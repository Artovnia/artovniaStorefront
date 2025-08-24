// src/lib/data/cookies.ts
// Universal cookie implementation that works in both client and server contexts
import { getPublishableApiKey } from '../get-publishable-key';
import { sdk } from '../config';
import { HttpTypes } from "@medusajs/types"

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Function to get cookies in a server context (safely)
const getServerCookies = async () => {
  if (isBrowser) return null;
  
  try {
    // Dynamic import to avoid bundling server-only code with client code
    const { cookies } = await import('next/headers');
    return cookies();
  } catch (error) {
    // This will happen during static generation or in pages directory
    return null;
  }
};

// Batch cookie operations for better performance
const getBatchBrowserCookies = (names: string[]): Record<string, string | null> => {
  if (!isBrowser) return names.reduce((acc, name) => ({ ...acc, [name]: null }), {});
  
  const cookies = document.cookie.split('; ');
  const result: Record<string, string | null> = {};
  
  names.forEach(name => {
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    result[name] = cookie ? cookie.split('=')[1] : null;
  });
  
  return result;
};

// Function to get a cookie value in the browser
const getBrowserCookie = (name: string): string | null => {
  if (!isBrowser) return null;
  
  const value = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
  return value ? value.split('=')[1] : null;
};

// Function to set a cookie in the browser
const setBrowserCookie = (name: string, value: string, options: Record<string, any> = {}) => {
  if (!isBrowser) return;
  
  let cookieString = `${name}=${value}`;
  
  if (options.maxAge) {
    cookieString += `; Max-Age=${options.maxAge}`;
  }
  
  if (options.path) {
    cookieString += `; Path=${options.path}`;
  } else {
    cookieString += '; Path=/';
  }
  
  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  }
  
  if (options.secure || process.env.NODE_ENV === 'production') {
    cookieString += '; Secure';
  }
  
  document.cookie = cookieString;
};

// Function to remove a cookie in the browser
const removeBrowserCookie = (name: string) => {
  if (!isBrowser) return;
  document.cookie = `${name}=; Max-Age=-1; Path=/`;
};

// Optimized single-layer cache for auth headers
let authHeadersCache: { headers: any; timestamp: number; token?: string } | null = null;
const CACHE_DURATION = 30000; // Single 30-second cache layer
const PUBLISHABLE_KEY_CACHE = { key: '', timestamp: 0 };
const PUBLISHABLE_KEY_CACHE_DURATION = 30000; // Aligned with auth cache

export const getAuthHeaders = async (): Promise<
  { authorization: string; 'x-publishable-api-key': string } | { 'x-publishable-api-key': string }
> => {
  // Fast path: Check cache first to avoid blocking operations
  if (authHeadersCache && (Date.now() - authHeadersCache.timestamp) < CACHE_DURATION) {
    return authHeadersCache.headers;
  }
  
  // Get publishable key with minimal overhead
  let publishableKey = '';
  if (PUBLISHABLE_KEY_CACHE.key && (Date.now() - PUBLISHABLE_KEY_CACHE.timestamp) < PUBLISHABLE_KEY_CACHE_DURATION) {
    publishableKey = PUBLISHABLE_KEY_CACHE.key;
  } else {
    try {
      publishableKey = await getPublishableApiKey();
      PUBLISHABLE_KEY_CACHE.key = publishableKey;
      PUBLISHABLE_KEY_CACHE.timestamp = Date.now();
    } catch {
      // Fallback to environment variable to prevent blocking
      publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';
    }
  }
  
  // Make the publishable key available globally for client components
  if (isBrowser && publishableKey) {
    // @ts-ignore - Add to window object
    window.__MEDUSA_PUBLISHABLE_KEY__ = publishableKey;
  }
  
  // Skip cookie access during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-export') {
    const headers = { 'x-publishable-api-key': publishableKey };
    authHeadersCache = { headers, timestamp: Date.now() };
    return headers;
  }
  
  // Optimized non-blocking token retrieval
  let token: string | null = null;
  
  if (isBrowser) {
    // Client-side: Direct cookie access (fastest, non-blocking)
    token = getBrowserCookie('_medusa_jwt');
  } else {
    // Server-side: Immediate fallback without timeout delays
    try {
      const cookies = await getServerCookies();
      token = cookies?.get('_medusa_jwt')?.value || null;
    } catch {
      // Immediate fallback - never block navigation
      token = null;
    }
  }

  const headers = token ? {
    authorization: `Bearer ${token}`,
    'x-publishable-api-key': publishableKey
  } : {
    'x-publishable-api-key': publishableKey
  };
  
  // Cache the result
  authHeadersCache = { headers, timestamp: Date.now(), token: token || undefined };
  return headers;
};

// Add the missing retrieveCustomer function with proper typing
export const retrieveCustomer = async (): Promise<HttpTypes.StoreCustomer | null> => {
  // Skip during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-export') {
    return null;
  }

  try {
    const headers = await getAuthHeaders();
    
    // Check if we have authorization header
    if (!('authorization' in headers)) {
      return null;
    }

    const response = await sdk.client.fetch('/store/customers/me', {
      headers,
      method: 'GET',
    }) as { customer: HttpTypes.StoreCustomer }; // Fix: Properly type the response

    return response.customer || null;
  } catch (error) {
    console.error('Error retrieving customer:', error);
    return null;
  }
};

// Add helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  // Skip during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-export') {
    return false;
  }

  try {
    let token: string | null = null;
    
    // Try to get the token from server cookies first
    const serverCookies = await getServerCookies();
    if (serverCookies) {
      token = serverCookies.get('_medusa_jwt')?.value || null;
    } 
    // If no server cookies or no token, try browser cookies
    else if (isBrowser) {
      token = getBrowserCookie('_medusa_jwt');
    }

    return !!token;
  } catch (error) {
    return false;
  }
};

export const getCacheTag = async (
  tag: string
): Promise<string> => {
  // Check if we're in a static generation context
  // This is a special case in Next.js where cookies are not available
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-export') {
    return ''; // Return empty string during static generation
  }
  
  try {
    let cacheId: string | null = null;
    
    // Try to get the cache ID from server cookies first
    const serverCookies = await getServerCookies();
    if (serverCookies) {
      cacheId = serverCookies.get('_medusa_cache_id')?.value || null;
    } 
    // If no server cookies or no cache ID, try browser cookies
    else if (isBrowser) {
      cacheId = getBrowserCookie('_medusa_cache_id');
    }

    if (cacheId) {
      return `${tag}-${cacheId}`;
    }
    
    return ''; // No cache ID found
  } catch (error) {
    // Only log real errors, not expected cookie access issues
    if (error instanceof Error && 
        !error.message.includes('outside a request scope')) {
      console.error('Error in getCacheTag:', error);
    }
    return '';
  }
};

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  // Always return empty object during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-export') {
    return {};
  }
  
  // Return empty object on client-side
  if (isBrowser) {
    return {};
  }

  try {
    const cacheTag = await getCacheTag(tag);

    if (!cacheTag) {
      return {};
    }

    return { tags: [`${cacheTag}`] };
  } catch (error) {
    // Silently fail during static generation or outside request context
    return {};
  }
};

// Batch cookie operations for better performance
export const setBatchCookies = async (cookieData: Array<{name: string, value: string, options?: any}>) => {
  try {
    const serverCookies = await getServerCookies();
    
    // Batch server cookie operations
    if (serverCookies) {
      cookieData.forEach(({name, value, options = {}}) => {
        serverCookies.set(name, value, {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: true,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          ...options
        });
      });
    }
    
    // Batch browser cookie operations
    if (isBrowser) {
      cookieData.forEach(({name, value, options = {}}) => {
        setBrowserCookie(name, value, {
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          ...options
        });
      });
    }
  } catch (error) {
    console.warn('Error setting batch cookies:', error);
  }
};

export const setAuthToken = async (token: string) => {
  // Clear cache immediately when setting new token
  authHeadersCache = null;
  
  await setBatchCookies([{
    name: '_medusa_jwt',
    value: token
  }]);
};

export const removeAuthToken = async () => {
  // Clear auth headers cache immediately
  authHeadersCache = null;
  
  await setBatchCookies([{
    name: '_medusa_jwt',
    value: '',
    options: { maxAge: -1 }
  }]);
};

// Ultra-fast cart ID cache to prevent navigation blocking
let cartIdCache: { id: string | null; timestamp: number } | null = null;
const CART_ID_CACHE_DURATION = 5000; // Reduced to 5 seconds for production stability

export const getCartId = async (): Promise<string | null> => {
  // Fast path: Check cache first
  if (cartIdCache && (Date.now() - cartIdCache.timestamp) < CART_ID_CACHE_DURATION) {
    return cartIdCache.id;
  }
  
  try {
    let cartId: string | null = null;
    
    // Optimized retrieval with timeout protection
    if (!isBrowser) {
      // Server-side: Ultra-fast timeout to prevent navigation blocking
      try {
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 25) // Ultra-short timeout for production
        );
        
        const cookiePromise = getServerCookies().then(cookies => 
          cookies?.get('_medusa_cart_id')?.value || null
        );
        
        cartId = await Promise.race([cookiePromise, timeoutPromise]);
      } catch {
        // Immediate fallback - never block navigation
        cartId = null;
      }
    } else {
      // Client-side: Try browser cookies first (fastest)
      cartId = getBrowserCookie('_medusa_cart_id');
      
      // Fallback to localStorage only if browser cookie not found
      if (!cartId) {
        try {
          cartId = localStorage.getItem('_medusa_cart_id');
        } catch {
          // Silently fail if localStorage is not available
          cartId = null;
        }
      }
    }
    
    // Cache the result
    cartIdCache = { id: cartId, timestamp: Date.now() };
    return cartId;
    
  } catch (error) {
    // Fast fallback - cache null result to avoid repeated failures
    cartIdCache = { id: null, timestamp: Date.now() };
    return null;
  }
};

export const setCartId = async (cartId: string) => {
  try {
    // Try to set the cart ID in server cookies first
    const serverCookies = await getServerCookies();
    if (serverCookies) {
      serverCookies.set('_medusa_cart_id', cartId, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    
    // Always set in browser cookies and localStorage for client-side access
    if (isBrowser) {
      setBrowserCookie('_medusa_cart_id', cartId, {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      
      // Also store in localStorage as a fallback
      localStorage.setItem('_medusa_cart_id', cartId);
    }
  } catch (error) {
    console.warn('Error setting cart ID:', error);
  }
};

export const removeCartId = async () => {
  try {
    // Clear cart ID cache immediately
    cartIdCache = null;
    
    const serverCookies = await getServerCookies();
    if (serverCookies) {
      serverCookies.set('_medusa_cart_id', '', { maxAge: -1 });
    }
  } catch (error) {
    console.warn('Could not remove cart ID from server cookies (this is expected in some contexts):', error);
    // Try to remove from client-side storage instead
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('medusa_cart_id');
        document.cookie = '_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } catch (clientError) {
        console.warn('Could not remove cart ID from client storage:', clientError);
      }
    }
  }
};