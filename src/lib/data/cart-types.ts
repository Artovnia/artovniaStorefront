/**
 * Type definitions for cart-related functions
 */
import { HttpTypes } from "@medusajs/types"

/**
 * Response type for payment processing
 */
export interface PaymentProcessingResponse {
  type: "order" | "payment_required" | "cart";
  data: any;
  redirect_url?: string;
  cart_id?: string;
}

/**
 * Extended type for cart with payment session
 */
export interface ExtendedStoreCart extends Omit<HttpTypes.StoreCart, "payment_session"> {
  payment_session?: {
    provider_id: string;
    data: Record<string, any>;
  } | null;
}

/**
 * Payment provider information
 */
export interface PaymentProvider {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}
