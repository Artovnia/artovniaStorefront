// src/lib/data/customer.ts
"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"
import { unifiedLogout, unifiedLogin, setAuthToken as unifiedSetAuthToken } from "../auth/unified-auth"

export const retrieveCustomer =
  async (useCache: boolean = true): Promise<HttpTypes.StoreCustomer | null> => {
    try {
      const authHeaders = await getAuthHeaders()

      // FIX: Check if authorization header exists, not if authHeaders is truthy
      if (!('authorization' in authHeaders)) return null

    const headers = {
      ...authHeaders,
    }

    if (useCache) {
      const cacheOptions = await getCacheOptions("customers")
      
      // Only include next property if cacheOptions has tags property and is not an empty object
      const requestOptions = {
        ...headers,
        ...(Object.keys(cacheOptions).length > 0 ? { next: { tags: (cacheOptions as any).tags } } : {})
      }
      
      return sdk.store.customer
        .retrieve(
          {
            fields: "*addresses",
          },
          requestOptions
        )
        .then(({ customer }) => customer)
        .catch(() => null)
    } else {
      // No cache version for addresses page
      return sdk.store.customer
        .retrieve(
          {
            fields: "*addresses",
          },
          {
            ...headers,
            cache: "no-cache",
          }
        )
        .then(({ customer }) => customer)
        .catch(() => null)
    }
    } catch (error) {
      // Handle static generation gracefully - cookies() not available during build
      return null
    }
  }

// ADD: Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const authHeaders = await getAuthHeaders()
    return 'authorization' in authHeaders
  } catch (error) {
    // Handle static generation gracefully
    return false
  }
}

// Rest of your existing functions remain the same...
export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch((err) => {
      throw new Error(err.message)
    })

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await unifiedSetAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await unifiedSetAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await unifiedSetAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function loginWithGoogle() {
  try {
    const result = await sdk.auth.login("customer", "google", {})
    
    // Check if result contains a location property (redirect to Google OAuth)
    if (result && typeof result === 'object' && 'location' in result) {
      // Return the location for client-side redirect
      return { location: result.location as string }
    }
    
    // If result is a token, the customer was previously authenticated
    if (result && typeof result === 'string') {
      await unifiedSetAuthToken(result)
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      await transferCart()
      return { success: true }
    }
    
    return { error: "Authentication failed" }
  } catch (error: any) {
    return { error: error.message || "Google login failed" }
  }
}

export async function registerWithGoogle() {
  try {
    // For registration, we want to ensure a fresh OAuth flow
    // First clear any existing auth state
    try {
      await sdk.auth.logout()
    } catch {
      // Ignore logout errors - user might not be logged in
    }
    
    const result = await sdk.auth.login("customer", "google", {})
    
    // Check if result contains a location property (redirect to Google OAuth)
    if (result && typeof result === 'object' && 'location' in result) {
      let location = result.location as string
      
      // Force account selection by adding prompt=select_account to the Google OAuth URL
      if (location.includes('accounts.google.com')) {
        const url = new URL(location)
        url.searchParams.set('prompt', 'select_account')
        location = url.toString()
      }
      
      return { location }
    }
    
    // If result is a token, the customer was previously authenticated
    if (result && typeof result === 'string') {
      await unifiedSetAuthToken(result)
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      await transferCart()
      return { success: true }
    }
    
    return { error: "Authentication failed" }
  } catch (error: any) {
    return { error: error.message || "Google registration failed" }
  }
}

export async function handleGoogleCallback(code: string, state?: string) {
  try {
    // Step 1: Call Medusa's OAuth callback endpoint
    const token = await sdk.auth.callback("customer", "google", {
      code,
      state: state || undefined,
    })
  
    if (!token || typeof token !== 'string') {
      throw new Error("Invalid token received from authentication")
    }
    
    // Step 2: Decode and inspect the token to check if customer exists
    let shouldCreateCustomer = false
    let decodedPayload: any = null
    
    try {
      const tokenParts = token.split('.')
      
      // Decode JWT to check for actor_id
      if (tokenParts.length === 3) {
        try {
          decodedPayload = JSON.parse(atob(tokenParts[1]))
          shouldCreateCustomer = !decodedPayload.actor_id || decodedPayload.actor_id === ""
        } catch (jwtError) {
          shouldCreateCustomer = true // Default to creating customer if we can't decode
        }
      }
    } catch (tokenInspectError) {
      shouldCreateCustomer = true // Default to creating customer if we can't inspect
    }
    
    // Step 3: Set the initial token
    await unifiedSetAuthToken(token)
    
    // Step 4: Create customer if needed (following Medusa's documented flow)
    if (shouldCreateCustomer) {
      // Get auth headers for customer creation
      const authHeaders = await getAuthHeaders()
      
      try {
        // SECURE BACKEND APPROACH: Use our custom backend endpoint to get real Google email
        let customerEmail = null // Will only proceed if we get real email
        let customerName = ''
        let firstName = ''
        let lastName = ''
        
        // Use our custom backend endpoint to securely access provider identity
        if (decodedPayload?.auth_identity_id) {
          try {
            const providerResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/oauth/provider-identity/${decodedPayload.auth_identity_id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              }
            })
            
            if (providerResponse.ok) {
              const providerData = await providerResponse.json()
              
              if (providerData?.success && providerData?.data) {
                const userData = providerData.data
                
                // Extract real Google email
                if (userData.email) {
                  customerEmail = userData.email
                }
                
                // Extract name information
                if (userData.name) {
                  customerName = userData.name
                  
                  // Split name into first and last name
                  const nameParts = customerName.trim().split(' ')
                  firstName = nameParts[0] || ''
                  lastName = nameParts.slice(1).join(' ') || ''
                }
                
                // Use given_name and family_name if available (more accurate)
                if (userData.given_name) {
                  firstName = userData.given_name
                }
                if (userData.family_name) {
                  lastName = userData.family_name
                }
              }
            }
          } catch (error) {
            // Silent fail for backend endpoint errors
          }
        }
        
        // Only proceed with customer creation if we have a real email
        if (!customerEmail) {
          throw new Error("Failed to obtain real Google email for customer creation")
        }
        
        // Create customer with the real email and name data
        const customerData = {
          email: customerEmail,
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName })
        }
        
        const customerResult = await sdk.store.customer.create(customerData, {}, authHeaders)
      } catch (createError: any) {
        // Re-throw the error to stop the OAuth flow
        throw new Error(`Customer creation failed: ${createError.message}. Real Google email is required.`)
      }
      
      // Step 5: Refresh token after customer creation (CRITICAL STEP)
      try {
        const refreshedToken = await sdk.auth.refresh()
        if (refreshedToken && typeof refreshedToken === 'string') {
          await unifiedSetAuthToken(refreshedToken)
        }
      } catch (refreshError: any) {
        // Silent fail for token refresh errors
      }
    } else {
      // Still try to refresh token to ensure it's up to date
      try {
        const refreshedToken = await sdk.auth.refresh()
        if (refreshedToken && typeof refreshedToken === 'string') {
          await unifiedSetAuthToken(refreshedToken)
        }
      } catch (refreshError: any) {
        // Silent fail for token refresh errors
      }
    }
    
    // Step 6: Verify customer retrieval with the final token
    const authHeaders = await getAuthHeaders()
    
    try {
      const customer = await retrieveCustomer()
    } catch (customerError: any) {
      // Silent fail for customer retrieval errors
    }
    
    // Step 7: Revalidate customer cache and transfer cart
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    await transferCart()
    
    return { success: true, token }
  } catch (error: any) {
    return { error: error.message || "Google authentication failed" }
  }
}

export async function signout() {
  try {
    // Step 1: Logout from Medusa backend
    await sdk.auth.logout()
  } catch (error) {
    console.warn('Backend logout failed:', error)
    // Continue with client-side cleanup even if backend logout fails
  }

  // Step 2: Use unified auth system to clear ALL auth state and caches
  await unifiedLogout()

  // Step 3: Clear legacy auth tokens (for backward compatibility)
  await removeAuthToken()

  // Step 4: Clear customer cache
  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  // Step 5: Clear cart data
  await removeCartId()
  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  // Step 6: Force page refresh to update all components
  redirect(`/`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (formData: FormData): Promise<any> => {
  const address = {
    address_name: formData.get("address_name") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    province: formData.get("province") as string,
    is_default_billing: Boolean(formData.get("isDefaultBilling")),
    is_default_shipping: Boolean(formData.get("isDefaultShipping")),
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      // Aggressive cache invalidation
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      
      // Also invalidate any related cache tags
      revalidateTag("customer")
      revalidateTag("addresses")
      
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<{ success: boolean; error: string | null }> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.customer.deleteAddress(addressId, headers)
    
    // Aggressive cache invalidation
    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)
    
    // Also invalidate any related cache tags
    revalidateTag("customer")
    revalidateTag("addresses")
    
    return { success: true, error: null }
  } catch (err: any) {
    console.error("Error deleting customer address:", err)
    return { success: false, error: err.message || err.toString() }
  }
}

export const updateCustomerAddress = async (
  formData: FormData
): Promise<any> => {
  const addressId = formData.get("addressId") as string

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    address_name: formData.get("address_name") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      // Aggressive cache invalidation
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      
      // Also invalidate any related cache tags
      revalidateTag("customer")
      revalidateTag("addresses")
      
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerPassword = async (
  password: string,
  token: string
): Promise<any> => {
  const res = await fetch(
    `${process.env.MEDUSA_BACKEND_URL}/auth/customer/emailpass/update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    }
  )
    .then(async () => {
      await removeAuthToken()
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err: any) => {
      return { success: false, error: err.toString() }
    })

  return res
}

export const sendResetPasswordEmail = async (email: string) => {
  const res = await sdk.auth
    .resetPassword("customer", "emailpass", {
      identifier: email,
    })
    .then(() => {
      return { success: true, error: null }
    })
    .catch((err: any) => {
      return { success: false, error: err.toString() }
    })

  return res
}