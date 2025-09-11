"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useBatchLowestPrices } from '@/hooks/use-batch-lowest-prices'
import { LowestPriceData } from '@/types/price-history'

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
}

export const BatchPriceProvider: React.FC<BatchPriceProviderProps> = ({
  children,
  currencyCode,
  regionId,
  days = 30
}) => {
  const [registeredVariants, setRegisteredVariants] = useState<Set<string>>(new Set())
  
  // Memoize variant IDs array to prevent unnecessary re-renders
  const variantIds = useMemo(() => Array.from(registeredVariants), [registeredVariants])

  const { data, loading, error } = useBatchLowestPrices({
    variantIds,
    currencyCode,
    regionId,
    days,
    enabled: variantIds.length > 0
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
    return data[variantId] || null
  }, [data])

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
