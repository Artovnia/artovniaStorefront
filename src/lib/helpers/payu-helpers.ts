/**
 * Helper functions for PayU integration
 */
import { sdk } from "../config";
import { revalidateTag } from "next/cache";
import { getCacheTag, getCartId } from "../data/cookies";

/**
 * PayU-specific configuration from the environment
 */
export const PAYU_CONFIG = {
  posId: "490998",
  clientId: "490998",
  secondKey: "70f0de25857a54f8375d1d91863e833f",
  clientSecret: "41523beef5ad2b8f3310a85cd0017b00",
  testCard: "4444 3333 2222 1111",
  testCVV: "123",
  testBlikCode: "123456"
};

/**
 * Check if redirect URL is in a nested location (PayU-specific helper)
 */
export function findPayURedirectUrl(obj: any): string | undefined {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  
  // Check direct properties
  if (obj.redirect_url) return obj.redirect_url;
  if (obj.redirectUri) return obj.redirectUri;
  if (obj.continueUrl) return obj.continueUrl;
  
  // Check for PayU specific redirect locations
  if (obj.data?.redirectUri) return obj.data.redirectUri;
  if (obj.data?.continueUrl) return obj.data.continueUrl;
  if (obj.data?.redirect_url) return obj.data.redirect_url;
  
  // Check in payment sessions
  if (obj.payment_session?.data?.redirect_url) return obj.payment_session.data.redirect_url;
  if (obj.payment_session?.data?.redirectUri) return obj.payment_session.data.redirectUri;
  if (obj.payment_session?.data?.continueUrl) return obj.payment_session.data.continueUrl;
  
  // Check in payment collection
  if (obj.payment_collection?.payment_sessions) {
    for (const session of obj.payment_collection.payment_sessions) {
      if (session.data?.redirect_url) return session.data.redirect_url;
      if (session.data?.redirectUri) return session.data.redirectUri;
      if (session.data?.continueUrl) return session.data.continueUrl;
    }
  }
  
  // Recursively check all object properties up to 3 levels deep to avoid infinite loops
  // with circular references
  const searchDeep = (obj: any, level = 0): string | undefined => {
    if (!obj || typeof obj !== 'object' || level > 3) {
      return undefined;
    }
    
    for (const key in obj) {
      // Skip certain properties to avoid circular references
      if (key === 'parent' || key === '_parent') continue;
      
      const value = obj[key];
      
      // Check if this property is a redirect URL
      if ((key === 'redirect_url' || key === 'redirectUri' || key === 'continueUrl') && typeof value === 'string') {
        return value;
      }
      
      // Recursively check nested objects
      if (value && typeof value === 'object') {
        const result = searchDeep(value, level + 1);
        if (result) return result;
      }
    }
    
    return undefined;
  };
  
  return searchDeep(obj);
}

/**
 * Updates cart metadata with PayU payment information
 */
export async function updateCartWithPayUMetadata(cartId: string, paymentMethod: string) {
  try {
    // Create headers with publishable API key
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
    const headers = {
      'Content-Type': 'application/json',
      'x-publishable-api-key': publishableKey || ''
    };
    
    // Determine the payment method type
    const methodType = paymentMethod.includes('blik') ? 'blik' :
                      paymentMethod.includes('transfer') ? 'transfer' : 'card';
    
    // Use the correct PayU sandbox credentials
    const metadata = {
      pos_id: PAYU_CONFIG.posId,
      client_id: PAYU_CONFIG.clientId,
      second_key: PAYU_CONFIG.secondKey,
      client_secret: PAYU_CONFIG.clientSecret,
      payment_ready: true,
      payment_method: methodType,
      payment_status: "pending",
      payment_gateway: "payu",
      selected_payment_provider: paymentMethod,
      payment_provider_id: paymentMethod,
      is_payment_selected: true,
      payment_method_selected: true,
      payment_selected_at: new Date().toISOString()
    };
    
    // Update cart with metadata
    const response = await sdk.client.fetch(
      `/store/carts/${cartId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ metadata })
      }
    );
    
    // Revalidate cart cache
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    
    console.log('Successfully updated cart with PayU payment metadata');
    return response;
  } catch (error) {
    console.error('Error updating cart with PayU metadata:', error);
    throw new Error('Failed to update cart with PayU payment information');
  }
}
