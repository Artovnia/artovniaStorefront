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
  shipping_methods?: Array<{
    id: string
    amount: number
    [key: string]: any
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
}

/**
 * Transform guest order to recalculate item prices from order.total
 * This mirrors the logic from transformOrderSetToOrder() used for registered users
 * 
 * The database stores incorrect item.total values, so we calculate the actual
 * paid amounts based on the order.total and proportional distribution
 * 
 * Note: Payment collection is not available in Order entity query, so we use order.total
 */
function transformGuestOrder(order: GuestOrder): GuestOrder {
  const items = order.items || []
  
  // Get ACTUAL paid amount from order.total (source of truth for guests)
  // Payment collection is not available in Order entity query
  const paymentAmount = order.total || 0
  
  const shippingAmount = order.shipping_methods?.[0]?.amount || order.shipping_total || 0
  const actualItemTotal = paymentAmount - shippingAmount
  
  console.log('🔄 Transforming guest order:', {
    order_id: order.id,
    display_id: order.display_id,
    paymentAmount,
    shippingAmount,
    actualItemTotal,
    itemCount: items.length
  })
  
  // Calculate total base price
  const totalBasePrice = items.reduce((sum: number, item: any) => 
    sum + ((item.unit_price || 0) * (item.quantity || 1)), 0
  )
  
  // Separate items into no-discount and discounted
  // Items with discount_total=0 have NO promotion, use full price
  const noDiscountItems = items.filter((item: any) => !item.discount_total || item.discount_total === 0)
  const discountedItems = items.filter((item: any) => item.discount_total && item.discount_total > 0)
  
  // Calculate total for no-discount items (use full price)
  const noDiscountTotal = noDiscountItems.reduce((sum: number, item: any) => 
    sum + ((item.unit_price || 0) * (item.quantity || 1)), 0
  )
  
  // Remaining amount goes to discounted items
  const remainingForDiscounted = actualItemTotal - noDiscountTotal
  
  // Calculate base price for discounted items only
  const discountedBaseTotal = discountedItems.reduce((sum: number, item: any) => 
    sum + ((item.unit_price || 0) * (item.quantity || 1)), 0
  )
  
  console.log('📊 Price distribution:', {
    totalBasePrice,
    noDiscountItemsCount: noDiscountItems.length,
    noDiscountTotal,
    discountedItemsCount: discountedItems.length,
    discountedBaseTotal,
    remainingForDiscounted
  })
  
  // Transform items with correct pricing
  const transformedItems = items.map((item: any) => {
    const baseAmount = (item.unit_price || 0) * (item.quantity || 1)
    
    let finalAmount: number
    let calculatedDiscount: number
    
    // If item has no discount, use full price
    if (!item.discount_total || item.discount_total === 0) {
      finalAmount = baseAmount
      calculatedDiscount = 0
    } else {
      // Distribute remaining amount proportionally among discounted items
      finalAmount = discountedBaseTotal > 0
        ? (baseAmount / discountedBaseTotal) * remainingForDiscounted
        : baseAmount
      calculatedDiscount = baseAmount - finalAmount
    }
    
    console.log('💰 Item transformed:', {
      subtitle: item.subtitle,
      unit_price: item.unit_price,
      quantity: item.quantity,
      baseAmount,
      original_total: item.total,
      original_discount: item.discount_total,
      finalAmount,
      calculatedDiscount
    })
    
    return {
      ...item,
      subtotal: finalAmount,
      total: finalAmount,
      discount_total: calculatedDiscount,
      _original_subtotal: item.subtotal,
      _original_total: item.total,
      _original_discount: item.discount_total
    }
  })
  
  return {
    ...order,
    items: transformedItems
  }
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

    // Backend now does manual calculation, so data is already correct
    // No transformation needed - just return the order
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
