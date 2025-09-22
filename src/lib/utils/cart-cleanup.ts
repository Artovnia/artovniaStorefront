/**
 * Comprehensive cart cleanup utility
 * Clears all cart-related state, caches, and storage
 */

import { invalidateCache } from './cache-invalidation'

export interface CartCleanupOptions {
  clearLocalStorage?: boolean
  clearSessionStorage?: boolean
  clearCaches?: boolean
  clearCookies?: boolean
}

export const cleanupCartState = async (options: CartCleanupOptions = {}) => {
  const {
    clearLocalStorage = true,
    clearSessionStorage = true,
    clearCaches = true,
    clearCookies = false
  } = options

  console.log('🔍 Starting comprehensive cart cleanup...', options)

  try {
    // Clear localStorage
    if (clearLocalStorage && typeof window !== 'undefined') {
      const keysToRemove = [
        'selected_payment_provider',
        'cart_payment_ready',
        'payu_cart_id',
        'checkout_step',
        'payment_method_selection',
        'shipping_method_selection',
        'cart_metadata',
        '_medusa_cart_id', // CRITICAL: Clear the actual cart ID
        'medusa_cart_id'   // Alternative cart ID key
      ]
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn(`Failed to remove localStorage key: ${key}`, error)
        }
      })
      
      console.log('✅ localStorage cleared')
    }

    // Clear sessionStorage
    if (clearSessionStorage && typeof window !== 'undefined') {
      const sessionKeysToRemove = [
        'cart_id',
        'payment_session_id',
        'checkout_state',
        'temp_cart_data'
      ]
      
      sessionKeysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key)
        } catch (error) {
          console.warn(`Failed to remove sessionStorage key: ${key}`, error)
        }
      })
      
      console.log('✅ sessionStorage cleared')
    }

    // Clear all caches
    if (clearCaches) {
      try {
        // Clear checkout-specific caches
        invalidateCache.checkout()
        
        // Clear all caches if needed
        // invalidateCache.all()
        
        console.log('✅ Caches invalidated')
      } catch (error) {
        console.warn('Failed to clear caches:', error)
      }
    }

    // Clear cookies (if needed)
    if (clearCookies && typeof document !== 'undefined') {
      try {
        // Clear cart-related cookies
        const cookiesToClear = [
          '_medusa_cart_id',
          'medusa_cart_id',
          '_medusa_cache_id'
        ]
        
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        })
        
        console.log('✅ Cookies cleared')
      } catch (error) {
        console.warn('Failed to clear cookies:', error)
      }
    }

    console.log('✅ Cart cleanup completed successfully')
    return true
  } catch (error) {
    console.error('❌ Cart cleanup failed:', error)
    return false
  }
}

/**
 * Emergency cart reset - clears everything
 */
export const emergencyCartReset = async () => {
  console.log('🚨 Emergency cart reset initiated...')
  
  const success = await cleanupCartState({
    clearLocalStorage: true,
    clearSessionStorage: true,
    clearCaches: true,
    clearCookies: true
  })
  
  if (success) {
    console.log('🚨 Emergency cart reset completed')
    
    // Force page reload to ensure clean state
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }
  
  return success
}

/**
 * Selective cart cleanup for specific scenarios
 */
export const cleanupPaymentState = async () => {
  return cleanupCartState({
    clearLocalStorage: true,
    clearSessionStorage: false,
    clearCaches: true,
    clearCookies: false
  })
}

export const cleanupShippingState = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shipping_method_selection')
    localStorage.removeItem('shipping_address_cache')
  }
  
  invalidateCache.checkout()
  console.log('✅ Shipping state cleaned')
}
