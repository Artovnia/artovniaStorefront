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
}

export const PromotionDataProvider: React.FC<PromotionDataProviderProps> = ({
  children,
  countryCode = "PL"
}) => {
  const [promotionalProducts, setPromotionalProducts] = useState<Map<string, HttpTypes.StoreProduct>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPromotionalData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simple approach: fetch fresh data with short cache
        const cacheKey = `promotions:${countryCode}`
        
        const result = await unifiedCache.get(cacheKey, async () => {
          return await listProductsWithPromotions({
            page: 1,
            limit: 100,
            countryCode,
          })
        }, CACHE_TTL.PROMOTIONS)

        // Handle case where result is undefined or doesn't have expected structure
        if (!result || !result.response || !result.response.products) {
          setPromotionalProducts(new Map())
          return
        }

        // Create a map for quick lookup by product ID
        const productMap = new Map<string, HttpTypes.StoreProduct>()
        result.response.products.forEach(product => {
          productMap.set(product.id, product)
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
  }, [countryCode])

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
