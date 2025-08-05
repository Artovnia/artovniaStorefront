/**
 * Persistent cache implementation using Next.js cache() for server-side caching
 * This survives across server requests and helps with variant selection performance
 */

import { cache } from 'react'

// Cache duration constants
const PRODUCT_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const CHECKOUT_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class PersistentCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = PRODUCT_CACHE_DURATION): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    // Clean up expired entries periodically
    if (this.cache.size > 100) {
      this.cleanup()
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}

// Global persistent cache instance
const persistentCache = new PersistentCache()

/**
 * Cached product fetcher that persists across server requests
 * This helps with variant selection performance
 */
export const getCachedProduct = cache(async (
  handle: string, 
  locale: string, 
  fetchFn: () => Promise<any>
): Promise<any> => {
  const cacheKey = `product-${handle}-${locale}`
  
  // Check persistent cache first
  const cached = persistentCache.get(cacheKey)
  if (cached && isValidProductData(cached)) {
    if (process.env.NODE_ENV === 'development') {
    }
    return cached
  }

  // Fetch and cache with error handling
  if (process.env.NODE_ENV === 'development') {
   
  }
  
  try {
    const result = await fetchFn()
    
    // Only cache valid product data
    if (isValidProductData(result)) {
      persistentCache.set(cacheKey, result, PRODUCT_CACHE_DURATION)
      return result
    } else {
      // Don't cache invalid data, but also don't throw error
      console.warn(`⚠️ Invalid product data for ${handle}, not caching`)
      return result
    }
  } catch (error) {
    // Clear any existing bad cache on error
    persistentCache.delete(cacheKey)
    console.error(`❌ Error fetching product ${handle}:`, error)
    throw error
  }
})

/**
 * Cached checkout data fetcher
 */
export const getCachedCheckoutData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  duration: number = CHECKOUT_CACHE_DURATION
): Promise<T> => {
  // Check persistent cache first
  const cached = persistentCache.get<T>(key)
  if (cached) {
    if (process.env.NODE_ENV === 'development') {
    }
    return cached
  }

  // Fetch and cache
  if (process.env.NODE_ENV === 'development') {
  }
  
  const result = await fetchFn()
  persistentCache.set(key, result, duration)
  
  return result
})

/**
 * Invalidate product cache when needed
 */
export const invalidateProductCache = (handle: string, locale: string) => {
  const cacheKey = `product-${handle}-${locale}`
  persistentCache.delete(cacheKey)
  
  if (process.env.NODE_ENV === 'development') {
  }
}

/**
 * Invalidate checkout cache when cart data changes
 */
export const invalidateCheckoutCache = (cartId?: string) => {
  // Invalidate all checkout-related cache entries using the actual key patterns
  persistentCache.delete('cart')
  persistentCache.delete('customer')
  
  if (cartId) {
    // Use the correct key pattern that matches how data is actually cached
    persistentCache.delete(`shipping-methods-${cartId}`)
    
    // Also invalidate any region-specific payment methods
    // We'll clear all payment method caches since we don't know the region ID
    const stats = persistentCache.getStats()
    stats.entries.forEach(key => {
      if (key.startsWith('payment-methods-')) {
        persistentCache.delete(key)
      }
    })
  }
  
}

/**
 * Validate product data to prevent caching corrupted/incomplete data
 */
function isValidProductData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  
  // Basic product validation
  return (
    data.id && 
    data.handle && 
    data.title &&
    Array.isArray(data.variants) &&
    data.variants.length > 0
  )
}

/**
 * Force clear all caches (for debugging/emergency use)
 */
export const clearAllCaches = () => {
  persistentCache.clear()
}

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => persistentCache.getStats()

export { persistentCache }
