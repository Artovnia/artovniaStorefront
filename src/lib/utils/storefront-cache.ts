/**
 * Standalone Redis cache implementation for storefront
 * Clean architecture with dedicated Redis instance
 */

// Redis is only available on server-side
let Redis: any
if (typeof window === 'undefined') {
  Redis = require('ioredis')
}
import { cache } from 'react'

// Simple Redis configuration - standalone instance, no shared concerns
let redis: any
if (typeof window === 'undefined' && Redis) {
  redis = new Redis(process.env.STOREFRONT_REDIS_URL!, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: process.env.NODE_ENV === 'development', // Enable queue in dev for hot reload
    retryDelayOnFailover: 100,
    connectTimeout: 10000,
    commandTimeout: 5000
  })
} else {
  // Client-side fallback - complete mock Redis client
  redis = {
    get: () => Promise.resolve(null),
    set: () => Promise.resolve('OK'),
    setex: () => Promise.resolve('OK'),  // ✅ Added missing setex
    del: () => Promise.resolve(0),
    keys: () => Promise.resolve([]),
    mget: () => Promise.resolve([]),     // ✅ Added missing mget
    dbsize: () => Promise.resolve(0),
    status: 'ready',
    on: () => {},
    off: () => {},
    // ✅ Added missing pipeline support
    pipeline: () => ({
      setex: () => ({}),
      exec: () => Promise.resolve([])
    })
  }
}

if (typeof window === 'undefined' && redis.on) {
  redis.on('error', (error: any) => {
    console.error('Storefront Redis error:', error)
  })
}

export const CACHE_TTL = {
  PRODUCT: 300,        // 5 minutes
  CHECKOUT: 120,       // 2 minutes  
  PRICE_HISTORY: 900,  // 15 minutes
  SHIPPING: 600        // 10 minutes
} as const

class StorefrontCache {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data))
    } catch (error) {
      // Suppress hot reload connection errors in development
      if (process.env.NODE_ENV === 'development' && 
          (error instanceof Error && 
           (error.message?.includes('enableOfflineQueue') || 
            error.message?.includes('Stream isn\'t writeable')))) {
        // Silent fail during hot reload - this is expected
        return
      }
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache pattern invalidation error:', error)
    }
  }

  // Batch operations for performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mget(...keys)
      return values.map((v: string | null) => v ? JSON.parse(v) : null)
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  async mset(entries: Array<{ key: string; data: any; ttl: number }>): Promise<void> {
    try {
      const pipeline = redis.pipeline()
      entries.forEach(({ key, data, ttl }) => {
        pipeline.setex(key, ttl, JSON.stringify(data))
      })
      await pipeline.exec()
    } catch (error) {
      console.error('Cache mset error:', error)
    }
  }
}

export const storefrontCache = new StorefrontCache()

// Generic cached data fetcher with React cache() for request deduplication
export const getCachedData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.PRODUCT,
  validator?: (data: any) => boolean
): Promise<T> => {
  // Try Redis cache first
  const cached = await storefrontCache.get<T>(key)
  if (cached && (!validator || validator(cached))) {
    return cached
  }

  // Fetch fresh data
  const result = await fetchFn()
  
  // Cache if valid
  if (!validator || validator(result)) {
    await storefrontCache.set(key, result, ttl)
  }
  
  return result
})

// Validation functions
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

function isValidBatchPriceData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  
  // Check if it's a valid batch price response
  return Object.keys(data).length >= 0 && 
         Object.values(data).every(item => 
           item === null || 
           (typeof item === 'object' && item !== null &&
            ('lowest_30d_amount' in item || 'error' in item))
         )
}

// Specific cache functions with simplified keys (no prefixing needed for standalone Redis)
export const getCachedProduct = cache(async (
  handle: string, 
  locale: string, 
  fetchFn: () => Promise<any>
): Promise<any> => {
  return getCachedData(
    `product:${handle}:${locale}`,
    fetchFn,
    CACHE_TTL.PRODUCT,
    isValidProductData
  )
})

export const getCachedBatchLowestPrices = cache(async (
  variantIds: string[],
  currencyCode: string,
  regionId: string | undefined,
  days: number,
  fetchFn: () => Promise<Record<string, any>>
): Promise<Record<string, any>> => {
  // Optimize cache key - use hash for long variant lists
  const variantKey = variantIds.length > 10 
    ? `hash:${Buffer.from(variantIds.sort().join(',')).toString('base64').slice(0, 16)}`
    : variantIds.sort().join(',')
    
  return getCachedData(
    `prices:${variantKey}:${currencyCode}:${regionId || 'default'}:${days}d`,
    fetchFn,
    CACHE_TTL.PRICE_HISTORY,
    isValidBatchPriceData
  )
})

export const getCachedCheckoutData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  duration: number = CACHE_TTL.CHECKOUT
): Promise<T> => {
  return getCachedData(
    `checkout:${key}`,
    fetchFn,
    duration
  )
})

// Cache invalidation functions
export const invalidateProductCache = (handle: string, locale: string) => {
  storefrontCache.del(`product:${handle}:${locale}`)
}

export const invalidateCheckoutCache = (cartId: string) => {
  storefrontCache.del(`checkout:${cartId}`)
}

export const invalidatePriceHistoryCache = (variantIds?: string[], currencyCode?: string) => {
  if (variantIds && currencyCode) {
    // Invalidate specific cache entries
    const pattern = `prices:*${currencyCode}*`
    storefrontCache.invalidatePattern(pattern)
  } else {
    // Invalidate all price history cache entries
    storefrontCache.invalidatePattern('prices:*')
  }
}

export const clearAllCaches = () => {
  storefrontCache.invalidatePattern('*')
}

export const getCacheStats = async () => {
  try {
    const dbsize = await redis.dbsize()
    return { 
      size: dbsize, 
      connected: redis.status === 'ready',
      timestamp: Date.now()
    }
  } catch (error) {
    return { 
      size: 0, 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }
  }
}

// Export validation functions for reuse
export { isValidProductData, isValidBatchPriceData }

// Export for backward compatibility
export const persistentCache = storefrontCache
export const PRICE_HISTORY_CACHE_DURATION = CACHE_TTL.PRICE_HISTORY
export const PRODUCT_CACHE_DURATION = CACHE_TTL.PRODUCT
export const CHECKOUT_CACHE_DURATION = CACHE_TTL.CHECKOUT
