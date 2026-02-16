"use server"

import { sdk } from "../config"
import { unifiedCache, CACHE_TTL } from "@/lib/utils/unified-cache"

/**
 * Delivery Timeframe Types
 */
export interface DeliveryTimeframe {
  id: string
  product_id: string
  min_days: number
  max_days: number
  label: string | null
  is_custom: boolean
  created_at: string
  updated_at: string
}

/**
 * Fetch delivery timeframe for a product
 * Uses caching for performance
 */
export const getProductDeliveryTimeframe = async (
  productId: string
): Promise<DeliveryTimeframe | null> => {
  if (!productId) return null

  const cacheKey = `delivery-timeframe:${productId}`

  return unifiedCache.get(
    cacheKey,
    async () => {
      try {
        const response = await sdk.client.fetch<{
          delivery_timeframe: DeliveryTimeframe | null
        }>(`/store/products/${productId}/delivery-timeframe`, {
          method: "GET",
          next: { revalidate: 300, tags: ["delivery-timeframe", `product-${productId}`] },
        })

        return response.delivery_timeframe
      } catch (error) {
        console.error(
          `❌ getProductDeliveryTimeframe: Failed to fetch for product ${productId}:`,
          error
        )
        return null
      }
    },
    CACHE_TTL.PRODUCT
  )
}

/**
 * Batch fetch delivery timeframes for multiple products
 * Useful for product listings
 */
export const getProductsDeliveryTimeframes = async (
  productIds: string[]
): Promise<Map<string, DeliveryTimeframe>> => {
  const result = new Map<string, DeliveryTimeframe>()

  if (!productIds.length) return result

  // Fetch in parallel with individual caching
  const promises = productIds.map(async (productId) => {
    const timeframe = await getProductDeliveryTimeframe(productId)
    if (timeframe) {
      result.set(productId, timeframe)
    }
  })

  await Promise.all(promises)

  return result
}

/**
 * Format delivery timeframe for display
 * Returns a human-readable string like "3-5 dni"
 * Note: This is a sync helper - not a server action
 */
function formatTimeframeInternal(
  timeframe: DeliveryTimeframe | null
): string | null {
  if (!timeframe) return null

  if (timeframe.label) {
    return timeframe.label
  }

  return `${timeframe.min_days}-${timeframe.max_days} dni`
}

/**
 * Format delivery timeframe for display (async wrapper for server action)
 * Returns a human-readable string like "3-5 dni"
 */
export const formatDeliveryTimeframe = async (
  timeframe: DeliveryTimeframe | null
): Promise<string | null> => {
  return formatTimeframeInternal(timeframe)
}
