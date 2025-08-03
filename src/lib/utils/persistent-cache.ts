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
  if (cached) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Using cached product data for: ${handle}`)
    }
    return cached
  }

  // Fetch and cache
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Fetching fresh product data for: ${handle}`)
  }
  
  const result = await fetchFn()
  persistentCache.set(cacheKey, result, PRODUCT_CACHE_DURATION)
  
  return result
})

/**
 * Cached checkout data fetcher
 */
export const getCachedCheckoutData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  const cacheKey = `checkout-${key}`
  
  // Check persistent cache first
  const cached = persistentCache.get<T>(cacheKey)
  if (cached) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Using cached checkout data for: ${key}`)
    }
    return cached
  }

  // Fetch and cache
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Fetching fresh checkout data for: ${key}`)
  }
  
  const result = await fetchFn()
  persistentCache.set(cacheKey, result, CHECKOUT_CACHE_DURATION)
  
  return result
})

/**
 * Invalidate product cache when needed
 */
export const invalidateProductCache = (handle: string, locale: string) => {
  const cacheKey = `product-${handle}-${locale}`
  persistentCache.delete(cacheKey)
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗑️ Invalidated cache for: ${handle}`)
  }
}

/**
 * Invalidate checkout cache when cart data changes
 */
export const invalidateCheckoutCache = (cartId?: string) => {
  // Invalidate all checkout-related cache entries
  persistentCache.delete('checkout-cart')
  persistentCache.delete('checkout-customer')
  
  if (cartId) {
    persistentCache.delete(`checkout-shipping-methods-${cartId}`)
    // Also invalidate any region-specific payment methods
    // We'll clear all payment method caches since we don't know the region ID
    const stats = persistentCache.getStats()
    stats.entries.forEach(key => {
      if (key.startsWith('checkout-payment-methods-')) {
        persistentCache.delete(key)
      }
    })
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗑️ Invalidated checkout cache${cartId ? ` for cart: ${cartId}` : ''}`)
  }
}

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => persistentCache.getStats()

export { persistentCache }
