"use client"

import React, { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useSearchParams } from 'next/navigation'

// URL-First Variant Selection — updates URL bar without triggering Next.js navigation.
// router.replace() on a dynamic (ƒ) page causes a full server re-render on every variant
// change. window.history.replaceState() updates the URL silently with zero network cost.

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
  const searchParams = useSearchParams()

  // Local state mirrors the URL — avoids re-reading searchParams on every render
  const [localVariantId, setLocalVariantId] = useState<string>(
    () => searchParams.get('variant') || initialVariantId
  )

  const selectedVariantId = localVariantId || initialVariantId

  // Update URL bar silently — no Next.js navigation, no server re-render
  const setSelectedVariantId = useCallback((id: string) => {
    if (!id || id === localVariantId || !id.trim()) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('variant', id)

    // Use native History API — zero cost, no router involvement
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `?${params.toString()}`)
    }

    setLocalVariantId(id)
  }, [localVariantId, searchParams])
  
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
