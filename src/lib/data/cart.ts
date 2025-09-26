"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"
import medusaError from "../helpers/medusa-error"
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
import { unifiedCache } from "../utils/unified-cache" // ✅ New import

interface ExtendedStoreCart extends HttpTypes.StoreCart {
  completed_at?: string;
  status?: string;
  completed?: boolean;
  payment_status?: string;
  promotions?: any[];
}

// Consolidated field list to avoid duplication
const CART_FIELDS = "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options,items.variant.options.option.title,*items.thumbnail,*items.metadata,+items.total,+items.unit_price,+items.original_total,+items.original_unit_price,*promotions,*promotions.application_method,*shipping_methods,*items.product.seller,*payment_collection,*payment_collection.payment_sessions,email,*shipping_address,*billing_address,subtotal,total,tax_total,item_total,shipping_total,currency_code"

async function getPaymentHeaders() {
  return {
    ...(await getAuthHeaders()),
    'x-publishable-api-key': await getPublishableApiKey()
  }
}

/**
 * Core cart retrieval function - handles completed cart cleanup and errors
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return null
  }

  const headers = await getAuthHeaders()

  try {
    const result = await sdk.client
      .fetch<{ cart: ExtendedStoreCart }>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields: fields || CART_FIELDS,
        },
        headers,
        cache: "no-cache",
      });
      
    const cart = result.cart;
    
    // Check if cart is completed and handle accordingly
    if (cart && cart.completed_at) {
      return null;
    }
    
    // Check other indicators of completion
    if (cart && (cart.status === "complete" || cart.completed === true || cart.payment_status === "captured")) {
      return null;
    }
    
    return cart as HttpTypes.StoreCart;
  } catch (error: any) {
    if (error?.status === 404) {
      await removeCartId()
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('_medusa_cart_id')
        localStorage.removeItem('medusa_cart_id')
      }
      
      return null
    }
    
    // For network/server errors, return null to prevent infinite retries
    if (error?.status >= 500 || error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      return null
    }
    
    throw error
  }
}

/**
 * Gets the cart from the API based on the cart ID in cookies
 */
export async function getCart() {
  return retrieveCart()
}

/**
 * Retrieves cart with fields optimized for the address section
 */
export async function retrieveCartForAddress(cartId?: string) {
  return retrieveCart(cartId)
}

/**
 * Retrieves cart with fields optimized for the shipping section
 */
export async function retrieveCartForShipping(cartId?: string) {
  return retrieveCart(cartId)
}

/**
 * Retrieves cart with fields optimized for the payment section
 */
export async function retrieveCartForPayment(cartId?: string) {
  return retrieveCart(cartId)
}

/**
 * Retrieves cart with fields optimized for the review section
 */
export async function retrieveCartForReview(cartId?: string) {
  return retrieveCart(cartId)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart()
  const headers = await getAuthHeaders()

  if (!cart) {
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      { fields: CART_FIELDS },
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  // Only update region if it's actually different to prevent promotion loss
  if (cart && cart?.region_id && cart.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, { fields: CART_FIELDS }, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    return await retrieveCart(cart.id)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = await getAuthHeaders()

  return await sdk.store.cart
    .update(cartId, data, { fields: CART_FIELDS }, headers)
    .then(async ({ cart }) => {
      const cartCacheTag = await getCacheTag("carts")
      await revalidateTag(cartCacheTag)
      
      // ✅ Updated cache invalidation
      unifiedCache.invalidate(['cart']).catch(() => {})
      
      return cart
    })
    .catch(medusaError)
}

/**
 * Simplified addToCart function without complex promotion preservation logic
 * Lets Medusa handle promotion application naturally through the scan endpoint
 */
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

 const cart = await getOrSetCart(countryCode)
 
 if (!cart) {
   throw new Error("Error retrieving or creating cart")
 }

 const headers = await getAuthHeaders()

 let updatedCart: HttpTypes.StoreCart | null = null

 try {
   const currentItem = cart.items?.find((item) => item.variant_id === variantId)

   if (currentItem) {
    const response = await sdk.store.cart.updateLineItem(
      cart.id,
      currentItem.id,
      { quantity: currentItem.quantity + quantity },
      { fields: CART_FIELDS },
      headers
    )
    updatedCart = response.cart
  } else {
    const response = await sdk.store.cart.createLineItem(
      cart.id,
       {
         variant_id: variantId,
         quantity,
       },
       { fields: CART_FIELDS },
       headers
     )
    updatedCart = response.cart
  }
  
  // ✅ Updated cache invalidation
  unifiedCache.invalidate(['cart', 'inventory']).catch(() => {})
   
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

  const headers = await getAuthHeaders()

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, { fields: CART_FIELDS }, headers)
    .then(async () => {
      // ✅ Updated cache invalidation
      unifiedCache.invalidate(['cart', 'inventory']).catch(() => {})
    })
    .catch(medusaError)

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

  const headers = await getAuthHeaders()

  try {
    await sdk.store.cart.deleteLineItem(cartId, lineId, headers)
    
    // ✅ Updated cache invalidation
    unifiedCache.invalidate(['cart', 'inventory']).catch(() => {})
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    return await retrieveCart(cartId)
  } catch (error) {
    try {
      return await retrieveCart(cartId)
    } catch (retrieveError) {
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
  const headers = await getAuthHeaders()

  return sdk.client.fetch<{ cart: HttpTypes.StoreCart }>(
    `/store/carts/${cartId}/shipping-methods`,
    {
      method: "POST",
      headers,
      body: {
        option_id: shippingMethodId,
        data: data,
      },
    }
  )
    .then(async (response) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      
      // ✅ Updated cache invalidation
      unifiedCache.invalidate(['cart']).catch(() => {})
      
      return response
    })
    .catch(medusaError)
}

/**
 * Updates the data field of an existing shipping method directly
 */
export async function updateShippingMethodData({
  shippingMethodId,
  data,
}: {
  shippingMethodId: string
  data: Record<string, any>
}) {
  const headers = await getAuthHeaders()

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

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    // ✅ Updated cache invalidation
    unifiedCache.invalidate(['cart']).catch(() => {})
    
    return response
  } catch (error) {
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
  
  const isRedirectPayment = data.provider_id.includes('przelewy24') || 
                           data.provider_id.includes('blik') || 
                           data.provider_id.includes('bancontact') ||
                           data.provider_id.includes('ideal') ||
                           data.provider_id.includes('giropay')
  
  const sessionData: any = {
    cart: cart,
  }
  
  if (isRedirectPayment) {
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
  }
  
  try {
    const response = await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: data.provider_id,
      data: sessionData
    }, {}, headers)
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    // ✅ Updated cache invalidation
    unifiedCache.invalidate(['cart']).catch(() => {})
    
    return response
  } catch (error) {
    throw medusaError(error)
  }
}

/**
 * Selects a payment session for a cart
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
    const cart = await retrieveCart(cartId);
    
    if (!cart) {
      throw new Error(`Cart ${cartId} not found`);
    }
    
    const response = await sdk.client.fetch<HttpTypes.StoreCartResponse>(
      `/store/carts/${cartId}/payment-sessions/${providerId}`, 
      {
        method: "POST",
        headers,
        body: {
          data: {
            cart: cart,
            provider_id: providerId,
            metadata: {
              payment_provider_id: providerId,
              cart_id: cartId
            }
          }
        }
      }
    );
    
    // Update cart metadata as a secondary operation
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
      // Continue even if metadata update fails
    }
    
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    
    // ✅ Updated cache invalidation
    unifiedCache.invalidate(['cart']).catch(() => {})
    
    return response.cart;
    
  } catch (error) {
    throw medusaError(error);
  }
}

/**
 * Simplified promotion application
 */
export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = await getAuthHeaders()
  
  try {
    // Apply promotion codes to cart
    const response = await sdk.client.fetch(`/store/carts/${cartId}`, {
      method: "POST",
      headers,
      body: {
        promo_codes: codes
      }
    })
    
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
    
    // ✅ Updated cache invalidation
    unifiedCache.invalidate(['cart', 'promotions']).catch(() => {})
    
    return response
  } catch (error) {
    console.error('🎫 Promotion application failed:', error)
    throw medusaError(error)
  }
}

/**
 * Removes a shipping method from a cart
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

  let shippingMethodData: any = null;
  let extractedSellerId = sellerId;
  
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
          
          if (method.data?.seller_id) {
            extractedSellerId = method.data.seller_id;
          } 
          else if (method.data?.type === 'seller_specific' && method.data?.seller_specific_id) {
            extractedSellerId = method.data.seller_specific_id;
          }
        } 
      }
    } catch (cartError) {
      // Continue without seller ID if cart fetch fails
    }
  }

  try {
    const requestBody = { 
      shipping_method_ids: [shippingMethodId], 
      cart_id: cartId
    };
    
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
      throw new Error(errorData.message || "Failed to remove shipping method");
    }
    
    let responseData = null;
    try {
      responseData = await response.json();
    } catch (err) {
      // No JSON response is okay
    }
    
    const cartCacheTag = await getCacheTag("carts");
    revalidateTag(cartCacheTag);
    
    const fulfillmentTag = await getCacheTag("fulfillment");
    revalidateTag(fulfillmentTag);
    
    // ✅ Updated cache invalidation
    unifiedCache.invalidate(['cart']).catch(() => {})
    
    return {
      success: true,
      cart: responseData?.cart || null,
      seller_id: extractedSellerId || null,
      method_id: shippingMethodId
    };
  } catch (error) {
    throw medusaError(error);
  }
}

/**
 * Deletes a promotion code from a cart
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
      
      // ✅ Updated cache invalidation
      unifiedCache.invalidate(['cart', 'promotions']).catch(() => {})
    })
    .catch(medusaError)
}

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

    data.billing_address = data.shipping_address

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
        throw new Error(`Failed to associate customer data: ${errorData.message || response.statusText}`)
      }

      // If user is authenticated, try to associate cart with customer ID
      if ('authorization' in headers) {
        try {
          const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/me`, {
            method: 'GET',
            headers
          })

          if (customerResponse.ok) {
            const customerData = await customerResponse.json()
            if (customerData.customer?.id) {
              try {
                await sdk.client.fetch('/store/customers/me/carts', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...headers
                  },
                  body: {
                    cart_id: cartId
                  }
                })
                
              } catch (associationError) {
                try {
                  await sdk.client.fetch(`/store/customers/me/carts`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      ...headers
                    },
                    body: {
                      cart_id: cartId
                    }
                  })
         
                } catch (altError) {
                  // Continue even if this fails
                }
              }
            }
          }
        } catch (customerError) {
          // Don't fail the entire process if this step fails
        }
      }

      await updateCart(data)
      await revalidatePath("/cart")
    } catch (fetchError: any) {
      // Fall back to the standard updateCart method
      await updateCart(data)
      await revalidatePath("/cart")
      return `Warning: Customer data may not be fully associated: ${fetchError?.message || 'Unknown error'}`
    }
    return "success"
  } catch (e: any) {
    return e.message
  }
}

/**
 * Places an order for a cart
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
        
        // For Stripe payments, we should NEVER call placeOrder directly
        // All Stripe payments must go through Stripe Checkout for security
        // UNLESS we're returning from Stripe (skipRedirectCheck = true)
        if (isStripeProvider && session.status === 'pending') {
          if (!skipRedirectCheck) {
            throw new Error('Stripe payments must use Stripe Checkout. Direct cart completion is not allowed for security reasons.')
          }
        }
        
        // Handle Stripe redirects (for redirect-based methods like Przelewy24, BLIK)
        if (isStripeProvider && (session.provider_id?.includes('przelewy24') || session.provider_id?.includes('blik'))) {
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
      }
    } 

    const completionUrl = `${baseUrl}/store/carts/${id}/complete`
    
    const options: any = {
      method: 'POST',
      headers
    }
    
    if (skipRedirectCheck) {
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
      throw new Error(`Failed to complete cart: ${completionResponse.statusText}`)
    }
    
    const result = await completionResponse.json()
    
    // Clear cart ID after successful completion
    if (result.type === 'order_set' || result.order_set || result.type === 'order' || result.order) {
      removeCartId()
      
      // ✅ Updated cache invalidation for completed order
      unifiedCache.invalidate(['cart', 'inventory']).catch(() => {})
    }
    
    return result
    
  } catch (error: any) {
    throw error
  }
}

/**
 * Updates the countrycode param and revalidates the regions cache
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
  const headers = await getAuthHeaders()
  const next = await getCacheOptions("shippingOptions")

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
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    const fullUrl = `${backendUrl}/store/stripe/confirm-payment-intent`
    
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
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to confirm PaymentIntent: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    
    return result
  } catch (error) {
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