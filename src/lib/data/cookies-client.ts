/**
 * Client-side cookie utilities
 * This file provides client-safe alternatives to the server-only cookie functions
 */

// Empty auth headers for client-side use
export const getClientAuthHeaders = async (): Promise<{}> => {
  return {}
}

// Empty cache tag for client-side use
export const getClientCacheTag = async (): Promise<string> => {
  return ''
}

// Empty cache options for client-side use
export const getClientCacheOptions = async (): Promise<{}> => {
  return {}
}
