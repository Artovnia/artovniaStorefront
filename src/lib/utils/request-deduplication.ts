/**
 * Request Deduplication Layer
 * Prevents race conditions and manages smart caching for cart and product operations
 * 
 * Key Features:
 * - Deduplicates simultaneous requests with same key
 * - Smart caching: bypasses cache for critical data (inventory, prices)
 * - Memory-safe with bounded cache and LRU eviction
 * - Automatic cleanup of pending requests
 */

interface CacheEntry {
  data: any
  timestamp: number
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>()
  private cache = new Map<string, CacheEntry>()
  private readonly maxCacheSize: number

  constructor(maxCacheSize: number = 50) {
    this.maxCacheSize = maxCacheSize
  }

  /**
   * Execute a request with deduplication and smart caching
   * @param key - Unique identifier for the request
   * @param requestFn - Function that performs the actual request
   * @param ttl - Time to live for cache in milliseconds (default: 60 seconds)
   * @returns Promise with the request result
   */
  async execute<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 60000
  ): Promise<T> {
    // Check cache first (except for critical data that needs to be fresh)
    const cached = this.cache.get(key)
    if (cached && (Date.now() - cached.timestamp) < ttl && !this.isCriticalData(key)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📦 Cache HIT for: ${key}`)
      }
      return cached.data as T
    }

    // If request is already pending, return existing promise to prevent duplicates
    if (this.pendingRequests.has(key)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Deduplicating request for: ${key}`)
      }
      return this.pendingRequests.get(key) as Promise<T>
    }

    // Execute new request
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Fresh request for: ${key}`)
    }

    const request = requestFn()
      .then((result) => {
        // Cache non-critical data only
        if (!this.isCriticalData(key)) {
          this.evictIfNeeded()
          this.cache.set(key, { 
            data: result, 
            timestamp: Date.now() 
          })
        }
        return result
      })
      .catch((error) => {
        // Don't cache errors, just propagate them
        throw error
      })
      .finally(() => {
        // Always clean up pending request
        this.pendingRequests.delete(key)
      })

    this.pendingRequests.set(key, request)
    return request
  }

  /**
   * Determine if data is critical and should always be fresh
   * Critical data: inventory, stock levels, real-time prices, cart operations
   */
  private isCriticalData(key: string): boolean {
    const criticalPatterns = [
      'inventory',
      'stock', 
      'price',
      'cart:', // Cart data changes frequently
      'payment', // Payment data must be fresh
      'checkout', // Checkout data must be fresh
      'products:', // CRITICAL FIX: Products should be fresh to prevent carousel issues
      'customer' // Customer data should be fresh
    ]
    
    return criticalPatterns.some(pattern => key.includes(pattern))
  }

  /**
   * Evict oldest cache entry if cache is full (LRU eviction)
   */
  private evictIfNeeded(): void {
    if (this.cache.size >= this.maxCacheSize) {
      const oldest = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0]
      
      if (oldest) {
        this.cache.delete(oldest[0])
        if (process.env.NODE_ENV === 'development') {
          console.log(`🗑️ Evicted cache entry: ${oldest[0]}`)
        }
      }
    }
  }

  /**
   * Manually invalidate cache and pending requests for a key
   */
  invalidate(key: string): void {
    this.cache.delete(key)
    this.pendingRequests.delete(key)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`❌ Invalidated cache for: ${key}`)
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = []
    
    // Find matching cache keys
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    
    // Find matching pending request keys
    for (const key of this.pendingRequests.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    
    // Delete all matching keys
    keysToDelete.forEach(key => {
      this.cache.delete(key)
      this.pendingRequests.delete(key)
    })
    
    if (process.env.NODE_ENV === 'development' && keysToDelete.length > 0) {
      console.log(`❌ Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`)
    }
  }

  /**
   * Clear all cache and pending requests
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🧹 Cleared all cache entries`)
    }
  }

  /**
   * Get cache statistics for debugging
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      maxCacheSize: this.maxCacheSize,
      cacheKeys: Array.from(this.cache.keys()),
      pendingKeys: Array.from(this.pendingRequests.keys())
    }
  }
}

// Global instances for different types of requests
export const cartDeduplicator = new RequestDeduplicator(30) // Smaller cache for cart operations
export const productDeduplicator = new RequestDeduplicator(100) // Larger cache for product data
export const categoryDeduplicator = new RequestDeduplicator(50) // Medium cache for categories

// Utility function to create cache keys
export const createCacheKey = (prefix: string, ...parts: (string | number | undefined)[]): string => {
  return `${prefix}:${parts.filter(Boolean).join(':')}`
}

// Export for debugging in development
if (process.env.NODE_ENV === 'development') {
  (globalThis as any).__deduplicatorStats = () => ({
    cart: cartDeduplicator.getStats(),
    product: productDeduplicator.getStats(),
    category: categoryDeduplicator.getStats()
  })
}
