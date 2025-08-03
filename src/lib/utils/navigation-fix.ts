// Navigation fixes for Next.js 15 stalling issues
import { useRouter } from '@/i18n/routing';
import { useCallback, useRef, useEffect } from 'react';

// Navigation timeout handler to prevent infinite stalls
export const useNavigationWithTimeout = () => {
  const router = useRouter();
  const navigationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isNavigatingRef = useRef(false);

  const navigate = useCallback((url: string, options?: { replace?: boolean; timeout?: number }) => {
    const timeout = options?.timeout || 5000; // 5 second timeout
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Prevent duplicate navigation
    if (isNavigatingRef.current) {
      console.warn('Navigation already in progress, skipping:', url);
      return;
    }

    isNavigatingRef.current = true;
    console.log('Starting navigation to:', url);

    // Set timeout to detect stalled navigation
    navigationTimeoutRef.current = setTimeout(() => {
      console.error('Navigation timeout detected for:', url);
      isNavigatingRef.current = false;
      
      // Force page reload as fallback
      if (typeof window !== 'undefined') {
        console.log('Forcing page reload due to navigation timeout');
        window.location.href = url;
      }
    }, timeout);

    try {
      // Next.js router methods return void, handle accordingly
      if (options?.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
      
      // Since router methods are void, use a timeout to reset navigation state
      setTimeout(() => {
        console.log('Navigation initiated to:', url);
        isNavigatingRef.current = false;
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Navigation error:', error);
      isNavigatingRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    }
  }, [router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return { navigate, isNavigating: isNavigatingRef.current };
};

// Router event monitoring for debugging
export const useRouterDebug = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      console.log('Page unload detected');
    };

    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.visibilityState);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return router;
};

// Force reload utility for stuck pages
export const forceReload = (url?: string) => {
  if (typeof window !== 'undefined') {
    if (url) {
      window.location.href = url;
    } else {
      window.location.reload();
    }
  }
};
