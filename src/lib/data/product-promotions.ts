"use server"

import { HttpTypes } from "@medusajs/types"
import {
  buildMedusaEndpointCandidates,
  isCannotGetHtmlResponse,
} from "@/lib/utils/medusa-backend-url"

const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const PRODUCT_PROMOTIONS_REVALIDATE_SECONDS = Number(process.env.PRODUCT_PROMOTIONS_REVALIDATE_SECONDS || 120)

interface ProductPromotion {
  id: string
  code: string
  type: string
  is_automatic: boolean
  campaign_id?: string
  application_method?: {
    type: string
    value: number
    target_type: string
    allocation: string
  }
  requires_code?: boolean
}

export interface ProductPromotionResponse {
  promotions: ProductPromotion[]
  count: number
  hasPromotions: boolean
}

/**
 * Check if a specific product has active promotions
 * @param productId - The product ID to check
 * @returns Promise with promotion data
 */
export const getProductPromotions = async (
  productId: string
): Promise<ProductPromotionResponse> => {
  if (!productId) {
    return {
      promotions: [],
      count: 0,
      hasPromotions: false
    }
  }

  try {
    const endpointCandidates = buildMedusaEndpointCandidates(
      `/store/products/${productId}/promotions`
    )

    let response: Response | null = null

    for (let candidateIndex = 0; candidateIndex < endpointCandidates.length; candidateIndex += 1) {
      const endpoint = endpointCandidates[candidateIndex]
      const currentResponse = await fetch(endpoint, {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-publishable-api-key": PUB_KEY,
        },
        next: {
          revalidate: PRODUCT_PROMOTIONS_REVALIDATE_SECONDS,
          tags: ["products", `product-${productId}`, "promotions"],
        },
      })

      if (!currentResponse.ok) {
        const body = await currentResponse.text().catch(() => "")
        const retryWithAlternativePath =
          candidateIndex < endpointCandidates.length - 1 &&
          isCannotGetHtmlResponse(currentResponse.status, body)

        if (retryWithAlternativePath) {
          continue
        }

        throw new Error(`getProductPromotions -> ${currentResponse.status}`)
      }

      response = currentResponse
      break
    }

    if (!response) {
      throw new Error("getProductPromotions -> no successful endpoint candidate")
    }

    const data = await response.json() as {
      promotions: ProductPromotion[]
      count: number
    }

    const promotions = data.promotions || []
    
    return {
      promotions,
      count: data.count || 0,
      hasPromotions: promotions.length > 0
    }
  } catch (error) {
    console.warn(`Failed to fetch promotions for product ${productId}:`, error)
    return {
      promotions: [],
      count: 0,
      hasPromotions: false
    }
  }
}

/**
 * Check if a product has any type of discount (promotions OR price list discounts)
 * This combines promotion module checks with price list discount detection
 * @param product - The product to check
 * @returns Promise with comprehensive discount information
 */
export const hasProductDiscount = async (
  product: HttpTypes.StoreProduct
): Promise<{
  hasPromotion: boolean
  hasCalculatedPrice: boolean
  hasAnyDiscount: boolean
  promotionData?: ProductPromotionResponse
}> => {
  if (!product?.id) {
    return {
      hasPromotion: false,
      hasCalculatedPrice: false,
      hasAnyDiscount: false
    }
  }

  try {
    // Check for promotion module discounts
    const promotionData = await getProductPromotions(product.id)
    
    // Check for price list discounts (calculated_price !== original_price)
    const hasCalculatedPrice = product.variants?.some(variant => 
      variant.calculated_price && 
      variant.calculated_price.calculated_amount !== variant.calculated_price.original_amount &&
      variant.calculated_price.calculated_amount < variant.calculated_price.original_amount
    ) || false

    const hasAnyDiscount = promotionData.hasPromotions || hasCalculatedPrice

    return {
      hasPromotion: promotionData.hasPromotions,
      hasCalculatedPrice,
      hasAnyDiscount,
      promotionData
    }
  } catch (error) {
    console.warn(`Failed to check discounts for product ${product.id}:`, error)
    
    // Fallback: only check calculated price
    const hasCalculatedPrice = product.variants?.some(variant => 
      variant.calculated_price && 
      variant.calculated_price.calculated_amount !== variant.calculated_price.original_amount &&
      variant.calculated_price.calculated_amount < variant.calculated_price.original_amount
    ) || false

    return {
      hasPromotion: false,
      hasCalculatedPrice,
      hasAnyDiscount: hasCalculatedPrice
    }
  }
}
