import { cache } from 'react'

// Simple memory cache for frequently accessed data
class SimpleMemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()
  private readonly maxSize = 500 // Reduced for serverless memory limits
  private readonly defaultTTL = 300000 // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  set(key: string, data: any, ttlMs: number = this.defaultTTL): void {
    // Simple LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    })
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

// Global memory cache instance
const memoryCache = new SimpleMemoryCache()

// Simple Redis client (optional, for persistent caching)
let Redis: any
let redis: any

if (typeof window === 'undefined' && process.env.STOREFRONT_REDIS_URL) {
  try {
    Redis = require('ioredis')
    redis = new Redis(process.env.STOREFRONT_REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryDelayOnFailover: 100,
      connectTimeout: 3000,
      commandTimeout: 2000,
      lazyConnect: true,
      keepAlive: 0,
      enableOfflineQueue: false,
      // Minimal error handling
      retryStrategy: (times: number) => times > 2 ? null : 100
    })
    
    redis.on('error', () => {
      redis = null // Disable on error
    })
  } catch {
    redis = null
  }
}

// TTL configurations
export const CACHE_TTL = {
  PRODUCT: 300, // 5 minutes
  PRICING: 30,  // 30 seconds
  INVENTORY: 60, // 1 minute
  MEASUREMENTS: 600, // 10 minutes
  CART: 120, // 2 minutes
  CATEGORIES: 1800, // 30 minutes
} as const

// Main cache interface
class UnifiedCache {
  async get<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = CACHE_TTL.PRODUCT): Promise<T> {
    // Check memory cache first (instant)
    const memoryResult = memoryCache.get<T>(key)
    if (memoryResult !== null) {
      return memoryResult
    }

    // Check Redis if available (with timeout)
    if (redis) {
      try {
        const redisResult = await Promise.race([
          redis.get(key),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 1500)
          )
        ])
        
        if (redisResult) {
          const parsed = JSON.parse(redisResult)
          memoryCache.set(key, parsed, ttlSeconds * 1000)
          return parsed
        }
      } catch {
        // Silent fallback
      }
    }

    // Fetch fresh data
    const result = await fetchFn()
    
    // Cache in memory
    memoryCache.set(key, result, ttlSeconds * 1000)
    
    // Cache in Redis (non-blocking)
    if (redis) {
      redis.setex(key, ttlSeconds, JSON.stringify(result)).catch(() => {
        // Silent failure
      })
    }
    
    return result
  }

  async invalidate(tags: string[]): Promise<void> {
    // Clear memory cache
    tags.forEach(tag => memoryCache.invalidate(tag))
    
    // Clear Redis (non-blocking)
    if (redis) {
      tags.forEach(tag => {
        redis.keys(`*${tag}*`).then((keys: string[]) => {
          if (keys.length > 0) {
            redis.del(...keys).catch(() => {})
          }
        }).catch(() => {})
      })
    }
  }

  async invalidateKey(key: string): Promise<void> {
    memoryCache.invalidate(key)
    
    if (redis) {
      redis.del(key).catch(() => {})
    }
  }

  clear(): void {
    memoryCache.clear()
  }

  getStats() {
    return {
      memory: memoryCache.getStats(),
      redis: redis ? 'connected' : 'disabled'
    }
  }
}

export const unifiedCache = new UnifiedCache()

// React cache wrapper for request deduplication
export const getCachedValue = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.PRODUCT
): Promise<T> => {
  return unifiedCache.get(key, fetchFn, ttl)
})

// Convenience functions
export const getCachedProduct = cache(async <T>(
  productId: string,
  locale: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return getCachedValue(`product:${productId}:${locale}`, fetchFn, CACHE_TTL.PRODUCT)
})

export const getCachedPricing = cache(async <T>(
  variantId: string,
  regionId: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return getCachedValue(`pricing:${variantId}:${regionId}`, fetchFn, CACHE_TTL.PRICING)
})

export const getCachedInventory = cache(async <T>(
  variantId: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return getCachedValue(`inventory:${variantId}`, fetchFn, CACHE_TTL.INVENTORY)
})

export const getCachedMeasurements = cache(async <T>(
  productId: string,
  variantId: string | undefined,
  locale: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  const key = `measurements:${productId}:${variantId || 'default'}:${locale}`
  return getCachedValue(key, fetchFn, CACHE_TTL.MEASUREMENTS)
})