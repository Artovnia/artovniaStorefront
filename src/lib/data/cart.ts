"use server"

import { sdk } from "../config"
import medusaError from "@/lib/helpers/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidatePath, revalidateTag } from "next/cache"

// Extended cart type that includes properties that exist in the API but not in the TypeScript definitions
interface ExtendedStoreCart extends HttpTypes.StoreCart {
  completed_at?: string;
  status?: string;
  completed?: boolean;
  payment_status?: string;
}
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

  const headers = {
    ...(await getAuthHeaders())
  }

  try {
    const result = await sdk.client
      .fetch<{ cart: ExtendedStoreCart }>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields:
            "*items,*region, *items.product, *items.variant, *items.variant.options, items.variant.options.option.title," +
            "*items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *items.product.seller," +
            "*payment_collection,*payment_collection.payment_sessions",
        },
        headers,
        cache: "no-store", // Don't cache cart data for immediate updates
      });
      
    const cart = result.cart;
      
    // Check if cart is completed and handle accordingly using our extended type
    if (cart && cart.completed_at) {
    
      // Don't try to remove cart ID here, as it causes the cookie error
      // The header component should handle this in a server action
      return null; // Return null so a new cart can be created
    }
    
    // Also check other indicators of completion
    if (cart && (cart.status === "complete" || cart.completed === true || cart.payment_status === "captured")) {
      
      return null;
    }
    
    return cart as HttpTypes.StoreCart; // Cast back to the expected type
  } catch (error) {
    console.warn(`Could not retrieve cart ${id}:`, error);
    return null;
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
    const fields = "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options,items.variant.options.option.title,*items.thumbnail,*items.metadata,+items.total,+items.unit_price,+items.original_total,*promotions,*shipping_methods,*items.product.seller,*payment_collection,*payment_collection.payment_sessions,*gift_cards,email,subtotal,total,tax_total,item_total,shipping_total,currency_code"
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
            "*items.product.seller,*payment_collection,*payment_collection.payment_sessions,*gift_cards," +
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
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
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

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const currentItem = cart.items?.find((item) => item.variant_id === variantId)

  if (currentItem) {
    await sdk.store.cart
      .updateLineItem(
        cart.id,
        currentItem.id,
        { quantity: currentItem.quantity + quantity },
        {},
        headers
      )
      .then(async () => {
        // Only invalidate persistent cache - avoid revalidateTag that triggers page refresh
        const { invalidateCheckoutCache } = await import('../utils/storefront-cache')
        invalidateCheckoutCache(cart.id)
      })
      .catch(medusaError)
  } else {
    await sdk.store.cart
      .createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        headers
      )
      .then(async () => {
        // Only invalidate persistent cache - avoid revalidateTag that triggers page refresh
        const { invalidateCheckoutCache } = await import('../utils/storefront-cache')
        invalidateCheckoutCache(cart.id)
      })
      .catch(medusaError)
  }

  // Return updated cart
  return await retrieveCart()
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

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, headers)
    .then(async () => {
      // Only invalidate persistent cache - avoid revalidateTag that triggers page refresh
      const { invalidateCheckoutCache } = await import('../utils/storefront-cache')
      invalidateCheckoutCache(cartId)
    })
    .catch(medusaError)

  // Return updated cart
  return await retrieveCart()
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
  
  try {
    const response = await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: data.provider_id,
      data: {
        cart: cart, // This passes the cart to input.data.cart in the provider
      }
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

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
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
        const sessionData = session.data || {}
        const redirectUrl = sessionData.redirect_url || sessionData.redirectUrl || sessionData.redirectUri
        
        if (isPayUProvider && redirectUrl && session.status === 'pending') {
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