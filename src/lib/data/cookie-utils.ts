/**
 * Cookie utilities that work with both App Router and Pages Router
 * This file provides cookie handling functions that are compatible with both routing systems
 */

import { parse } from 'cookies-next';

/**
 * Gets the auth token from cookies in a way that works with both App Router and Pages Router
 * This uses document.cookie for client-side and falls back to empty string for server-side in Pages Router
 */
export function getAuthToken(): string | undefined {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const cookies = parse(document.cookie);
    return cookies['_medusa_jwt'];
  }
  
  // In server environment without next/headers, we can't access cookies directly
  // This will be handled by the server action in App Router
  return undefined;
}

/**
 * Gets authentication headers in a way that works with both App Router and Pages Router
 */
export function getCompatAuthHeaders(): { authorization: string } | {} {
  const token = getAuthToken();
  
  if (!token) {
    return {};
  }
  
  return { authorization: `Bearer ${token}` };
}

/**
 * Gets the cart ID from cookies in a way that works with both App Router and Pages Router
 */
export function getCompatCartId(): string | undefined {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const cookies = parse(document.cookie);
    return cookies['_medusa_cart_id'];
  }
  
  // In server environment without next/headers, we can't access cookies directly
  return undefined;
}
