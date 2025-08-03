"use client"

import { HttpTypes } from "@medusajs/types"
import { useCallback, useMemo, useEffect } from "react"

import { Chip } from "@/components/atoms"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { hydrationLogger } from "@/lib/utils/hydration-logger"

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
}

export const ProductVariants = ({
  product,
  selectedVariant,
}: {
  product: ExtendedStoreProduct
  selectedVariant: Record<string, string>
}) => {
  const updateSearchParams = useUpdateSearchParams()

  // Log component mount for hydration debugging
  useEffect(() => {
    hydrationLogger.logComponentMount('ProductVariants', {
      productId: product.id,
      optionsCount: product.options?.length || 0,
      selectedVariant: Object.keys(selectedVariant).length
    })
    
    return () => {
      hydrationLogger.logComponentUnmount('ProductVariants')
    }
  }, [])

  // Optimized option value setter with useCallback to prevent unnecessary re-renders
  const setOptionValue = useCallback((optionId: string, value: string) => {
    if (value) {
      // Log variant option selection for debugging
      hydrationLogger.logEvent('variant_option_change', 'ProductVariants', {
        optionId,
        value,
        productId: product.id,
        timestamp: performance.now()
      })
      updateSearchParams(optionId, value)
    }
  }, [updateSearchParams, product.id])
  
  // Memoize product options to prevent unnecessary re-processing
  const productOptions = useMemo(() => product.options || [], [product.options])

  return (
    <div className="my-4 space-y-2">
      {productOptions.map(
        ({ id, title, values }: ProductOption) => (
          <div key={id}>
            <span className="label-md text-secondary">{title}: </span>
            <span className="label-md text-primary">
              {selectedVariant[title.toLowerCase()]}
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
                      setOptionValue(title.toLowerCase(), value || "")
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
