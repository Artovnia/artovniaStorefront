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
  completeOrder: () => Promise<any>
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

  // Operation locking to prevent race conditions
  const operationInProgress = useRef(false)
  const refreshCartRef = useRef<Promise<void> | null>(null)
  
  // Optimized cart refresh with better error handling and timeout
  const refreshCart = useCallback(async (context?: 'address' | 'shipping' | 'payment') => {
    if (state.isLoading || operationInProgress.current) return
    
    // Deduplicate simultaneous refresh requests
    if (refreshCartRef.current) {
      return refreshCartRef.current
    }
    
    const refreshPromise = (async () => {
      let timeoutId: NodeJS.Timeout | undefined
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Cart refresh timeout')), 5000)
        })
        
        let cartPromise: Promise<ExtendedCart | null>
        
        // Use specialized cart functions based on context
        switch (context) {
          case 'address':
            cartPromise = retrieveCartForAddress()
            break
          case 'shipping':
            cartPromise = retrieveCartForShipping()
            break
          case 'payment':
            cartPromise = retrieveCartForPayment()
            break
          default:
            cartPromise = retrieveCart()
        }
        
        const updatedCart = await Promise.race([cartPromise, timeoutPromise])
        
        // Clear timeout on success
        if (timeoutId) clearTimeout(timeoutId)
        
        // Check if cart is completed and clear it if so
        if (updatedCart && ((updatedCart as any).status === 'completed' || (updatedCart as any).completed_at)) {
          console.log('🔄 Cart is completed, clearing from context and storage')
          
          // Clear cart ID from localStorage and cookies
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('_medusa_cart_id')
              document.cookie = '_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            } catch (error) {
              console.warn('Could not clear cart ID from storage:', error)
            }
          }
          
          dispatch({ type: 'CLEAR_CART' })
          return
        }
        
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart | null })
        
        // Invalidate cart-related caches (non-blocking)
        if (updatedCart?.id) {
          unifiedCache.invalidate(['cart']).catch(err => {
            console.warn('Cache invalidation failed:', err)
          })
        }
        
      } catch (error) {
        // Clear timeout on error
        if (timeoutId) clearTimeout(timeoutId)
        
        console.error('Error refreshing cart:', error)
        
        // Don't show error for timeout - just log it
        if (error instanceof Error && error.message.includes('timeout')) {
          console.warn('Cart refresh timed out, continuing with current state')
        } else {
          dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh cart' })
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
        refreshCartRef.current = null
      }
    })()
    
    refreshCartRef.current = refreshPromise
    return refreshPromise
  }, [state.isLoading])

  // Add item with improved immediate response and error handling
  const addItem = useCallback(async (variantId: string, quantity: number, metadata?: any) => {
    if (operationInProgress.current) {
      console.warn('Cart operation already in progress, skipping add item')
      return
    }
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Show loading state immediately for better UX
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const updatedCart = await addToCart({
        variantId,
        quantity,
        countryCode: 'pl'
      })
      
      if (updatedCart) {
        // ✅ Set cart data immediately from API response with full seller/pricing data
        dispatch({ type: 'SET_CART', payload: updatedCart })
        
        // ✅ Debug log to verify seller data is present
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 CartContext: Updated cart with seller data:', {
            itemsCount: updatedCart.items?.length || 0,
            itemsWithSeller: updatedCart.items?.filter(item => (item.product as any)?.seller).length || 0,
            promotionsCount: (updatedCart as any)?.promotions?.length || 0
          })
        }
        
        // Invalidate cache in background (non-blocking)
        unifiedCache.invalidate(['cart', 'inventory', 'promotions']).catch(err => {
          console.warn('Cache invalidation failed:', err)
        })
      } else {
        // Fallback refresh if no cart returned
        console.warn('⚠️ No cart returned from addToCart, refreshing...')
        await refreshCart()
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item' })
      // Refresh cart to get current state on error
      await refreshCart()
    } finally {
      operationInProgress.current = false
    }
  }, [refreshCart])

  // Update item with optimistic updates and error handling
  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (!state.cart || operationInProgress.current) return
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // Optimistic update
      const optimisticCart = {
        ...state.cart,
        items: state.cart.items?.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      }
      
      dispatch({ type: 'UPDATE_CART', payload: optimisticCart })
      
      const updatedCart = await updateLineItem({
        lineId: itemId,
        quantity
      })
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        await unifiedCache.invalidate(['cart', 'inventory', 'promotions'])
      } else {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update item' })
      await refreshCart() // Revert optimistic update
    } finally {
      operationInProgress.current = false
    }
  }, [state.cart, refreshCart])

  // Clear cart function - defined early to be used by other methods
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
    
    // Clear cart ID from localStorage and cookies
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('_medusa_cart_id')
        document.cookie = '_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        console.log('✅ Cart manually cleared from storage')
      } catch (error) {
        console.warn('Could not clear cart ID from storage:', error)
      }
    }
    
    // Invalidate cache
    unifiedCache.invalidate(['cart', 'inventory', 'promotions']).catch(err => {
      console.warn('Cache invalidation failed:', err)
    })
  }, [])

  // Remove item with proper error handling
  const removeItem = useCallback(async (itemId: string) => {
    if (!state.cart || operationInProgress.current) return
    
    // Check if cart is completed
    if ((state.cart as any).status === 'completed' || (state.cart as any).completed_at) {
      console.log('🚫 Cannot remove item from completed cart, clearing cart context')
      clearCart()
      return
    }
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const updatedCart = await deleteLineItem(itemId)
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        await unifiedCache.invalidate(['cart', 'inventory', 'promotions'])
      } else {
        await refreshCart()
      }
    } catch (error) {
      console.error('Error removing cart item:', error)
      
      // If error mentions payment sessions or completed cart, clear the cart
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item'
      if (errorMessage.includes('payment sessions') || errorMessage.includes('completed')) {
        console.log('🚫 Cart appears to be completed, clearing cart context')
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
        await unifiedCache.invalidate(['cart'])
      }
    } catch (error) {
      console.error('Error setting shipping method:', error)
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
        await unifiedCache.invalidate(['cart'])
      }
    } catch (error) {
      console.error('Error setting payment method:', error)
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
        await unifiedCache.invalidate(['cart'])
      } else {
        dispatch({ type: 'SET_ERROR', payload: result || 'Failed to set address' })
      }
    } catch (error) {
      console.error('Error setting address:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set address' })
    }
  }, [state.cart, refreshCart])

  // Complete order
  const completeOrder = useCallback(async (skipRedirectCheck: boolean = false) => {
    if (!state.cart) throw new Error('No cart available')
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const { placeOrder } = await import('@/lib/data/cart')
      const result = await placeOrder(state.cart.id, skipRedirectCheck)
      
      if (result) {
        if (result.type === 'order_set' || result.order_set || result.type === 'order' || result.order) {
          dispatch({ type: 'CLEAR_CART' })
          
          // Clear cart ID from localStorage and cookies
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('_medusa_cart_id')
              document.cookie = '_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
              console.log('✅ Cart ID cleared from storage')
            } catch (error) {
              console.warn('Could not clear cart ID from storage:', error)
            }
          }
          
          await unifiedCache.invalidate(['cart', 'inventory', 'promotions'])
        }
      }
      
      return result
    } catch (error) {
      console.error('Error completing order:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to complete order' })
      throw error
    }
  }, [state.cart])

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