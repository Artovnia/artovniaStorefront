"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef } from 'react'
import { HttpTypes } from '@medusajs/types'
import { retrieveCart, retrieveCartForAddress, retrieveCartForShipping, retrieveCartForPayment, addToCart, updateLineItem, deleteLineItem, setAddresses, setShippingMethod, selectPaymentSession, initiatePaymentSession } from '@/lib/data/cart'
import { unifiedCache } from "@/lib/utils/unified-cache"

interface ExtendedCart extends HttpTypes.StoreCart {
  metadata?: {
    payment_provider_id?: string
    [key: string]: any
  } | null
  gift_cards?: any[]
}

interface CartState {
  cart: ExtendedCart | null
  isLoading: boolean
  error: string | null
  lastUpdated: number
}

type CartAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: ExtendedCart | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CART'; payload: Partial<ExtendedCart> }
  | { type: 'CLEAR_CART' }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_CART':
      return { 
        ...state, 
        cart: action.payload, 
        isLoading: false, 
        error: null,
        lastUpdated: Date.now()
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'UPDATE_CART':
      return { 
        ...state, 
        cart: state.cart ? { ...state.cart, ...action.payload } : null,
        lastUpdated: Date.now()
      }
    case 'CLEAR_CART':
      return { cart: null, isLoading: false, error: null, lastUpdated: Date.now() }
    default:
      return state
  }
}

export interface CartContextType {
  // State
  cart: ExtendedCart | null
  isLoading: boolean
  error: string | null
  lastUpdated: number
  
  // Actions
  refreshCart: (context?: 'address' | 'shipping' | 'payment') => Promise<void>
  addItem: (variantId: string, quantity: number, metadata?: any) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  setShipping: (methodId: string) => Promise<void>
  setPayment: (providerId: string) => Promise<void>
  setAddress: (address: any) => Promise<void>
  completeOrder: (skipRedirectCheck?: boolean, cartId?: string) => Promise<any>
  clearError: () => void
  clearCart: () => void
  
  // Computed properties
  itemCount: number
  hasShippingAddress: boolean
  hasShippingMethod: boolean
  hasPaymentMethod: boolean
  isReadyForCheckout: boolean
}

const CartContext = createContext<CartContextType | null>(null)

// Export CartContext as default for direct context usage
export default CartContext

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: React.ReactNode
  initialCart?: ExtendedCart | null
}

export const CartProvider: React.FC<CartProviderProps> = ({ children, initialCart }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: initialCart || null,
    isLoading: false,
    error: null,
    lastUpdated: Date.now()
  })

  // Simple operation locking
  const operationInProgress = useRef(false)
  
  // ✅ Generate unique browser session ID to prevent cross-browser contamination
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const sessionId = sessionStorage.getItem('browser_session_id') || 
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!sessionStorage.getItem('browser_session_id')) {
      sessionStorage.setItem('browser_session_id', sessionId);
    }
    
    console.log('🔑 Browser Session ID:', sessionId);
    
    // Log cart ID on mount for debugging
    if (state.cart?.id) {
      console.log('🛒 Cart ID:', state.cart.id, 'Session:', sessionId);
    }
  }, [state.cart?.id])
  
  // Ensure cart exists using server action
  const ensureCart = useCallback(async (countryCode?: string) => {
    if (operationInProgress.current) return null
    
    operationInProgress.current = true
    
    try {      
      // Try to get existing cart first
      let cart = await retrieveCart()
      
      if (!cart) {
        // Import and call server action
        // Country will be auto-detected if not provided
        const { createCartAction } = await import('@/lib/actions/cart-actions')
        cart = await createCartAction(countryCode)
      }
      
      return cart
    } catch (error) {
      console.error('Error ensuring cart:', error)
      return null
    } finally {
      operationInProgress.current = false
    }
  }, [])
  
  // Simplified cart refresh
  const refreshCart = useCallback(async (context?: 'address' | 'shipping' | 'payment') => {
    if (state.isLoading || operationInProgress.current) return
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      let updatedCart: ExtendedCart | null
      
      // Use context-specific retrieval
      switch (context) {
        case 'address':
          updatedCart = await retrieveCartForAddress()
          break
        case 'shipping':
          updatedCart = await retrieveCartForShipping()
          break
        case 'payment':
          updatedCart = await retrieveCartForPayment()
          break
        default:
          updatedCart = await retrieveCart()
      }
      
      // Handle completed cart
      if (updatedCart && ((updatedCart as any).status === 'completed' || (updatedCart as any).completed_at)) {
        clearCartStorage()
        dispatch({ type: 'CLEAR_CART' })
        return
      }
      
      dispatch({ type: 'SET_CART', payload: updatedCart })
      
      // Simple cache invalidation
      if (updatedCart?.id) {
        unifiedCache.invalidateAfterCartChange()
      }
        
    } catch (error) {
      console.error('Error refreshing cart:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh cart' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
      operationInProgress.current = false
    }
  }, [state.isLoading])

  // Helper function to clear cart storage
  const clearCartStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('_medusa_cart_id')
        document.cookie = '_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      } catch (error) {
      }
    }
  }

  // Add item - simplified
  const addItem = useCallback(async (variantId: string, quantity: number, metadata?: any) => {
    if (operationInProgress.current) return
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const updatedCart = await addToCart({
        variantId,
        quantity,
        countryCode: 'pl'
      })
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart })
        unifiedCache.invalidateAfterCartChange()
      } else {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error adding item:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item' })
      await refreshCart()
    } finally {
      operationInProgress.current = false
    }
  }, [refreshCart])

  // Update item - simplified with optimistic updates
  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (!state.cart || operationInProgress.current) return
    
    operationInProgress.current = true
    
    // Optimistic update
    const optimisticCart = {
      ...state.cart,
      items: state.cart.items?.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    }
    dispatch({ type: 'UPDATE_CART', payload: optimisticCart })
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const updatedCart = await updateLineItem({
        lineId: itemId,
        quantity
      })
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        unifiedCache.invalidateAfterCartChange()
      } else {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error updating item:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update item' })
      await refreshCart() // Revert optimistic update
    } finally {
      operationInProgress.current = false
    }
  }, [state.cart, refreshCart])

  // Clear cart function
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
    clearCartStorage()
    unifiedCache.invalidate('cart')
  }, [])

  // Remove item - simplified
  const removeItem = useCallback(async (itemId: string) => {
    if (!state.cart || operationInProgress.current) return
    
    // Check if cart is completed
    if ((state.cart as any).status === 'completed' || (state.cart as any).completed_at) {
      clearCart()
      return
    }
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const updatedCart = await deleteLineItem(itemId)
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        unifiedCache.invalidateAfterCartChange()
      } else {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error removing item:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item'
      if (errorMessage.includes('payment sessions') || errorMessage.includes('completed')) {
        clearCart()
        return
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      await refreshCart()
    } finally {
      operationInProgress.current = false
    }
  }, [state.cart, refreshCart, clearCart])

  // Set shipping method
  const setShipping = useCallback(async (methodId: string) => {
    if (!state.cart) return
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const response = await setShippingMethod({
        cartId: state.cart.id,
        shippingMethodId: methodId
      })
      
      if (response && response.cart) {
        dispatch({ type: 'SET_CART', payload: response.cart as ExtendedCart })
        unifiedCache.invalidateAfterCartChange()
      }
    } catch (error) {
      console.error('Error setting shipping:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set shipping method' })
    }
  }, [state.cart])

  // Set payment method
  const setPayment = useCallback(async (providerId: string) => {
    if (!state.cart) return
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const existingSession = state.cart.payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === providerId && session.status === 'pending'
      )
      
      if (!existingSession) {
        await initiatePaymentSession(state.cart, { provider_id: providerId })
      }
      
      const updatedCart = await selectPaymentSession(state.cart.id, providerId)
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        unifiedCache.invalidateAfterCartChange()
      }
    } catch (error) {
      console.error('Error setting payment:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set payment method' })
    }
  }, [state.cart])

  // Set address
  const setAddress = useCallback(async (address: any) => {
    if (!state.cart) return
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const formData = new FormData()
      const shippingAddress = address.shipping_address || address
      const email = address.email || state.cart.email || ''
      
      formData.append('shipping_address.first_name', shippingAddress.first_name || '')
      formData.append('shipping_address.last_name', shippingAddress.last_name || '')
      formData.append('shipping_address.address_1', shippingAddress.address_1 || '')
      formData.append('shipping_address.address_2', shippingAddress.address_2 || '')
      formData.append('shipping_address.company', shippingAddress.company || '')
      formData.append('shipping_address.postal_code', shippingAddress.postal_code || '')
      formData.append('shipping_address.city', shippingAddress.city || '')
      formData.append('shipping_address.country_code', shippingAddress.country_code || '')
      formData.append('shipping_address.province', shippingAddress.province || '')
      formData.append('shipping_address.phone', shippingAddress.phone || '')
      formData.append('email', email)
      
      const result = await setAddresses(null, formData)
      
      if (result === 'success') {
        await refreshCart('address')
        unifiedCache.invalidateAfterCartChange()
      } else {
        dispatch({ type: 'SET_ERROR', payload: result || 'Failed to set address' })
      }
    } catch (error) {
      console.error('Error setting address:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set address' })
    }
  }, [state.cart, refreshCart])

  // Complete order
  const completeOrder = useCallback(async (skipRedirectCheck: boolean = false, cartId?: string) => {
    const targetCartId = cartId || state.cart?.id
    if (!targetCartId) throw new Error('No cart available')
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const { placeOrder } = await import('@/lib/data/cart')
      const result = await placeOrder(targetCartId, skipRedirectCheck)
      
      if (result) {
        if (result.type === 'order_set' || result.order_set || result.type === 'order' || result.order) {
          clearCart()
          unifiedCache.invalidateAfterCartChange()
        }
      }
      
      return result
    } catch (error) {
      console.error('Error completing order:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to complete order' })
      throw error
    }
  }, [state.cart, clearCart])

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])
  // Computed properties
  const computedValues = useMemo(() => {
    const cart = state.cart
    
    return {
      itemCount: cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0,
      hasShippingAddress: !!(cart?.shipping_address),
      hasShippingMethod: !!(cart?.shipping_methods && cart.shipping_methods.length > 0),
      hasPaymentMethod: !!(
        cart?.payment_collection?.payment_sessions?.some((s: any) => s.status === 'pending') ||
        cart?.metadata?.payment_provider_id ||
        (cart?.gift_cards && cart.gift_cards.length > 0 && cart.total === 0)
      ),
      isReadyForCheckout: !!(
        cart?.shipping_address &&
        cart?.shipping_methods && cart.shipping_methods.length > 0 &&
        (cart?.payment_collection?.payment_sessions?.some((s: any) => s.status === 'pending') ||
         cart?.metadata?.payment_provider_id ||
         (cart?.gift_cards && cart.gift_cards.length > 0 && cart.total === 0))
      )
    }
  }, [state.cart])

  const contextValue: CartContextType = {
    // State
    cart: state.cart,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    setShipping,
    setPayment,
    setAddress,
    completeOrder,
    clearError,
    clearCart,
    
    // Computed properties
    ...computedValues
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}