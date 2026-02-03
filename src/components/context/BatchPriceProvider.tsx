"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useBatchLowestPrices } from '@/hooks/use-batch-lowest-prices'
import { LowestPriceData } from '@/types/price-history'
import { unifiedCache, CACHE_TTL } from '@/lib/utils/unified-cache'

interface BatchPriceContextType {
  registerVariant: (variantId: string) => void
  unregisterVariant: (variantId: string) => void
  getPriceData: (variantId: string) => LowestPriceData | null
  loading: boolean
  error: string | null
}

const BatchPriceContext = createContext<BatchPriceContextType | null>(null)

interface BatchPriceProviderProps {
  children: React.ReactNode
  currencyCode: string
  regionId?: string
  days?: number
  // ✅ OPTIMIZATION: Pass variant IDs directly to enable instant cache lookup
  preloadVariantIds?: string[]
  // ✅ OPTIMIZATION: Pass server-fetched price data to eliminate client-side fetch
  initialPriceData?: Record<string, LowestPriceData | null>
}

export const BatchPriceProvider: React.FC<BatchPriceProviderProps> = ({
  children,
  currencyCode,
  regionId,
  days = 30,
  preloadVariantIds = [],
  initialPriceData
}) => {
  // ✅ OPTIMIZATION: Initialize with preloaded variant IDs for instant cache lookup
  const [registeredVariants, setRegisteredVariants] = useState<Set<string>>(
    () => new Set(preloadVariantIds.filter(Boolean))
  )
  
  // Cleanup mechanism to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear all registered variants on unmount
      setRegisteredVariants(new Set())
      
      // 🧹 Clear related cache entries to prevent memory leaks
      if (process.env.NODE_ENV === 'development') {
     
      }
      unifiedCache.invalidate('price:')
    }
  }, [])
  
  // ✅ OPTIMIZATION: Merge preloaded and registered variants
  const variantIds = useMemo(() => {
    const merged = new Set([...preloadVariantIds.filter(Boolean), ...registeredVariants])
    return Array.from(merged)
  }, [registeredVariants, preloadVariantIds])

  // ✅ CRITICAL FIX: Skip client-side fetch if we have server-provided price data
  const shouldFetch = variantIds.length > 0 && (!initialPriceData || Object.keys(initialPriceData).length === 0)
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (initialPriceData && Object.keys(initialPriceData).length > 0) {
        console.log(`✅ [BatchPriceProvider] Using server-provided price data (${Object.keys(initialPriceData).length} variants), skipping client fetch`)
        console.log(`📊 [BatchPriceProvider] initialPriceData sample:`, Object.entries(initialPriceData)[0])
      } else if (shouldFetch) {
        console.log(`🔄 [BatchPriceProvider] No server data, will fetch ${variantIds.length} variants client-side`)
      }
    }
  }, [initialPriceData, shouldFetch, variantIds.length])
  
  const { data, loading, error } = useBatchLowestPrices({
    variantIds,
    currencyCode,
    regionId,
    days,
    enabled: shouldFetch,
    initialData: initialPriceData
  })


  const registerVariant = useCallback((variantId: string) => {
    setRegisteredVariants(prev => {
      if (prev.has(variantId)) return prev // Avoid unnecessary state updates
      const newSet = new Set(prev)
      newSet.add(variantId)
      return newSet
    })
  }, [])

  const unregisterVariant = useCallback((variantId: string) => {
    setRegisteredVariants(prev => {
      if (!prev.has(variantId)) return prev // Avoid unnecessary state updates
      const newSet = new Set(prev)
      newSet.delete(variantId)
      return newSet
    })
  }, [])

  const getPriceData = useCallback((variantId: string): LowestPriceData | null => {
    // Get price data from current batch
    const priceData = data[variantId]
    
    
    if (priceData) {
      // 🚀 Cache successful price lookups for future use
      const cacheKey = `price:${variantId}:${currencyCode}:${regionId || 'default'}:${days}`
      unifiedCache.set(cacheKey, priceData, CACHE_TTL.PRICING)
      
    }
    
    return priceData || null
  }, [data, currencyCode, regionId, days])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: BatchPriceContextType = useMemo(() => ({
    registerVariant,
    unregisterVariant,
    getPriceData,
    loading,
    error
  }), [registerVariant, unregisterVariant, getPriceData, loading, error])

  return (
    <BatchPriceContext.Provider value={contextValue}>
      {children}
    </BatchPriceContext.Provider>
  )
}

export const useBatchPrice = (): BatchPriceContextType => {
  const context = useContext(BatchPriceContext)
  if (!context) {
    throw new Error('useBatchPrice must be used within a BatchPriceProvider')
  }
  return context
}
