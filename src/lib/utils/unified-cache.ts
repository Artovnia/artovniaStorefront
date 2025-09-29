// Simple client-side cache that actually works
const memoryCache = new Map<string, { data: any; expires: number }>()
const pendingRequests = new Map<string, Promise<any>>()
const MAX_CACHE_SIZE = 500

// TTL configurations
export const CACHE_TTL = {
  PRODUCT: 300, // 5 minutes
  PRICING: 60,  // 1 minute
  CART: 30,     // 30 seconds
  PROMOTIONS: 60, // 1 minute
  INVENTORY: 120, // 2 minutes
  MEASUREMENTS: 600, // 10 minutes
} as const

// 🔒 ENHANCED SAFETY: Comprehensive user-specific data protection
const USER_SPECIFIC_PREFIXES = [
  'cart:', 'user:', 'customer:', 'order:', 'checkout:', 
  'payment:', 'session:', 'auth:', 'billing:'
]

const isUserSpecificKey = (key: string): boolean => {
  return USER_SPECIFIC_PREFIXES.some(prefix => key.startsWith(prefix)) ||
         key.includes('_user_') || 
         key.includes('_customer_') ||
         key.includes('_cart_')
}

class UnifiedCache {
  async get<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = CACHE_TTL.PRODUCT): Promise<T> {
    // 🔒 CRITICAL: Block user-specific data from being cached
    if (isUserSpecificKey(key)) {
      return fetchFn()
    }

    // Check cache first
    const cached = memoryCache.get(key)
    if (cached && Date.now() < cached.expires) {
      return cached.data
    }

    // Check if request is already pending
    const pending = pendingRequests.get(key)
    if (pending) {
      return pending
    }

    // Make new request
    const promise = fetchFn().then(result => {
      // Cache the result
      this.set(key, result, ttlSeconds)
      pendingRequests.delete(key)
      return result
    }).catch(error => {
      pendingRequests.delete(key)
      throw error
    })

    pendingRequests.set(key, promise)
    return promise
  }

  set(key: string, data: any, ttlSeconds: number): void {
    // 🔒 CRITICAL: Block user-specific data from being cached
    if (isUserSpecificKey(key)) {
      return
    }
    
    // Simple LRU eviction
    if (memoryCache.size >= MAX_CACHE_SIZE) {
      const firstKey = memoryCache.keys().next().value
      if (firstKey) memoryCache.delete(firstKey)
    }
    
    memoryCache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    })
  }

  // ✅ More targeted invalidation
  invalidateByPattern(pattern: string): void {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key)
      }
    }
    for (const key of pendingRequests.keys()) {
      if (key.includes(pattern)) {
        pendingRequests.delete(key)
      }
    }
  }

  // ✅ Safer invalidation for cart operations
  invalidateAfterCartChange(): void {
    this.invalidateByPattern('pricing')
    this.invalidateByPattern('promotions')
    this.invalidateByPattern('inventory')
  }

  // Keep existing method for backward compatibility
  invalidate(pattern: string): void {
    this.invalidateByPattern(pattern)
  }

  clear(): void {
    memoryCache.clear()
    pendingRequests.clear()
  }

  getStats() {
    return {
      size: memoryCache.size,
      pending: pendingRequests.size,
      maxSize: MAX_CACHE_SIZE,
      userSpecificPrefixes: USER_SPECIFIC_PREFIXES
    }
  }
}

export const unifiedCache = new UnifiedCache()

// Debug helpers
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__clearCache = () => unifiedCache.clear()
  // @ts-ignore
  window.__cacheStats = () => unifiedCache.getStats()
}