"use server"

import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

// We extend the shipping method type with seller_id which is added by our custom backend
type ExtendedShippingMethod = HttpTypes.StoreCartShippingMethod & { 
  seller_id?: string 
  // Add other custom fields that may be used in our marketplace
  seller_name?: string
  price_type?: string
}

// Type for cart items with all possible seller ID locations
type CartItem = {
  product?: {
    seller?: {
      id: string
      name: string
    }
    vendor_id?: string
  }
  seller?: {
    id: string
    name: string
  }
  vendor_id?: string
  id: string
  name: string
}

// Simplified shipping option type that works with the UI
type SimpleShippingOption = {
  id: string
  name: string
  price_type: string
  amount: number
  data: Record<string, any>
  seller_id?: string
  type: string
  provider: string
}

/**
 * Fetches shipping methods available for a cart
 * This function implements multiple fallback strategies to ensure shipping options are retrieved
 */
export const listCartShippingMethods = async (
  cartId: string,
  headers: { [key: string]: string } = {},
  next?: any
): Promise<ExtendedShippingMethod[]> => {
  if (!cartId) {
    return [];
  }
  
  const authHeaders = {
    ...(await getAuthHeaders()),
    ...headers
  }

  const cacheOptions = {
    ...(await getCacheOptions("fulfillment")),
    ...next
  }

  // Using the ExtendedShippingMethod type defined at the top of the file
  let allShippingOptions: ExtendedShippingMethod[] = []
  const errors: { endpoint: string; error: any }[] = []
  
  // Variables to store cart data
  let sellerIds: string[] = []
  let regionId: string | undefined
  let cart: any = null
  
  try {
    // Fetch the cart to extract seller IDs and region ID
    const cartResponse = await sdk.client.fetch<{ cart: any }>(
      `/store/carts/${cartId}`,
      {
        method: "GET",
        headers: authHeaders,
        cache: "force-cache",
        next: { revalidate: 30 }, // Cache for 30 seconds
        query: {
          fields: "*items, *region, *items.product, *items.variant, *items.variant.options, items.variant.options.option.title, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *items.product.seller"
        }
      }
    )
    
    cart = cartResponse.cart
    
    regionId = cart?.region_id
    
    // Extract seller IDs from cart items
    if (cart?.items && cart.items.length > 0) {
      const sellerSet = new Set<string>()
      
      let foundAnySeller = false
      
      for (const item of cart.items) {
        // Check all possible seller ID locations
        if (item?.product?.seller?.id) {
          sellerSet.add(item.product.seller.id)
          foundAnySeller = true
        } else if (item?.seller?.id) {
          sellerSet.add(item.seller.id)
          foundAnySeller = true
        } else if (item?.product?.vendor_id) {
          sellerSet.add(item.product.vendor_id)
          foundAnySeller = true
        } else if (item?.vendor_id) {
          sellerSet.add(item.vendor_id)
          foundAnySeller = true
        }
      }
      
      // Only add seller IDs if we actually found items in the cart
      sellerIds = Array.from(sellerSet)
    } else {
      // If the cart is empty, don't return any shipping options
      return [];
    }
  } catch (error) {
    // Continue with empty sellerIds and regionId
    errors.push({ endpoint: "cart-fetch", error });
  }

  // Use the seller-specific shipping options endpoint to only get seller options
  try {
    // Only send the cart_id parameter to avoid validation errors
    const query = { cart_id: cartId }

    let response;
    try {
      // Skip the seller-specific endpoint that returns 404 and go directly to the working endpoint
      response = await sdk.client.fetch<{ shipping_options: HttpTypes.StoreCartShippingMethod[] | null }>(
        `/store/shipping-options`,
        {
          method: "GET",
          query,
          headers: authHeaders,
          cache: "force-cache",
          next: { revalidate: 60 }, // Cache for 1 minute
        }
      );
    } catch (error) {
      // If request fails, return empty response
      response = { shipping_options: [] };
      errors.push({ endpoint: "shipping-options-fetch", error });
    }
      
    // Don't filter out shipping options - we need all available options
    // The processing logic below will handle seller assignment appropriately
      
    if (response && response.shipping_options && Array.isArray(response.shipping_options) && response.shipping_options.length > 0) {
      // Process shipping options
      const processedOptions = response.shipping_options.map(option => {
        // Check if this option already has proper metadata
        // Cast to ExtendedShippingMethod to access seller_id property
        if ((option as unknown as ExtendedShippingMethod).seller_id) {
          // This option already has seller information, keep it as is
          return option;
        }
        
        // Check if this option has admin-specific properties or lacks seller-specific ones
        // We need to use a type-safe approach to check for admin options
        const isAdminOption = (
          // Check if it has an admin provider_id
          (option as any).provider_id === 'admin' || 
          // Check data field for admin markers
          (option.data && typeof option.data === 'object' && 
            ((option.data as Record<string, any>).is_admin === true || 
             (option.data as Record<string, any>).admin_only === true))
        );
                             
        if (isAdminOption) {
          // This is an admin option - ensure it has NO seller_id
          return option; // Keep it as is without a seller_id
        }
        
        // For options without seller information, check if they match a seller in the cart
        // This is for backward compatibility with systems that don't properly tag seller options
        if (cart?.items && cart.items.length > 0) {
          // Get all seller IDs from cart items
          const cartSellerIds = new Set<string>();
          const cartSellerMap = new Map<string, { id: string, name: string }>();
          
          // Build a map of seller IDs to seller info
          cart.items.forEach((item: CartItem) => {
            if (item?.product?.seller?.id) {
              cartSellerIds.add(item.product.seller.id);
              cartSellerMap.set(item.product.seller.id, {
                id: item.product.seller.id,
                name: item.product.seller.name || 'Seller'
              });
            } else if (item?.seller?.id) {
              cartSellerIds.add(item.seller.id);
              cartSellerMap.set(item.seller.id, {
                id: item.seller.id,
                name: item.seller.name || 'Seller'
              });
            }
          });
          
          // If we have exactly one seller in the cart, and this option doesn't have seller info,
          // we can reasonably assume it belongs to that seller
          if (cartSellerIds.size === 1) {
            const sellerId = Array.from(cartSellerIds)[0];
            const sellerInfo = cartSellerMap.get(sellerId);
            
            if (sellerInfo) {
              return {
                ...option,
                seller_id: sellerInfo.id,
                seller_name: sellerInfo.name
              };
            }
          }
        }
        
        return option
      });
      
      allShippingOptions = processedOptions;
    }
  } catch (error) {
    errors.push({ endpoint: "general-shipping-options", error });
  }
  
  // If we didn't find any shipping options, return an empty array
  if (allShippingOptions.length === 0) {
    return [];
  }

  // Process the shipping options to ensure they have all required fields
  // Remove duplicates by ID
  const uniqueOptions = allShippingOptions.filter((option: any, index: number, self: any[]) =>
    index === self.findIndex((t: any) => t.id === option.id)
  );
  
  // Add seller names for display purposes but don't automatically assign seller IDs
  const finalOptions = uniqueOptions.map((option: any) => {
    // DO NOT automatically assign seller IDs to options that don't have them
    // This was causing admin shipping options to be incorrectly assigned to sellers
    // Admin shipping options should remain without a seller_id
    
    // Try to find seller name from cart items if not already set
    if (!option.seller_name && option.seller_id && cart?.items) {
      const sellerItem = cart.items.find((item: any) => 
        (item?.product?.seller?.id === option.seller_id) || 
        (item?.seller?.id === option.seller_id)
      );
      
      if (sellerItem?.product?.seller?.name) {
        option = { ...option, seller_name: sellerItem.product.seller.name };
      } else if (sellerItem?.seller?.name) {
        option = { ...option, seller_name: sellerItem.seller.name };
      } else {
        // Default seller name if not found
        option = { ...option, seller_name: 'Seller' };
      }
    }
    
    return option;
  });
  
  return finalOptions;
}

/**
 * Calculates the price for a specific shipping option
 * This function implements error handling and logging for better debugging
 */
export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  sellerId?: string,
  data?: Record<string, unknown>
): Promise<{ id: string; amount: number } | null> => {
  if (!optionId || !cartId) {
    return null;
  }

  const authHeaders = {
    ...(await getAuthHeaders()),
  }

  const cacheOptions = {
    ...(await getCacheOptions("fulfillment")),
  }

  const body: { cart_id: string; data?: Record<string, unknown> } = { cart_id: cartId };

  if (data) {
    body.data = data;
  }
  
  try {
    const { shipping_option } = await sdk.client.fetch<{
      shipping_option: { id: string; amount: number }
    }>(`/store/shipping-options/${optionId}/calculate`, {
      method: "POST",
      headers: authHeaders,
      next: cacheOptions,
      body,
    })

    return shipping_option;
  } catch (error) {
    // Try fallback approach if the main endpoint fails
    try {
      const { shipping_option } = await sdk.client.fetch<{
        shipping_option: { id: string; amount: number }
      }>(`/store/carts/${cartId}/shipping-options/${optionId}`, {
        method: "GET",
        headers: authHeaders,
        next: cacheOptions,
      })

      return shipping_option;
    } catch (fallbackError) {
      return null;
    }
  }
}