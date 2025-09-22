"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef } from 'react'
import { HttpTypes } from '@medusajs/types'
import { retrieveCart, retrieveCartForAddress, retrieveCartForShipping, retrieveCartForPayment, addToCart, updateLineItem, deleteLineItem, setAddresses, setShippingMethod, selectPaymentSession, initiatePaymentSession } from '@/lib/data/cart'
import { invalidateCheckoutCache } from "@/lib/utils/storefront-cache"

// Extended cart type to include PayU metadata and additional properties
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

interface CartContextType {
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
  
  // Computed properties
  itemCount: number
  hasShippingAddress: boolean
  hasShippingMethod: boolean
  hasPaymentMethod: boolean
  isReadyForCheckout: boolean
}

const CartContext = createContext<CartContextType | null>(null)

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

  // CRITICAL FIX: Add operation locking to prevent race conditions
  const operationInProgress = useRef(false)
  const refreshCartRef = useRef<Promise<void> | null>(null)
  
  // Optimized cart refresh with context-aware data loading
  const refreshCart = useCallback(async (context?: 'address' | 'shipping' | 'payment') => {
    if (state.isLoading) return // Prevent concurrent refreshes
    
    // CRITICAL FIX: Deduplicate simultaneous refresh requests
    if (refreshCartRef.current) {
      return refreshCartRef.current
    }
    
    const refreshPromise = (async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })
        
        let updatedCart
        
        // Use specialized cart functions based on context to reduce data transfer
        // Default to general cart retrieval for backward compatibility
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
            // Use general cart retrieval for cart operations (add/update/remove items)
            updatedCart = await retrieveCart()
        }
        
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart | null })
      } catch (error) {
        console.error('Error refreshing cart:', error)
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh cart' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
        refreshCartRef.current = null
      }
    })()
    
    refreshCartRef.current = refreshPromise
    return refreshPromise
  }, [state.isLoading])

  // CRITICAL FIX: Add item with operation locking to prevent race conditions
  const addItem = useCallback(async (variantId: string, quantity: number, metadata?: any) => {
    if (operationInProgress.current) {
      console.warn('Cart operation already in progress, skipping add item')
      return
    }
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const updatedCart = await addToCart({
        variantId,
        quantity,
        countryCode: 'pl' // Default to Poland for Polish storefront
      })
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart })
        // CRITICAL FIX: Force immediate refresh to ensure UI updates
        setTimeout(() => {
          dispatch({ type: 'SET_CART', payload: updatedCart })
        }, 50)
      } else {
        // If no cart returned, refresh to get latest state
        await refreshCart()
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item' })
      // CRITICAL FIX: Refresh cart on error to get true server state
      await refreshCart()
    } finally {
      operationInProgress.current = false
    }
  }, [refreshCart])

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (!state.cart) return
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    // Optimistic update
    const optimisticCart = {
      ...state.cart,
      items: state.cart.items?.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    }
    
    dispatch({ type: 'UPDATE_CART', payload: optimisticCart })
    
    try {
      const updatedCart = await updateLineItem({
        lineId: itemId,
        quantity
      })
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        invalidateCheckoutCache(updatedCart.id)
      } else {
        // If no cart returned, refresh to get latest state
        await refreshCart()
      }
    } catch (error) {
      console.error('Error updating cart item:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update item' })
      // Revert optimistic update
      await refreshCart()
    }
  }, [state.cart, refreshCart])

  const removeItem = useCallback(async (itemId: string) => {
    if (!state.cart) return
    
    if (operationInProgress.current) {
      console.warn('Cart operation already in progress, skipping remove item')
      return
    }
    
    operationInProgress.current = true
    
    try {
      dispatch({ type: 'SET_ERROR', payload: null })
      
      // CRITICAL FIX: No optimistic update for remove - wait for server confirmation
      // This prevents trying to delete items that don't exist on server
      
      const updatedCart = await deleteLineItem(itemId)
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        console.log(`✅ Cart updated after removing item ${itemId}`)
      } else {
        // If no cart returned, refresh to get latest state
        console.warn(`⚠️ No cart returned after deleting item ${itemId}, refreshing...`)
        await refreshCart()
      }
    } catch (error) {
      console.error('Error removing cart item:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item' })
      // CRITICAL FIX: Always refresh on error to get true server state
      await refreshCart()
    } finally {
      operationInProgress.current = false
    }
  }, [state.cart, refreshCart])

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
        invalidateCheckoutCache(response.cart.id)
      }
    } catch (error) {
      console.error('Error setting shipping method:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set shipping method' })
    }
  }, [state.cart])

  const setPayment = useCallback(async (providerId: string) => {
    if (!state.cart) return
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      // Check if payment session already exists
      const existingSession = state.cart.payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === providerId && session.status === 'pending'
      )
      
      if (!existingSession) {
        await initiatePaymentSession(state.cart, { provider_id: providerId })
      }
      
      const updatedCart = await selectPaymentSession(state.cart.id, providerId)
      
      if (updatedCart) {
        dispatch({ type: 'SET_CART', payload: updatedCart as ExtendedCart })
        invalidateCheckoutCache(updatedCart.id)
      }
    } catch (error) {
      console.error('Error setting payment method:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set payment method' })
    }
  }, [state.cart])

  const setAddress = useCallback(async (address: any) => {
    if (!state.cart) return
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
   
      
      // Use setAddresses function which exists in cart.ts
      const formData = new FormData()
      
      // Handle nested address structure correctly
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
        // Refresh cart with address context for optimized data loading
        await refreshCart('address')
      } else {
        console.error('🔍 CartContext.setAddress - setAddresses failed with result:', result)
        dispatch({ type: 'SET_ERROR', payload: result || 'Failed to set address' })
      }
    } catch (error) {
      console.error('🔍 CartContext.setAddress - Error setting address:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to set address' })
    }
  }, [state.cart, refreshCart])

  const completeOrder = useCallback(async (skipRedirectCheck: boolean = false) => {
    if (!state.cart) throw new Error('No cart available')
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      // Import the placeOrder function from cart.ts
      const { placeOrder } = await import('@/lib/data/cart')
      
      // Use the existing placeOrder implementation
      const result = await placeOrder(state.cart.id, skipRedirectCheck)
      
      if (result) {
        // Check if order was successfully completed
        if (result.type === 'order_set' || result.order_set || result.type === 'order' || result.order) {
          dispatch({ type: 'CLEAR_CART' })
          invalidateCheckoutCache(state.cart.id)
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

  // Remove auto-refresh to prevent redundant API calls when initialCart is provided
  // Components can manually call refreshCart() when needed

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
    
    // Computed properties
    ...computedValues
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}