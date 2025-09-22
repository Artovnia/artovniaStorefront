/**
 * Client-side caching for categories data to improve performance
 * Reduces API calls and provides instant loading for repeat visits
 */

interface CachedCategoriesData {
  categories: any[]
  parentCategories: any[]
  timestamp: number
  ttl: number
}

class CategoriesCache {
  private cache = new Map<string, CachedCategoriesData>()
  private readonly defaultTTL = 60 * 60 * 1000 // 1 hour - categories rarely change

  set(key: string, data: { categories: any[], parentCategories: any[] }, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      ...data,
      timestamp: Date.now(),
      ttl
    })

    // Clean up expired entries periodically
    if (this.cache.size > 20) {
      this.cleanup()
    }
  }

  get(key: string): { categories: any[], parentCategories: any[] } | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return {
      categories: entry.categories,
      parentCategories: entry.parentCategories
    }
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

  invalidate(key: string): void {
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
      keys: Array.from(this.cache.keys())
    }
  }
}

// Global categories cache instance
export const categoriesCache = new CategoriesCache()

/**
 * Enhanced listCategories with client-side caching
 */
export const getCachedCategories = async (
  fetchFn: () => Promise<{ categories: any[], parentCategories: any[] }>,
  cacheKey: string,
  ttl: number = 60 * 60 * 1000 // 1 hour default - categories rarely change
): Promise<{ categories: any[], parentCategories: any[] }> => {
  // CRITICAL FIX: Disable client-side caching to prevent corruption issues
  // Always fetch fresh data to avoid infinite loops from corrupted cache
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Fetching fresh categories data for: ${cacheKey} (cache disabled)`)
  }
  
  const result = await fetchFn()
  // Don't cache in development to prevent corruption issues
  // categoriesCache.set(cacheKey, result, ttl)
  
  return result
}

/**
 * Preload categories data for faster navigation
 */
export const preloadCategories = async (
  fetchFn: () => Promise<{ categories: any[], parentCategories: any[] }>,
  cacheKey: string
): Promise<void> => {
  try {
    if (!categoriesCache.has(cacheKey)) {
      await getCachedCategories(fetchFn, cacheKey)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 Preloaded categories data for: ${cacheKey}`)
      }
    }
  } catch (error) {
    // Silently fail preloading to not affect user experience
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Failed to preload categories for: ${cacheKey}`, error)
    }
  }
}
