"use server"

import { sdk } from "../config"
import medusaError from "../helpers/medusa-error"
import { getPublishableApiKey } from "../get-publishable-key"

export interface GuestOrderVerification {
  order_id: string
  email: string
}

export interface GuestOrder {
  id: string
  display_id: string
  email: string
  customer_id?: string
  status: string
  created_at: string
  currency_code: string
  total: number
  shipping_total: number
  items: Array<{
    id: string
    title: string
    subtitle?: string
    variant_title?: string
    thumbnail?: string
    quantity: number
    unit_price: number
    total: number
    subtotal: number
    discount_total: number
    variant?: any
    product?: any
  }>
  fulfillments?: Array<{
    id: string
    delivered_at?: string | null
    shipped_at?: string | null
  }>
  seller?: {
    id: string
    name: string
    email?: string
    phone?: string
    address_line?: string
    city?: string
    state?: string
    postal_code?: string
    country_code?: string
  }
  shipping_methods?: any[]
}

/**
 * Verify guest order ownership by email
 * Used for guest return requests
 */
export async function verifyGuestOrder(
  data: GuestOrderVerification
): Promise<{ order: GuestOrder } | null> {
  try {
    const response = await sdk.client.fetch<{ order: GuestOrder }>(
      `/store/orders/guest-verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": await getPublishableApiKey(),
        },
        body: data,
        cache: "no-store",
      }
    )

    return response
  } catch (error: any) {
    return medusaError(error)
  }
}

/**
 * Retrieve full guest order details with seller info for return page
 * This mirrors retrieveOrder() for registered users
 * 
 * IMPORTANT: Uses only /store/orders/guest-verify which returns complete order data
 * We DON'T call /store/orders/:id because that requires authentication
 */
export async function retrieveGuestOrder(
  order_id: string,
  email: string
): Promise<GuestOrder | null> {
  try {
    // Verify ownership and get COMPLETE order details in one call
    // The guest-verify endpoint now returns all data we need (seller, items, etc.)
    const verification = await verifyGuestOrder({ order_id, email })
    
    if (!verification || !verification.order) {
      console.error('Guest order verification failed - no order returned')
      return null
    }

    // The verification response already contains all the data we need
    // No need for a second API call to /store/orders/:id (which requires auth)
    return verification.order
  } catch (error: any) {
    console.error('Error retrieving guest order:', error)
    return medusaError(error)
  }
}

/**
 * Get return shipping options for guest order (no auth required)
 * This mirrors retrieveReturnMethods() for registered users
 */
export async function retrieveGuestReturnMethods(
  order_id: string
): Promise<any[]> {
  try {
    const response = await sdk.client.fetch<{ shipping_options: any[] }>(
      `/store/shipping-options/return?order_id=${order_id}`,
      {
        method: "GET",
        headers: {
          "x-publishable-api-key": await getPublishableApiKey(),
        },
        cache: "no-store",
      }
    )

    return response?.shipping_options || []
  } catch (error: any) {
    console.error(`Error fetching guest return methods for order ${order_id}:`, error)
    return []
  }
}

// Alias for backward compatibility
export const getGuestReturnShippingOptions = retrieveGuestReturnMethods

/**
 * Get return reasons for guest users (no auth required)
 * This mirrors retrieveReturnReasons() for registered users
 */
export async function retrieveGuestReturnReasons(): Promise<any[]> {
  try {
    const response = await sdk.client.fetch<{
      return_reasons: Array<{
        id: string
        value: string
        label: string
        description?: string | null
      }>
    }>(`/store/return-reasons`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": await getPublishableApiKey(),
      },
      cache: "no-store",
    })

    return response?.return_reasons || []
  } catch (error: any) {
    console.error('Error fetching guest return reasons:', error)
    return []
  }
}

// Alias for backward compatibility
export const getGuestReturnReasons = retrieveGuestReturnReasons

/**
 * Create guest return request
 */
export async function createGuestReturnRequest(data: {
  order_id: string
  email: string
  line_items: Array<{
    line_item_id: string
    quantity: number
    reason_id?: string
  }>
  shipping_option_id: string
  customer_note?: string
}): Promise<any> {
  try {
    // Use direct fetch instead of SDK to avoid authentication issues
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = await getPublishableApiKey()
    
    console.log('Creating guest return request:', {
      backendUrl,
      hasPublishableKey: !!publishableKey,
      data: {
        order_id: data.order_id,
        email: data.email,
        line_items_count: data.line_items.length
      }
    })
    
    const response = await fetch(`${backendUrl}/store/return-request/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      let errorMessage = 'Unknown error'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
        console.error('Guest return request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
      } catch {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
        console.error('Guest return request failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Guest return request successful:', result)
    
    // Validate response structure
    if (!result || !result.order_return_request) {
      console.error('Invalid response structure:', result)
      throw new Error('Invalid response from server')
    }
    
    return result
  } catch (error: any) {
    console.error('Error creating guest return request:', error)
    throw error
  }
}
