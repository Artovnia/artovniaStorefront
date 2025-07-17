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
  console.log('Transforming order set to order:', {
    id: orderSet.id,
    display_id: orderSet.display_id,
    orders_count: orderSet.orders?.length || 0,
    has_detailed_orders: orderSet.orders && orderSet.orders.length > 0 && orderSet.orders[0]?.items
  })
  
  const orders = orderSet.orders || []
  
  if (orders.length === 0) {
    console.log(`Order set ${orderSet.id} has no orders - creating placeholder`)
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
    total: orders.reduce((sum, order) => sum + (order.total || 0), 0),
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
    items: orders.flatMap(order => order.items || []),
    
    // Use shipping info from first order
    shipping_address: firstOrder?.shipping_address || {},
    shipping_methods: firstOrder?.shipping_methods || [],
    payments: firstOrder?.payments || [],
    
    // Include the detailed orders array
    orders: orders,
    
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
  
  console.log('Created composite order from order set:', {
    id: compositeOrder.id,
    display_id: compositeOrder.display_id,
    payment_status: compositeOrder.payment_status,
    items_count: compositeOrder.items?.length || 0,
    orders_count: compositeOrder.orders?.length || 0,
    total: compositeOrder.total
  })
  
  return compositeOrder
}