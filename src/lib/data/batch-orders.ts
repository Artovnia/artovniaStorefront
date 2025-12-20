"use server"

import { getAuthHeaders } from "./cookies"
import { sdk } from "../config"
import { Order } from "./orders"

/**
 * Batch retrieve multiple orders in a single query
 * Optimizes performance by avoiding N+1 query problem
 */
export const batchRetrieveOrders = async (orderIds: string[]): Promise<Order[]> => {
  if (!orderIds || orderIds.length === 0) {
    return []
  }

  try {
    const headers = await getAuthHeaders()
    
    // Use filters to fetch multiple orders at once
    const response = await sdk.client.fetch<{ orders: any[] }>(
      `/store/orders`,
      {
        method: "GET",
        query: {
          // Filter by order IDs
          id: orderIds,
          // Minimal fields needed for returns display
          fields: "id,display_id,status,total,currency_code,shipping_total,created_at,*items,+items.title,+items.quantity,+items.unit_price,+items.thumbnail,*items.variant,*items.product,*shipping_methods,+shipping_methods.amount"
        },
        headers,
        cache: "no-cache",
      }
    )
    
    return response.orders || []
  } catch (error) {
    console.error(`Error batch retrieving orders:`, error)
    return []
  }
}

/**
 * Batch retrieve order sets by IDs
 */
export const batchRetrieveOrderSets = async (orderSetIds: string[]): Promise<any[]> => {
  if (!orderSetIds || orderSetIds.length === 0) {
    return []
  }

  try {
    const headers = await getAuthHeaders()
    
    const response = await sdk.client.fetch<{ order_sets: any[] }>(
      `/store/order-set`,
      {
        method: "GET",
        query: {
          // Filter by order set IDs
          id: orderSetIds,
          limit: orderSetIds.length
        },
        headers,
        cache: "no-cache",
      }
    )
    
    return response.order_sets || []
  } catch (error) {
    console.error(`Error batch retrieving order sets:`, error)
    return []
  }
}
