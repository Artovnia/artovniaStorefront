// src/components/cells/SizeFilter/SizeFilter.tsx
"use client"

import { useMemo } from "react"
import { Chip } from "@/components/atoms"
import { Accordion } from "@/components/molecules"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { useSearchParams } from "next/navigation"
import { useInstantSearch } from "react-instantsearch"
import { useSizeAttributes } from "../../../hooks/useUniversalAttributes"

interface SizeFilterProps {
  onClose?: () => void;
  showButton?: boolean;
}

export const SizeFilter = ({ onClose, showButton = true }: SizeFilterProps = {}) => {
  const { attributes: sizeAttributes, loading, error } = useSizeAttributes()
  const { results } = useInstantSearch()
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()

  // Auto-detect the primary size attribute (first one found)
  const primarySizeAttribute = useMemo(() => {
    return sizeAttributes.find(attr => attr.is_filterable) || sizeAttributes[0]
  }, [sizeAttributes])

  // State for tracking current filter(s)
  const currentSizeFilters = useMemo(() => {
    const sizeParam = searchParams.get("size") || ""
    return sizeParam ? sizeParam.split(',') : []
  }, [searchParams])

  // SOLUTION 3: Extract sizes from product results instead of using useRefinementList
  // This eliminates additional Algolia queries
  const allSizes = useMemo(() => {
    const sizeSet = new Set<string>()

    // Add sizes from backend attribute data
    if (primarySizeAttribute?.possible_values) {
      primarySizeAttribute.possible_values.forEach((pv: any) => {
        if (pv.value && typeof pv.value === 'string') {
          sizeSet.add(pv.value)
        }
      })
    }

    // Extract sizes from product hits
    if (results?.hits) {
      results.hits.forEach((product: any) => {
        // Check variant_attribute_values (aggregated)
        if (product.variant_attribute_values) {
          Object.values(product.variant_attribute_values).forEach((values: any) => {
            if (Array.isArray(values)) {
              values.forEach(value => {
                if (value && typeof value === 'string') sizeSet.add(value)
              })
            } else if (values && typeof values === 'string') {
              sizeSet.add(values)
            }
          })
        }

        // Check product attribute_values
        if (product.attribute_values) {
          Object.values(product.attribute_values).forEach((value: any) => {
            if (value && typeof value === 'string') sizeSet.add(value)
          })
        }

        // Check individual variant attributes
        if (product.variants && Array.isArray(product.variants)) {
          product.variants.forEach((variant: any) => {
            if (variant.attribute_values) {
              Object.values(variant.attribute_values).forEach((value: any) => {
                if (value && typeof value === 'string') sizeSet.add(value)
              })
            }
          })
        }
      })
    }

    return Array.from(sizeSet).sort()
  }, [primarySizeAttribute, results])

  // Check if a size filter is currently active
  const isFilterActive = (size: string) => {
    return currentSizeFilters.includes(size)
  }

  // Handle size selection
  const handleSizeSelection = (size: string): void => {
    let newSizes: string[]

    if (currentSizeFilters.includes(size)) {
      // Remove if already selected
      newSizes = currentSizeFilters.filter((s: string) => s !== size)
    } else {
      // Add if not selected
      newSizes = [...currentSizeFilters, size]
    }

    // Update URL param
    const newSizeParam = newSizes.length > 0 ? newSizes.join(',') : null
    updateSearchParams('size', newSizeParam)
  }

  // Clear all size filters
  const clearSizeFilters = (): void => {
    updateSearchParams('size', null)
  }

  if (loading) {
    return (
      <Accordion heading="Rozmiar">
        <p className="text-sm text-gray-500">Ładowanie...</p>
      </Accordion>
    )
  }

  if (error) {
    return (
      <Accordion heading="Rozmiar">
        <p className="text-sm text-gray-500">Błąd podczas ładowania danych o rozmiarach</p>
      </Accordion>
    )
  }

  if (sizeAttributes.length === 0 || allSizes.length === 0) {
    return null
  }

  return (
    <Accordion heading="Rozmiar">
      <div className="flex flex-wrap gap-2 mb-4">
        {allSizes.map((size) => (
          <Chip
            key={`size-${size}`}
            value={size}
            selected={isFilterActive(size)}
            onSelect={() => handleSizeSelection(size)}
          />
        ))}
      </div>

      {currentSizeFilters.length > 0 && (
        <button
          className="text-sm text-primary hover:text-primary-dark"
          onClick={clearSizeFilters}
        >
          Wyczyść filtry
        </button>
      )}
    </Accordion>
  )
}

export default SizeFilter