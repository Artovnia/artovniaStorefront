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

// Stable Redis configuration with connection pooling for rapid requests
let redis: any
if (typeof window === 'undefined' && Redis) {
  redis = new Redis(process.env.STOREFRONT_REDIS_URL!, {
    maxRetriesPerRequest: 1, // Fast failover for rapid requests
    lazyConnect: false, // Connect immediately
    enableOfflineQueue: false, // Fail fast
    retryDelayOnFailover: 50, // Very fast retry
    connectTimeout: 3000, // Quick connection timeout
    commandTimeout: 2000, // Quick command timeout
    // Simple retry strategy for stability
    retryStrategy: (times: number) => {
      if (times > 2) return null // Give up quickly
      return 100 // Fixed 100ms delay
    },
    // Connection pool settings for rapid requests
    enableReadyCheck: false,
    maxLoadingTimeout: 2000,
    keepAlive: 5000, // Shorter keepalive
    family: 4,
    // Don't reconnect on every error to avoid connection churn
    reconnectOnError: (err: Error) => {
      return err.message.includes('READONLY')
    },
    // Additional stability settings
    maxMemoryPolicy: 'noeviction',
    showFriendlyErrorStack: process.env.NODE_ENV === 'development'
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
    // Enhanced Redis error logging with connection state
    const errorType = error.code || error.message?.split(':')[0] || 'UNKNOWN'
    console.warn(`Storefront Redis connection issue [${errorType}]:`, {
      message: error.message,
      code: error.code,
      errno: error.errno,
      timestamp: new Date().toISOString()
    })
  })
  
  redis.on('connect', () => {})
  
  redis.on('ready', () => {})
  
  redis.on('close', () => {
    console.warn('Storefront Redis connection closed')
  })
  
  redis.on('reconnecting', (delay: number) => {})
}

export const CACHE_TTL = {
  PRODUCT: 300,        // 5 minutes
  CHECKOUT: 120,       // 2 minutes  
  PRICE_HISTORY: 900,  // 15 minutes
  SHIPPING: 600        // 10 minutes
} as const

class StorefrontCache {
  private connectionState: 'connecting' | 'ready' | 'error' = 'connecting'
  
  constructor() {
    this.initializeConnection()
  }

  private initializeConnection() {
    if (redis.status === 'ready') {
      this.connectionState = 'ready'
    } else {
      redis.once('ready', () => {
        this.connectionState = 'ready'
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Redis connection established')
        }
      })
      redis.once('error', (error: any) => {
        this.connectionState = 'error'
        if (process.env.NODE_ENV === 'development') {
          console.warn('❌ Redis connection failed:', error?.message || 'Unknown error')
        }
      })
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.connectionState !== 'ready') {
      return null
    }
    
    try {
      const data = await Promise.race([
        redis.get(key),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), 1000)
        )
      ])
      return data ? JSON.parse(data as string) : null
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Cache get failed for key: ${key}`, error)
      }
      return null
    }
  }

  async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    if (this.connectionState !== 'ready') {
      return
    }
    
    try {
      await Promise.race([
        redis.setex(key, ttlSeconds, JSON.stringify(data)),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), 1000)
        )
      ])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Cache set failed for key: ${key}`, error)
      }
    }
  }

  async del(key: string): Promise<void> {
    if (this.connectionState !== 'ready') {
      return
    }
    
    try {
      await Promise.race([
        redis.del(key),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), 1000)
        )
      ])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Cache delete failed for key: ${key}`, error)
      }
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (this.connectionState !== 'ready') {
      return
    }
    
    try {
      const keys = await redis.keys(`*${pattern}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Pattern invalidation failed: ${pattern}`, error)
      }
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