"use client"

import { HttpTypes } from "@medusajs/types"
import { useCallback, useMemo } from "react"

import { Chip } from "@/components/atoms"
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
  // Also filter out default variants when they're the only option
  const availableOptions = useMemo(() => {
    if (!product.variants || !product.options) return []
    
    // Check if product has only default variants (should be hidden)
    const hasOnlyDefaultVariants = product.variants.length === 1 && 
      product.variants[0]?.options?.every(opt => 
        opt.option?.title?.toLowerCase().includes('default') || 
        opt.value?.toLowerCase().includes('default') ||
        opt.option?.title === 'Default Title' ||
        opt.value === 'Default Value'
      )
    
    // If only default variants exist, don't render any options
    if (hasOnlyDefaultVariants) {
      return []
    }
    
    const optionsMap = new Map<string, Set<string>>()
    
    // Collect all possible option values from all variants
    product.variants.forEach(variant => {
      variant.options?.forEach(variantOption => {
        const optionTitle = variantOption.option?.title?.toLowerCase()
        const optionValue = variantOption.value?.toLowerCase()
        
        // Skip default options entirely
        if (optionTitle?.includes('default') || 
            optionValue?.includes('default') ||
            variantOption.option?.title === 'Default Title' ||
            variantOption.value === 'Default Value') {
          return
        }
        
        if (optionTitle && variantOption.value) {
          if (!optionsMap.has(optionTitle)) {
            optionsMap.set(optionTitle, new Set())
          }
          optionsMap.get(optionTitle)?.add(variantOption.value)
        }
      })
    })
    
    // Convert back to the expected format, filtering out options with only one value
    return product.options
      .map(option => {
        const values = Array.from(optionsMap.get(option.title.toLowerCase()) || [])
        
        // Skip options that have no values or only one value (no real choice)
        if (values.length <= 1) {
          return null
        }
        
        return {
          ...option,
          values: values.map(value => ({
            id: `${option.id}-${value}`,
            value
          }))
        }
      })
      .filter(Boolean) // Remove null entries
  }, [product.options, product.variants])

  // CRITICAL FIX: Maintain all option selections when changing one option
  const setOptionValue = useCallback((optionTitle: string, value: string) => {
    if (!value || !product.variants) return
    
    // Get fresh current variant data to avoid stale closures
    const currentVariant = selectedVariantId 
      ? product.variants.find(v => v.id === selectedVariantId)
      : product.variants[0]
    
    if (!currentVariant) return
    
    // Build current options map from the actual current variant
    const currentOptions: Record<string, string> = {}
    currentVariant.options?.forEach(opt => {
      if (opt.option?.title && opt.value) {
        currentOptions[opt.option.title.toLowerCase()] = opt.value
      }
    })
    
    // Build the desired option combination by updating only the changed option
    // Keep all other currently selected options unchanged
    const desiredOptions: Record<string, string> = { ...currentOptions }
    desiredOptions[optionTitle.toLowerCase()] = value
    
    // Find variant that matches ALL desired options
    const matchingVariant = product.variants.find(variant => {
      if (!variant.options || variant.options.length === 0) return false
      
      // Check if this variant matches ALL desired option values
      return Object.entries(desiredOptions).every(([optTitle, optValue]) => {
        return variant.options?.some(variantOption => {
          return variantOption.option?.title?.toLowerCase() === optTitle.toLowerCase() && 
                 variantOption.value === optValue
        })
      })
    })
    
    if (matchingVariant && matchingVariant.id !== selectedVariantId) {
      // Direct URL navigation - no React state management
      setSelectedVariantId(matchingVariant.id)
    }
  }, [product.variants, selectedVariantId, setSelectedVariantId])

  // Don't render anything if no meaningful options are available
  if (availableOptions.length === 0) {
    return null
  }

  return (
    <div className="my-4 xl:my-6 space-y-2">
      {availableOptions.map(
        (option) => {
          if (!option) return null // Type guard for filtered null values
          
          const { id, title, values } = option
          
          return (
            <div key={id}>
              <span className="label-md text-secondary">{title}: </span>
              <span className="label-md text-primary">
                {selectedVariant[title.toLowerCase()] || 'Not selected'}
              </span>
              <div className="gap-2 ">
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
        }
      )}
    </div>
  )
}
