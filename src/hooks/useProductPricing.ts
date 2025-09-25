// src/hooks/useProductPricing.ts
"use client"

import { useState, useEffect } from 'react'
import { unifiedCache } from '@/lib/utils/unified-cache'
import { getPromotionalPrice } from '@/lib/helpers/get-promotional-price'
import { HttpTypes } from '@medusajs/types'

interface ProductPricingData {
  promotionalPricing: {
    originalPrice: string
    promotionalPrice: string
    discountPercentage: number
    hasPromotion: boolean
  }
  isLoading: boolean
  error: string | null
}

/**
 * Hook for caching product pricing calculations
 * Uses unified cache for promotional pricing with short TTL for freshness
 */
export const useProductPricing = (
  product: any,
  variantId?: string
): ProductPricingData => {
  const [data, setData] = useState<ProductPricingData>({
    promotionalPricing: {
      originalPrice: '0',
      promotionalPrice: '0',
      discountPercentage: 0,
      hasPromotion: false
    },
    isLoading: true,
    error: null
  })

  useEffect(() => {
    if (!product?.id) {
      setData(prev => ({ ...prev, isLoading: false }))
      return
    }

    const firstVariant = product.variants?.[0]
    const targetVariantId = variantId || firstVariant?.id
    const regionId = firstVariant?.calculated_price?.region_id

    if (!targetVariantId || !regionId) {
      setData(prev => ({ ...prev, isLoading: false }))
      return
    }

    // Create cache key for promotional pricing
    const cacheKey = `promotional:price:${product.id}:${targetVariantId}:${regionId}`

    const fetchPricing = async () => {
      try {
        const promotionalPricing = await unifiedCache.get(cacheKey, async () => {
          return getPromotionalPrice({
            product: product as any,
            regionId,
            variantId: targetVariantId
          })
        })

        setData({
          promotionalPricing,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Error fetching promotional pricing:', error)
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load pricing'
        }))
      }
    }

    fetchPricing()
  }, [product?.id, variantId, product.variants])

  return data
}

/**
 * Hook for caching product availability with very short TTL for stock freshness
 */
export const useProductAvailability = (
  product: any,
  variantId?: string
) => {
  const [availability, setAvailability] = useState<{
    available: boolean
    quantity: number
    isLoading: boolean
    error: string | null
  }>({
    available: false,
    quantity: 0,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    if (!product?.id) {
      setAvailability(prev => ({ ...prev, isLoading: false }))
      return
    }

    const firstVariant = product.variants?.[0]
    const targetVariantId = variantId || firstVariant?.id

    if (!targetVariantId) {
      setAvailability(prev => ({ ...prev, isLoading: false }))
      return
    }

    // Create cache key for availability - very short cache due to stock sensitivity
    const cacheKey = `product:availability:${product.id}:${targetVariantId}`

    const fetchAvailability = async () => {
      try {
        const availabilityData = await unifiedCache.get(cacheKey, async () => {
          // Get variant data from the product
          const variant = product.variants?.find((v: any) => v.id === targetVariantId)
          
          if (!variant) {
            return { available: false, quantity: 0, manage_inventory: true }
          }

          // Calculate availability based on inventory settings
          const manageInventory = variant.manage_inventory ?? true
          const allowBackorder = variant.allow_backorder ?? false
          const inventoryQuantity = variant.inventory_quantity ?? 0

          let available = true
          let quantity = inventoryQuantity

          if (manageInventory) {
            available = inventoryQuantity > 0 || allowBackorder
            quantity = Math.max(0, inventoryQuantity)
          }

          return {
            available,
            quantity,
            manage_inventory: manageInventory
          }
        })

        setAvailability({
          ...availabilityData,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Error fetching product availability:', error)
        setAvailability(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load availability'
        }))
      }
    }

    fetchAvailability()
  }, [product?.id, variantId, product.variants])

  return availability
}
