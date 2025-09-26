"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { unifiedCache, CACHE_TTL } from "@/lib/utils/unified-cache"

/**
 * Fetch attribute values for a specific product variant
 */
export async function getVariantAttributes(productId: string, variantId: string) {
  const cacheKey = `variant:attributes:${productId}:${variantId}`
  
  return unifiedCache.get(cacheKey, async () => {
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
            revalidate: 60, // Revalidate every minute
            tags: [`variant-${variantId}-attributes`],
          }
        }
      )
      
      return response
    } catch (error) {
      console.error(`Failed to fetch variant attributes: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { attribute_values: [] }
    }
  }, CACHE_TTL.PRODUCT) // Use product cache TTL (5 minutes)
}
