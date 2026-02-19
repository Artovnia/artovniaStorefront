// src/lib/data/cookies.ts
// Universal cookie implementation that works in both client and server contexts
import { cache } from 'react';
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

// Server-side getAuthHeaders deduplicated per request via React.cache().
// On the client side React.cache() is a no-op, so the function runs normally.
const _getAuthHeadersServer = cache(async (): Promise<
  { authorization: string; 'x-publishable-api-key': string } | { 'x-publishable-api-key': string }
> => {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

  if (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-export') {
    return { 'x-publishable-api-key': publishableKey };
  }

  try {
    const serverCookies = await getServerCookies();
    const token = serverCookies?.get('_medusa_jwt')?.value || null;
    const isValidToken = token && token.split('.').length === 3 && token.length > 50;
    return isValidToken
      ? { authorization: `Bearer ${token}`, 'x-publishable-api-key': publishableKey }
      : { 'x-publishable-api-key': publishableKey };
  } catch {
    return { 'x-publishable-api-key': publishableKey };
  }
});

// Simple auth headers - no complex caching
export const getAuthHeaders = async (): Promise<
  { authorization: string; 'x-publishable-api-key': string } | { 'x-publishable-api-key': string }
> => {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

  // Skip during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NEXT_PHASE === 'phase-export') {
    return { 'x-publishable-api-key': publishableKey };
  }

  // Client-side: read directly from browser cookie (React.cache is no-op on client)
  if (isBrowser) {
    const token = getBrowserCookie('_medusa_jwt');
    const isValidToken = token && token.split('.').length === 3 && token.length > 50;
    return isValidToken
      ? { authorization: `Bearer ${token}`, 'x-publishable-api-key': publishableKey }
      : { 'x-publishable-api-key': publishableKey };
  }

  // Server-side: deduplicated via React.cache() — one cookie read per request
  return _getAuthHeadersServer();
};

// ✅ FIXED: Client-only request deduplication for retrieveCustomer
// Server-side NEVER deduplicates to prevent cross-request contamination
let clientCustomerRequestPromise: Promise<HttpTypes.StoreCustomer | null> | null = null;

export const retrieveCustomer = async (): Promise<HttpTypes.StoreCustomer | null> => {
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-export') {
    return null;
  }

  // ✅ Client-side: Use deduplication (safe, isolated per browser tab)
  if (isBrowser) {
    if (clientCustomerRequestPromise) {
      return clientCustomerRequestPromise;
    }

    clientCustomerRequestPromise = (async () => {
      try {
        const requestHeaders = await getAuthHeaders();
        
        if (!('authorization' in requestHeaders)) {
          return null;
        }

        const authHeader = requestHeaders.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 20) {
          return null;
        }

        const response = await sdk.client.fetch('/store/customers/me', {
          headers: requestHeaders,
          method: 'GET'
        }) as { customer: HttpTypes.StoreCustomer };
        
        return response.customer || null;
      } catch (error) {
        if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('401'))) {
          removeBrowserCookie('_medusa_jwt');
        }
        
        return null;
      } finally {
        clientCustomerRequestPromise = null;
      }
    })();

    return clientCustomerRequestPromise;
  }

  // ✅ Server-side: NO deduplication, each request is isolated
  try {
    const requestHeaders = await getAuthHeaders();
    
    if (!('authorization' in requestHeaders)) {
      return null;
    }

    const authHeader = requestHeaders.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 20) {
      return null;
    }

    const response = await sdk.client.fetch('/store/customers/me', {
      headers: requestHeaders,
      method: 'GET',
      cache: 'no-store' // ✅ Never cache customer data
    }) as { customer: HttpTypes.StoreCustomer };
    
    return response.customer || null;
  } catch (error) {
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
    
    // ✅ FIX: Return generic tag instead of empty string to prevent 400 errors
    return tag; // Fallback to tag name without cache ID
  } catch (error) {
    // Only log real errors, not expected cookie access issues
    if (error instanceof Error && 
        !error.message.includes('outside a request scope')) {
      console.error('Error in getCacheTag:', error);
    }
    // ✅ FIX: Return tag instead of empty string on error
    return tag;
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
  await setBatchCookies([{
    name: '_medusa_jwt',
    value: token
  }]);
};

export const removeAuthToken = async () => {
  await setBatchCookies([{
    name: '_medusa_jwt',
    value: '',
    options: { maxAge: -1 }
  }]);
};

// ✅ FIXED: Client-only cart ID cache (safe for client-side)
// Server-side NEVER uses cache to prevent cross-request contamination
let clientCartIdCache: { id: string | null; timestamp: number } | null = null;
const CLIENT_CACHE_DURATION = 5000; // 5 seconds, only for client

export const getCartId = async (): Promise<string | null> => {
  const requestId = `getCartId_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // ✅ Client-side: Use cache (safe, isolated per browser tab)
  if (isBrowser) {
    // Check cache first
    if (clientCartIdCache && (Date.now() - clientCartIdCache.timestamp) < CLIENT_CACHE_DURATION) {
     
      return clientCartIdCache.id;
    }
    
    // Get from cookie
    let cartId = getBrowserCookie('_medusa_cart_id');
    
    // Fallback to localStorage
    if (!cartId) {
      try {
        cartId = localStorage.getItem('_medusa_cart_id');
      } catch {
        cartId = null;
      }
    }
    
    // Cache the result
    clientCartIdCache = { id: cartId, timestamp: Date.now() };
    
    return cartId;
  }
  
  // ✅ Server-side: NEVER cache, always read from cookies
  // This ensures each request gets the correct cart ID
  try {
    const serverCookies = await getServerCookies();
    const cartId = serverCookies?.get('_medusa_cart_id')?.value || null;
    
    
    return cartId;
  } catch (error) {
    console.error('❌ [getCartId] Server error:', error, requestId);
    return null;
  }
};

export const setCartId = async (cartId: string) => {
  const requestId = `setCartId_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // ✅ Update client cache immediately (only on client)
    if (isBrowser) {
      clientCartIdCache = { id: cartId, timestamp: Date.now() };
      
      // Set browser cookie
      setBrowserCookie('_medusa_cart_id', cartId, {
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      
      // Also store in localStorage as backup
      try {
        localStorage.setItem('_medusa_cart_id', cartId);
      } catch (storageError) {
        console.warn('Could not access localStorage:', storageError);
      }
    }
    
    // ✅ Set server cookie (if available)
    if (!isBrowser) {
      try {
        const serverCookies = await getServerCookies();
        if (serverCookies) {
          serverCookies.set('_medusa_cart_id', cartId, {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
          });
        }
      } catch (error) {
        console.warn('⚠️ [setCartId] Could not set server cookie:', error);
      }
    }
  } catch (error) {
    console.error('❌ [setCartId] Error:', error, requestId);
  }
};

export const removeCartId = async () => {
  const requestId = `removeCartId_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // ✅ Clear client cache immediately
    if (isBrowser) {
      clientCartIdCache = null;
      
      try {
        localStorage.removeItem('_medusa_cart_id');
        localStorage.removeItem('medusa_cart_id'); // Remove legacy key
        document.cookie = '_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } catch (clientError) {
        console.warn('Could not remove cart ID from client storage:', clientError);
      }
    }
    
    // ✅ Clear server cookie
    if (!isBrowser) {
      const serverCookies = await getServerCookies();
      if (serverCookies) {
        serverCookies.set('_medusa_cart_id', '', { maxAge: -1 });
        console.log('✅ [removeCartId] Server cart ID removed', requestId);
      }
    }
  } catch (error) {
    console.error('❌ [removeCartId] Error:', error, requestId);
  }
}

/**
 * ✅ SECURITY: Validates that the cart being accessed belongs to the current user
 * - For authenticated users: Validates customer_id matches
 * - For guest users: Validates cart_id matches the one in cookie
 * - Prevents cart hijacking and cross-user data leakage
 */
export async function validateCartOwnership(cartId: string): Promise<void> {
  const requestId = `validate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  
  try {
    // Import retrieveCart dynamically to avoid circular dependency
    const { retrieveCart } = await import('./cart');
    
    // Get current cart
    const cart = await retrieveCart(cartId);
    if (!cart) {
      console.error('❌ [validateCartOwnership] Cart not found', { requestId, cartId });
      throw new Error(`Cart ${cartId} not found`);
    }
    
    // Check if user is authenticated
    const headers = await getAuthHeaders();
    
    if ('authorization' in headers) {
      // User is AUTHENTICATED - validate customer_id match
      const customer = await retrieveCustomer();
      
      if (customer && cart.customer_id) {
        if (cart.customer_id !== customer.id) {
          console.error('❌ [validateCartOwnership] Customer ID mismatch!', {
            requestId,
            cartId,
            cartCustomerId: cart.customer_id,
            authenticatedCustomerId: customer.id
          });
          throw new Error("Cart does not belong to current user");
        }
      } else if (customer && !cart.customer_id) {
        // Authenticated user accessing guest cart - this is OK during login transition
      }
    } else {
      // User is GUEST - cart security relies on cookie secrecy
      // The cart_id from cookie should match the cart being accessed
      const cookieCartId = await getCartId();
      
      if (cookieCartId && cookieCartId !== cartId) {
        console.error('❌ [validateCartOwnership] Guest cart ID mismatch!', {
          requestId,
          cartId,
          cookieCartId
        });
        throw new Error("Cart ID mismatch - possible cart hijacking attempt");
      }
    }
  } catch (error: any) {
    console.error('❌ [validateCartOwnership] Error:', {
      requestId,
      error: error.message
    });
    throw error;
  }
};