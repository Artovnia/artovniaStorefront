"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'

type VariantSelectionContextType = {
  selectedVariantId: string
  setSelectedVariantId: (id: string) => void
  updateUrlWithVariant: (id: string) => void
}

const VariantSelectionContext = createContext<VariantSelectionContextType | undefined>(undefined)

export const VariantSelectionProvider = ({ 
  children,
  initialVariantId = "",
}: { 
  children: React.ReactNode
  initialVariantId?: string
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(initialVariantId)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Simplified URL update - immediate, no debouncing to prevent navigation conflicts
  const updateUrlWithVariant = useCallback((id: string) => {
    if (!id) return
    
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set('variant', id)
      
      // Immediate URL update without timeout to prevent navigation blocking
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 URL updated with variant: ${id}`);
      }
    } catch (error) {
      // Silently handle URL update errors to prevent navigation blocking
      if (process.env.NODE_ENV === 'development') {
        console.warn('URL update failed:', error);
      }
    }
  }, [pathname, router, searchParams])
  
  // Simplified initialization - only sync from URL on mount
  useEffect(() => {
    const variantParam = searchParams.get('variant')
    
    if (variantParam && variantParam !== selectedVariantId) {
      setSelectedVariantId(variantParam)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 Initialized from URL param: ${variantParam}`);
      }
    }
  }, [searchParams, selectedVariantId, setSelectedVariantId]) // Include all dependencies

  // Optimized setSelectedVariantId with minimal overhead
  const setSelectedVariantIdOptimized = useCallback((id: string) => {
    if (id === selectedVariantId) return // Prevent unnecessary updates
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Variant selection changed: ${selectedVariantId} → ${id}`);
    }
    
    setSelectedVariantId(id)
    updateUrlWithVariant(id)
  }, [selectedVariantId, updateUrlWithVariant])

  // Simplified context value
  const contextValue = useMemo(() => ({
    selectedVariantId,
    setSelectedVariantId: setSelectedVariantIdOptimized,
    updateUrlWithVariant
  }), [selectedVariantId, setSelectedVariantIdOptimized, updateUrlWithVariant])

  return (
    <VariantSelectionContext.Provider value={contextValue}>
      {children}
    </VariantSelectionContext.Provider>
  )
}

export const useVariantSelection = () => {
  const context = useContext(VariantSelectionContext)
  
  if (context === undefined) {
    throw new Error("useVariantSelection must be used within a VariantSelectionProvider")
  }
  
  return context
}
