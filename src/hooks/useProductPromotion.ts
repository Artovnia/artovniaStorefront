"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { hasProductDiscount, ProductPromotionResponse } from "@/lib/data/product-promotions"
import { getPromotionalPrice } from "@/lib/helpers/get-promotional-price"

interface UseProductPromotionReturn {
  hasPromotion: boolean
  hasCalculatedPrice: boolean
  hasAnyDiscount: boolean
  promotionData?: ProductPromotionResponse
  promotionalPricing?: {
    originalPrice: string
    promotionalPrice: string
    discountPercentage: number
    hasPromotion: boolean
  }
  isLoading: boolean
  error: string | null
}

/**
 * Hook to check if a product has promotions or discounts
 * Combines promotion module checks with price list discount detection
 */
export const useProductPromotion = (
  product: HttpTypes.StoreProduct | null
): UseProductPromotionReturn => {
  const [hasPromotion, setHasPromotion] = useState(false)
  const [hasCalculatedPrice, setHasCalculatedPrice] = useState(false)
  const [hasAnyDiscount, setHasAnyDiscount] = useState(false)
  const [promotionData, setPromotionData] = useState<ProductPromotionResponse | undefined>()
  const [promotionalPricing, setPromotionalPricing] = useState<{
    originalPrice: string
    promotionalPrice: string
    discountPercentage: number
    hasPromotion: boolean
  } | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!product?.id) {
      setHasPromotion(false)
      setHasCalculatedPrice(false)
      setHasAnyDiscount(false)
      setIsLoading(false)
      setError(null)
      return
    }

    const checkDiscounts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const discountInfo = await hasProductDiscount(product)
        
        // Also get promotional pricing using the helper
        const promotionalPricingData = getPromotionalPrice({
          product: product as any,
          regionId: undefined
        })
        
        setHasPromotion(discountInfo.hasPromotion)
        setHasCalculatedPrice(discountInfo.hasCalculatedPrice)
        setHasAnyDiscount(discountInfo.hasAnyDiscount)
        setPromotionData(discountInfo.promotionData)
        setPromotionalPricing(promotionalPricingData)
      } catch (err) {
        console.error('Error checking product discounts:', err)
        setError(err instanceof Error ? err.message : 'Failed to check discounts')
        
        // Fallback: check calculated price locally
        const fallbackCalculatedPrice = product.variants?.some(variant => 
          variant.calculated_price && 
          variant.calculated_price.calculated_amount !== variant.calculated_price.original_amount &&
          variant.calculated_price.calculated_amount < variant.calculated_price.original_amount
        ) || false
        
        // Fallback promotional pricing
        const fallbackPromotionalPricing = getPromotionalPrice({
          product: product as any,
          regionId: undefined
        })
        
        setHasPromotion(false)
        setHasCalculatedPrice(fallbackCalculatedPrice)
        setHasAnyDiscount(fallbackCalculatedPrice)
        setPromotionData(undefined)
        setPromotionalPricing(fallbackPromotionalPricing)
      } finally {
        setIsLoading(false)
      }
    }

    checkDiscounts()
  }, [product?.id]) // Only re-run when product ID changes

  return {
    hasPromotion,
    hasCalculatedPrice,
    hasAnyDiscount,
    promotionData,
    promotionalPricing,
    isLoading,
    error
  }
}
