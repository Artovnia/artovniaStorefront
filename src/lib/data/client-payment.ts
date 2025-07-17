"use client"

import { sdk } from "../config"

/**
 * Client-side payment utilities for handling payment sessions using Medusa's REST API
 */

/**
 * Get client headers with publishable API key
 */
function getClientHeaders() {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
 
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableKey,
    ...(typeof window !== 'undefined' && localStorage.getItem("medusa_jwt")
      ? {
          Authorization: `Bearer ${localStorage.getItem("medusa_jwt")}`,
        }
      : {}),
  };
}


/**
 * Retrieves payment session data for a cart
 */
export async function getPaymentSessionData(cartId: string): Promise<any | null> {
  if (!cartId) {
    console.error("Cannot get payment session: Missing cart ID")
    return null
  }

  try {
    const headers = getClientHeaders();

    const { cart } = await sdk.client.fetch<{ cart: any }>(
      `/store/carts/${cartId}`,
      {
        method: "GET",
        headers,
      }
    )

    if (!cart) {
      console.error("Cart not found")
      return null
    }

    // Return payment collection with all sessions
    return cart.payment_collection || null
  } catch (error) {
    console.error("Error getting payment session data:", error)
    return null
  }
}


/**
 * Selects a payment provider for the cart
 */
export async function selectPaymentProvider(
  cartId: string,
  providerId: string
): Promise<boolean> {
  if (!cartId || !providerId) {
    console.error("Cannot select payment provider: Missing parameters")
    return false
  }

  try {
    console.log("Selecting payment provider:", { cartId, providerId })
   
    const headers = getClientHeaders();
   
    await sdk.client.fetch(
      `/store/carts/${cartId}/payment-session`,
      {
        method: "POST",
        headers,
        body: { provider_id: providerId }
      }
    );
   
    console.log("Payment provider selected successfully")
    return true
  } catch (error) {
    console.error("Error selecting payment provider:", error)
    return false
  }
}


/**
 * Updates payment session with additional data
 */
export async function updatePaymentSessionData(
  cartId: string,
  providerId: string,
  data: Record<string, unknown>
): Promise<boolean> {
  if (!cartId || !providerId) {
    console.error("Cannot update payment session: Missing parameters")
    return false
  }

  try {
    console.log("Updating payment session data:", { cartId, providerId })
   
    const headers = getClientHeaders();
   
    // First get the cart to find the payment session
    const { cart } = await sdk.client.fetch<{ cart: any }>(
      `/store/carts/${cartId}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!cart?.payment_collection) {
      throw new Error('Payment collection not found');
    }

    // Find the payment session for the provider
    const paymentSession = cart.payment_collection.payment_sessions?.find(
      (session: any) => session.provider_id === providerId
    );

    if (!paymentSession) {
      throw new Error(`Payment session not found for provider: ${providerId}`);
    }

    // Update the payment session
    await sdk.client.fetch(
      `/store/carts/${cartId}/payment-sessions/${providerId}`,
      {
        method: "POST",
        headers,
        body: { data }
      }
    );
   
    console.log("Payment session data updated successfully")
    return true
  } catch (error) {
    console.error("Error updating payment session data:", error)
    return false
  }
}


/**
 * Completes a cart and handles the response
 */
export async function completeCart(cartId: string): Promise<any> {
  if (!cartId) {
    console.error("Cannot complete cart: Missing cart ID")
    throw new Error("Missing cart ID")
  }

  try {
    console.log("Preparing to complete cart:", cartId)
   
    const headers = getClientHeaders();
   
    // First get the cart to check if it has a payment collection
    const { cart } = await sdk.client.fetch<{ cart: any }>(
      `/store/carts/${cartId}`,
      {
        method: "GET",
        headers,
      }
    );
   
    // If no payment collection, create payment sessions
    if (!cart.payment_collection?.payment_sessions?.length) {
      console.log("No payment sessions found, creating payment sessions")
      
      try {
        await sdk.client.fetch(
          `/store/carts/${cartId}/payment-sessions`,
          {
            method: "POST",
            headers,
          }
        );
        console.log("Payment sessions created successfully")
      } catch (sessionError) {
        console.warn("Error creating payment sessions:", sessionError)
        throw new Error("Failed to create payment sessions")
      }
    }
    
    // Now complete the cart
    console.log("Completing cart:", cartId)
    const result = await sdk.client.fetch(
      `/store/carts/${cartId}/complete`,
      {
        method: "POST",
        headers,
      }
    );

    console.log("Cart completion result:", result)
    return result
  } catch (error: any) {
    console.error("Error completing cart:", error)
    throw error
  }
}


/**
 * Authorizes a payment session
 */
export async function authorizePayment(
  cartId: string,
  providerId?: string
): Promise<boolean> {
  if (!cartId) {
    console.error("Cannot authorize payment: Missing cart ID")
    return false
  }

  try {
    console.log("Authorizing payment:", { cartId, providerId })
   
    const headers = getClientHeaders();
   
    // Get the cart to find the payment session
    const { cart } = await sdk.client.fetch<{ cart: any }>(
      `/store/carts/${cartId}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!cart?.payment_collection) {
      throw new Error('Payment collection not found');
    }

    // Find the payment session
    let paymentSession;
    if (providerId) {
      paymentSession = cart.payment_collection.payment_sessions?.find(
        (session: any) => session.provider_id === providerId
      );
    } else {
      // Use the selected session
      paymentSession = cart.payment_collection.payment_sessions?.find(
        (session: any) => session.selected
      );
    }

    if (!paymentSession) {
      throw new Error('Payment session not found');
    }

    // Authorize the payment session
    await sdk.client.fetch(
      `/store/carts/${cartId}/payment-sessions/${paymentSession.provider_id}/authorize`,
      {
        method: "POST",
        headers,
      }
    );
   
    console.log("Payment authorized successfully")
    return true
  } catch (error) {
    console.error("Error authorizing payment:", error)
    return false
  }
}


/**
 * Gets available payment providers for a region
 */
export async function getAvailablePaymentProviders(regionId: string): Promise<any[]> {
  try {
    const headers = getClientHeaders();
   
    const response = await sdk.client.fetch<{ payment_providers: any[] }>(
      `/store/regions/${regionId}/payment-providers`,
      {
        method: "GET",
        headers,
      }
    );
   
    return response.payment_providers || [];
  } catch (error) {
    console.error("Error getting available payment providers:", error)
    return []
  }
}


/**
 * Refreshes payment sessions for a cart
 */
export async function refreshPaymentSessions(cartId: string): Promise<boolean> {
  if (!cartId) {
    console.error("Cannot refresh payment sessions: Missing cart ID")
    return false
  }


  try {
    console.log("Refreshing payment sessions for cart:", cartId)
   
    const headers = getClientHeaders();
   
    await sdk.client.fetch(
      `/store/carts/${cartId}/payment-collection`,
      {
        method: "POST",
        headers,
      }
    );
   
    console.log("Payment sessions refreshed successfully")
    return true
  } catch (error) {
    console.error("Error refreshing payment sessions:", error)
    return false
  }
}


