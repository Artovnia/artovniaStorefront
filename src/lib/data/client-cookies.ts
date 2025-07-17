/**
 * Client-side cookie handling for auth and cache headers
 * This file provides client-side alternatives to the server-only cookies.ts functions
 */

/**
 * Get the publishable API key for Medusa
 */
export const getPublishableApiKey = (): string => {
  return process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_f821cc0100d91d1f80a9a3aa10ba069740c29d4f9aea104c2fe852ad87beee03';
};

/**
 * Gets authentication headers for client-side requests
 * Unlike the server-side version, this cannot access HttpOnly cookies,
 * but it can include the publishable API key
 */
export const getClientAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': getPublishableApiKey()
  };
  
  // Try to get auth token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('_medusa_jwt');
    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};
