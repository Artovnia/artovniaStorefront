"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

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
  
  // Initialize from URL params if available
  useEffect(() => {
    const variantParam = searchParams.get('variant')
    if (variantParam) {
      setSelectedVariantId(variantParam)
    } else if (initialVariantId) {
      // If no variant in URL but we have an initial ID, update URL
      updateUrlWithVariant(initialVariantId)
    }
  }, [initialVariantId])

  // Update URL with variant ID
  const updateUrlWithVariant = (id: string) => {
    if (!id) return
    
    const params = new URLSearchParams(searchParams.toString())
    
    // Update or add the variant parameter
    params.set('variant', id)
    
    // Update URL without forcing navigation
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <VariantSelectionContext.Provider 
      value={{ 
        selectedVariantId, 
        setSelectedVariantId,
        updateUrlWithVariant
      }}
    >
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
