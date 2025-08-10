"use client"

import React, { createContext, useContext, useMemo } from "react"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

// ARCHITECTURAL REDESIGN: URL-First, Server-Driven Variant Selection
// No client state, no synchronization issues, no hydration mismatches

type VariantSelectionContextType = {
  selectedVariantId: string
  setSelectedVariantId: (id: string) => void
  updateUrlWithVariant: (id: string) => void // Deprecated but kept for compatibility
}

const VariantSelectionContext = createContext<VariantSelectionContextType | undefined>(undefined)

export const VariantSelectionProvider = ({ 
  children,
  initialVariantId = "",
}: { 
  children: React.ReactNode
  initialVariantId?: string
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // ARCHITECTURAL CHANGE: Read variant from URL only - no client state
  const selectedVariantId = searchParams.get('variant') || initialVariantId
  
  // ARCHITECTURAL CHANGE: Direct URL navigation - no debouncing, no state sync
  const setSelectedVariantId = (id: string) => {
    if (!id || id === selectedVariantId || !id.trim()) return
    
    
    
    // CRITICAL: Use window.location for immediate, synchronous navigation
    // This avoids all React state/router conflicts
    const url = new URL(window.location.href)
    url.searchParams.set('variant', id)
    
    // Immediate navigation - no async operations
    window.location.href = url.toString()
  }
  
  // Simple context value - no complex memoization
  const contextValue = useMemo(() => ({
    selectedVariantId,
    setSelectedVariantId,
    updateUrlWithVariant: setSelectedVariantId // Redirect to new implementation
  }), [selectedVariantId])

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
