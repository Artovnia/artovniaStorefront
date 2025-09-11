"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { LowestPriceData } from "@/types/price-history"
import { getPublishableApiKey } from "@/lib/get-publishable-key"
import { getCachedBatchLowestPrices } from "@/lib/utils/storefront-cache"

interface BatchLowestPricesOptions {
  variantIds: string[]
  currencyCode: string
  regionId?: string
  days?: number
  enabled?: boolean
}

interface BatchLowestPricesReturn {
  data: Record<string, LowestPriceData | null>
  loading: boolean
  error: string | null
  refetch: () => void
}

// Legacy cache removed - now using persistent cache system

export function useBatchLowestPrices({
  variantIds,
  currencyCode,
  regionId,
  days = 30,
  enabled = true
}: BatchLowestPricesOptions): BatchLowestPricesReturn {
  const [data, setData] = useState<Record<string, LowestPriceData | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<string>('')

  const fetchBatchLowestPrices = useCallback(async (): Promise<Record<string, LowestPriceData | null>> => {
    if (variantIds.length === 0) {
      return {}
    }

    const fetchFn = async (): Promise<Record<string, LowestPriceData | null>> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
        
        // Get the publishable API key
        const publishableKey = await getPublishableApiKey()
        
        const requestBody = {
          variant_ids: Array.from(variantIds),
          currency_code: currencyCode,
          region_id: regionId,
          days
        }

        const response = await fetch(`${baseUrl}/store/variants/lowest-prices-batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': publishableKey,
          },
          body: JSON.stringify(requestBody)
        })

  

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[useBatchLowestPrices] Response error:', errorText)
          throw new Error(`Failed to fetch batch lowest prices: ${response.statusText}`)
        }

        const result = await response.json()
        
        const data = result.results || {}
        
        return data
      } catch (error) {
        console.error('[useBatchLowestPrices] Error fetching batch lowest prices:', error)
        throw error
      }
    }

    // Use persistent cache with 15-minute duration
    return getCachedBatchLowestPrices(variantIds, currencyCode, regionId, days, fetchFn)
  }, [variantIds, currencyCode, regionId, days])

  const refetch = useCallback(async () => {
    if (!enabled || variantIds.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await fetchBatchLowestPrices()
      setData(results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error refetching batch lowest prices:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchBatchLowestPrices, enabled, variantIds.length])

  useEffect(() => {
    if (!enabled || variantIds.length === 0) {
      return
    }

    // Create cache key for deduplication
    const cacheKey = `${variantIds.sort().join(',')}:${currencyCode}:${regionId || 'default'}:${days}`
    
    // Skip if same request is already in progress
    if (lastFetchRef.current === cacheKey) {
      return
    }

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce API calls by 150ms to batch rapid registrations
    debounceRef.current = setTimeout(async () => {
      lastFetchRef.current = cacheKey
      setLoading(true)
      setError(null)

      try {
        const results = await fetchBatchLowestPrices()
        setData(results)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching batch lowest prices:', err)
        }
      } finally {
        setLoading(false)
      }
    }, 150)

    // Cleanup debounce on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [enabled, variantIds.length, currencyCode, regionId, days, fetchBatchLowestPrices])

  return {
    data,
    loading,
    error,
    refetch
  }
}

// Hook to get a single variant's price from batch data
export function useVariantFromBatch(
  batchData: Record<string, LowestPriceData | null>,
  variantId: string
): LowestPriceData | null {
  return batchData[variantId] || null
}
