"use client"

import React, { createContext, useContext, useMemo } from "react"
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

// URL-First Variant Selection with Client-Side Navigation
// Updates URL without full page reload, preserving React state and caches

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
  
  // Read variant from URL only - no client state
  const selectedVariantId = searchParams.get('variant') || initialVariantId
  
  // ✅ Client-side navigation - updates URL without page reload
  // Preserves React state, caches, and prevents unnecessary refetches
  const setSelectedVariantId = (id: string) => {
    if (!id || id === selectedVariantId || !id.trim()) return
    
    // Build new URL with updated variant parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('variant', id)
    
    // ✅ Use Next.js router for client-side navigation (no page reload)
    // scroll: false prevents scrolling to top on variant change
    router.push(`?${params.toString()}`, { scroll: false })
  }
  
  const contextValue = useMemo(() => ({
    selectedVariantId,
    setSelectedVariantId,
    updateUrlWithVariant: setSelectedVariantId
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
