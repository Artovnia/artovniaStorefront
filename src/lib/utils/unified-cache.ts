import { storefrontCache, getCacheStats } from './storefront-cache'
import { cache } from 'react'

interface CacheConfig {
  ttl: number
  batchable: boolean
  invalidationTags: string[]
  fallbackEnabled: boolean
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Product data - optimized TTLs for performance
  'product:details:': { ttl: 300000, batchable: false, invalidationTags: ['products'], fallbackEnabled: true }, // 5 min
  'product:pricing:': { ttl: 30000, batchable: true, invalidationTags: ['pricing', 'promotions'], fallbackEnabled: true }, // 30s
  'product:inventory:': { ttl: 45000, batchable: true, invalidationTags: ['inventory'], fallbackEnabled: true }, // 45s
  'cart:': { ttl: 60000, batchable: false, invalidationTags: ['cart'], fallbackEnabled: true }, // 1 min
  
  // Semi-critical data
  'seller:products:': { ttl: 600000, batchable: false, invalidationTags: ['products', 'sellers'], fallbackEnabled: true },
  'product:reviews:': { ttl: 900000, batchable: false, invalidationTags: ['reviews'], fallbackEnabled: true },
  'wishlist:': { ttl: 300000, batchable: false, invalidationTags: ['wishlist'], fallbackEnabled: true },
  'breadcrumbs:': { ttl: 1800000, batchable: false, invalidationTags: ['navigation'], fallbackEnabled: true },
  
  // Static data - longer cache times
  'categories:': { ttl: 3600000, batchable: false, invalidationTags: ['categories'], fallbackEnabled: true },
  'homepage:': { ttl: 900000, batchable: false, invalidationTags: ['homepage'], fallbackEnabled: true },
  'reviews:': { ttl: 600000, batchable: false, invalidationTags: ['reviews'], fallbackEnabled: true },
  
  // Time-sensitive data with fallbacks
  'measurements:': { ttl: 120000, batchable: false, invalidationTags: ['measurements'], fallbackEnabled: true }, // 2 min
  'region:': { ttl: 3600000, batchable: false, invalidationTags: ['regions'], fallbackEnabled: true },
  
  // Product display data
  'product:card:': { ttl: 180000, batchable: true, invalidationTags: ['products'], fallbackEnabled: true }, // 3 min
  'category:tree:': { ttl: 1800000, batchable: false, invalidationTags: ['categories'], fallbackEnabled: true },
  'category:metadata:': { ttl: 1800000, batchable: false, invalidationTags: ['categories'], fallbackEnabled: true },
  
  // Homepage content
  'homepage:newest:': { ttl: 300000, batchable: false, invalidationTags: ['products', 'homepage'], fallbackEnabled: true },
  'homepage:top:': { ttl: 600000, batchable: false, invalidationTags: ['products', 'homepage'], fallbackEnabled: true },
  
  // Promotion data
  'products:promotions:': { ttl: 30000, batchable: false, invalidationTags: ['promotions', 'products'], fallbackEnabled: true }, // 30s - same as pricing
  'promotional:price:': { ttl: 30000, batchable: true, invalidationTags: ['promotions', 'pricing'], fallbackEnabled: true }, // 30s - same as pricing
}

interface CacheStats {
  connected: boolean
  size: number
  operations: number
  failures: number
  circuitBreakerOpen: boolean
  timestamp: number
  error?: string
}

interface UnifiedCacheStats {
  redis: CacheStats
  pending: number
  circuitBreaker: {
    open: boolean
    failures: number
    lastFailure: number
  }
  pendingKeys: string[]
  serverless: boolean
  error?: string
}

class UnifiedCache {
  private redis = storefrontCache
  private pendingRequests = new Map<string, Promise<any>>()
  private isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
  
  // Circuit breaker - more conservative for production
  private failureCount = 0
  private lastFailureTime = 0
  private circuitBreakerOpen = false
  private readonly maxFailures = 10 // Increased threshold
  private readonly resetTimeout = 30000 // 30 seconds

  private checkCircuitBreaker(): boolean {
    if (this.circuitBreakerOpen) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.circuitBreakerOpen = false
        this.failureCount = 0
        console.log('🔄 Cache circuit breaker reset')
      } else {
        return false
      }
    }
    return true
  }

  private recordFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= this.maxFailures) {
      this.circuitBreakerOpen = true
      console.error('🚨 Cache circuit breaker opened - too many failures')
    }
  }

  private recordSuccess() {
    // Reset failure count on successful operations
    if (this.failureCount > 0) {
      this.failureCount = Math.max(0, this.failureCount - 1)
    }
  }

  async get<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const config = this.getConfig(key)
    
    // Always try cache first - this is crucial for performance
    if (this.checkCircuitBreaker()) {
      try {
        const cached = await Promise.race([
          this.redis.get<T>(key),
          new Promise<T | null>((_, reject) => 
            setTimeout(() => reject(new Error('Cache timeout')), 1000)
          )
        ])
        
        if (cached !== null) {
          this.recordSuccess()
          return cached
        }
      } catch (error) {
        this.recordFailure()
        console.warn(`Cache read failed for ${key}:`, error)
      }
    }

    // Handle request deduplication for serverless
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }

    // Execute fetch with proper error handling
    const promise = this.executeFetch(key, fetchFn, config)
    this.pendingRequests.set(key, promise)
    
    return promise.finally(() => {
      this.pendingRequests.delete(key)
    })
  }

  private async executeFetch<T>(key: string, fetchFn: () => Promise<T>, config: CacheConfig): Promise<T> {
    try {
      // Set reasonable timeout for fetch operations
      const fetchTimeout = this.isServerless ? 8000 : 15000
      
      const result = await Promise.race([
        fetchFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Fetch timeout for ${key}`)), fetchTimeout)
        )
      ])

      // Cache the successful result
      this.cacheResult(key, result, config).catch(error => {
        console.warn(`Failed to cache result for ${key}:`, error)
      })

      this.recordSuccess()
      return result

    } catch (error) {
      this.recordFailure()
      console.error(`Fetch failed for ${key}:`, error)
      
      // Try fallback value if enabled
      if (config.fallbackEnabled) {
        const fallback = this.getFallbackValue<T>(key)
        if (fallback !== null) {
          console.warn(`Using fallback value for ${key}`)
          return fallback
        }
      }

      throw error
    }
  }

  private async cacheResult(key: string, result: any, config: CacheConfig): Promise<void> {
    if (!this.checkCircuitBreaker()) return
    
    try {
      await this.redis.set(key, result, Math.floor(config.ttl / 1000), config.invalidationTags)
    } catch (error) {
      // Cache write failures shouldn't break the main flow
      console.warn(`Cache write failed for ${key}:`, error)
    }
  }

  private getFallbackValue<T>(key: string): T | null {
    // Enhanced fallback values for better UX
    if (key.includes('cart:')) {
      return { 
        id: null, 
        items: [], 
        total: 0, 
        subtotal: 0, 
        item_total: 0,
        shipping_total: 0,
        tax_total: 0,
        currency_code: 'PLN',
        region: null,
        shipping_address: null,
        billing_address: null,
        shipping_methods: [],
        payment_collection: null
      } as T
    }
    
    if (key.includes('measurements')) {
      return [] as T
    }
    
    if (key.includes('product:inventory:')) {
      return { available: false, quantity: 0, manage_inventory: true } as T
    }
    
    if (key.includes('product:pricing:') || key.includes('promotional:price:')) {
      return { 
        calculated_price: null, 
        original_price: null,
        has_promotion: false,
        promotional_price: null 
      } as T
    }
    
    if (key.includes('reviews')) {
      return [] as T
    }
    
    if (key.includes('categories') || key.includes('category:tree')) {
      return [] as T
    }
    
    if (key.includes('category:metadata')) {
      return { title: '', description: '', seo_title: '', seo_description: '' } as T
    }
    
    if (key.includes('breadcrumbs')) {
      return [] as T
    }
    
    if (key.includes('wishlist')) {
      return { wishlists: [], inWishlist: false, wishlistId: null } as T
    }
    
    if (key.includes('products:list') || key.includes('homepage:newest') || key.includes('homepage:top')) {
      return { products: [], count: 0, nextPage: null } as T
    }
    
    if (key.includes('seller:products')) {
      return { products: [], count: 0 } as T
    }
    
    if (key.includes('region')) {
      return null as T
    }
    
    return null
  }

  async invalidate(tags: string[]): Promise<void> {
    try {
      await this.redis.invalidateTags(tags)
      console.log(`Invalidated cache tags: ${tags.join(', ')}`)
    } catch (error) {
      console.warn(`Failed to invalidate tags ${tags.join(', ')}:`, error)
    }
    
    // Clear related pending requests
    for (const [key] of this.pendingRequests.entries()) {
      const config = this.getConfig(key)
      if (config.invalidationTags.some(t => tags.includes(t))) {
        this.pendingRequests.delete(key)
      }
    }
  }

  async invalidateKey(key: string): Promise<void> {
    try {
      await this.redis.del(key)
      this.pendingRequests.delete(key)
      console.log(`Invalidated cache key: ${key}`)
    } catch (error) {
      console.warn(`Failed to invalidate key ${key}:`, error)
    }
  }

  private getConfig(key: string): CacheConfig {
    // Efficient prefix matching
    for (const [pattern, config] of Object.entries(CACHE_CONFIGS)) {
      if (key.startsWith(pattern)) {
        return config
      }
    }
    
    // Sensible defaults
    return { 
      ttl: 300000, // 5 minutes
      batchable: false, 
      invalidationTags: ['general'],
      fallbackEnabled: true
    }
  }

  async getStats(): Promise<UnifiedCacheStats> {
    try {
      const redisStats = await getCacheStats()
      
      // Ensure all stats have the required properties
      const normalizedRedisStats: CacheStats = {
        connected: redisStats.connected ?? false,
        size: redisStats.size ?? 0,
        operations: redisStats.operations ?? 0,
        failures: redisStats.failures ?? 0,
        circuitBreakerOpen: redisStats.circuitBreakerOpen ?? false,
        timestamp: redisStats.timestamp ?? Date.now(),
        ...(redisStats.error && { error: redisStats.error })
      }

      return {
        redis: normalizedRedisStats,
        pending: this.pendingRequests.size,
        circuitBreaker: {
          open: this.circuitBreakerOpen,
          failures: this.failureCount,
          lastFailure: this.lastFailureTime
        },
        pendingKeys: Array.from(this.pendingRequests.keys()),
        serverless: this.isServerless
      }
    } catch (error) {
      return {
        redis: {
          connected: false,
          size: 0,
          operations: 0,
          failures: 0,
          circuitBreakerOpen: false,
          timestamp: Date.now(),
          error: 'Failed to get Redis stats'
        },
        pending: this.pendingRequests.size,
        circuitBreaker: {
          open: this.circuitBreakerOpen,
          failures: this.failureCount,
          lastFailure: this.lastFailureTime
        },
        pendingKeys: Array.from(this.pendingRequests.keys()),
        serverless: this.isServerless,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  clear() {
    this.pendingRequests.clear()
    console.log('🧹 Cache cleared')
  }

  // Health check method
  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const stats = await this.getStats()
      const healthy = !this.circuitBreakerOpen && 
                     stats.redis.connected &&
                     this.failureCount < this.maxFailures / 2

      return {
        healthy,
        details: {
          circuitBreakerOpen: this.circuitBreakerOpen,
          failureCount: this.failureCount,
          pendingRequests: this.pendingRequests.size,
          redisConnected: stats.redis.connected,
          redisErrors: stats.redis.error
        }
      }
    } catch (error) {
      return {
        healthy: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }
}

export const unifiedCache = new UnifiedCache()

// Request-level cache deduplication using React cache()
export const getCachedValue = cache(async <T>(
  key: string, 
  fetchFn: () => Promise<T>
): Promise<T> => {
  return unifiedCache.get(key, fetchFn)
})

// Convenience functions for common patterns
export const getCachedProduct = cache(async <T>(
  productId: string,
  locale: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return getCachedValue(`product:details:${productId}:${locale}`, fetchFn)
})

export const getCachedPricing = cache(async <T>(
  variantId: string,
  regionId: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return getCachedValue(`product:pricing:${variantId}:${regionId}`, fetchFn)
})

export const getCachedInventory = cache(async <T>(
  variantId: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  return getCachedValue(`product:inventory:${variantId}`, fetchFn)
})
