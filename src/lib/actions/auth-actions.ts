"use server"

import { cookies } from 'next/headers'

/**
 * Gets authentication headers for API requests
 * This must be used in a Server Component or Server Action
 */
export async function getAuthHeaders(): Promise<{ authorization: string } | {}> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('_medusa_jwt')?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch (error) {
    console.error('Error getting auth headers:', error)
    return {}
  }
}

/**
 * Gets cache tag for API requests
 * This must be used in a Server Component or Server Action
 */
export async function getCacheTag(tag: string): Promise<string> {
  try {
    const cookieStore = await cookies()
    const cacheId = cookieStore.get('_medusa_cache_id')?.value

    if (!cacheId) {
      return ''
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ''
  }
}

/**
 * Gets cache options for API requests
 * This must be used in a Server Component or Server Action
 */
export async function getCacheOptions(tag: string): Promise<{ tags: string[] } | {}> {
  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

/**
 * Sets the authentication token in cookies
 * This must be used in a Server Component or Server Action
 */
export async function setAuthToken(token: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set('_medusa_jwt', token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  } catch (error) {
    console.error('Error setting auth token:', error)
  }
}

/**
 * Removes the authentication token from cookies
 * This must be used in a Server Component or Server Action
 */
export async function removeAuthToken(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set('_medusa_jwt', '', {
      maxAge: -1,
    })
  } catch (error) {
    console.error('Error removing auth token:', error)
  }
}

/**
 * Gets the cart ID from cookies
 * This must be used in a Server Component or Server Action
 */
export async function getCartId(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get('_medusa_cart_id')?.value
  } catch (error) {
    console.error('Error getting cart ID:', error)
    return undefined
  }
}

/**
 * Sets the cart ID in cookies
 * This must be used in a Server Component or Server Action
 */
export async function setCartId(cartId: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set('_medusa_cart_id', cartId, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  } catch (error) {
    console.error('Error setting cart ID:', error)
  }
}

/**
 * Removes the cart ID from cookies
 * This must be used in a Server Component or Server Action
 */
export async function removeCartId(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set('_medusa_cart_id', '', {
      maxAge: -1,
    })
  } catch (error) {
    console.error('Error removing cart ID:', error)
  }
}
