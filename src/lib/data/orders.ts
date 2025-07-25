"use server"

import { SellerProps } from "@/types/seller"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import { transformOrderSetToOrder, type OrderSet } from "../utils/order-transformations"
import medusaError from "../helpers/medusa-error"

// Define order set response type
export interface OrderSetResponse {
  order_set: OrderSet & {
    linked_order_ids?: string[]
  }
}

// Define the minimal Order interface needed
// In the Order interface, add fulfillments field
export interface Order {
  id: string;
  display_id?: number;
  status?: string;
  payment_status?: string;
  fulfillment_status?: string;
  total?: number;
  currency_code?: string;
  created_at?: string;
  updated_at?: string;
  customer_id?: string;
  customer?: {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  items?: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price?: number;
    thumbnail?: string;
    variant?: {
      id: string;
      title?: string;
      sku?: string;
      product?: {
        id: string;
        title?: string;
        thumbnail?: string;
      };
    };
  }>;
  shipping_address?: any;
  shipping_methods?: any[];
  payments?: any[];
  fulfillments?: Array<{
    id: string;
    packed_at?: string | null;
    shipped_at?: string | null;
    delivered_at?: string | null;
    canceled_at?: string | null;
  }>;
  is_order_set?: boolean;
  order_set_id?: string;
  order_set_display_id?: number;
  seller?: SellerProps;
  reviews?: any[];
}

/**
 * Retrieve order set data from the backend
 */
export const retrieveOrderSet = async (id: string): Promise<(OrderSet & { linked_order_ids?: string[] }) | null> => {
  console.log(`Attempting to fetch order set: ${id}`)
  
  try {
    const headers = await getAuthHeaders()
    
    console.log('Performing request to:')
    console.log(` URL: ${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/order-set/${id}`)

    const response = await sdk.client.fetch<OrderSetResponse>(
      `/store/order-set/${id}`,
      {
        method: "GET",
        query: {
          // Make sure to include fulfillment fields explicitly
          fields: "*items,+items.metadata,*items.variant,*items.product,*seller,*reviews,*order_set,*customer,*shipping_address,*shipping_methods,*fulfillments,*fulfillments.packed_at,*fulfillments.shipped_at,*fulfillments.delivered_at,*fulfillments.canceled_at"
        },
        headers,
        cache: "no-cache",
      }
    )
    
    console.log(`Received response with status ${response ? 'success' : 'failed'}`)
    
    if (!response || !response.order_set) {
      console.log('Order set response is empty or invalid')
      return null
    }
    
    const orderSet = response.order_set
    
    // Log fulfillment data for debugging
    console.log('OrderSet fulfillment data:', {
      id: orderSet.id,
      orders: orderSet.orders?.map((order: any) => ({
        id: order.id,
        status: order.status,
        fulfillment_status: order.fulfillment_status,
        fulfillments_count: order.fulfillments?.length || 0,
        fulfillments: order.fulfillments?.map((f: any) => ({
          id: f.id,
          packed_at: f.packed_at,
          shipped_at: f.shipped_at,
          delivered_at: f.delivered_at,
          canceled_at: f.canceled_at
        }))
      }))
    })
    
    return orderSet
  } catch (error) {
    console.error(`Failed to fetch order set via API:`, error)
    return null
  }
}

// Also update retrieveIndividualOrder to include fulfillment fields
export const retrieveIndividualOrder = async (id: string): Promise<Order | null> => {
  try {
    console.log(`Fetching individual order: ${id}`)
    
    const headers = await getAuthHeaders()
    const next = await getCacheOptions("orders")
    
    const response = await sdk.client.fetch<{ order: HttpTypes.StoreOrder & { seller?: SellerProps; reviews?: any[] } }>(
      `/store/orders/${id}`,
      {
        method: "GET",
        query: {
          // Include fulfillment fields
          fields: "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product,*seller,*order_set,*reviews,*fulfillments,*fulfillments.packed_at,*fulfillments.shipped_at,*fulfillments.delivered_at,*fulfillments.canceled_at"
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    
    const { order } = response
    
    // Log fulfillment data for debugging
    console.log('Individual order fulfillment data:', {
      id: order.id,
      status: order.status,
      fulfillment_status: order.fulfillment_status,
      fulfillments_count: (order as any).fulfillments?.length || 0,
      fulfillments: (order as any).fulfillments?.map((f: any) => ({
        id: f.id,
        packed_at: f.packed_at,
        shipped_at: f.shipped_at,
        delivered_at: f.delivered_at,
        canceled_at: f.canceled_at
      }))
    })
    
    // Convert HttpTypes.StoreOrder to our Order interface
    return {
      id: order.id,
      display_id: order.display_id,
      status: order.status,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      total: order.total,
      currency_code: order.currency_code,
      created_at: order.created_at instanceof Date ? order.created_at.toISOString() : order.created_at,
      updated_at: order.updated_at instanceof Date ? order.updated_at.toISOString() : order.updated_at,
      customer_id: order.customer_id || undefined,
      customer: order.customer ? {
        id: order.customer.id,
        email: order.customer.email || undefined,
        first_name: order.customer.first_name || undefined,
        last_name: order.customer.last_name || undefined,
      } : undefined,
      seller: (order as any).seller,
      reviews: (order as any).reviews || [],
      items: order.items as any,
      shipping_address: order.shipping_address,
      shipping_methods: order.shipping_methods || [],
      payments: (order as any).payments || [],
      fulfillments: (order as any).fulfillments || [], // Include fulfillments
      is_order_set: false
    }
  } catch (error) {
    console.error(`Error retrieving individual order ${id}:`, error)
    return null
  }
}

/**
 * Main function to retrieve either an order or order set by ID
 */
export const retrieveOrder = async (id: string): Promise<Order | null> => {
  console.log(`Attempting to retrieve order or order set with ID: ${id}`)
  
  try {
    // Check if this is an order set ID
    if (id.startsWith('ordset_')) {
      console.log(`ID ${id} detected as an order set`)
      
      // Retrieve order set data
      const orderSet = await retrieveOrderSet(id)
      
      if (!orderSet) {
        console.log(`Order set not found for ID: ${id}`)
        return null
      }
      
      // Transform the order set regardless of whether it has orders
      const transformedOrder = transformOrderSetToOrder(orderSet)
      
      console.log(`Transformed order set to order:`, {
        id: transformedOrder.id,
        display_id: transformedOrder.display_id,
        has_orders: transformedOrder.orders && transformedOrder.orders.length > 0,
        orders_count: transformedOrder.orders?.length || 0,
        has_items: transformedOrder.items && transformedOrder.items.length > 0,
        items_count: transformedOrder.items?.length || 0
      })
      
      return transformedOrder
      
    } else {
      // Regular order retrieval
      console.log(`ID ${id} detected as a regular order`)
      return await retrieveIndividualOrder(id)
    }
    
  } catch (error) {
    console.error(`Error retrieving order/order set ${id}:`, error)
    return null
  }
}

/**
 * List orders for the current user
 */
export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  try {
    const headers = await getAuthHeaders()
    const next = await getCacheOptions("orders")

    console.log('Listing orders with params:', { limit, offset, filters })

    try {
      const response = await sdk.client.fetch<{
        orders: Array<HttpTypes.StoreOrder & { 
          seller: { id: string; name: string }
          // reviews temporarily removed due to backend issue
        }>
      }>(`/store/orders`, {
        method: "GET",
        query: {
          limit,
          offset,
          order: "-created_at",
          // Removed *reviews until backend relation is fixed
          fields: "*items,+items.metadata,*items.variant,*items.product,*seller,*order_set",
          ...filters,
        },
        headers,
        next,
        cache: "no-cache",
      })
      console.log(`Retrieved ${response.orders?.length || 0} orders`)
      return response.orders || []
    } catch (apiError) {
      console.error("API Error listing orders:", apiError)
      return []
    }
  } catch (err) {
    console.error("Error in listOrders:", err)
    return []
  }
}

/**
 * Create transfer request for an order
 */
export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  try {
    const headers = await getAuthHeaders()

    const result = await sdk.store.order.requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )

    return { success: true, error: null, order: result.order }
  } catch (err) {
    console.error("Transfer request error:", err)
    const errorMessage = err instanceof Error ? err.message : "Transfer request failed"
    return { success: false, error: errorMessage, order: null }
  }
}

/**
 * Accept transfer request for an order
 */
export const acceptTransferRequest = async (id: string, token: string) => {
  try {
    const headers = await getAuthHeaders()

    const result = await sdk.store.order.acceptTransfer(id, { token }, {}, headers)
    return { success: true, error: null, order: result.order }
  } catch (err) {
    console.error("Accept transfer error:", err)
    const errorMessage = err instanceof Error ? err.message : "Accept transfer failed"
    return { success: false, error: errorMessage, order: null }
  }
}

/**
 * Decline transfer request for an order
 */
export const declineTransferRequest = async (id: string, token: string) => {
  try {
    const headers = await getAuthHeaders()

    const result = await sdk.store.order.declineTransfer(id, { token }, {}, headers)
    return { success: true, error: null, order: result.order }
  } catch (err) {
    console.error("Decline transfer error:", err)
    const errorMessage = err instanceof Error ? err.message : "Decline transfer failed"
    return { success: false, error: errorMessage, order: null }
  }
}

/**
 * Create return request for an order
 */
export const createReturnRequest = async (data: any) => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
    }

    console.log('Creating return request with data:', data)

    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/return-request`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Return request created successfully:', result)
    return result
  } catch (error) {
    console.error("Error creating return request:", error)
    throw error
  }
}

/**
 * Get returns for the current user
 * This function gracefully handles backend errors when the returns API is not fully implemented
 * Will try both possible API endpoints: /store/return-request and /store/returns
 */
export const getReturns = async () => {
  try {
    const headers = await getAuthHeaders()
    
    // Log authentication status for debugging
    console.log('Fetching returns with auth headers:', {
      hasAuthToken: 'authorization' in headers,
      hasPublishableKey: !!headers['x-publishable-api-key']
    })
    
    // First try the /store/return-request endpoint
    try {
      console.log('Attempting to fetch from /store/return-request first')
      
      // For Next.js 15 and Vercel compatibility
      const response = await sdk.client.fetch<{
        order_return_requests: Array<any>
      }>(`/store/return-request`, {
        method: "GET",
        headers,
        cache: "no-store", // Ensure fresh data on each request
        credentials: "include", // Include cookies for authentication
        next: { revalidate: 0 }, // Next.js 15 cache busting
      })
      
      if (response && response.order_return_requests) {
        // Always return an array even if backend returns null
        const returnRequests = Array.isArray(response.order_return_requests) ? 
          response.order_return_requests : [];
          
        console.log(`Retrieved ${returnRequests.length} return requests from /store/return-request`)
        
        // Show details of first return for debugging
        if (returnRequests.length > 0) {
          const sampleReturn = returnRequests[0];
          console.log('Sample return data:', {
            id: sampleReturn.id,
            status: sampleReturn.status,
            customer_id: sampleReturn.customer_id,
            order_id: sampleReturn.order_id,
            created_at: sampleReturn.created_at,
            has_line_items: Array.isArray(sampleReturn.line_items) && sampleReturn.line_items.length > 0
          })
          return { order_return_requests: returnRequests }
        }
        
        // If we got an empty array, continue to try the other endpoint
        if (returnRequests.length === 0) {
          console.log('Got empty array from /store/return-request, trying /store/returns next')
        } else {
          return { order_return_requests: returnRequests }
        }
      }
    } catch (firstError) {
      console.error("Error fetching from /store/return-request:", firstError)
      console.log('Trying fallback to /store/returns endpoint')
      // Continue to the next endpoint
    }
    
    // Try the alternate /store/returns endpoint if first one failed or returned empty
    try {
      console.log('Attempting to fetch from /store/returns')
      
      const response = await sdk.client.fetch<{
        returns: Array<any>
      }>(`/store/returns`, {
        method: "GET",
        headers,
        cache: "no-store",
        credentials: "include",
        next: { revalidate: 0 },
      })
      
      if (response && response.returns) {
        const returns = Array.isArray(response.returns) ? response.returns : [];
        console.log(`Retrieved ${returns.length} returns from /store/returns`)
        
        // Transform returns to match expected format if needed
        const transformedReturns = returns.map(returnItem => ({
          ...returnItem,
          // Add any missing fields to match the expected format
          id: returnItem.id || `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          status: returnItem.status || 'pending',
          // Ensure line_items is always an array
          line_items: Array.isArray(returnItem.items) ? returnItem.items : []
        }));
        
        return { order_return_requests: transformedReturns }
      }
    } catch (secondError) {
      console.error("Error fetching from /store/returns:", secondError)
    }
    
    // If both endpoints failed, return empty array
    console.log('Both API endpoints failed or returned empty, using empty array fallback')
    return { order_return_requests: [] }
    
  } catch (error: any) {
    console.error("Error in getReturns setup:", error?.message || error)
    return { order_return_requests: [] }
  }
}

/**
 * Retrieve return methods for an order
 */
export const retrieveReturnMethods = async (order_id: string) => {
  try {
    const headers = await getAuthHeaders()

    console.log(`Fetching return methods for order: ${order_id}`)

    const response = await sdk.client.fetch<{
      shipping_options: Array<any>
    }>(`/store/shipping-options/return?order_id=${order_id}`, {
      method: "GET",
      headers,
      cache: "force-cache",
    })

    console.log(`Retrieved ${response.shipping_options?.length || 0} return methods`)
    return response.shipping_options
  } catch (error) {
    console.error(`Error fetching return methods for order ${order_id}:`, error)
    throw medusaError(error)
  }
}

/**
 * Retrieve return reasons
 */
export const retrieveReturnReasons = async () => {
  try {
    const headers = await getAuthHeaders()

    console.log('Fetching return reasons...')

    // Use the proper endpoint for return reasons
    const response = await sdk.client.fetch<{
      return_reasons: Array<{
        id: string
        value: string
        label: string
        description?: string | null
      }>
    }>(`/store/return-reasons`, {
      method: "GET",
      headers,
      next: { revalidate: 0 }, // Always fetch fresh data
    })

    console.log(`Retrieved ${response.return_reasons?.length || 0} return reasons:`, response.return_reasons)
    
    if (!response.return_reasons) {
      console.warn('No return reasons found in response')
      return []
    }

    // Return the complete array of return reasons with proper structure
    return response.return_reasons
  } catch (error) {
    console.error("Error fetching return reasons:", error)
    // Return an empty array instead of throwing to prevent UI breaks
    return []
  }
}