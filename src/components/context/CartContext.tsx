"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo, useRef } from 'react'
import { HttpTypes } from '@medusajs/types'
import { retrieveCart, retrieveCartForAddress, retrieveCartForShipping, retrieveCartForPayment, addToCart, updateLineItem, deleteLineItem, setAddresses, setShippingMethod, selectPaymentSession, initiatePaymentSession, fetchCartItemsInventory } from '@/lib/data/cart'
import { unifiedCache } from "@/lib/utils/unified-cache"

interface ExtendedCart extends HttpTypes.StoreCart {
  metadata?: {
    payment_provider_id?: string
    [key: string]: any
  } | null
  gift_cards?: any[]
  customer?: HttpTypes.StoreCustomer | null
}

export interface VariantInventory {
  inventory_quantity: number
  manage_inventory: boolean
  allow_backorder: boolean
}

interface CartState {
  cart: ExtendedCart | null
  isLoading: boolean
  error: string | null
  lastUpdated: number
  variantInventory: Record<string, VariantInventory>
}

type CartAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: ExtendedCart | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CART'; payload: Partial<ExtendedCart> }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_INVENTORY'; payload: Record<string, VariantInventory> }

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
      return { cart: null, isLoading: false, error: null, lastUpdated: Date.now(), variantInventory: {} }
    case 'SET_INVENTORY':
      return { ...state, variantInventory: action.payload }
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
  variantInventory: Record<string, VariantInventory>
  
  // Actions
  refreshCart: (context?: 'address' | 'shipping' | 'payment') => Promise<void>
  refreshInventory: () => Promise<Record<string, VariantInventory>>
  addItem: (variantId: string, quantity: number, metadata?: any) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  setShipping: (methodId: string, data?: Record<string, any>) => Promise<void>
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
  // ✅ HYDRATION FIX: Use 0 as initial value to prevent server/client mismatch
  // lastUpdated will be set properly on first cart operation
  const [state, dispatch] = useReducer(cartReducer, {
    cart: initialCart || null,
    isLoading: false,
    error: null,
    lastUpdated: 0,
    variantInventory: {}
  })

  // Simple operation locking
  const operationInProgress = useRef(false)
  
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
    if (operationInProgress.current) return
    
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
      
      // When using context-specific fields, merge into existing state to avoid
      // wiping out data not included in the partial field set
      if (context && state.cart && updatedCart) {
        const mergedCart = { ...state.cart, ...updatedCart } as ExtendedCart
        dispatch({ type: 'SET_CART', payload: mergedCart })
      } else {
        dispatch({ type: 'SET_CART', payload: updatedCart })
      }
      
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
  }, [state.cart])

  // Fetch inventory for all cart item variants
  // Returns the inventory map so callers can use it immediately (before state update)
  const refreshInventory = useCallback(async (): Promise<Record<string, VariantInventory>> => {
    const cart = state.cart
    if (!cart?.items?.length || !cart.region_id) return {}

    const items = cart.items
      .filter(item => item.variant_id && item.product_id)
      .map(item => ({ product_id: item.product_id!, variant_id: item.variant_id! }))

    if (!items.length) return {}

    try {
      const inventory = await fetchCartItemsInventory(items, cart.region_id)
      dispatch({ type: 'SET_INVENTORY', payload: inventory })
      return inventory
    } catch (error) {
      console.error('Error fetching inventory:', error)
      return {}
    }
  }, [state.cart?.items, state.cart?.region_id])

  // Auto-fetch inventory when cart items change
  const prevItemsRef = useRef<string>('')
  useEffect(() => {
    const itemsKey = state.cart?.items?.map(i => `${i.variant_id}:${i.quantity}`).join(',') || ''
    if (itemsKey && itemsKey !== prevItemsRef.current) {
      prevItemsRef.current = itemsKey
      refreshInventory()
    }
  }, [state.cart?.items, refreshInventory])

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

  // Update item - with optimistic updates and inventory error handling
  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    if (!state.cart || operationInProgress.current) return
    
    operationInProgress.current = true
    
    // Save previous quantity for revert
    const previousItem = state.cart.items?.find(item => item.id === itemId)
    const previousQuantity = previousItem?.quantity || 1
    
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item'
      const isInsufficientInventory = errorMessage.includes('insufficient_inventory') || 
        errorMessage.includes('does not have the required inventory')
      
      if (isInsufficientInventory) {
        // Revert to previous quantity immediately
        const revertedCart = {
          ...state.cart,
          items: state.cart.items?.map(item => 
            item.id === itemId ? { ...item, quantity: previousQuantity } : item
          )
        }
        dispatch({ type: 'UPDATE_CART', payload: revertedCart })
        dispatch({ type: 'SET_ERROR', payload: 'Niewystarczająca ilość w magazynie. Odśwież stronę, aby zobaczyć aktualny stan.' })
        // Refresh inventory to get current stock levels
        await refreshInventory()
      } else {
        console.error('Error updating item:', error)
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
        await refreshCart() // Revert optimistic update
      }
    } finally {
      operationInProgress.current = false
    }
  }, [state.cart, refreshCart, refreshInventory])

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
  const setShipping = useCallback(async (methodId: string, data?: Record<string, any>) => {
    if (!state.cart) return
    
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      const response = await setShippingMethod({
        cartId: state.cart.id,
        shippingMethodId: methodId,
        data
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
      const billingAddress = address.billing_address || shippingAddress
      const email = address.email || state.cart.email || ''
      
      // Shipping address fields
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
      
      // ✅ Billing address with invoice metadata support
      if (billingAddress.metadata) {
        formData.append('billing_address.metadata.want_invoice', String(billingAddress.metadata.want_invoice || false))
        formData.append('billing_address.metadata.nip', billingAddress.metadata.nip || '')
        formData.append('billing_address.metadata.is_company', String(billingAddress.metadata.is_company || false))
      }
      
      const result = await setAddresses(null, formData)
      
      // OPTIMIZATION: setAddresses returns { success: true, cart } with CART_ADDRESS_FIELDS.
      // Merge into existing state — the partial cart is missing payment_collection,
      // shipping_methods, promotions etc. A full replace would wipe those out.
      if (result && typeof result === 'object' && result.success && result.cart) {
        // Filter out undefined values from partial cart to avoid overwriting existing data
        const partialCart = Object.fromEntries(
          Object.entries(result.cart).filter(([_, v]) => v !== undefined)
        )
        const mergedCart = { ...state.cart, ...partialCart } as ExtendedCart
        dispatch({ type: 'SET_CART', payload: mergedCart })
        unifiedCache.invalidateAfterCartChange()
      } else if (typeof result === 'string' && result !== 'success') {
        // Error message returned as string (legacy error path)
        dispatch({ type: 'SET_ERROR', payload: result || 'Failed to set address' })
      } else {
        // Fallback: if result format is unexpected, refresh cart
        await refreshCart('address')
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
    variantInventory: state.variantInventory,
    
    // Actions
    refreshCart,
    refreshInventory,
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