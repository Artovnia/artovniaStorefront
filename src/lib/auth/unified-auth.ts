/**
 * Unified Authentication System for Medusa.js Storefront
 * Consolidates all authentication logic to prevent race conditions and state inconsistencies
 */

import { cookies } from 'next/headers'
import { sdk } from '../config'
import { getPublishableApiKey } from '../get-publishable-key'
import { HttpTypes } from "@medusajs/types"

// Types
interface AuthState {
  isAuthenticated: boolean
  customer: HttpTypes.StoreCustomer | null
  token: string | null
}

interface AuthHeaders {
  'x-publishable-api-key': string
  authorization?: string
  [key: string]: string | undefined // Index signature for compatibility
}

// Constants
const JWT_COOKIE_NAME = '_medusa_jwt'
const CART_COOKIE_NAME = '_medusa_cart_id'
const CACHE_ID_COOKIE_NAME = '_medusa_cache_id'

// In-memory cache for auth state (cleared on logout)
let authStateCache: { 
  state: AuthState | null
  timestamp: number
  headers: AuthHeaders | null
} | null = null

const CACHE_TTL = 5000 // 5 seconds (much shorter than before)

/**
 * Clear all authentication caches
 */
function clearAuthCache(): void {
  authStateCache = null
  
  // Clear any global caches that might exist
  if (typeof window !== 'undefined') {
    // Clear any client-side auth caches
    sessionStorage.removeItem('auth_state')
    localStorage.removeItem('auth_state')
  }
}

/**
 * Get authentication headers (server-side safe)
 */
export async function getUnifiedAuthHeaders(): Promise<AuthHeaders> {
  // Check cache first
  if (authStateCache && 
      authStateCache.headers && 
      (Date.now() - authStateCache.timestamp) < CACHE_TTL) {
    return authStateCache.headers
  }

  const publishableKey = await getPublishableApiKey()
  const baseHeaders: AuthHeaders = {
    'x-publishable-api-key': publishableKey
  }

  try {
    // Server-side: use next/headers
    if (typeof window === 'undefined') {
      const cookieStore = await cookies()
      const token = cookieStore.get(JWT_COOKIE_NAME)?.value
      
      if (token) {
        baseHeaders.authorization = `Bearer ${token}`
      }
    } else {
      // Client-side: use document.cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${JWT_COOKIE_NAME}=`))
        ?.split('=')[1]
      
      if (token) {
        baseHeaders.authorization = `Bearer ${token}`
      }
    }

    // Cache the headers
    authStateCache = {
      state: null,
      timestamp: Date.now(),
      headers: baseHeaders
    }

    return baseHeaders
  } catch (error) {
    console.warn('Error getting auth headers:', error)
    return baseHeaders
  }
}

/**
 * Get current authentication state
 */
export async function getAuthState(): Promise<AuthState> {
  // Check cache first
  if (authStateCache && 
      authStateCache.state && 
      (Date.now() - authStateCache.timestamp) < CACHE_TTL) {
    return authStateCache.state
  }

  const headers = await getUnifiedAuthHeaders()
  const hasToken = !!headers.authorization

  if (!hasToken) {
    const state: AuthState = {
      isAuthenticated: false,
      customer: null,
      token: null
    }
    
    authStateCache = {
      state,
      timestamp: Date.now(),
      headers
    }
    
    return state
  }

  try {
    // Fetch customer data
    const response = await sdk.client.fetch<{ customer: HttpTypes.StoreCustomer }>(
      '/store/customers/me',
      {
        method: 'GET',
        headers: headers as any, // Type assertion to fix compatibility
        cache: 'no-cache' // Always fresh for auth state
      }
    )

    const state: AuthState = {
      isAuthenticated: true,
      customer: response.customer,
      token: headers.authorization?.replace('Bearer ', '') || null
    }

    authStateCache = {
      state,
      timestamp: Date.now(),
      headers
    }

    return state
  } catch (error) {
    console.warn('Error fetching customer:', error)
    
    const state: AuthState = {
      isAuthenticated: false,
      customer: null,
      token: null
    }
    
    authStateCache = {
      state,
      timestamp: Date.now(),
      headers
    }
    
    return state
  }
}

/**
 * Set authentication token (unified approach)
 */
export async function setAuthToken(token: string): Promise<void> {
  try {
    // Clear existing cache
    clearAuthCache()

    // Server-side: set httpOnly cookie
    if (typeof window === 'undefined') {
      const cookieStore = await cookies()
      cookieStore.set(JWT_COOKIE_NAME, token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      })
    } else {
      // Client-side: set accessible cookie for client components
      const maxAge = 60 * 60 * 24 * 7 // 7 days
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
      
      document.cookie = `${JWT_COOKIE_NAME}=${token}; Max-Age=${maxAge}; Path=/; SameSite=Strict${secure}`
    }

    console.log('✅ Auth token set successfully')
  } catch (error) {
    console.error('❌ Error setting auth token:', error)
    throw error
  }
}

/**
 * Remove authentication token (unified approach)
 */
export async function removeAuthToken(): Promise<void> {
  try {
    // Clear all caches first
    clearAuthCache()

    // Server-side: remove httpOnly cookie
    if (typeof window === 'undefined') {
      const cookieStore = await cookies()
      cookieStore.set(JWT_COOKIE_NAME, '', {
        maxAge: -1,
        path: '/'
      })
    } else {
      // Client-side: remove accessible cookie
      document.cookie = `${JWT_COOKIE_NAME}=; Max-Age=-1; Path=/`
      
      // Also clear from localStorage/sessionStorage as fallback
      localStorage.removeItem(JWT_COOKIE_NAME)
      sessionStorage.removeItem(JWT_COOKIE_NAME)
    }

    console.log('✅ Auth token removed successfully')
  } catch (error) {
    console.error('❌ Error removing auth token:', error)
    throw error
  }
}

/**
 * Login with credentials
 */
export async function unifiedLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    clearAuthCache()
    
    const token = await sdk.auth.login("customer", "emailpass", { email, password })
    
    if (typeof token === 'string') {
      await setAuthToken(token)
      
      // Verify login worked
      const authState = await getAuthState()
      if (authState.isAuthenticated) {
        return { success: true }
      } else {
        throw new Error('Login verification failed')
      }
    } else {
      throw new Error('Invalid token received')
    }
  } catch (error: any) {
    console.error('❌ Login failed:', error)
    return { success: false, error: error.message || 'Login failed' }
  }
}

/**
 * Logout (unified approach)
 */
export async function unifiedLogout(): Promise<void> {
  try {
    // Clear auth token
    await removeAuthToken()
    
    // Clear cart ID as well
    if (typeof window === 'undefined') {
      const cookieStore = await cookies()
      cookieStore.set(CART_COOKIE_NAME, '', { maxAge: -1, path: '/' })
      cookieStore.set(CACHE_ID_COOKIE_NAME, '', { maxAge: -1, path: '/' })
    } else {
      document.cookie = `${CART_COOKIE_NAME}=; Max-Age=-1; Path=/`
      document.cookie = `${CACHE_ID_COOKIE_NAME}=; Max-Age=-1; Path=/`
      
      // Clear localStorage/sessionStorage
      localStorage.removeItem(CART_COOKIE_NAME)
      localStorage.removeItem(CACHE_ID_COOKIE_NAME)
      sessionStorage.clear()
    }
    
    console.log('✅ Logout completed successfully')
  } catch (error) {
    console.error('❌ Error during logout:', error)
    throw error
  }
}

/**
 * Check if user is authenticated (quick check)
 */
export async function isAuthenticated(): Promise<boolean> {
  const headers = await getUnifiedAuthHeaders()
  return !!headers.authorization
}

/**
 * Force refresh auth state (clears cache)
 */
export function refreshAuthState(): void {
  clearAuthCache()
  console.log('🔄 Auth state cache cleared')
}
