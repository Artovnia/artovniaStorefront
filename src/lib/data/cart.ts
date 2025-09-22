"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import medusaError from "../helpers/medusa-error"
import { cartDeduplicator, createCacheKey } from "../utils/request-deduplication"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"

import { getRegion } from "./regions"
import { getPublishableApiKey } from "../get-publishable-key"

// Extended cart type that includes properties that exist in the API but not in the TypeScript definitions
interface ExtendedStoreCart extends HttpTypes.StoreCart {
  completed_at?: string;
  status?: string;
  completed?: boolean;
  payment_status?: string;
}

/**
 * Gets the headers needed for payment operations, including the publishable API key
 * @returns Headers object with auth headers and publishable API key
 */
async function getPaymentHeaders() {
  const headers = {
    ...(await getAuthHeaders()),
    'x-publishable-api-key': await getPublishableApiKey()
  }
  return headers
}

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * If the cart is found to be completed, it will automatically remove the cart ID and return null
 * so that a new cart can be created.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found and active, or null if not found or if cart is completed.
 */
export async function retrieveCart(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  // CRITICAL FIX: Disable deduplication temporarily to fix cart UI updates
  const headers = {
    ...(await getAuthHeaders())
  }

  try {
    const result = await sdk.client
      .fetch<{ cart: ExtendedStoreCart }>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields: "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options,items.variant.options.option.title,*items.thumbnail,*items.metadata,+items.total,+items.unit_price,+items.original_total,*promotions,*shipping_methods,*items.product.seller,*payment_collection,*payment_collection.payment_sessions,email,*shipping_address,*billing_address,subtotal,total,tax_total,item_total,shipping_total,currency_code",
        },
        headers,
        cache: "no-cache", // Always fresh for cart data (critical data)
      });
      
    const cart = result.cart;
      
    // Check if cart is completed and handle accordingly using our extended type
    if (cart && cart.completed_at) {
      // Don't try to remove cart ID here, as it causes the cookie error
      // The header component should handle this in a server action
      return null; // Return null so a new cart can be created
    }
    
    // Check other indicators of completion
    if (cart && (cart.status === "complete" || cart.completed === true || cart.payment_status === "captured")) {
      return null;
    }
    
    return cart as HttpTypes.StoreCart; // Cast back to the expected type
  } catch (error: any) {
    if (error?.status === 404) {
      // CRITICAL FIX: Cart not found - clean up corrupted cart ID
      console.warn(`🔍 Cart ${id} not found, cleaning up corrupted cart ID`)
      await removeCartId()
      
      // Also clean localStorage to prevent infinite loops
      if (typeof window !== 'undefined') {
        localStorage.removeItem('_medusa_cart_id')
        localStorage.removeItem('medusa_cart_id')
      }
      
      return null
    }
    
    // CRITICAL FIX: For other errors, don't throw immediately - log and return null
    console.error(`🔍 Cart retrieval error for ${id}:`, error)
    
    // If it's a network error or server error, return null to prevent infinite retries
    if (error?.status >= 500 || error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      return null
    }
    
    throw error
  }
}

/**
 * Gets the cart from the API based on the cart ID in cookies
 * @returns The cart object or null if no cart ID is found
 */
export async function getCart() {
  return retrieveCart()
}

/**
 * Retrieves cart with fields optimized for the address section
 * Only loads basic cart info, items, and region data
 */
export async function retrieveCartForAddress(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders())
  }

  try {
    const fields = "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options,items.variant.options.option.title,*items.thumbnail,*items.metadata,+items.total,+items.unit_price,+items.original_total,*promotions,*shipping_methods,*items.product.seller,*payment_collection,*payment_collection.payment_sessions,email,*shipping_address,*billing_address,subtotal,total,tax_total,item_total,shipping_total,currency_code"
    const result = await sdk.client
      .fetch<{ cart: ExtendedStoreCart }>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields,
        },
        headers,
        cache: "no-cache",
      });
      
    const cart = result.cart;
      
    // Check if cart is completed
    if (cart && (cart.completed_at || cart.status === "complete" || cart.completed === true)) {
      return null;
    }
    
    return cart as HttpTypes.StoreCart;
  } catch (error) {
    console.warn(`Could not retrieve cart for address ${id}:`, error);
    return null;
  }
}

/**
 * Retrieves cart with fields optimized for the shipping section
 * Loads items, shipping methods, and seller information
 */
export async function retrieveCartForShipping(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders())
  }

  try {
    const fields = "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options,items.variant.options.option.title,*items.thumbnail,*items.metadata,+items.total,+items.unit_price,+items.original_total,*promotions,*shipping_methods,*items.product.seller,*payment_collection,*payment_collection.payment_sessions,*shipping_address,*billing_address,email,subtotal,total,tax_total,item_total,shipping_total,currency_code"
    const result = await sdk.client
      .fetch<{ cart: ExtendedStoreCart }>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields,
        },
        headers,
        cache: "no-cache",
      });
      
    const cart = result.cart;
      
    // Check if cart is completed
    if (cart && (cart.completed_at || cart.status === "complete" || cart.completed === true)) {
      return null;
    }
    
    return cart as HttpTypes.StoreCart;
  } catch (error) {
    console.warn(`Could not retrieve cart for shipping ${id}:`, error);
    return null;
  }
}

/**
 * Retrieves cart with fields optimized for the payment section
 * Loads payment collection, payment sessions, and minimal item data
 */
export async function retrieveCartForPayment(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders())
  }

  try {
    const fields = "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options,items.variant.options.option.title,*items.thumbnail,*items.metadata,+items.total,+items.unit_price,+items.original_total,*promotions,*shipping_methods,*items.product.seller,*payment_collection,*payment_collection.payment_sessions,email,subtotal,total,tax_total,item_total,shipping_total,currency_code"
    const result = await sdk.client
      .fetch<{ cart: ExtendedStoreCart }>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields,
        },
        headers,
        cache: "no-cache",
      });
      
    const cart = result.cart;
      
    // Check if cart is completed
    if (cart && (cart.completed_at || cart.status === "complete" || cart.completed === true)) {
      return null;
    }
    
    return cart as HttpTypes.StoreCart;
  } catch (error) {
    console.warn(`Could not retrieve cart for payment ${id}:`, error);
    return null;
  }
}

/**
 * Retrieves cart with fields optimized for the review section
 * Loads all necessary data for order review and completion
 */
export async function retrieveCartForReview(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders())
  }

  try {
    const result = await sdk.client
      .fetch<{ cart: ExtendedStoreCart }>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields:
            "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options," +
            "items.variant.options.option.title,*items.thumbnail,*items.metadata," +
            "+items.total,+items.unit_price,+items.original_total,*promotions,*shipping_methods," +
            "*items.product.seller,*payment_collection,*payment_collection.payment_sessions," +
            "*shipping_address,*billing_address,email,subtotal,total,tax_total,item_total,shipping_total,currency_code",
        },
        headers,
        cache: "no-cache",
      });
      
    const cart = result.cart;
      
    // Check if cart is completed
    if (cart && (cart.completed_at || cart.status === "complete" || cart.completed === true)) {
      return null;
    }
    
    return cart as HttpTypes.StoreCart;
  } catch (error) {
    console.warn(`Could not retrieve cart for review ${id}:`, error);
    return null;
  }
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()

  const headers = {
    ...(await getAuthHeaders()),
  }

  // CRITICAL DEBUG: Log cart state before any operations
  if (process.env.NODE_ENV === 'development') {
    const extendedCart = cart as any
    console.log(`🔍 getOrSetCart - Initial cart promotions:`, extendedCart?.promotions?.length || 0)
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    console.log(`✅ Created new cart ${cart.id} for region ${region.id}`)
  }

  // CRITICAL FIX: Only update region if it's actually different to prevent promotion loss
  if (cart && cart?.region_id && cart.region_id !== region.id) {
    console.log(`🔄 Updating cart region from ${cart.region_id} to ${region.id}`)
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  } else if (cart && cart?.region_id === region.id) {
    console.log(`✅ Cart region already matches ${region.id}, skipping update to preserve promotions`)
  }

  // CRITICAL DEBUG: Log cart state after operations
  if (process.env.NODE_ENV === 'development') {
    const finalCart = await retrieveCart(cart.id)
    const extendedFinalCart = finalCart as any
    console.log(`🔍 getOrSetCart - Final cart promotions:`, extendedFinalCart?.promotions?.length || 0)
  }

  // CRITICAL FIX: Return fresh cart data instead of potentially stale cart object
  return await retrieveCart(cart.id)
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return await sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      await revalidateTag(cartCacheTag)
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  // CRITICAL DEBUG: Log promotion state before getOrSetCart
  if (process.env.NODE_ENV === 'development') {
    const existingCart = await retrieveCart()
    const extendedExisting = existingCart as any
    console.log(`🔍 addToCart - BEFORE getOrSetCart - Existing cart promotions:`, extendedExisting?.promotions?.length || 0)
  }

  const cart = await getOrSetCart(countryCode)
  
  // CRITICAL DEBUG: Log promotion state after getOrSetCart
  if (process.env.NODE_ENV === 'development') {
    const extendedCart = cart as any
    console.log(`🔍 addToCart - AFTER getOrSetCart - Cart promotions:`, extendedCart?.promotions?.length || 0)
  }

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // CRITICAL DEBUG: Log cart state before line item operations
    if (process.env.NODE_ENV === 'development') {
      const extendedCart = cart as any
      console.log(`🔍 addToCart - Cart promotions BEFORE line item operation:`, extendedCart?.promotions?.length || 0)
      console.log(`🔍 addToCart - Current items count:`, cart.items?.length || 0)
    }

    const currentItem = cart.items?.find((item) => item.variant_id === variantId)

    // CRITICAL FIX: Store existing promotions before line item operation
    const existingPromotions = (cart as any).promotions || []
    console.log(`🔍 Storing ${existingPromotions.length} existing promotions before line item operation`)

    if (currentItem) {
      console.log(`🔄 Updating existing line item ${currentItem.id} quantity from ${currentItem.quantity} to ${currentItem.quantity + quantity}`)
      await sdk.store.cart.updateLineItem(
        cart.id,
        currentItem.id,
        { quantity: currentItem.quantity + quantity },
        {},
        headers
      )
    } else {
      console.log(`➕ Creating new line item for variant ${variantId} with quantity ${quantity}`)
      await sdk.store.cart.createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        headers
      )
    }

    // CRITICAL FIX: If promotions were lost, try to reapply them
    const cartAfterLineItem = await retrieveCart(cart.id)
    const promotionsAfter = (cartAfterLineItem as any).promotions || []
    
    if (existingPromotions.length > 0 && promotionsAfter.length === 0) {
      console.log(`🚨 Promotions lost during line item operation! Attempting to reapply...`)
      
      // Try to reapply the promotion codes that were active
      const promoCodes = existingPromotions.map((p: any) => p.code).filter(Boolean)
      if (promoCodes.length > 0) {
        try {
          console.log(`🔄 Reapplying promotion codes:`, promoCodes)
          await sdk.store.cart.update(cart.id, { promo_codes: promoCodes }, {}, headers)
          console.log(`✅ Successfully reapplied promotions`)
          
          // CRITICAL DEBUG: Check if promotions were actually applied
          const cartAfterReapply = await retrieveCart(cart.id)
          const promotionsAfterReapply = (cartAfterReapply as any).promotions || []
          console.log(`🔍 Promotions after reapplication attempt:`, promotionsAfterReapply.length)
          
          if (promotionsAfterReapply.length === 0) {
            console.log(`🚨 PROMOTION REJECTED BY MEDUSA! The promotion code '${promoCodes[0]}' is not compatible with multiple items in cart.`)
            console.log(`🔍 Current cart state:`)
            console.log(`   - Items count: ${cartAfterReapply?.items?.length || 0}`)
            console.log(`   - Cart total: ${cartAfterReapply?.total || 0}`)
            console.log(`   - Item total: ${cartAfterReapply?.item_total || 0}`)
            console.log(`🔧 SOLUTION: Check Medusa promotion rules for '${promoCodes[0]}' in the admin panel.`)
          }
        } catch (error) {
          console.error(`❌ Failed to reapply promotions:`, error)
        }
      } else {
        // Handle automatic promotions (no codes)
        console.log(`🔍 Lost promotions were automatic (no codes). This indicates promotion rules are not compatible with multiple items.`)
        console.log(`🔍 Lost promotion details:`, existingPromotions.map((p: any) => ({ 
          id: p.id, 
          code: p.code, 
          is_automatic: p.is_automatic,
          type: p.type 
        })))
      }
    }

    // CRITICAL DEBUG: Log cart state immediately after line item operation
    if (process.env.NODE_ENV === 'development') {
      const cartAfterLineItem = await retrieveCart(cart.id)
      const extendedCartAfter = cartAfterLineItem as any
      console.log(`🔍 addToCart - Cart promotions AFTER line item operation:`, extendedCartAfter?.promotions?.length || 0)
    }

    // CRITICAL FIX: Auto-detect and apply promotions for newly added items
    console.log(`🤖 [AUTO-APPLY] Checking for automatic promotions after adding item`)
    
    try {
      // Trigger automatic promotion detection for the cart
      await sdk.client.fetch(`/store/carts/${cart.id}/scan-promotions`, {
        method: "POST",
        headers,
        cache: "no-cache"
      })
      console.log(`✅ [AUTO-APPLY] Automatic promotion scan completed`)
    } catch (autoError) {
      console.warn(`⚠️ [AUTO-APPLY] Automatic promotion scan failed:`, autoError)
    }
    
    // Return fresh cart data
    const updatedCart = await retrieveCart(cart.id)
    
    // CRITICAL DEBUG: Log promotion status after adding item
    if (process.env.NODE_ENV === 'development') {
      const extendedCart = updatedCart as any
      console.log(`🔍 Cart after adding item - Promotions:`, extendedCart?.promotions?.length || 0)
      if (extendedCart?.promotions && extendedCart.promotions.length > 0) {
        console.log(`📋 Active promotions:`, extendedCart.promotions.map((p: any) => ({ id: p.id, code: p.code })))
      }
    }
    
    return updatedCart
  } catch (error) {
    throw medusaError(error)
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      // Only invalidate persistent cache - avoid revalidateTag that triggers page refresh
      const { invalidateCheckoutCache } = await import('../utils/storefront-cache')
      invalidateCheckoutCache(cartId)
    })
    .catch(medusaError)

  // Return updated cart
  return await retrieveCart()
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // Delete the line item
    await sdk.store.cart.deleteLineItem(cartId, lineId, headers)
    
    // CRITICAL FIX: Comprehensive cache cleanup for cart deletion
    const { invalidateCheckoutCache } = await import('../utils/storefront-cache')
    invalidateCheckoutCache(cartId)
    
    // Also invalidate Next.js cache
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    console.log(`✅ Successfully deleted line item ${lineId} from cart ${cartId}`)
    
    // Return fresh cart data
    return await retrieveCart(cartId)
  } catch (error) {
    console.error(`❌ Failed to delete line item ${lineId}:`, error)
    
    // CRITICAL FIX: On error, still try to return current cart state
    try {
      return await retrieveCart(cartId)
    } catch (retrieveError) {
      console.error('❌ Failed to retrieve cart after delete error:', retrieveError)
      throw medusaError(error)
    }
  }
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
  data,
}: {
  cartId: string
  shippingMethodId: string
  data?: Record<string, any>
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
    `/store/carts/${cartId}/shipping-methods`,
    {
      method: "POST",
      headers,
      body: {
        option_id: shippingMethodId,
        data: data, // Pass additional data for parcel machine details
      },
    }
  )
    .then(async (response) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      
      // Invalidate persistent cache to ensure fresh data on next request
      const { invalidateCheckoutCache } = await import('../utils/storefront-cache')
      invalidateCheckoutCache(cartId)
      
      // Return the response data so callers can access the updated cart
      return response
    })
    .catch(medusaError)
}

/**
 * Updates the data field of an existing shipping method directly
 * This avoids the validation that checks for duplicate shipping methods
 * @param shippingMethodId The ID of the shipping method to update
 * @param data The data to set on the shipping method
 */
export async function updateShippingMethodData({
  shippingMethodId,
  data,
}: {
  shippingMethodId: string
  data: Record<string, any>
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const response = await sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
      `/store/shipping-methods/${shippingMethodId}/data`,
      {
        method: "POST",
        headers,
        body: {
          data,
        },
      }
    )

    // Only revalidate if the request was successful
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    return response
  } catch (error) {
    console.error('Error updating shipping method data:', error)
    throw medusaError(error)
  }
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: {
    provider_id: string
    context?: Record<string, unknown>
  }
) {
  const headers = {
    ...(await getAuthHeaders()),
    'x-publishable-api-key': await getPublishableApiKey()
  }
  
  // Check if this is a redirect-based payment method
  const isRedirectPayment = data.provider_id.includes('przelewy24') || 
                           data.provider_id.includes('blik') || 
                           data.provider_id.includes('bancontact') ||
                           data.provider_id.includes('ideal') ||
                           data.provider_id.includes('giropay')
  
  // Prepare payment session data
  const sessionData: any = {
    cart: cart, // This passes the cart to input.data.cart in the provider
  }
  
  // Add payment method types for redirect-based payments
  if (isRedirectPayment) {
    // Map provider IDs to Stripe payment method types
    let paymentMethodTypes: string[] = []
    
    if (data.provider_id.includes('przelewy24')) {
      paymentMethodTypes = ['p24']
    } else if (data.provider_id.includes('blik')) {
      paymentMethodTypes = ['blik']
    } else if (data.provider_id.includes('bancontact')) {
      paymentMethodTypes = ['bancontact']
    } else if (data.provider_id.includes('ideal')) {
      paymentMethodTypes = ['ideal']
    } else if (data.provider_id.includes('giropay')) {
      paymentMethodTypes = ['giropay']
    }
    
    if (paymentMethodTypes.length > 0) {
      sessionData.payment_method_types = paymentMethodTypes
    }
    
    console.log('🔍 Adding payment method types for redirect payment:', {
      provider_id: data.provider_id,
      payment_method_types: paymentMethodTypes
    })
  }
  
  try {
    const response = await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: data.provider_id,
      data: sessionData
    }, {}, headers)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return response
  } catch (error) {
    throw medusaError(error)
  }
}



/**
 * Selects a payment session for a cart
 * @param cartId - The ID of the cart
 * @param providerId - The ID of the payment provider to select
 * @returns The updated cart with the selected payment session
 */
export async function selectPaymentSession(
  cartId: string,
  providerId: string
) {
  
  const headers = {
    ...(await getAuthHeaders()),
    'x-publishable-api-key': await getPublishableApiKey()
  }
  
  try {
    // Get the current cart first to pass it with the request
    const cart = await retrieveCart(cartId);
    
    if (!cart) {
      throw new Error(`Cart ${cartId} not found`);
    }
    
    // Make the payment session request with cart data
    const response = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
      `/store/carts/${cartId}/payment-sessions/${providerId}`, 
      {
        method: "POST",
        headers,
        body: {
          data: {
            cart: cart, // Pass the complete cart data
            provider_id: providerId,
            // Add metadata that might be useful for the provider
            metadata: {
              payment_provider_id: providerId,
              cart_id: cartId
            }
          }
        }
      }
    );
    
    // Update cart metadata as a secondary operation (for redundancy)
    try {
      await sdk.client.fetch<HttpTypes.StoreCartResponse>(
        `/store/carts/${cartId}`, 
        {
          method: "POST",
          headers,
          body: {
            metadata: {
              payment_provider_id: providerId
            }
          }
        }
      );
    } catch (metadataError) {
      console.error('Failed to update cart metadata, but payment session was selected:', metadataError);
      // Continue even if metadata update fails - this is just for redundancy
    }
    
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    
    return response.cart;
    
  } catch (error) {
    throw medusaError(error);
  }
}


export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  // CRITICAL FIX: Also trigger automatic promotion detection
  console.log(`🎯 [APPLY-PROMOTIONS] Applying codes: ${codes.join(', ')} to cart ${cartId}`)
  
  try {
    // Step 1: Apply the manual promotion codes
    const result = await sdk.store.cart.update(cartId, { promo_codes: codes }, {}, headers)
    
    // Step 2: Trigger automatic promotion detection
    console.log(`🤖 [AUTO-PROMOTIONS] Triggering automatic promotion scan for cart ${cartId}`)
    
    try {
      await sdk.client.fetch(`/store/carts/${cartId}/scan-promotions`, {
        method: "POST",
        headers,
        cache: "no-cache"
      })
      console.log(`✅ [AUTO-PROMOTIONS] Automatic promotion scan completed`)
    } catch (autoError) {
      console.warn(`⚠️ [AUTO-PROMOTIONS] Automatic promotion scan failed:`, autoError)
      // Don't fail the whole operation if auto-promotion fails
    }
    
    // Step 3: Revalidate cache
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    return result
  } catch (error) {
    console.error(`❌ [APPLY-PROMOTIONS] Failed to apply promotions:`, error)
    throw medusaError(error)
  }
}

/**
 * Removes a shipping method from a cart
 * @param shippingMethodId - The ID of the shipping method to remove
 * @param sellerId - Optional seller ID if known in advance
 */
export async function removeShippingMethod(shippingMethodId: string, sellerId?: string) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  // First, let's get the cart to extract shipping method details if needed
  let shippingMethodData: any = null;
  let extractedSellerId = sellerId;
  
  // Only fetch cart data if we don't already have a seller ID
  if (!extractedSellerId) {
    try {
      const cartResponse = await fetch(
        `${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}`,
        {
          method: "GET",
          headers,
          cache: "no-cache",
        }
      );
      
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        const method = cartData.cart?.shipping_methods?.find((m: any) => m.id === shippingMethodId);
        
        if (method) {
          shippingMethodData = method;
          
          // Try to extract seller ID from method data
          if (method.data?.seller_id) {
            extractedSellerId = method.data.seller_id;
          } 
          // Fallback extraction methods if needed
          else if (method.data?.type === 'seller_specific' && method.data?.seller_specific_id) {
            extractedSellerId = method.data.seller_specific_id;
          }
        } 
      }
    } catch (cartError) {
      console.error('Error fetching cart for shipping method details:', cartError);
    }
  }

  try {
    
    
    // Build request body with all available context
    const requestBody = { 
      shipping_method_ids: [shippingMethodId], 
      cart_id: cartId
    };
    
    // Include seller ID if we have it
    if (extractedSellerId) {
      // @ts-ignore - the API might use this for context
      requestBody.seller_id = extractedSellerId;
    }
    
    
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/shipping-methods`,
      {
        method: "DELETE",
        body: JSON.stringify(requestBody),
        headers,
        cache: "no-cache",
      }
    )
    
    
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error removing shipping method:", errorData);
      throw new Error(errorData.message || "Failed to remove shipping method");
    }
    
    // Try to get the response data
    let responseData = null;
    try {
      responseData = await response.json();
    } catch (err) {
      // If no JSON response, it's likely just a 200 OK with no body
      // We can continue without error
    }
    
    // Revalidate cart data
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    
    // Also revalidate fulfillment data to refresh shipping options
    const fulfillmentTag = await getCacheTag("fulfillment");
    revalidateTag(fulfillmentTag);
    
    // Invalidate persistent cache to ensure fresh data on next request
    const { getCachedCheckoutData, invalidateCheckoutCache } = await import('@/lib/utils/storefront-cache')
    invalidateCheckoutCache(cartId)
    
    return {
      success: true,
      cart: responseData?.cart || null,
      seller_id: extractedSellerId || null,
      method_id: shippingMethodId
    };
  } catch (error) {
    console.error("Failed to remove shipping method:", error);
    throw medusaError(error);
  }
}

/**
 * Deletes a promotion code from a cart
 * @param promoId - The ID of the promotion code to delete
 */
export async function deletePromotionCode(promoId: string) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }
  const headers = {
    ...(await getAuthHeaders()),
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  return fetch(
    `${process.env.MEDUSA_BACKEND_URL}/store/carts/${cartId}/promotions`,
    {
      method: "DELETE",
      body: JSON.stringify({ promo_codes: [promoId] }),
      headers,
    }
  )
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }


    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: formData.get("shipping_address.address_2") || "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    // Set billing address same as shipping
    data.billing_address = data.shipping_address

    // Important: Associate customer information with the cart
    // This is critical for payment providers to have access to customer data
    const headers = await getAuthHeaders()
    const customerInfo = {
      email: formData.get("email"),
      billing_address: {
        first_name: data.shipping_address.first_name,
        last_name: data.shipping_address.last_name,
        address_1: data.shipping_address.address_1,
        address_2: data.shipping_address.address_2 || "",
        company: data.shipping_address.company,
        postal_code: data.shipping_address.postal_code,
        city: data.shipping_address.city,
        country_code: data.shipping_address.country_code,
        province: data.shipping_address.province,
        phone: data.shipping_address.phone,
      },
      shipping_address: data.shipping_address
    }

    // Update cart with customer data using direct fetch (ensures all customer data is properly associated)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(customerInfo)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error associating customer data with cart:", errorData)
        throw new Error(`Failed to associate customer data: ${errorData.message || response.statusText}`)
      }

      // If user is authenticated, try to associate cart with customer ID
      // Check for authentication token in headers
      if ('authorization' in headers) {
        try {
          // Get customer information from the account endpoint
          const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me`, {
            method: 'GET',
            headers
          })

          if (customerResponse.ok) {
            const customerData = await customerResponse.json()
            if (customerData.customer?.id) {
              try {
                // The correct endpoint to associate a cart with a customer
                // is the dedicated customer cart association endpoint
                await sdk.client.fetch('/store/customers/me/carts', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...headers
                  },
                  // Don't use JSON.stringify here since sdk.client.fetch handles this automatically
                  body: {
                    cart_id: cartId
                  }
                })
                
              } catch (associationError) {
                // Alternative method if the SDK call fails
                try {
                  await sdk.client.fetch(`/store/customers/me/carts`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...headers
                    },
                    // Don't use JSON.stringify here since sdk.client.fetch handles this automatically
                    body: {
                      cart_id: cartId
                    }
                  })
         
                } catch (altError) {
                  console.warn("Failed to associate cart with customer using alternate method:", altError)
                  // Continue even if this fails
                }
              }
            }
          }
        } catch (customerError) {
          console.warn("Could not associate cart with customer ID:", customerError)
          // Don't fail the entire process if this step fails
        }
      }

      // Standard Medusa cart update for backward compatibility
      await updateCart(data)
      await revalidatePath("/cart")
    } catch (fetchError: any) {
      console.error("Error in cart update with fetch:", fetchError)
      // Fall back to the standard updateCart method
      await updateCart(data)
      await revalidatePath("/cart")
      return `Warning: Customer data may not be fully associated: ${fetchError?.message || 'Unknown error'}`
    }
    return "success"
  } catch (e: any) {
    console.error("Error in setAddresses:", e)
    return e.message
  }
}

/**
 * Places an order for a cart.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @param skipRedirectCheck - optional - If true, will skip checking for redirect URLs and proceed with cart completion (used for payment return flows).
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string, skipRedirectCheck: boolean = false) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
    'x-publishable-api-key': await getPublishableApiKey()
  }

  // Force absolute URL to ensure correct backend targeting
  // This ensures we're not making relative requests that might resolve to the current page
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  
  try {
    // First, get the current cart to check payment session status
    const cartUrl = `${baseUrl}/store/carts/${id}?fields=*payment_collection.payment_sessions`
    const cartResponse = await fetch(cartUrl, {
      headers
    })
    
    if (!cartResponse.ok) {
      throw new Error(`Failed to get cart: ${cartResponse.statusText}`)
    }
    
    const { cart } = await cartResponse.json()
    const paymentSessions = cart?.payment_collection?.payment_sessions || []
    
    // Check if any payment session requires redirect (skip this check if skipRedirectCheck is true)
    if (!skipRedirectCheck) {
      for (const session of paymentSessions) {
        const isPayUProvider = session.provider_id?.includes('payu')
        const isStripeProvider = session.provider_id?.includes('stripe')
        const sessionData = session.data || {}
        const redirectUrl = sessionData.redirect_url || sessionData.redirectUrl || sessionData.redirectUri || sessionData.url
        
        // CRITICAL: For Stripe payments, we should NEVER call placeOrder directly
        // All Stripe payments must go through Stripe Checkout for security
        // UNLESS we're returning from Stripe (skipRedirectCheck = true)
        if (isStripeProvider && session.status === 'pending') {
          console.log('🚨 CRITICAL: Stripe payment detected - placeOrder should not be called directly!')
          console.log('🚨 All Stripe payments must use Stripe Checkout for security!')
          console.log('🚨 Provider:', session.provider_id, 'Status:', session.status)
          console.log('🚨 skipRedirectCheck:', skipRedirectCheck)
          
          if (!skipRedirectCheck) {
            throw new Error('Stripe payments must use Stripe Checkout. Direct cart completion is not allowed for security reasons.')
          } else {
            console.log('🔍 Allowing cart completion - returning from Stripe Checkout')
          }
        }
        
        // Handle Stripe redirects (for redirect-based methods like Przelewy24, BLIK)
        if (isStripeProvider && (session.provider_id?.includes('przelewy24') || session.provider_id?.includes('blik'))) {
          console.log('🔍 Stripe redirect payment detected, need to confirm PaymentIntent:', session.provider_id)
          
          // For redirect payments, we need to confirm the PaymentIntent to get the redirect URL
          const paymentIntentId = sessionData.id
          if (paymentIntentId) {
            return {
              type: 'redirect_confirm',
              paymentIntentId: paymentIntentId,
              cartId: cart.id,
              session: session,
              cart: cart
            }
          }
        }
        
        // Handle other Stripe redirects (for Stripe Checkout or Connect)
        if (isStripeProvider && redirectUrl && session.status === 'pending') {
          return {
            type: 'redirect',
            redirectUrl: redirectUrl,
            cart: cart
          }
        }
        
        // Handle PayU redirects
        if (isPayUProvider && redirectUrl && session.status === 'pending') {
          return {
            type: 'redirect',
            redirectUrl: redirectUrl,
            cart: cart
          }
        }
        
        // Handle Stripe redirects (for Stripe Checkout or Connect)
        if (isStripeProvider && redirectUrl && session.status === 'pending') {
          console.log('🔍 Stripe redirect detected:', redirectUrl)
          return {
            type: 'redirect',
            redirectUrl: redirectUrl,
            cart: cart
          }
        }
      }
    } 
    
    

    // Use the baseUrl defined at the top of the function
    const completionUrl = `${baseUrl}/store/carts/${id}/complete`
    
    
    // If skipRedirectCheck is true, we're coming back from a payment redirect
    // Add additional data to help the backend know payment is complete
    const options: any = {
      method: 'POST',
      headers
    }
    
    if (skipRedirectCheck) {
      // When returning from PayU, add special parameters to help the payment process complete
      options.body = JSON.stringify({
        payment_data: {
          payment_status: "completed",
          status: "authorized",
          fully_authorized: true,
          requires_more: false
        }
      })
      options.headers['Content-Type'] = 'application/json'
    }
    
    const completionResponse = await fetch(completionUrl, options)
    
    if (!completionResponse.ok) {
      const errorText = await completionResponse.text()
      console.error(`[ERROR] Cart completion failed:`, errorText)
      throw new Error(`Failed to complete cart: ${completionResponse.statusText}`)
    }
    
    const result = await completionResponse.json()
    
    // Clear cart ID after successful completion
    if (result.type === 'order_set' || result.order_set || result.type === 'order' || result.order) {
      removeCartId()
    }
    
    return result
    
  } catch (error: any) {
    throw error
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}

/**
 * Confirm Stripe PaymentIntent for redirect payments and get redirect URL
 */
export async function confirmStripeRedirectPayment(paymentIntentId: string, cartId: string, customerEmail?: string) {
  const headers = {
    ...(await getAuthHeaders()),
    'x-publishable-api-key': await getPublishableApiKey()
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  const returnUrl = `${baseUrl}/stripe/return?cart_id=${cartId}`
  
  console.log('🔍 Confirming Stripe PaymentIntent for redirect:', {
    paymentIntentId,
    cartId,
    returnUrl
  })
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const fullUrl = `${backendUrl}/store/stripe/confirm-payment-intent`
    
    console.log('🔍 Making confirmation request to:', fullUrl)
    console.log('🔍 Request payload:', {
      payment_intent_id: paymentIntentId,
      return_url: returnUrl
    })
    
    // We need to call a backend endpoint to confirm the PaymentIntent
    // Since we can't call Stripe directly from the frontend for security reasons
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        return_url: returnUrl,
        customer_email: customerEmail
      })
    })
    
    console.log('🔍 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend error response:', errorText)
      throw new Error(`Failed to confirm PaymentIntent: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('🔍 PaymentIntent confirmation result:', result)
    
    return result
  } catch (error) {
    console.error('❌ Error confirming PaymentIntent:', error)
    throw error
  }
}

/**
 * Manually trigger payment capture for a specific payment session
 */
export async function capturePayment(paymentId: string) {
  const headers = await getPaymentHeaders();
  
  try {
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payu/capture`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_id: paymentId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Capture failed: ${errorData.message}`);
    }
    
    const result = await response.json();
    
    return result;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Enhanced place order with capture retry logic
 */
export async function placeOrderWithCapture(cartId?: string, skipRedirectCheck: boolean = false) {
  try {
    const result = await placeOrder(cartId, skipRedirectCheck);
    
    // If order was placed successfully but payment needs capture, try to capture
    if (result.type === 'order_set' || result.order_set) {
      const cart = await retrieveCart(cartId);
      const paymentSessions = cart?.payment_collection?.payment_sessions || [];
      
      for (const session of paymentSessions) {
        if (session.provider_id?.includes('payu') && session.status === 'authorized') {
          try {
            await capturePayment(session.id);
          } catch (captureError) {
            // Don't fail the order placement
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}