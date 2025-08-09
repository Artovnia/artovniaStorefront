"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
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
  
  // RADICAL SIMPLIFICATION: Single timeout ref, no nested timeouts
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Track if we're currently updating to prevent cascading
  const isUpdatingRef = useRef<boolean>(false)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
      isUpdatingRef.current = false
    }
  }, [])
  
  // RADICAL SIMPLIFICATION: Single, simple URL sync - no bidirectional sync
  useEffect(() => {
    const variantParam = searchParams.get('variant')
    
    // Only sync from URL if we're not currently updating and param is different
    if (!isUpdatingRef.current && variantParam && variantParam !== selectedVariantId && variantParam.trim()) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 URL sync: ${variantParam}`);
      }
      setSelectedVariantId(variantParam)
    }
  }, [searchParams]) // CRITICAL: Remove selectedVariantId dependency

  // RADICAL SIMPLIFICATION: Ultra-simple variant setter with minimal async
  const setSelectedVariantIdOptimized = useCallback((id: string) => {
    // Basic validation
    if (!id || id === selectedVariantId || !id.trim() || isUpdatingRef.current) return
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Setting variant: ${id}`);
    }
    
    // Set updating flag immediately
    isUpdatingRef.current = true
    
    // Update state immediately - no delays
    setSelectedVariantId(id)
    
    // Clear any pending URL updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    // CRITICAL: Minimal URL update with immediate flag reset
    updateTimeoutRef.current = setTimeout(() => {
      try {
        // Use current URL to avoid stale searchParams
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('variant', id)
        
        // Single router call
        router.replace(currentUrl.pathname + currentUrl.search, { scroll: false })
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 URL updated: ${id}`);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('URL update failed:', error);
        }
      }
      
      // Reset flag immediately after URL update
      isUpdatingRef.current = false
    }, 50) // Reduced debounce time
  }, [selectedVariantId, router]) // Minimal dependencies

  // RADICAL SIMPLIFICATION: Remove unused updateUrlWithVariant from context
  const contextValue = useMemo(() => ({
    selectedVariantId,
    setSelectedVariantId: setSelectedVariantIdOptimized,
    updateUrlWithVariant: () => {} // Deprecated - kept for compatibility
  }), [selectedVariantId, setSelectedVariantIdOptimized])

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
