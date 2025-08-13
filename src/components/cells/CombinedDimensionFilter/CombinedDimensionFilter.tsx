// src/components/cells/CombinedDimensionFilter/CombinedDimensionFilter.tsx
"use client"

import { Accordion } from "@/components/molecules"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState, useCallback } from "react"
import { useHits, useInstantSearch } from "react-instantsearch"

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
  // State for all dimension values using a single state object
  const [dimensionInputs, setDimensionInputs] = useState<DimensionInputs>({
    min_length: "",
    max_length: "",
    min_width: "",
    max_width: "",
    min_height: "",
    max_height: "",
    min_weight: "",
    max_weight: ""
  })
  
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
  } = dimensionInputs
  
  // Get search params and update utility
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  
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

  // Update local state when URL params change
  useEffect(() => {
    // Update all dimension inputs in a single state update
    setDimensionInputs({
      min_length: searchParams.get("min_length") || "",
      max_length: searchParams.get("max_length") || "",
      min_width: searchParams.get("min_width") || "",
      max_width: searchParams.get("max_width") || "",
      min_height: searchParams.get("min_height") || "",
      max_height: searchParams.get("max_height") || "",
      min_weight: searchParams.get("min_weight") || "",
      max_weight: searchParams.get("max_weight") || ""
    })
  }, [searchParams])
  
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
      
      helper.search()
    }
  }, [helper])

  // Handle dimension change
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Update local state
    setDimensionInputs(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Apply filter immediately on change
    applyDimensionFilter(name, value)
  }

  // Apply dimension filter when Enter is pressed or input changes
  const applyDimensionFilter = (name: string, value: string) => {
    // Update URL param
    updateSearchParams(name, value || null)
    
    // Apply filter directly to Algolia
    if (helper) {
      // Extract the dimension type and min/max from the parameter name
      const isMin = name.startsWith('min_')
      const dimensionType = name.replace(/^(min|max)_/, '')
      
      // Get the current numeric filters
      const numericFilters = helper.state.numericFilters || []
      
      // Remove any existing filter for this dimension and min/max type
      const filteredNumericFilters = numericFilters.filter((filter: string) => {
        // Check if this filter is for the same dimension and operator type
        const parts = filter.split(/([<>=]+)/)
        if (parts.length < 2) return true
        
        const filterAttribute = parts[0].trim()
        const filterOperator = parts[1].trim()
        
        // Check all possible attribute paths for this dimension
        const dimensionPaths = [
          dimensionType, // product-level
          `variant_${dimensionType}s`, // variant arrays
          `variants.${dimensionType}`, // individual variants
          `variant_dimensions.${dimensionType}` // structured variant dimensions
        ]
        
        const isDimensionFilter = dimensionPaths.includes(filterAttribute)
        const isMatchingOperator = (isMin && filterOperator === '>=') || (!isMin && filterOperator === '<=')
        
        return !(isDimensionFilter && isMatchingOperator)
      })
      
      if (value) {
        // Add new filters for all possible dimension paths
        const operator = isMin ? '>=' : '<='
        const newFilters: string[] = []
        
        // Add filters for variant dimension arrays (primary)
        newFilters.push(`variant_${dimensionType}s${operator}${value}`)
        
        // Add filters for individual variants
        newFilters.push(`variants.${dimensionType}${operator}${value}`)
        
        // Add filters for structured variant dimensions
        newFilters.push(`variant_dimensions.${dimensionType}${operator}${value}`)
        
        // Add filter for product-level dimensions (fallback)
        newFilters.push(`${dimensionType}${operator}${value}`)
        

        
        // Update the helper state and trigger a search
        helper.setState({
          ...helper.state,
          numericFilters: [...filteredNumericFilters, ...newFilters]
        })
      } else {
        // Just remove the filter without adding a new one
        helper.setState({
          ...helper.state,
          numericFilters: filteredNumericFilters
        })
      }
      
      helper.search()
    }
  }

  // Handle dimension apply on Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const { name, value } = e.currentTarget
      applyDimensionFilter(name, value)
    }
  }

  // Clear all dimension filters - use useCallback to ensure stable reference
  const clearAllDimensionFilters = useCallback(() => {
    console.log('🧽 CombinedDimensionFilter: clearAllDimensionFilters called')
    
    // Get all dimension params from search params to clear them
    const dimensionParams = [
      'min_length', 'max_length',
      'min_width', 'max_width',
      'min_height', 'max_height',
      'min_weight', 'max_weight'
    ]

    console.log('📝 CombinedDimensionFilter: Current dimension inputs before clear:', dimensionInputs)

    // Clear inputs
    setDimensionInputs({
      min_length: '',
      max_length: '',
      min_width: '',
      max_width: '',
      min_height: '',
      max_height: '',
      min_weight: '',
      max_weight: ''
    })

    console.log('🔗 CombinedDimensionFilter: Clearing URL params:', dimensionParams)
    
    // Clear URL params
    dimensionParams.forEach(param => {
      updateSearchParams(param, null)
    })

    // Clear all numeric filters from the Algolia helper if available
    if (helper) {
      const numericFilters = helper.state.numericFilters || []
      
      // Remove dimension-related filters
      const filteredNumericFilters = numericFilters.filter((filter: string) => {
        const parts = filter.split(/([<>=]+)/)
        if (parts.length < 2) return true
        
        const filterAttribute = parts[0].trim()
        
        // Check if this is a dimension-related filter
        const dimensionTypes = ['length', 'width', 'height', 'weight']
        const isDimensionFilter = dimensionTypes.some(dim => 
          filterAttribute === dim ||
          filterAttribute === `variant_${dim}s` ||
          filterAttribute === `variants.${dim}` ||
          filterAttribute === `variant_dimensions.${dim}`
        )
        
        return !isDimensionFilter
      })
      
      // Update helper state and trigger a search
      helper.setState({
        ...helper.state,
        numericFilters: filteredNumericFilters
      })
      
      helper.search()
    }
  }, [updateSearchParams, helper]) // Add dependency array for useCallback

  // Listen for clear all filters event from ProductFilterBar
  useEffect(() => {
    const handleClearAllDimensionFilters = () => {
      console.log('🎯 CombinedDimensionFilter: Received clearAllDimensionFilters event')
      clearAllDimensionFilters()
    }

    console.log('🔧 CombinedDimensionFilter: Adding event listener for clearAllDimensionFilters')
    window.addEventListener('clearAllDimensionFilters', handleClearAllDimensionFilters)
    
    return () => {
      console.log('🧹 CombinedDimensionFilter: Removing event listener for clearAllDimensionFilters')
      window.removeEventListener('clearAllDimensionFilters', handleClearAllDimensionFilters)
    }
  }, []) // Empty dependency array is fine since clearAllDimensionFilters doesn't depend on props/state

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
    <Accordion heading="WYMIARY">
      {/* Length section */}
      <div className="mb-6">
        <div className="font-medium">Długość</div>
        {dimensionRanges.length && (
          <div className="text-sm text-gray-600 mb-2">
            Zakres: {formatDimensionValue(dimensionRanges.length.min, 'length')} - {formatDimensionValue(dimensionRanges.length.max, 'length')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Min"
                value={minLength}
                name="min_length"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">mm</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Max"
                value={maxLength}
                name="max_length"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Width section */}
      <div className="mb-6">
        <div className="font-medium">Szerokość</div>
        {dimensionRanges.width && (
          <div className="text-sm text-gray-600 mb-2">
            Zakres: {formatDimensionValue(dimensionRanges.width.min, 'width')} - {formatDimensionValue(dimensionRanges.width.max, 'width')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Min"
                value={minWidth}
                name="min_width"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">mm</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Max"
                value={maxWidth}
                name="max_width"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Height section */}
      <div className="mb-6">
        <div className="font-medium">Wysokość</div>
        {dimensionRanges.height && (
          <div className="text-sm text-gray-600 mb-2">
            Zakres: {formatDimensionValue(dimensionRanges.height.min, 'height')} - {formatDimensionValue(dimensionRanges.height.max, 'height')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Min"
                value={minHeight}
                name="min_height"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">mm</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Max"
                value={maxHeight}
                name="max_height"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weight section */}
      <div className="mb-4">
        <div className="font-medium">Waga</div>
        {dimensionRanges.weight && (
          <div className="text-sm text-gray-600 mb-2">
            Zakres: {formatDimensionValue(dimensionRanges.weight.min, 'weight')} - {formatDimensionValue(dimensionRanges.weight.max, 'weight')}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Min"
                value={minWeight}
                name="min_weight"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">g</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8"
                placeholder="Max"
                value={maxWeight}
                name="max_weight"
                onChange={handleDimensionChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">g</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Clear filters button */}
      {hasActiveFilter && (
        <div className="text-center mb-4">
          <button 
            onClick={clearAllDimensionFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Wyczyść filtry wymiarów
          </button>
        </div>
      )}
      
     
    </Accordion>
  )
}

export default CombinedDimensionFilter