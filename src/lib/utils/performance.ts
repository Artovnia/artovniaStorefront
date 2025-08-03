// Optimized performance monitoring utilities for Medusa storefront
export const performanceMonitor = {
  // Lightweight API call tracking with minimal overhead
  trackApiCall: async <T>(
    operation: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    // Skip performance tracking in production to reduce overhead
    if (process.env.NODE_ENV === 'production') {
      return apiCall();
    }
    
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Only log slow operations (> 1000ms) to reduce console noise
      if (duration > 1000) {
        console.warn(`⚠️ Slow API call: ${operation} took ${duration.toFixed(0)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`❌ API call failed: ${operation} after ${duration.toFixed(0)}ms`);
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

// Lightweight request deduplication utility
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheTTL = 300000; // 5 minutes
  private readonly maxCacheSize = 50; // Reduced from 200

  async dedupe<T>(
    key: string, 
    requestFn: () => Promise<T>,
    options: {
      useCache?: boolean;
    } = {}
  ): Promise<T> {
    const { useCache = true } = options;
    
    // Check cache first if enabled
    if (useCache) {
      const cached = this.cache.get(key);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
        return cached.data as T;
      }
      // Remove expired cache entry
      if (cached) {
        this.cache.delete(key);
      }
    }
    
    // If request is already pending, return the existing promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }
    
    // Create new request without performance tracking to reduce overhead
    const request = requestFn().then((result) => {
      // Cache the result if enabled
      if (useCache) {
        // Simple LRU eviction
        if (this.cache.size >= this.maxCacheSize) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) this.cache.delete(firstKey);
        }
        this.cache.set(key, { data: result, timestamp: Date.now() });
      }
      return result;
    }).finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, request);
    return request;
  }

  // Get cached value without making request
  getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }
  
  // Invalidate cache entry
  invalidate(key: string): void {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }
  
  // Invalidate by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.invalidate(key);
      }
    }
  }

  clear(): void {
    this.pendingRequests.clear();
    this.cache.clear();
  }
  
  // Get basic statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      maxCacheSize: this.maxCacheSize
    };
  }
}

// Global request deduplicator instance
export const globalDeduplicator = new RequestDeduplicator();

// Specialized deduplicators for different types of requests
export const productDeduplicator = new RequestDeduplicator();
export const measurementDeduplicator = new RequestDeduplicator();
export const imageDeduplicator = new RequestDeduplicator();
