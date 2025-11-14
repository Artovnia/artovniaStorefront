/**
 * Stripe payment helpers for redirect-based payment methods
 * Similar to payu-helpers.ts but for Stripe Connect payments
 */

import { placeOrder } from "@/lib/data/cart"

/**
 * Handle Stripe payment return from redirect-based payment methods
 * like Przelewy24, BLIK, etc.
 * 
 * This is called when user returns from external payment page
 * Similar to PayU continue URL handling
 */
export async function handleStripePaymentReturn(
  cartId: string,
  paymentIntentId?: string,
  paymentIntentClientSecret?: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    

    if (!cartId) {
      throw new Error('Missing cart ID in payment return')
    }

    // Complete the order with skipRedirectCheck=true since we're handling the return
    const result = await placeOrder(cartId, true)
    
    
    // Check if order was created successfully
    if (result.type === 'order' && result.order) {
      return {
        success: true,
        orderId: result.order.id
      }
    }
    
    if (result.type === 'order_set' && result.order_set) {
      const firstOrder = result.order_set[0]
      if (firstOrder) {
        return {
          success: true,
          orderId: firstOrder.id
        }
      }
    }
    
    throw new Error('Unexpected result from order completion')
    
  } catch (error: any) {
    console.error('❌ Error handling Stripe payment return:', error)
    return {
      success: false,
      error: error.message || 'Payment completion failed'
    }
  }
}

/**
 * Get the Stripe return URL for redirect-based payments
 * This should be set as return_url when creating payment sessions
 */
export function getStripeReturnUrl(cartId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  
  return `${baseUrl}/checkout/payment/return?cart_id=${cartId}`
}

/**
 * Check if a payment provider requires redirect flow
 */
export function isRedirectPaymentMethod(providerId: string): boolean {
  return providerId.includes('przelewy24') || 
         providerId.includes('blik') || 
         providerId.includes('bancontact') ||
         providerId.includes('ideal') ||
         providerId.includes('giropay') ||
         providerId.includes('sofort')
}

/**
 * Parse Stripe payment return URL parameters
 */
export function parseStripeReturnParams(searchParams: URLSearchParams) {
  return {
    cartId: searchParams.get('cart_id'),
    paymentIntent: searchParams.get('payment_intent'),
    paymentIntentClientSecret: searchParams.get('payment_intent_client_secret'),
    redirectStatus: searchParams.get('redirect_status')
  }
}
