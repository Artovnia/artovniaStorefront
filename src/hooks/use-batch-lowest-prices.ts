"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { LowestPriceData } from "@/types/price-history"
import { getPublishableApiKey } from "@/lib/get-publishable-key"
import { unifiedCache } from "@/lib/utils/unified-cache"

interface BatchLowestPricesOptions {
  variantIds: string[]
  currencyCode: string
  regionId?: string
  days?: number
  enabled?: boolean
  // ✅ OPTIMIZATION: Server-provided price data to skip client-side fetch
  initialData?: Record<string, LowestPriceData | null>
}

interface BatchLowestPricesReturn {
  data: Record<string, LowestPriceData | null>
  loading: boolean
  error: string | null
  refetch: () => void
}

// Legacy cache removed - now using persistent cache system

// ✅ OPTIMIZATION: Check cache synchronously to get initial data without loading state
function getInitialCachedData(
  variantIds: string[],
  currencyCode: string,
  regionId: string | undefined,
  days: number
): Record<string, LowestPriceData | null> | null {
  if (variantIds.length === 0) return null
  
  const cacheKey = `promotional:price:batch:${variantIds.sort().join(',')}:${currencyCode}:${regionId || 'default'}:${days}`
  const cached = unifiedCache.getSync<Record<string, LowestPriceData | null>>(cacheKey)
  return cached
}

export function useBatchLowestPrices({
  variantIds,
  currencyCode,
  regionId,
  days = 30,
  enabled = true,
  initialData: serverProvidedData
}: BatchLowestPricesOptions): BatchLowestPricesReturn {
  // ✅ OPTIMIZATION: Use server-provided data first, then check cache
  const cachedData = getInitialCachedData(variantIds, currencyCode, regionId, days)
  const initialData = serverProvidedData || cachedData
  const [data, setData] = useState<Record<string, LowestPriceData | null>>(initialData || {})
  // ✅ OPTIMIZATION: Don't show loading if we have server or cached data
  const [loading, setLoading] = useState(initialData === null && variantIds.length > 0 && enabled)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchRef = useRef<string>('')
  const hasCachedDataRef = useRef<boolean>(initialData !== null)

  const fetchBatchLowestPrices = useCallback(async (): Promise<Record<string, LowestPriceData | null>> => {
    // Filter out any empty/blank IDs before proceeding
    const validIds = variantIds.filter(id => id && id.trim().length > 0)
    if (validIds.length === 0) {
      return {}
    }

    const CHUNK_SIZE = 50

    const fetchChunk = async (
      chunkIds: string[],
      baseUrl: string,
      publishableKey: string
    ): Promise<Record<string, LowestPriceData | null>> => {
      const url = new URL(`${baseUrl}/store/variants/lowest-prices-batch`)
      url.searchParams.set('variant_ids', chunkIds.join(','))
      url.searchParams.set('currency_code', currencyCode)
      if (regionId) {
        url.searchParams.set('region_id', regionId)
      }
      url.searchParams.set('days', days.toString())

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-publishable-api-key': publishableKey,
          'x-source-function': 'useBatchLowestPrices',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[useBatchLowestPrices] Response error:', errorText)
        throw new Error(`Failed to fetch batch lowest prices: ${response.statusText}`)
      }

      const result = await response.json()
      return result.results || {}
    }

    const fetchFn = async (): Promise<Record<string, LowestPriceData | null>> => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
        const publishableKey = await getPublishableApiKey()

        // Split into chunks of CHUNK_SIZE and fetch in parallel
        const chunks: string[][] = []
        for (let i = 0; i < validIds.length; i += CHUNK_SIZE) {
          chunks.push(validIds.slice(i, i + CHUNK_SIZE))
        }

        const chunkResults = await Promise.all(
          chunks.map(chunk => fetchChunk(chunk, baseUrl, publishableKey))
        )

        // Merge all chunk results into a single record
        return Object.assign({}, ...chunkResults)
      } catch (error) {
        console.error('[useBatchLowestPrices] Error fetching batch lowest prices:', error)
        throw error
      }
    }

    const cacheKey = `promotional:price:batch:${variantIds.sort().join(',')}:${currencyCode}:${regionId || 'default'}:${days}`
    
    return unifiedCache.get(cacheKey, fetchFn)
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

    // ✅ OPTIMIZATION: Skip fetch if we already have cached data (from initial load)
    if (hasCachedDataRef.current && Object.keys(data).length > 0) {
      lastFetchRef.current = cacheKey
      return
    }

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce API calls by 50ms to batch rapid registrations (reduced from 150ms for faster loading)
    debounceRef.current = setTimeout(async () => {
      lastFetchRef.current = cacheKey
      // ✅ OPTIMIZATION: Don't show loading if we have any data already
      if (Object.keys(data).length === 0) {
        setLoading(true)
      }
      setError(null)

      try {
        const results = await fetchBatchLowestPrices()
        setData(results)
        hasCachedDataRef.current = true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching batch lowest prices:', err)
        }
      } finally {
        setLoading(false)
      }
    }, 50)

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
