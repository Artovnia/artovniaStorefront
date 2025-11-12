"use server"

import { sdk } from "../config"
import medusaError from "../helpers/medusa-error"

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
  items: Array<{
    id: string
    title: string
    variant_title?: string
    thumbnail?: string
    quantity: number
    unit_price: number
  }>
  fulfillments?: Array<{
    id: string
    delivered_at?: string
    shipped_at?: string
  }>
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
        },
        body: JSON.stringify(data),
      }
    )

    return response
  } catch (error: any) {
    return medusaError(error)
  }
}

/**
 * Get return shipping options for guest order
 */
export async function getGuestReturnShippingOptions(
  order_id: string
): Promise<{ shipping_options: any[] } | null> {
  try {
    const response = await sdk.client.fetch<{ shipping_options: any[] }>(
      `/store/shipping-options/return?order_id=${order_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    return response
  } catch (error: any) {
    return medusaError(error)
  }
}

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
    const response = await sdk.client.fetch(`/store/return-request/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return response
  } catch (error: any) {
    return medusaError(error)
  }
}
