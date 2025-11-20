"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { HttpTypes } from "@medusajs/types"
import { listProductsWithPromotions } from "@/lib/data/products"
import { unifiedCache, CACHE_TTL } from "@/lib/utils/unified-cache"

interface PromotionDataContextType {
  promotionalProducts: Map<string, HttpTypes.StoreProduct>
  isLoading: boolean
  error: string | null
  getProductWithPromotions: (productId: string) => HttpTypes.StoreProduct | null
}

const PromotionDataContext = createContext<PromotionDataContextType | undefined>(undefined)

interface PromotionDataProviderProps {
  children: React.ReactNode
  countryCode?: string
  productIds?: string[]  // ✅ Optional: Fetch only specific products. If undefined, fetch based on limit.
  limit?: number  // ✅ NEW: How many promotional products to fetch (default: 50)
}

export const PromotionDataProvider: React.FC<PromotionDataProviderProps> = ({
  children,
  countryCode = "PL",
  productIds,  // ✅ undefined = fetch based on limit, [] = fetch none, [ids] = fetch specific
  limit = 50  // ✅ Default to 50 promotional products (reasonable for most pages)
}) => {
  const [promotionalProducts, setPromotionalProducts] = useState<Map<string, HttpTypes.StoreProduct>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ✅ OPTIMIZATION: Skip fetch ONLY if explicitly passed empty array
    // undefined = fetch based on limit (homepage, categories)
    // [] = skip fetch (products already have promotion data)
    // [ids] = fetch specific products (promotions page pagination)
    if (productIds !== undefined && productIds.length === 0) {
      setPromotionalProducts(new Map())
      setIsLoading(false)
      return
    }

    const fetchPromotionalData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Determine fetch limit and cache key
        const isSpecificProducts = productIds !== undefined && productIds.length > 0
        const fetchLimit = isSpecificProducts ? productIds.length : limit
        
        // ✅ OPTIMIZATION: Create cache key based on specific product IDs or "all"
        let cacheKey: string
        if (isSpecificProducts) {
          const sortedIds = [...productIds].sort()
          cacheKey = `promotions:${countryCode}:${sortedIds.slice(0, 10).join(',')}:${sortedIds.length}`
        } else {
          cacheKey = `promotions:${countryCode}:all:${fetchLimit}`
        }
        
        const result = await unifiedCache.get(cacheKey, async () => {
          return await listProductsWithPromotions({
            page: 1,
            limit: fetchLimit,
            countryCode,
          })
        }, CACHE_TTL.PROMOTIONS)

        // Handle case where result is undefined or doesn't have expected structure
        if (!result || !result.response || !result.response.products) {
          setPromotionalProducts(new Map())
          return
        }

        // ✅ OPTIMIZATION: Create map with products
        const productMap = new Map<string, HttpTypes.StoreProduct>()
        result.response.products.forEach(product => {
          // If specific IDs provided, only include those. Otherwise include all.
          if (!isSpecificProducts || productIds.includes(product.id)) {
            productMap.set(product.id, product)
          }
        })

        setPromotionalProducts(productMap)
      } catch (err) {
        console.error('Failed to fetch promotional data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch promotional data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotionalData()
  }, [countryCode, productIds?.join(',') || 'all', limit])  // ✅ Re-fetch when product IDs or limit changes

  const getProductWithPromotions = (productId: string): HttpTypes.StoreProduct | null => {
    return promotionalProducts.get(productId) || null
  }

  const contextValue: PromotionDataContextType = {
    promotionalProducts,
    isLoading,
    error,
    getProductWithPromotions
  }

  return (
    <PromotionDataContext.Provider value={contextValue}>
      {children}
    </PromotionDataContext.Provider>
  )
}

export const usePromotionData = (): PromotionDataContextType => {
  const context = useContext(PromotionDataContext)
  if (context === undefined) {
    throw new Error('usePromotionData must be used within a PromotionDataProvider')
  }
  return context
}
