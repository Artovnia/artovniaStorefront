"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"

/**
 * Fetch attribute values for a specific product variant
 * 
 * NOTE: Uses Next.js fetch caching (revalidate) instead of unifiedCache
 * because this is a Server Action and unifiedCache is client-side only.
 */
export async function getVariantAttributes(productId: string, variantId: string) {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{
      attribute_values: Array<{
        id: string
        value: string
        attribute_id: string
        attribute_name: string
        attribute: {
          id: string
          name: string
          handle: string
          ui_component: string
        }
      }>
    }>(
      `/store/products/${productId}/variants/${variantId}/attributes`,
      {
        method: "GET",
        headers,
        next: {
          revalidate: 300, // 5 minutes - matches CACHE_TTL.PRODUCT
          tags: [`variant-${variantId}-attributes`, `product-${productId}`],
        }
      }
    )
    
    return response
  } catch (error) {
    console.error(`Failed to fetch variant attributes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { attribute_values: [] }
  }
}
