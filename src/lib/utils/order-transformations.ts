// src/lib/utils/order-transformations.ts
import { SellerProps } from "@/types/seller"

// Define interfaces for OrderSet
interface PaymentCollection {
  id: string;
  amount: number;
  currency_code: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  payment_sessions?: any[];
}

export interface OrderSet {
  id: string;
  display_id: number;
  created_at: string | Date;
  updated_at: string | Date;
  customer_id?: string;
  customer?: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  cart_id: string;
  cart?: any;
  sales_channel_id?: string;
  sales_channel?: {
    id: string;
    name?: string;
  };
  payment_collection_id?: string;
  payment_collection?: PaymentCollection;
  orders?: any[]; // Linked orders from the backend
}

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
  // Additional properties for order stats
  has_items?: boolean;
  items_count?: number;
  
  // Seller information
  seller?: SellerProps;
  seller_id?: string;
  
  items?: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price?: number;
    subtotal?: number;
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
    // Additional item properties
    product_title?: string;
    variant_id?: string;
    variant_title?: string;
    seller_id?: string;
    shipping_method?: {
      name: string;
    };
  }>;
  shipping_address?: any;
  shipping_methods?: any[];
  payments?: any[];
  is_order_set?: boolean;
  order_set_id?: string;
  order_set_display_id?: number;
  // Payment collection for UI components
  payment_collection?: {
    currency_code?: string;
    amount?: number;
    status?: string;
  };
  // For compatibility with OrderDetailsSection
  orders?: any[];
}

/**
 * Transforms an OrderSet into an Order format that can be used by the frontend
 * Since the backend may include linked orders in the response,
 * we create a comprehensive order with the data from the order set and linked orders
 * For empty order sets, we create placeholder data to prevent UI rendering issues
 */
export function transformOrderSetToOrder(orderSet: OrderSet): Order & { orders?: any[] } {
  
  const orders = orderSet.orders || []
  
  if (orders.length === 0) {
    
    return {
      id: orderSet.id,
      display_id: orderSet.display_id,
      status: 'pending',
      payment_status: orderSet.payment_collection?.status || 'pending',
      fulfillment_status: 'pending',
      total: orderSet.payment_collection?.amount || 0,
      currency_code: orderSet.payment_collection?.currency_code || 'PLN',
      created_at: typeof orderSet.created_at === 'string' ? 
        orderSet.created_at : 
        new Date(orderSet.created_at).toISOString(),
      updated_at: typeof orderSet.updated_at === 'string' ? 
        orderSet.updated_at : 
        new Date(orderSet.updated_at).toISOString(),
      customer_id: orderSet.customer_id,
      customer: orderSet.customer,
      is_order_set: true,
      order_set_id: orderSet.id,
      order_set_display_id: orderSet.display_id,
      items: [],
      orders: [],
      payment_collection: orderSet.payment_collection ? {
        currency_code: orderSet.payment_collection.currency_code,
        amount: orderSet.payment_collection.amount,
        status: orderSet.payment_collection.status
      } : {
        currency_code: 'PLN',
        amount: 0,
        status: 'pending'
      }
    }
  }
  
  const firstOrder = orders[0]
  
  
  // Create the composite order with all linked orders
  const compositeOrder = {
    id: orderSet.id,
    display_id: orderSet.display_id,
    status: firstOrder?.status || 'pending',
    payment_status: firstOrder?.payment_status || orderSet.payment_collection?.status || 'pending',
    fulfillment_status: firstOrder?.fulfillment_status || 'pending',
    total: orderSet.payment_collection?.amount || orders.reduce((sum, order) => sum + (order.total || 0), 0),
    currency_code: firstOrder?.currency_code || orderSet.payment_collection?.currency_code || 'PLN',
    created_at: typeof orderSet.created_at === 'string' ? 
      orderSet.created_at : 
      new Date(orderSet.created_at).toISOString(),
    updated_at: typeof orderSet.updated_at === 'string' ? 
      orderSet.updated_at : 
      new Date(orderSet.updated_at).toISOString(),
    customer_id: orderSet.customer_id,
    customer: orderSet.customer,
    is_order_set: true,
    order_set_id: orderSet.id,
    order_set_display_id: orderSet.display_id,
    
    // Aggregate items from all orders
    // CRITICAL: Backend correctly calculates all values - pass them through unchanged
    // Backend provides:
    // - item.subtotal: unit_price * quantity (base price before discounts)
    // - item.total: subtotal - discount_total (final price after discounts)
    // - item.discount_total: sum of all adjustments (discount amount)
    items: orders.flatMap(order => {
      const items = order.items || []
      
      // Pass through backend-calculated values without modification
      return items.map((item: any) => {
        return {
          ...item,
          // Use backend values directly - they are already correct
          subtotal: item.subtotal || 0,           // Base price (unit_price * quantity)
          total: item.total || 0,                 // Final price (subtotal - discounts)
          discount_total: item.discount_total || 0, // Discount amount
          unit_price: item.unit_price || 0,       // Price per unit
          quantity: item.quantity || 1            // Quantity
        }
      })
    }),
    
    // Use shipping info from first order
    shipping_address: firstOrder?.shipping_address || {},
    // CRITICAL: Aggregate ALL shipping methods from ALL orders (for split parcels)
    shipping_methods: orders.flatMap(order => order.shipping_methods || []),
    payments: firstOrder?.payments || [],
    
    // CRITICAL: Pass through orders array with backend-calculated values
    // Backend already correctly calculates item.total and item.discount_total
    // DO NOT recalculate here - it causes wrong values due to BigNumber timing issues
    orders: orders.map(order => ({
      ...order,
      // Keep all backend-calculated values as-is
      // Backend handles: item.total, item.discount_total, item.subtotal
    })),
    
    // Payment collection info
    payment_collection: orderSet.payment_collection ? {
      currency_code: orderSet.payment_collection.currency_code,
      amount: orderSet.payment_collection.amount,
      status: orderSet.payment_collection.status
    } : {
      currency_code: firstOrder?.currency_code || 'PLN',
      amount: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      status: firstOrder?.payment_status || 'pending'
    }
  }
 
 
  
  return compositeOrder
}