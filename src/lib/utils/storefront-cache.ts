/**
 * Production-ready Redis cache implementation for storefront
 * Optimized for Vercel serverless environment and high traffic
 */

let Redis: any
if (typeof window === 'undefined') {
  try {
    Redis = require('ioredis')
  } catch (error) {
    console.warn('ioredis not available, using fallback cache')
    Redis = null
  }
}

import { cache } from 'react'

// Production-optimized Redis configuration
let redis: any
const REDIS_TIMEOUT = 2000 // 2 seconds max for serverless
const REDIS_CONNECT_TIMEOUT = 3000 // 3 seconds for connection

// Debug Redis connection setup
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Redis Debug Info:', {
    isServer: typeof window === 'undefined',
    hasRedis: !!Redis,
    hasRedisUrl: !!process.env.STOREFRONT_REDIS_URL,
    redisUrl: process.env.STOREFRONT_REDIS_URL ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV
  })
}

if (typeof window === 'undefined' && Redis && process.env.STOREFRONT_REDIS_URL) {
  try {
    console.log('🚀 Attempting Redis connection...')
    redis = new Redis(process.env.STOREFRONT_REDIS_URL, {
      // Vercel serverless optimizations
      maxRetriesPerRequest: 0,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: REDIS_CONNECT_TIMEOUT,
      commandTimeout: REDIS_TIMEOUT,
      retryStrategy: () => null,
      
      // Connection management
      enableReadyCheck: false,
      maxLoadingTimeout: REDIS_CONNECT_TIMEOUT,
      keepAlive: 0,
      family: 4,
      
      // Disable automatic reconnection in serverless
      reconnectOnError: () => false,
      
      // Performance settings
      maxMemoryPolicy: 'allkeys-lru', // Better for cache scenarios
      showFriendlyErrorStack: process.env.NODE_ENV === 'development',
      
      // Pool settings for better connection management
      enableAutoPipelining: true,
      
      // Compression for large values
      compression: 'gzip'
    })

    // Error handling with proper logging
    redis.on('error', (error: any) => {
      const errorInfo = {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        timestamp: new Date().toISOString()
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('Redis connection error:', errorInfo)
      }
      
      // Set to null on critical errors to trigger fallback mode
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        redis = null
      }
    })

    redis.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Redis connected successfully')
      }
    })

    redis.on('ready', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Redis ready for operations')
      }
    })

    redis.on('close', () => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔌 Redis connection closed')
      }
    })

    // Force connection in development to trigger events
    if (process.env.NODE_ENV === 'development') {
      redis.connect().catch((error: any) => {
        console.error('❌ Manual Redis connection failed:', error)
      })
    }

  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    redis = null
  }
} else {
  // Fallback for client-side or missing Redis URL
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Using Redis fallback mode because:', {
      isClientSide: typeof window !== 'undefined',
      noRedisModule: !Redis,
      noRedisUrl: !process.env.STOREFRONT_REDIS_URL,
      redisUrl: process.env.STOREFRONT_REDIS_URL || 'undefined'
    })
  }
  
  redis = {
    get: () => Promise.resolve(null),
    set: () => Promise.resolve('OK'),
    setex: () => Promise.resolve('OK'),
    del: () => Promise.resolve(0),
    keys: () => Promise.resolve([]),
    mget: () => Promise.resolve([]),
    dbsize: () => Promise.resolve(0),
    smembers: () => Promise.resolve([]),
    sadd: () => Promise.resolve(0),
    expire: () => Promise.resolve(1),
    status: 'ready',
    on: () => {},
    pipeline: () => ({
      setex: () => ({}),
      sadd: () => ({}),
      expire: () => ({}),
      exec: () => Promise.resolve([])
    })
  }
}

export const CACHE_TTL = {
  PRODUCT: 300,        // 5 minutes
  PRICING: 30,         // 30 seconds
  INVENTORY: 45,       // 45 seconds  
  CHECKOUT: 60,        // 1 minute
  REVIEWS: 600,        // 10 minutes
  CATEGORIES: 3600,    // 1 hour
  PRICE_HISTORY: 900,  // 15 minutes
  SHIPPING: 300        // 5 minutes
} as const

class StorefrontCache {
  private connectionState: 'connecting' | 'ready' | 'error' = 'connecting'
  private operationCount = 0
  private lastOperationTime = Date.now()
  private failureCount = 0
  private readonly maxFailures = 5
  private circuitBreakerOpen = false
  
  constructor() {
    this.initializeConnection()
    this.startHealthMonitoring()
  }

  private initializeConnection() {
    if (!redis || redis === null) {
      this.connectionState = 'error'
      return
    }

    if (redis.status === 'ready') {
      this.connectionState = 'ready'
    } else {
      redis.once('ready', () => {
        this.connectionState = 'ready'
        this.failureCount = 0
        this.circuitBreakerOpen = false
      })
      
      redis.once('error', () => {
        this.connectionState = 'error'
      })
    }
  }

  private startHealthMonitoring() {
    // Reset circuit breaker periodically
    setInterval(() => {
      if (this.circuitBreakerOpen && Date.now() - this.lastOperationTime > 60000) {
        this.circuitBreakerOpen = false
        this.failureCount = 0
        console.log('🔄 Redis circuit breaker reset')
      }
    }, 60000) // Check every minute
  }

  private checkHealth(): boolean {
    if (this.circuitBreakerOpen) {
      return false
    }
    
    if (this.connectionState !== 'ready' || !redis) {
      return false
    }
    
    return true
  }

  private recordOperation(success: boolean) {
    this.operationCount++
    this.lastOperationTime = Date.now()
    
    if (!success) {
      this.failureCount++
      if (this.failureCount >= this.maxFailures) {
        this.circuitBreakerOpen = true
        console.error('🚨 Redis circuit breaker opened')
      }
    } else if (this.failureCount > 0) {
      this.failureCount--
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.checkHealth()) {
      return null
    }
    
    try {
      const data = await Promise.race([
        redis.get(key),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT)
        )
      ])
      
      this.recordOperation(true)
      return data ? JSON.parse(data as string) : null
    } catch (error) {
      this.recordOperation(false)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Redis get failed for key: ${key}`, error)
      }
      return null
    }
  }

  async set(key: string, data: any, ttlSeconds: number, tags: string[] = []): Promise<boolean> {
    if (!this.checkHealth()) {
      return false
    }
    
    try {
      const serializedData = JSON.stringify(data)
      
      // Use pipeline for better performance with tags
      const pipeline = redis.pipeline()
      pipeline.setex(key, ttlSeconds, serializedData)
      
      // Add tags for invalidation
      if (tags.length > 0) {
        const tagTTL = ttlSeconds + 300 // Tags live slightly longer
        for (const tag of tags) {
          pipeline.sadd(`tag:${tag}`, key)
          pipeline.expire(`tag:${tag}`, tagTTL)
        }
      }
      
      await Promise.race([
        pipeline.exec(),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT)
        )
      ])
      
      this.recordOperation(true)
      return true
    } catch (error) {
      this.recordOperation(false)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Redis set failed for key: ${key}`, error)
      }
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.checkHealth()) {
      return false
    }
    
    try {
      await Promise.race([
        redis.del(key),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT)
        )
      ])
      
      this.recordOperation(true)
      return true
    } catch (error) {
      this.recordOperation(false)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Redis delete failed for key: ${key}`, error)
      }
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.checkHealth()) {
      return
    }
    
    try {
      const keys = await redis.keys(`*${pattern}*`)
      if (keys.length > 0) {
        // Process in batches to avoid blocking Redis
        const batchSize = 100
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize)
          await redis.del(...batch)
        }
      }
      this.recordOperation(true)
    } catch (error) {
      this.recordOperation(false)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Pattern invalidation failed: ${pattern}`, error)
      }
    }
  }

  async invalidateTags(tags: string[]): Promise<void> {
    if (!this.checkHealth()) {
      return
    }

    try {
      const allKeys = new Set<string>()
      
      // Collect all keys from all tags
      for (const tag of tags) {
        try {
          const keys = await redis.smembers(`tag:${tag}`)
          keys.forEach((key: string) => allKeys.add(key))
          allKeys.add(`tag:${tag}`) // Also remove the tag set itself
        } catch (tagError) {
          console.warn(`Failed to get keys for tag: ${tag}`, tagError)
        }
      }
      
      if (allKeys.size > 0) {
        // Delete in batches
        const keysArray = Array.from(allKeys)
        const batchSize = 100
        
        for (let i = 0; i < keysArray.length; i += batchSize) {
          const batch = keysArray.slice(i, i + batchSize)
          await redis.del(...batch)
        }
      }
      
      this.recordOperation(true)
    } catch (error) {
      this.recordOperation(false)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Tag-based invalidation failed for tags: ${tags.join(', ')}`, error)
      }
    }
  }

  // Batch operations for performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.checkHealth() || keys.length === 0) {
      return keys.map(() => null)
    }

    try {
      const values = await Promise.race([
        redis.mget(...keys),
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT)
        )
      ])
      
      this.recordOperation(true)
      return values.map((v: string | null) => v ? JSON.parse(v) : null)
    } catch (error) {
      this.recordOperation(false)
      console.error('Redis mget error:', error)
      return keys.map(() => null)
    }
  }

  async mset(entries: Array<{ key: string; data: any; ttl: number; tags?: string[] }>): Promise<boolean> {
    if (!this.checkHealth() || entries.length === 0) {
      return false
    }

    try {
      const pipeline = redis.pipeline()
      
      for (const { key, data, ttl, tags = [] } of entries) {
        pipeline.setex(key, ttl, JSON.stringify(data))
        
        // Handle tags
        if (tags.length > 0) {
          const tagTTL = ttl + 300
          for (const tag of tags) {
            pipeline.sadd(`tag:${tag}`, key)
            pipeline.expire(`tag:${tag}`, tagTTL)
          }
        }
      }
      
      await Promise.race([
        pipeline.exec(),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT * 2)
        )
      ])
      
      this.recordOperation(true)
      return true
    } catch (error) {
      this.recordOperation(false)
      console.error('Redis mset error:', error)
      return false
    }
  }

  async getStats() {
    try {
      if (!redis || this.connectionState !== 'ready') {
        return {
          connected: false,
          size: 0,
          operations: this.operationCount,
          failures: this.failureCount,
          circuitBreakerOpen: this.circuitBreakerOpen,
          timestamp: Date.now()
        }
      }

      const dbsize = await Promise.race([
        redis.dbsize(),
        new Promise<number>((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT)
        )
      ])
      
      return { 
        connected: true,
        size: dbsize,
        operations: this.operationCount,
        failures: this.failureCount,
        circuitBreakerOpen: this.circuitBreakerOpen,
        timestamp: Date.now()
      }
    } catch (error) {
      return { 
        connected: false,
        size: 0,
        operations: this.operationCount,
        failures: this.failureCount,
        circuitBreakerOpen: this.circuitBreakerOpen,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    if (!redis || this.connectionState !== 'ready') {
      return { healthy: false, error: 'Redis not connected' }
    }

    try {
      const start = Date.now()
      await redis.ping()
      const latency = Date.now() - start
      
      return { 
        healthy: !this.circuitBreakerOpen && latency < 1000,
        latency 
      }
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const storefrontCache = new StorefrontCache()

// Enhanced cached data fetcher with React cache() for request deduplication
export const getCachedData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.PRODUCT,
  tags: string[] = [],
  validator?: (data: any) => boolean
): Promise<T> => {
  // Try cache first
  const cached = await storefrontCache.get<T>(key)
  if (cached && (!validator || validator(cached))) {
    return cached
  }

  // Fetch fresh data
  const result = await fetchFn()
  
  // Cache if valid
  if (!validator || validator(result)) {
    await storefrontCache.set(key, result, ttl, tags)
  }
  
  return result
})

// Validation functions
export function isValidProductData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  return !!(data.id && data.handle && data.title && Array.isArray(data.variants))
}

export function isValidPriceData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  return Object.keys(data).length >= 0 // Allow empty objects for batch responses
}

export function isValidInventoryData(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  return typeof data.available === 'boolean' && typeof data.quantity === 'number'
}

// Specific cache functions with validation
export const getCachedProduct = cache(async (
  handle: string, 
  locale: string, 
  fetchFn: () => Promise<any>
): Promise<any> => {
  return getCachedData(
    `product:details:${handle}:${locale}`,
    fetchFn,
    CACHE_TTL.PRODUCT,
    ['products'],
    isValidProductData
  )
})

export const getCachedPricing = cache(async (
  variantIds: string[],
  currencyCode: string,
  regionId: string | undefined,
  fetchFn: () => Promise<Record<string, any>>
): Promise<Record<string, any>> => {
  const key = variantIds.length > 5 
    ? `pricing:batch:${Buffer.from(variantIds.sort().join(',')).toString('base64').slice(0, 20)}:${currencyCode}:${regionId || 'default'}`
    : `pricing:${variantIds.sort().join(',')}:${currencyCode}:${regionId || 'default'}`
    
  return getCachedData(
    key,
    fetchFn,
    CACHE_TTL.PRICING,
    ['pricing', 'promotions'],
    isValidPriceData
  )
})

export const getCachedInventory = cache(async (
  variantIds: string[],
  fetchFn: () => Promise<Record<string, any>>
): Promise<Record<string, any>> => {
  const key = variantIds.length > 5
    ? `inventory:batch:${Buffer.from(variantIds.sort().join(',')).toString('base64').slice(0, 20)}`
    : `inventory:${variantIds.sort().join(',')}`
    
  return getCachedData(
    key,
    fetchFn,
    CACHE_TTL.INVENTORY,
    ['inventory']
  )
})

// Cache invalidation functions
export const invalidateProductCache = async (handle: string, locale?: string) => {
  if (locale) {
    await storefrontCache.del(`product:details:${handle}:${locale}`)
  } else {
    await storefrontCache.invalidatePattern(`product:details:${handle}:`)
  }
}

export const invalidatePricingCache = async () => {
  await storefrontCache.invalidateTags(['pricing', 'promotions'])
}

export const invalidateInventoryCache = async () => {
  await storefrontCache.invalidateTags(['inventory'])
}

export const invalidateCheckoutCache = async (cartId: string) => {
  // Invalidate all checkout-related cache entries for the specific cart
  await storefrontCache.invalidatePattern(`checkout:${cartId}:`)
  await storefrontCache.invalidatePattern(`cart:${cartId}:`)
  await storefrontCache.invalidatePattern(`shipping:${cartId}:`)
  await storefrontCache.invalidatePattern(`payment:${cartId}:`)
  
  // Also invalidate by tags
  await storefrontCache.invalidateTags(['checkout', 'cart'])
}

export const clearAllCaches = async () => {
  await storefrontCache.invalidatePattern('*')
}

// Export stats function
export const getCacheStats = () => storefrontCache.getStats()

// Backward compatibility exports
export const persistentCache = storefrontCache
export const PRICE_HISTORY_CACHE_DURATION = CACHE_TTL.PRICE_HISTORY
export const PRODUCT_CACHE_DURATION = CACHE_TTL.PRODUCT
export const CHECKOUT_CACHE_DURATION = CACHE_TTL.CHECKOUT