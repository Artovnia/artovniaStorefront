"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { performanceMonitor } from "@/lib/utils/performance"
import { hydrationLogger } from "@/lib/utils/hydration-logger"

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
  
  // Log component mount for hydration debugging
  useEffect(() => {
    hydrationLogger.logComponentMount('VariantSelectionProvider', {
      initialVariantId: selectedVariantId
    })
    
    return () => {
      hydrationLogger.logComponentUnmount('VariantSelectionProvider')
    }
  }, [])
  
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitializedRef = useRef(false)
  const lastVariantIdRef = useRef<string>('')
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Simplified URL update without complex debouncing
  const updateUrlWithVariant = useCallback((id: string) => {
    if (!id || id === lastVariantIdRef.current) return
    
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    // Simple timeout to batch URL updates
    updateTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('variant', id)
      
      // Update URL without forcing navigation
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      lastVariantIdRef.current = id
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 URL updated with variant: ${id}`);
      }
    }, 150) // Reduced from 300ms to 150ms
  }, [pathname, router, searchParams]) // Simplified dependencies
  
  // Simplified initialization - only run once
  useEffect(() => {
    if (isInitializedRef.current) return
    
    const variantParam = searchParams.get('variant')
    
    if (variantParam && variantParam !== selectedVariantId) {
      setSelectedVariantId(variantParam)
      lastVariantIdRef.current = variantParam
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 Initialized from URL param: ${variantParam}`);
      }
    } else if (initialVariantId && !variantParam) {
      // If no variant in URL but we have an initial ID, update URL
      updateUrlWithVariant(initialVariantId)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 Initialized with initial variant: ${initialVariantId}`);
      }
    }
    
    isInitializedRef.current = true
  }, []) // Empty dependency array - only run once

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  // Optimized setSelectedVariantId with useCallback for stable reference
  const setSelectedVariantIdOptimized = useCallback((id: string) => {
    if (id === selectedVariantId) return // Prevent unnecessary updates
    
    // Log variant selection for debugging
    hydrationLogger.logEvent('variant_selection_change', 'VariantSelectionProvider', {
      from: selectedVariantId,
      to: id,
      timestamp: performance.now()
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Variant selection changed: ${selectedVariantId} → ${id}`);
    }
    setSelectedVariantId(id)
    updateUrlWithVariant(id)
  }, [selectedVariantId, updateUrlWithVariant])

  // Optimized context value with stable references
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
