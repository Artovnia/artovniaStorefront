"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { performanceMonitor } from "@/lib/utils/performance"

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
  const isInitializedRef = useRef(false)
  const lastVariantIdRef = useRef<string>('')
  
  // Performance tracking
  const measureRender = performanceMonitor.measureRender('VariantSelectionProvider')
  
  // Debounced URL update to prevent excessive navigation calls
  const debouncedUpdateUrl = useMemo(() => 
    performanceMonitor.debounce((id: string) => {
      if (!id || id === lastVariantIdRef.current) return
      
      const params = new URLSearchParams(searchParams.toString())
      params.set('variant', id)
      
      // Update URL without forcing navigation
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      lastVariantIdRef.current = id
      
      console.log(`🔄 URL updated with variant: ${id}`);
    }, 300), // 300ms debounce
    [searchParams, router, pathname]
  )
  
  // Memoized update function to prevent unnecessary re-renders
  const updateUrlWithVariant = useCallback((id: string) => {
    if (!id || id === lastVariantIdRef.current) return
    debouncedUpdateUrl(id)
  }, [debouncedUpdateUrl])
  
  // Optimized initialization - only run once
  useEffect(() => {
    if (isInitializedRef.current) return
    
    const variantParam = searchParams.get('variant')
    
    if (variantParam && variantParam !== selectedVariantId) {
      setSelectedVariantId(variantParam)
      lastVariantIdRef.current = variantParam
      console.log(`🎯 Initialized from URL param: ${variantParam}`);
    } else if (initialVariantId && !variantParam) {
      // If no variant in URL but we have an initial ID, update URL
      updateUrlWithVariant(initialVariantId)
      console.log(`🎯 Initialized with initial variant: ${initialVariantId}`);
    }
    
    isInitializedRef.current = true
  }, [initialVariantId, searchParams, updateUrlWithVariant, selectedVariantId])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    selectedVariantId,
    setSelectedVariantId: (id: string) => {
      if (id === selectedVariantId) return // Prevent unnecessary updates
      
      console.log(`🔄 Variant selection changed: ${selectedVariantId} → ${id}`);
      setSelectedVariantId(id)
      updateUrlWithVariant(id)
    },
    updateUrlWithVariant
  }), [selectedVariantId, updateUrlWithVariant])
  
  // Track render performance
  useEffect(() => {
    measureRender()
  })

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
