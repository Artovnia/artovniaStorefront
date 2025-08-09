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
  
  // Simple debounce ref to prevent rapid updates
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // CRITICAL FIX: Minimal URL update that doesn't block navigation
  const updateUrlWithVariant = useCallback((id: string) => {
    if (!id) return
    
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }
    
    // Simple debounced update - no blocking operations
    updateTimeoutRef.current = setTimeout(() => {
      try {
        const params = new URLSearchParams(searchParams.toString())
        params.set('variant', id)
        
        // Direct router update without complex async operations
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        
        if (process.env.NODE_ENV === 'development') {
         
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('URL update failed:', error);
        }
      }
    }, 100) // Simple 100ms debounce
  }, [pathname, router, searchParams])
  
  // CRITICAL FIX: Simple URL sync without complex state tracking
  useEffect(() => {
    const variantParam = searchParams.get('variant')
    
    // Only sync if we have a different variant param
    if (variantParam && variantParam !== selectedVariantId) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎯 Syncing from URL param: ${variantParam}`);
      }
      setSelectedVariantId(variantParam)
    }
  }, [searchParams]) // Only depend on searchParams

  // CRITICAL FIX: Simple variant selection without complex async operations
  const setSelectedVariantIdOptimized = useCallback((id: string) => {
    // Prevent unnecessary updates
    if (!id || id === selectedVariantId) return
    
    if (process.env.NODE_ENV === 'development') {
      
    }
    
    // Update state immediately
    setSelectedVariantId(id)
    
    // Update URL with simple debounce
    updateUrlWithVariant(id)
  }, [selectedVariantId, updateUrlWithVariant])

  // Memoized context value with stable references
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
