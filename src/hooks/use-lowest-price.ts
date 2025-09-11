"use client"

import { useState, useEffect } from "react"
import { LowestPriceData, ProductLowestPricesData } from "@/types/price-history"
import { getPublishableApiKey } from "@/lib/get-publishable-key"

interface UseLowestPriceOptions {
  variantId?: string
  productId?: string
  currencyCode: string
  regionId?: string
  days?: number
  enabled?: boolean
}

interface UseLowestPriceReturn {
  data: LowestPriceData | ProductLowestPricesData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useLowestPrice({
  variantId,
  productId,
  currencyCode,
  regionId,
  days = 30,
  enabled = true
}: UseLowestPriceOptions): UseLowestPriceReturn {
  const [data, setData] = useState<LowestPriceData | ProductLowestPricesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLowestPrice = async () => {
    if (!enabled || (!variantId && !productId) || !currencyCode) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
      
      // Get the publishable API key
      const publishableKey = await getPublishableApiKey()
      
      let url: string
      if (variantId) {
        // Single variant endpoint
        const params = new URLSearchParams({
          currency_code: currencyCode,
          days: days.toString(),
          ...(regionId && { region_id: regionId })
        })
        url = `${baseUrl}/store/variants/${variantId}/lowest-30d?${params}`
      } else if (productId) {
        // Product with all variants endpoint
        const params = new URLSearchParams({
          currency_code: currencyCode,
          days: days.toString(),
          ...(regionId && { region_id: regionId })
        })
        url = `${baseUrl}/store/products/${productId}/lowest-prices?${params}`
      } else {
        throw new Error('Either variantId or productId must be provided')
      }


      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableKey,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[useLowestPrice] Response error:', errorText)
        throw new Error(`Failed to fetch lowest price: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('[useLowestPrice] Error fetching lowest price:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLowestPrice()
  }, [variantId, productId, currencyCode, regionId, days, enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchLowestPrice
  }
}

// Convenience hook for single variant
export function useVariantLowestPrice(
  variantId: string,
  currencyCode: string,
  regionId?: string,
  days: number = 30,
  enabled: boolean = true
) {
  return useLowestPrice({
    variantId,
    currencyCode,
    regionId,
    days,
    enabled
  })
}

// Convenience hook for product (all variants)
export function useProductLowestPrices(
  productId: string,
  currencyCode: string,
  regionId?: string,
  days: number = 30,
  enabled: boolean = true
) {
  return useLowestPrice({
    productId,
    currencyCode,
    regionId,
    days,
    enabled
  })
}
