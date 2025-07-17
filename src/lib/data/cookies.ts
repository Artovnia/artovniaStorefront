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

export const getAuthHeaders = async (): Promise<
  { authorization: string; 'x-publishable-api-key': string } | { 'x-publishable-api-key': string }
> => {
  // Get the publishable API key
  const publishableKey = await getPublishableApiKey();
  
  // Make the publishable key available globally for client components
  if (isBrowser) {
    // @ts-ignore - Add to window object
    window.__MEDUSA_PUBLISHABLE_KEY__ = publishableKey;
  }
  
  // Skip cookie access during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-export') {
    return { 'x-publishable-api-key': publishableKey };
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

    if (token) {
      return { 
        authorization: `Bearer ${token}`,
        'x-publishable-api-key': publishableKey
      };
    }
  } catch (error) {
    // During static generation or outside request context, don't log the error
    if (!(error instanceof Error) || !error.message.includes('outside a request scope')) {
      console.warn('Error getting auth headers:', error);
    }
  }
  
  // If no token was found or there was an error, just return the publishable key
  return { 'x-publishable-api-key': publishableKey };
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

export const setAuthToken = async (token: string) => {
  try {
    // Try to set the token in server cookies first
    const serverCookies = await getServerCookies();
    if (serverCookies) {
      serverCookies.set('_medusa_jwt', token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    // Always set in browser cookies as well for client-side access
    if (isBrowser) {
      setBrowserCookie('_medusa_jwt', token, {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }
  } catch (error) {
    console.warn('Error setting auth token:', error);
  }
};

export const removeAuthToken = async () => {
  try {
    // Try to remove the token from server cookies first
    const serverCookies = await getServerCookies();
    if (serverCookies) {
      serverCookies.set('_medusa_jwt', '', { maxAge: -1 });
    }
    // Always remove from browser cookies as well
    if (isBrowser) {
      removeBrowserCookie('_medusa_jwt');
    }
  } catch (error) {
    console.warn('Error removing auth token:', error);
  }
};

export const getCartId = async (): Promise<string | null> => {
  try {
    // Try to get the cart ID from server cookies first
    const serverCookies = await getServerCookies();
    if (serverCookies) {
      const cartId = serverCookies.get('_medusa_cart_id')?.value;
      if (cartId) return cartId;
    }
    
    // If no server cookies or no cart ID, try browser cookies
    if (isBrowser) {
      const cartId = getBrowserCookie('_medusa_cart_id');
      if (cartId) return cartId;
      
      // Also check localStorage as a fallback
      const localCartId = localStorage.getItem('_medusa_cart_id');
      if (localCartId) return localCartId;
    }
    
    return null; // No cart ID found
  } catch (error) {
    console.warn('Error getting cart ID:', error);
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