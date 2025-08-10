"use client"

import { HttpTypes } from "@medusajs/types"
import { useCallback, useMemo, useEffect } from "react"

import { Chip } from "@/components/atoms"
import { hydrationLogger } from "@/lib/utils/hydration-logger"
import { useVariantSelection } from "@/components/context/VariantSelectionContext"

// Define proper types for product options and values
type ProductOption = {
  id: string
  title: string
  values?: ProductOptionValue[]
}

type ProductOptionValue = {
  id: string
  value: string
}

type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  options?: ProductOption[]
  variants?: ExtendedProductVariant[]
}

type ExtendedProductVariant = HttpTypes.StoreProductVariant & {
  id: string
  options?: ExtendedProductOptionValue[]
}

type ExtendedProductOptionValue = HttpTypes.StoreProductOptionValue & {
  option?: {
    id: string
    title: string
  }
  value: string
}

export const ProductVariants = ({
  product,
  selectedVariant,
}: {
  product: ExtendedStoreProduct
  selectedVariant: Record<string, string>
}) => {
  const { selectedVariantId, setSelectedVariantId } = useVariantSelection()

  // ARCHITECTURAL CHANGE: Remove hydration logging that can cause memory issues
  // URL-first architecture doesn't need complex hydration tracking

  // CRITICAL FIX: Find the currently selected variant to show only its available options
  const currentVariant = useMemo(() => {
    if (!selectedVariantId || !product.variants) return null
    return product.variants.find(variant => variant.id === selectedVariantId) || product.variants[0]
  }, [selectedVariantId, product.variants])

  // CRITICAL FIX: Generate available options based on all variants, not just current variant
  const availableOptions = useMemo(() => {
    if (!product.variants || !product.options) return []
    
    const optionsMap = new Map<string, Set<string>>()
    
    // Collect all possible option values from all variants
    product.variants.forEach(variant => {
      variant.options?.forEach(variantOption => {
        const optionTitle = variantOption.option?.title?.toLowerCase()
        if (optionTitle && variantOption.value) {
          if (!optionsMap.has(optionTitle)) {
            optionsMap.set(optionTitle, new Set())
          }
          optionsMap.get(optionTitle)?.add(variantOption.value)
        }
      })
    })
    
    // Convert back to the expected format
    return product.options.map(option => ({
      ...option,
      values: Array.from(optionsMap.get(option.title.toLowerCase()) || []).map(value => ({
        id: `${option.id}-${value}`,
        value
      }))
    }))
  }, [product.options, product.variants])

  // ARCHITECTURAL CHANGE: Ultra-simple option setter for URL-first navigation
  const setOptionValue = useCallback((optionTitle: string, value: string) => {
    if (!value || !product.variants) return
    
    
    
    // Find variant by matching the specific option change
    const matchingVariant = product.variants.find(variant => {
      return variant.options?.some(variantOption => {
        return variantOption.option?.title?.toLowerCase() === optionTitle.toLowerCase() && 
               variantOption.value === value
      })
    })
    
    if (matchingVariant && matchingVariant.id !== selectedVariantId) {
      // ARCHITECTURAL CHANGE: Direct URL navigation - no React state management
      setSelectedVariantId(matchingVariant.id)
    }
  }, [product.variants, selectedVariantId, setSelectedVariantId])

  return (
    <div className="my-4 space-y-2">
      {availableOptions.map(
        ({ id, title, values }: ProductOption) => (
          <div key={id}>
            <span className="label-md text-secondary">{title}: </span>
            <span className="label-md text-primary">
              {selectedVariant[title.toLowerCase()] || 'Not selected'}
            </span>
            <div className="flex gap-2 mt-2 relative z-[5]">
              {(values || []).map(
                ({
                  id,
                  value,
                }: ProductOptionValue) => (
                  <Chip
                    key={id}
                    className="z-10"
                    selected={selectedVariant[title.toLowerCase()] === value}
                    color={title === "Color"}
                    value={value}
                    onSelect={() =>
                      setOptionValue(title, value || "")
                    }
                  />
                )
              )}
            </div>
          </div>
        )
      )}
    </div>
  )
}
