// src/lib/utils/unified-cache.ts
import { storefrontCache, getCacheStats } from './storefront-cache'

interface CacheConfig {
  ttl: number
  critical: boolean // Always fetch fresh
  batchable: boolean // Can be batched with similar requests
  invalidationTags: string[] // Tags for targeted invalidation
}
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Split product data by criticality
  'product:details:': { ttl: 1800000, critical: false, batchable: false, invalidationTags: ['products'] }, // 30 min - static data only (description, categories, metadata)
  'product:pricing:': { ttl: 10000, critical: true, batchable: true, invalidationTags: ['pricing', 'promotions'] }, // 10s - all pricing including promotions
  'product:inventory:': { ttl: 15000, critical: true, batchable: true, invalidationTags: ['inventory'] }, // 15s - stock levels
  'cart:': { ttl: 60000, critical: true, batchable: false, invalidationTags: ['cart'] }, // 1 minute
  
  // Semi-critical data
  'seller:products:': { ttl: 600000, critical: false, batchable: false, invalidationTags: ['products', 'sellers'] }, // 10 minutes
  'product:reviews:': { ttl: 900000, critical: false, batchable: false, invalidationTags: ['reviews'] }, // 15 minutes
  'wishlist:': { ttl: 600000, critical: false, batchable: false, invalidationTags: ['wishlist'] }, // 10 minutes
  'breadcrumbs:': { ttl: 1800000, critical: false, batchable: false, invalidationTags: ['navigation'] }, // 30 minutes
  
  // Long-lived static data
  'categories:': { ttl: 3600000, critical: false, batchable: false, invalidationTags: ['categories'] }, // 1 hour
  'homepage:': { ttl: 1800000, critical: false, batchable: false, invalidationTags: ['homepage'] }, // 30 minutes
  'reviews:': { ttl: 600000, critical: false, batchable: false, invalidationTags: ['reviews'] },
  
  // Measurements and regions - short TTL to prevent timeout issues
  'measurements:': { ttl: 60000, critical: true, batchable: false, invalidationTags: ['measurements'] }, // 1 minute, critical for fresh data
  'region:': { ttl: 3600000, critical: false, batchable: false, invalidationTags: ['regions'] },
  
  // Product card data - careful with freshness requirements
  'product:card:': { ttl: 300000, critical: false, batchable: true, invalidationTags: ['products'] }, // 5 minutes
  'category:tree:': { ttl: 1800000, critical: false, batchable: false, invalidationTags: ['categories'] }, // 30 min cache
  'category:metadata:': { ttl: 1800000, critical: false, batchable: false, invalidationTags: ['categories'] }, // 30 min cache
  
  // Homepage sections - can cache safely
  'homepage:newest:': { ttl: 300000, critical: false, batchable: false, invalidationTags: ['products', 'homepage'] }, // 5 min cache
  'homepage:top:': { ttl: 600000, critical: false, batchable: false, invalidationTags: ['products', 'homepage'] }, // 10 min cache
  
  // Promotion data - needs frequent updates
  'products:promotions:': { ttl: 300000, critical: false, batchable: false, invalidationTags: ['promotions', 'products'] }, // 5 min cache - promotion metadata
  'promotional:price:': { ttl: 10000, critical: true, batchable: true, invalidationTags: ['promotions', 'pricing'] }, // 10s same as product:pricing
}

class UnifiedCache {
  private redis = storefrontCache
  private pendingRequests = new Map<string, Promise<any>>()
  private batchQueue = new Map<string, Array<{ key: string, resolve: Function, reject: Function, fetchFn: Function }>>()
  private batchTimers = new Map<string, NodeJS.Timeout>()

  async get<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const config = this.getConfig(key)
    
    // Add timeout to prevent hanging requests with proper cleanup
    const timeoutDuration = config.critical ? 5000 : 10000
    let timeoutId: NodeJS.Timeout | undefined
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`Request timeout for key: ${key}`)), timeoutDuration)
    })
    
    try {
      // Critical data - always fetch fresh but still deduplicate concurrent requests
      if (config.critical) {
        const result = await Promise.race([
          this.executeFresh(key, fetchFn),
          timeoutPromise
        ])
        // Clear timeout on successful completion
        if (timeoutId) clearTimeout(timeoutId)
        return result
      }
      
      // Check Redis cache first for non-critical data
      try {
        const cached = await this.redis.get<T>(key)
        if (cached) {
          // Clear timeout on cache hit
          if (timeoutId) clearTimeout(timeoutId)
          return cached
        }
      } catch (error) {
        console.warn(`Cache read failed for ${key}:`, error)
      }
      
      // Handle batchable requests
      if (config.batchable) {
        const result = await Promise.race([
          this.addToBatch(key, fetchFn, config),
          timeoutPromise
        ])
        // Clear timeout on successful completion
        if (timeoutId) clearTimeout(timeoutId)
        return result
      }
      
      // Regular request with deduplication
      const result = await Promise.race([
        this.executeWithDeduplication(key, fetchFn, config),
        timeoutPromise
      ])
      // Clear timeout on successful completion
      if (timeoutId) clearTimeout(timeoutId)
      return result
      
    } catch (error) {
      // Clean up timeout and pending request on error
      if (timeoutId) clearTimeout(timeoutId)
      this.pendingRequests.delete(key)
      
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn(`Cache request timed out for key: ${key}`)
        // Return fallback value instead of throwing
        return this.getFallbackValue<T>(key)
      }
      
      // For other errors, try to return fallback if available
      try {
        const fallbackValue = this.getFallbackValue<T>(key)
        if (fallbackValue !== null && fallbackValue !== undefined) {
          console.warn(`Using fallback value for failed request: ${key}`)
          return fallbackValue
        }
      } catch (fallbackError) {
        // If fallback fails, continue to throw original error
      }
      
      throw error
    }
  }

  private async executeFresh<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // For critical data, still deduplicate concurrent requests but don't cache
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }
    
    
    const promise = fetchFn()
      .catch((error) => {
        // Log the error but re-throw it
        console.error(`Fresh request failed for ${key}:`, error)
        throw error
      })
      .finally(() => {
        this.pendingRequests.delete(key)
      })
    
    this.pendingRequests.set(key, promise)
    return promise
  }

  private async executeWithDeduplication<T>(key: string, fetchFn: () => Promise<T>, config: CacheConfig): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>
    }

    const promise = fetchFn()
      .then(async (result) => {
        // Cache the result with tags
        try {
          await this.redis.set(key, result, Math.floor(config.ttl / 1000), config.invalidationTags)
        } catch (error) {
          console.warn(`Cache write failed for ${key}:`, error)
        }
        return result
      })
      .catch((error) => {
        console.error(`Request failed for ${key}:`, error)
        throw error
      })
      .finally(() => {
        this.pendingRequests.delete(key)
      })

    this.pendingRequests.set(key, promise)
    return promise
  }

  private async addToBatch<T>(key: string, fetchFn: () => Promise<T>, config: CacheConfig): Promise<T> {
    const batchType = this.getBatchType(key)
    
    return new Promise((resolve, reject) => {
      if (!this.batchQueue.has(batchType)) {
        this.batchQueue.set(batchType, [])
        
        // Set timer to process batch after collecting similar requests
        const timer = setTimeout(() => {
          this.processBatch(batchType)
          this.batchTimers.delete(batchType)
        }, 10) // Very short delay to collect concurrent requests
        
        this.batchTimers.set(batchType, timer)
      }
      
      this.batchQueue.get(batchType)!.push({ key, resolve, reject, fetchFn })
    })
  }

  private getBatchType(key: string): string {
    // Group similar requests together
    if (key.includes('products:list')) return 'products'
    if (key.includes('prices:')) return 'prices'
    if (key.includes('inventory:')) return 'inventory'
    return 'default'
  }

  private async processBatch(batchType: string) {
    const batch = this.batchQueue.get(batchType)
    if (!batch || batch.length === 0) {
      this.batchQueue.delete(batchType)
      return
    }

    this.batchQueue.delete(batchType)

    // Process each request individually with error handling
    const promises = batch.map(async (item) => {
      try {
        const result = await item.fetchFn()
        item.resolve(result)
      } catch (error) {
        console.error(`Batch request failed for ${item.key}:`, error)
        item.reject(error)
      }
    })

    // Wait for all batch items to complete
    await Promise.allSettled(promises)
  }

  private getFallbackValue<T>(key: string): T {
    // Provide sensible fallback values for different data types
    if (key.includes('cart:')) {
      // Return minimal cart structure for cart operations
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
      return [] as T  // Return empty array for measurements
    }
    if (key.includes('reviews')) {
      return [] as T
    }
    if (key.includes('customer') || key.includes('auth')) {
      return null as T
    }
    if (key.includes('vendor') || key.includes('seller')) {
      return null as T
    }
    if (key.includes('breadcrumbs')) {
      return [] as T
    }
    if (key.includes('region')) {
      return null as T
    }
    if (key.includes('wishlists')) {
      return { wishlists: [] } as T
    }
    if (key.includes('products:list')) {
      return { response: { products: [], count: 0 }, nextPage: null } as T
    }
    if (key.includes('prices:')) {
      return {} as T // Empty price object
    }
    if (key.includes('inventory:')) {
      return { available: false, quantity: 0 } as T
    }
    if (key.includes('categories') || key.includes('category:tree')) {
      // All category cache keys return arrays (even products-database returns array that gets converted to Set)
      return [] as T
    }
    if (key.includes('category:metadata')) {
      return { title: '', description: '' } as T
    }
    if (key.includes('price:calculation')) {
      return { calculated_price: null, original_price: null } as T
    }
    if (key.includes('promotional:price')) {
      return { has_promotion: false, promotional_price: null } as T
    }
    if (key.includes('wishlist:state')) {
      return { inWishlist: false, wishlistId: null } as T
    }
    if (key.includes('product:availability')) {
      return { available: false, quantity: 0, manage_inventory: true } as T
    }
    if (key.includes('homepage:newest') || key.includes('homepage:top')) {
      return { products: [], count: 0 } as T
    }
    
    // For unknown types, return null
    return null as T
  }

  async invalidate(tags: string[]): Promise<void> {
    try {
      // Use efficient tag-based invalidation
      await this.redis.invalidateTags(tags)
    } catch (error) {
      console.warn(`Failed to invalidate tags ${tags.join(', ')}:`, error)
    }
    
    // Clear related pending requests
    for (const [key] of this.pendingRequests.entries()) {
      if (this.getConfig(key).invalidationTags.some(t => tags.includes(t))) {
        this.pendingRequests.delete(key)
      }
    }
  }

  async invalidateKey(key: string): Promise<void> {
    try {
      await this.redis.del(key)
      this.pendingRequests.delete(key)
    } catch (error) {
      console.warn(`Failed to invalidate key ${key}:`, error)
    }
  }

  private getConfig(key: string): CacheConfig {
    // Match key against patterns using strict prefix matching
    for (const [pattern, config] of Object.entries(CACHE_CONFIGS)) {
      if (key.startsWith(pattern)) {
        return config
      }
    }
    // Default config for unmatched keys
    return { ttl: 60000, critical: false, batchable: false, invalidationTags: ['general'] }
  }

  async getStats() {
    const redisStats = await getCacheStats()
    return {
      redis: redisStats,
      pending: this.pendingRequests.size,
      batches: this.batchQueue.size,
      pendingKeys: Array.from(this.pendingRequests.keys()),
      batchTypes: Array.from(this.batchQueue.keys())
    }
  }

  clear() {
    this.pendingRequests.clear()
    this.batchQueue.clear()
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer)
    }
    this.batchTimers.clear()
  }
}

export const unifiedCache = new UnifiedCache()

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
  (globalThis as any).__unifiedCacheStats = () => unifiedCache.getStats()
}