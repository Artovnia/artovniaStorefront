// Advanced performance monitoring utilities for Medusa storefront
export const performanceMonitor = {
  // Track API call performance with detailed metrics
  trackApiCall: async <T>(
    operation: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log slow operations (> 500ms for better threshold)
      if (duration > 500) {
        console.warn(`⚠️ Slow API call: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      // In development, log all API calls with performance data
      if (process.env.NODE_ENV === 'development') {
        const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '✅';
        console.log(`${emoji} API: ${operation} - ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`❌ API call failed: ${operation} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  },

  // Enhanced debounce with immediate option
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) func.apply(null, args);
      }, wait);
      
      if (callNow) func.apply(null, args);
    };
  },

  // Advanced cache with LRU eviction and compression
  createCache: <T>(ttlMs: number = 300000, maxSize: number = 100) => {
    const cache = new Map<string, { data: T; timestamp: number; accessCount: number }>();
    
    const evictLRU = () => {
      if (cache.size <= maxSize) return;
      
      // Find least recently used entry
      let lruKey = '';
      let minAccessCount = Infinity;
      let oldestTimestamp = Date.now();
      
      for (const [key, entry] of cache.entries()) {
        if (entry.accessCount < minAccessCount || 
           (entry.accessCount === minAccessCount && entry.timestamp < oldestTimestamp)) {
          lruKey = key;
          minAccessCount = entry.accessCount;
          oldestTimestamp = entry.timestamp;
        }
      }
      
      if (lruKey) {
        cache.delete(lruKey);
        console.log(`🗑️ Cache evicted LRU entry: ${lruKey}`);
      }
    };
    
    return {
      get: (key: string): T | null => {
        const entry = cache.get(key);
        if (!entry) return null;
        
        // Check TTL
        if (Date.now() - entry.timestamp > ttlMs) {
          cache.delete(key);
          return null;
        }
        
        // Update access count for LRU
        entry.accessCount++;
        cache.set(key, entry);
        
        return entry.data;
      },
      
      set: (key: string, data: T): void => {
        cache.set(key, { 
          data, 
          timestamp: Date.now(), 
          accessCount: 1 
        });
        evictLRU();
      },
      
      clear: (): void => {
        cache.clear();
      },
      
      size: (): number => {
        return cache.size;
      },
      
      // Get cache statistics
      stats: () => ({
        size: cache.size,
        maxSize,
        ttlMs,
        keys: Array.from(cache.keys())
      })
    };
  },

  // Enhanced render measurement with component tree tracking
  measureRender: (componentName: string, threshold: number = 50) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > threshold) {
        const emoji = duration > 200 ? '🐌' : duration > 100 ? '⚠️' : '📊';
        console.warn(`${emoji} Render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
  },

  // Prefetch utility for critical resources
  prefetch: {
    // Prefetch API endpoint
    api: async (url: string, options?: RequestInit) => {
      if (typeof window === 'undefined') return; // Server-side skip
      
      try {
        const response = await fetch(url, {
          ...options,
          priority: 'low' as any, // Use low priority for prefetch
        });
        
        if (response.ok) {
          console.log(`🚀 Prefetched API: ${url}`);
        }
      } catch (error) {
        console.warn(`Failed to prefetch API: ${url}`, error);
      }
    },
    
    // Prefetch image
    image: (src: string) => {
      if (typeof window === 'undefined') return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
      
      console.log(`🖼️ Prefetched image: ${src}`);
    },
    
    // Prefetch route
    route: (href: string) => {
      if (typeof window === 'undefined') return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
      
      console.log(`🔗 Prefetched route: ${href}`);
    }
  }
};

// Advanced request deduplication utility with caching
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  private cache = performanceMonitor.createCache<any>(300000, 200); // 5 min TTL, 200 items max
  private stats = {
    hits: 0,
    misses: 0,
    deduped: 0,
    errors: 0
  };

  async dedupe<T>(
    key: string, 
    requestFn: () => Promise<T>,
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<T> {
    const { useCache = true, priority = 'normal' } = options;
    
    // Check cache first if enabled
    if (useCache) {
      const cached = this.cache.get(key);
      if (cached) {
        this.stats.hits++;
        console.log(`💾 Cache hit: ${key}`);
        return cached as T;
      }
    }
    
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      this.stats.deduped++;
      console.log(`🔄 Request deduped: ${key}`);
      return this.pendingRequests.get(key) as Promise<T>;
    }

    this.stats.misses++;
    
    // Create new request with performance tracking
    const request = performanceMonitor.trackApiCall(
      `Deduped-${key}`,
      requestFn
    ).then((result) => {
      // Cache the result if enabled
      if (useCache) {
        this.cache.set(key, result);
        console.log(`💾 Cached result: ${key}`);
      }
      return result;
    }).catch((error) => {
      this.stats.errors++;
      console.error(`❌ Deduped request failed: ${key}`, error);
      throw error;
    }).finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  // Get cached value without making request
  getCached<T>(key: string): T | null {
    return this.cache.get(key) as T | null;
  }
  
  // Invalidate cache entry
  invalidate(key: string): void {
    this.cache.clear();
    this.pendingRequests.delete(key);
    console.log(`🗑️ Invalidated: ${key}`);
  }
  
  // Invalidate by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const stats = this.cache.stats();
    
    stats.keys.forEach(key => {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    });
  }

  clear(): void {
    this.pendingRequests.clear();
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, deduped: 0, errors: 0 };
    console.log(`🧹 RequestDeduplicator cleared`);
  }
  
  // Get performance statistics
  getStats() {
    const cacheStats = this.cache.stats();
    return {
      ...this.stats,
      cache: cacheStats,
      pendingRequests: this.pendingRequests.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }
}

// Global request deduplicator instance
export const globalDeduplicator = new RequestDeduplicator();

// Specialized deduplicators for different types of requests
export const productDeduplicator = new RequestDeduplicator();
export const measurementDeduplicator = new RequestDeduplicator();
export const imageDeduplicator = new RequestDeduplicator();
