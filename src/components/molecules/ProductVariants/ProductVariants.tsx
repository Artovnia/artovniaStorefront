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

  // Log component mount for hydration debugging
  useEffect(() => {
    hydrationLogger.logComponentMount('ProductVariants', {
      productId: product.id,
      optionsCount: product.options?.length || 0,
      selectedVariant: Object.keys(selectedVariant).length,
      selectedVariantId
    })
    
    return () => {
      hydrationLogger.logComponentUnmount('ProductVariants')
    }
  }, [])

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

  // CRITICAL FIX: Simplified option value setter - only update variant context
  const setOptionValue = useCallback((optionTitle: string, value: string) => {
    if (!value || !product.variants) return
    
    // Log variant option selection for debugging
    hydrationLogger.logEvent('variant_option_change', 'ProductVariants', {
      optionTitle,
      value,
      productId: product.id,
      currentVariantId: selectedVariantId,
      timestamp: performance.now()
    })
    
    // Find the variant that matches the new option selection
    const newSelectedOptions = {
      ...selectedVariant,
      [optionTitle.toLowerCase()]: value
    }
    
    const matchingVariant = product.variants.find(variant => {
      return variant.options?.every(variantOption => {
        const optionKey = variantOption.option?.title?.toLowerCase()
        return optionKey && newSelectedOptions[optionKey] === variantOption.value
      })
    })
    
    if (matchingVariant && matchingVariant.id !== selectedVariantId) {
      // CRITICAL FIX: Only update variant context - let context handle URL updates
      setSelectedVariantId(matchingVariant.id)
    }
  }, [product.id, product.variants, selectedVariant, selectedVariantId, setSelectedVariantId])

  return (
    <div className="my-4 space-y-2">
      {availableOptions.map(
        ({ id, title, values }: ProductOption) => (
          <div key={id}>
            <span className="label-md text-secondary">{title}: </span>
            <span className="label-md text-primary">
              {selectedVariant[title.toLowerCase()] || 'Not selected'}
            </span>
            <div className="flex gap-2 mt-2">
              {(values || []).map(
                ({
                  id,
                  value,
                }: ProductOptionValue) => (
                  <Chip
                    key={id}
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
