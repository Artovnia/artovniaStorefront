// src/components/cells/CombinedDimensionFilter/CombinedDimensionFilter.tsx
"use client"

import { Accordion } from "@/components/molecules"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState, useCallback } from "react"
import { useHits, useInstantSearch } from "react-instantsearch"
import { useFilterStore } from "@/stores/filterStore"

// Define TypeScript types for improved type safety
type DimensionInputs = {
  min_length: string;
  max_length: string;
  min_width: string;
  max_width: string;
  min_height: string;
  max_height: string;
  min_weight: string;
  max_weight: string;
}

type DimensionRanges = {
  length: { min: number; max: number } | null;
  width: { min: number; max: number } | null;
  height: { min: number; max: number } | null;
  weight: { min: number; max: number } | null;
}

interface CombinedDimensionFilterProps {
  onClose?: () => void;
  showButton?: boolean;
}

/**
 * CombinedDimensionFilter component for filtering products by all physical dimensions
 * Handles length, width, height, and weight filtering with min/max ranges
 * Works with both product-level and variant-level dimensions
 */
export function CombinedDimensionFilter({ onClose, showButton = true }: CombinedDimensionFilterProps = {}): JSX.Element {
  // Use PENDING state from Zustand for staging (not applied until Apply button)
  // URL sync is handled by useSyncFiltersFromURL in ProductFilterBar
  const { pendingDimensionFilters, setPendingDimensionFilter } = useFilterStore()
  const searchParams = useSearchParams()
  
  // Destructure values for easier access in the component
  const { 
    min_length: minLength, 
    max_length: maxLength, 
    min_width: minWidth, 
    max_width: maxWidth, 
    min_height: minHeight, 
    max_height: maxHeight,
    min_weight: minWeight,
    max_weight: maxWeight
  } = pendingDimensionFilters
  
  // Get product hits to analyze dimension ranges
  const { results } = useHits()
  
  // Access the Algolia search context
  const instantSearch = useInstantSearch()
  
  // Safely access the search helper
  // @ts-ignore - This is a valid usage but TypeScript doesn't recognize it
  const searchInstance = instantSearch.status === 'loading' ? null : instantSearch.use?.((state: any) => state.search)
  const helper = searchInstance?.helper
  
  // Calculate dimension ranges from product data
  const [dimensionRanges, setDimensionRanges] = useState<DimensionRanges>({
    length: null,
    width: null,
    height: null,
    weight: null
  })

  // Pending state is managed by Zustand store, no need to sync with URL params here
  
  // Analyze product data to find dimension ranges from variant data
  useEffect(() => {
    if (results && results.hits && results.hits.length > 0) {
      const newRanges: DimensionRanges = { 
        length: null, 
        width: null,
        height: null,
        weight: null
      }

      // Calculate for each dimension type
      const dimensionTypes = ['length', 'width', 'height', 'weight'] as const
      
      dimensionTypes.forEach(dimension => {
        let allValues: number[] = []
        
        results.hits.forEach(hit => {
          // Priority 1: Check variant dimension arrays (most reliable)
          const variantArrayKey = `variant_${dimension}s`
          const variantArray = hit[variantArrayKey] as number[] | null
          if (Array.isArray(variantArray)) {
            variantArray.forEach(val => {
              if (typeof val === 'number' && !isNaN(val) && val > 0) {
                allValues.push(val)
              }
            })
          }
          
          // Priority 2: Check structured variant_dimensions array
          const variantDimensions = hit.variant_dimensions as Array<{
            variant_id: string;
            variant_title: string;
            weight: number | null;
            length: number | null;
            height: number | null;
            width: number | null;
          }> | null
          
          if (Array.isArray(variantDimensions)) {
            variantDimensions.forEach(variantDim => {
              const value = variantDim[dimension]
              if (typeof value === 'number' && !isNaN(value) && value > 0) {
                allValues.push(value)
              }
            })
          }
          
          // Priority 3: Check individual variants in the variants array
          const variants = hit.variants as Array<{
            id: string;
            length?: number | null;
            width?: number | null;
            height?: number | null;
            weight?: number | null;
          }> | null
          
          if (Array.isArray(variants)) {
            variants.forEach(variant => {
              const value = variant[dimension]
              if (typeof value === 'number' && !isNaN(value) && value > 0) {
                allValues.push(value)
              }
            })
          }
          
          // Priority 4: Fallback to product-level dimensions
          const productValue = hit[dimension] as number | null
          if (typeof productValue === 'number' && !isNaN(productValue) && productValue > 0) {
            allValues.push(productValue)
          }
        })
        
        if (allValues.length > 0) {
          const minValue = Math.min(...allValues)
          const maxValue = Math.max(...allValues)
          
          newRanges[dimension] = { min: minValue, max: maxValue }
        }
      })
      
      setDimensionRanges(newRanges)
    }
  }, [results])

  // Set up dimension attributes for filtering
  useEffect(() => {
    if (helper) {
      // Add numeric attributes as disjunctive facets to allow filtering
      // Include both product-level and variant-level dimensions
      
      // Product-level dimensions (fallback)
      helper.addDisjunctiveFacet('length')
      helper.addDisjunctiveFacet('width')
      helper.addDisjunctiveFacet('height')
      helper.addDisjunctiveFacet('weight')
      
      // Variant-level dimension arrays (primary)
      helper.addDisjunctiveFacet('variant_lengths')
      helper.addDisjunctiveFacet('variant_widths')
      helper.addDisjunctiveFacet('variant_heights')
      helper.addDisjunctiveFacet('variant_weights')
      
      // Individual variant dimensions
      helper.addDisjunctiveFacet('variants.length')
      helper.addDisjunctiveFacet('variants.width')
      helper.addDisjunctiveFacet('variants.height')
      helper.addDisjunctiveFacet('variants.weight')
      
      // Structured variant dimensions
      helper.addDisjunctiveFacet('variant_dimensions.length')
      helper.addDisjunctiveFacet('variant_dimensions.width')
      helper.addDisjunctiveFacet('variant_dimensions.height')
      helper.addDisjunctiveFacet('variant_dimensions.weight')
    }
  }, [helper])

  // Handle dimension change - updates PENDING state only
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Update pending state only (not applied until Apply button)
    setPendingDimensionFilter(name, value)
  }

  // Removed immediate apply logic - dimensions will be applied when user clicks Apply button

  // Clearing is now handled by the main Apply/Clear buttons in ProductFilterBar

  // Check if any dimension filter is active
  const hasActiveFilter = Boolean(
    minLength || maxLength || 
    minWidth || maxWidth || 
    minHeight || maxHeight ||
    minWeight || maxWeight
  )

  // Helper function to format dimension values for display
  const formatDimensionValue = (value: number, dimension: string): string => {
    if (dimension === 'weight') {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}kg` : `${value}g`
    }
    return value >= 1000 ? `${(value / 10).toFixed(1)}cm` : `${value}mm`
  }
  
  return (
    <div className="p-4">
    
      
      {/* Length section */}
      <div className="mb-4">
        <div className="font-medium text-sm text-black font-instrument-sans mb-1">Długość</div>
        {dimensionRanges.length && (
          <div className="text-xs text-[#3B3634]/60 mb-2 font-instrument-sans">
            Zakres: {formatDimensionValue(dimensionRanges.length.min, 'length')} - {formatDimensionValue(dimensionRanges.length.max, 'length')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Min"
                value={minLength}
                name="min_length"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">mm</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Max"
                value={maxLength}
                name="max_length"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Width section */}
      <div className="mb-4">
        <div className="font-medium text-sm text-black font-instrument-sans mb-1">Szerokość</div>
        {dimensionRanges.width && (
          <div className="text-xs text-[#3B3634]/60 mb-2 font-instrument-sans">
            Zakres: {formatDimensionValue(dimensionRanges.width.min, 'width')} - {formatDimensionValue(dimensionRanges.width.max, 'width')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Min"
                value={minWidth}
                name="min_width"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">mm</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Max"
                value={maxWidth}
                name="max_width"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Height section */}
      <div className="mb-4">
        <div className="font-medium text-sm text-black font-instrument-sans mb-1">Wysokość</div>
        {dimensionRanges.height && (
          <div className="text-xs text-[#3B3634]/60 mb-2 font-instrument-sans">
            Zakres: {formatDimensionValue(dimensionRanges.height.min, 'height')} - {formatDimensionValue(dimensionRanges.height.max, 'height')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Min"
                value={minHeight}
                name="min_height"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">mm</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Max"
                value={maxHeight}
                name="max_height"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weight section */}
      <div>
        <div className="font-medium text-sm text-black font-instrument-sans mb-1">Waga</div>
        {dimensionRanges.weight && (
          <div className="text-xs text-[#3B3634]/60 mb-2 font-instrument-sans">
            Zakres: {formatDimensionValue(dimensionRanges.weight.min, 'weight')} - {formatDimensionValue(dimensionRanges.weight.max, 'weight')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Min"
                value={minWeight}
                name="min_weight"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">g</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-8 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
                placeholder="Max"
                value={maxWeight}
                name="max_weight"
                onChange={handleDimensionChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60">g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CombinedDimensionFilter