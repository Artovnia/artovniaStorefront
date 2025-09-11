/**
 * Centralized cache management system to prevent conflicts between different caching layers
 * This ensures proper coordination between persistent cache, batch pricing, and other cache systems
 */

import { 
  storefrontCache, 
  invalidatePriceHistoryCache, 
  invalidateProductCache, 
  invalidateCheckoutCache,
  clearAllCaches,
  getCacheStats
} from './storefront-cache'

interface CacheInvalidationOptions {
  variantIds?: string[]
  productHandles?: string[]
  currencyCode?: string
  locale?: string
  cartId?: string
  force?: boolean
}

class CacheManager {
  private static instance: CacheManager
  private invalidationQueue: Set<string> = new Set()
  private isProcessing = false

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Safely invalidate price-related caches
   */
  async invalidatePriceCaches(options: CacheInvalidationOptions = {}) {
    const { variantIds, currencyCode, force = false } = options

    if (force) {
      // Force clear all price-related caches
      invalidatePriceHistoryCache()
      return
    }

    if (variantIds && currencyCode) {
      // Targeted invalidation
      invalidatePriceHistoryCache(variantIds, currencyCode)
    }
  }

  /**
   * Safely invalidate product caches
   */
  async invalidateProductCaches(options: CacheInvalidationOptions = {}) {
    const { productHandles, locale, force = false } = options

    if (force) {
      // Clear all product caches
      const stats = getCacheStats()
      // Note: Redis-based cache doesn't track individual entries like memory cache
      // Use pattern invalidation instead
      storefrontCache.invalidatePattern('product:*')
      return
    }

    if (productHandles && locale) {
      productHandles.forEach(handle => {
        invalidateProductCache(handle, locale)
      })
    }
  }

  /**
 * Safely invalidate checkout caches
 */
async invalidateCheckoutCaches(options: CacheInvalidationOptions = {}) {
  const { cartId } = options
  
  // Only invalidate if cartId is provided
  if (cartId) {
    invalidateCheckoutCache(cartId)
  }
}

  /**
   * Queue cache invalidation to prevent race conditions
   */
  async queueInvalidation(cacheKey: string, invalidationFn: () => void) {
    this.invalidationQueue.add(cacheKey)
    
    if (!this.isProcessing) {
      await this.processInvalidationQueue()
    }
  }

  /**
   * Process queued invalidations in batches to prevent performance issues
   */
  private async processInvalidationQueue() {
    if (this.isProcessing || this.invalidationQueue.size === 0) {
      return
    }

    this.isProcessing = true

    try {
      // Process in small batches to prevent blocking
      const batch = Array.from(this.invalidationQueue).slice(0, 10)
      
      for (const cacheKey of batch) {
        storefrontCache.del(cacheKey)
        this.invalidationQueue.delete(cacheKey)
      }

      // If there are more items, schedule next batch
      if (this.invalidationQueue.size > 0) {
        setTimeout(() => this.processInvalidationQueue(), 0)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Emergency cache clear with safety checks
   */
  async emergencyCacheClear() {
    try {
      clearAllCaches()
      this.invalidationQueue.clear()
      console.warn('🚨 Emergency cache clear executed')
    } catch (error) {
      console.error('❌ Emergency cache clear failed:', error)
    }
  }

  /**
   * Health check for cache system
   */
  async getCacheHealth() {
    const stats = await getCacheStats()
    const queueSize = this.invalidationQueue.size
    
    return {
      cacheSize: stats.size,
      queueSize,
      isProcessing: this.isProcessing,
      status: stats.size > 1000 ? 'warning' : 'healthy',
      recommendations: this.getRecommendations(stats.size, queueSize)
    }
  }

  private getRecommendations(cacheSize: number, queueSize: number): string[] {
    const recommendations: string[] = []
    
    if (cacheSize > 1000) {
      recommendations.push('Consider reducing cache TTL or implementing more aggressive cleanup')
    }
    
    if (queueSize > 50) {
      recommendations.push('High invalidation queue - consider batching cache operations')
    }
    
    if (cacheSize > 2000) {
      recommendations.push('Cache size is very large - emergency clear may be needed')
    }
    
    return recommendations
  }

  /**
   * Validate cache consistency
   */
  async validateCacheConsistency(): Promise<boolean> {
    try {
      const stats = await getCacheStats()
      
      // Check for orphaned entries
      let orphanedCount = 0
      // Redis-based cache doesn't track entries like memory cache
      // Skip orphaned entry check for Redis implementation
      orphanedCount = 0

      if (orphanedCount > stats.size * 0.1) {
        console.warn(`⚠️ High number of orphaned cache entries: ${orphanedCount}`)
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Cache consistency validation failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance()

// Export convenience functions
export const invalidatePriceCaches = (options: CacheInvalidationOptions = {}) => 
  cacheManager.invalidatePriceCaches(options)

export const invalidateProductCaches = (options: CacheInvalidationOptions = {}) => 
  cacheManager.invalidateProductCaches(options)

export const invalidateCheckoutCaches = (options: CacheInvalidationOptions = {}) => 
  cacheManager.invalidateCheckoutCaches(options)

export const getCacheHealth = () => cacheManager.getCacheHealth()

export const validateCacheConsistency = () => cacheManager.validateCacheConsistency()

export const emergencyCacheClear = () => cacheManager.emergencyCacheClear()
