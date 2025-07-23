// Navigation performance optimizations for Next.js 15
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

// Debounced navigation to prevent rapid navigation calls
export const useOptimizedNavigation = () => {
  const router = useRouter();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastNavigationRef = useRef<string>('');

  const navigate = useCallback((url: string, options?: { replace?: boolean }) => {
    // Prevent duplicate navigation to same URL
    if (lastNavigationRef.current === url) {
      return;
    }

    // Clear any pending navigation
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Debounce navigation calls
    navigationTimeoutRef.current = setTimeout(() => {
      lastNavigationRef.current = url;
      
      if (options?.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    }, 50); // 50ms debounce

  }, [router]);

  const prefetch = useCallback((url: string) => {
    // Only prefetch if not already prefetched recently
    try {
      router.prefetch(url);
    } catch (error) {
      console.warn('Prefetch failed for:', url, error);
    }
  }, [router]);

  return { navigate, prefetch };
};

// Intersection Observer for link prefetching
export const useLinkPrefetch = () => {
  const { prefetch } = useOptimizedNavigation();
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  const observeLink = useCallback((element: HTMLElement, href: string) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const link = entry.target as HTMLElement;
              const href = link.getAttribute('data-prefetch-href');
              if (href) {
                prefetch(href);
                observerRef.current?.unobserve(entry.target);
              }
            }
          });
        },
        { rootMargin: '100px' } // Prefetch when link is 100px away from viewport
      );
    }

    element.setAttribute('data-prefetch-href', href);
    observerRef.current.observe(element);
  }, [prefetch]);

  return { observeLink };
};

// Route change performance monitoring
export const routeChangeMonitor = {
  startTime: 0,
  
  start: () => {
    routeChangeMonitor.startTime = performance.now();
  },
  
  end: (route: string) => {
    const duration = performance.now() - routeChangeMonitor.startTime;
    
    if (duration > 2000) { // Log slow route changes > 2s
      console.warn(`Slow route change to ${route}: ${duration.toFixed(2)}ms`);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Route change to ${route}: ${duration.toFixed(2)}ms`);
    }
  }
};

// Bundle size monitoring
export const bundleMonitor = {
  logBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') && 
        !resource.name.includes('webpack') &&
        !resource.name.includes('hot-update')
      );
      
      const totalJSSize = jsResources.reduce((total, resource) => {
        return total + (resource.transferSize || 0);
      }, 0);
      
      console.log('Bundle Analysis:', {
        totalJSSize: `${(totalJSSize / 1024).toFixed(2)} KB`,
        jsFileCount: jsResources.length,
        largestJS: jsResources
          .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
          .slice(0, 3)
          .map(r => ({
            name: r.name.split('/').pop(),
            size: `${((r.transferSize || 0) / 1024).toFixed(2)} KB`
          }))
      });
    }
  }
};
