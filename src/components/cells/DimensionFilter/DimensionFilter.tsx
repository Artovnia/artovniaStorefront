"use client"

import { Accordion } from "@/components/molecules"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useHits } from "react-instantsearch"
import { Input } from "@/components/atoms"

interface DimensionFilterProps {
  title: string
  dimensionType: 'weight' | 'length' | 'height' | 'width'
  unit?: string
}

/**
 * DimensionFilter component for filtering products by physical dimensions
 * Supports weight, length, height, and width filtering with min/max ranges
 */
export function DimensionFilter({ title, dimensionType, unit = 'cm' }: DimensionFilterProps) {
  // State for min/max input values
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")
  
  // Get search params and update utility
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  
  // Get product hits to analyze dimension ranges
  const { results } = useHits()
  
  // Calculate min/max dimensions from product data
  const [dimensionRange, setDimensionRange] = useState<{ min: number, max: number } | null>(null)

  // Update local state when URL params change
  useEffect(() => {
    setMin(searchParams.get(`min_${dimensionType}`) || "")
    setMax(searchParams.get(`max_${dimensionType}`) || "")
  }, [searchParams, dimensionType])
  
  // Analyze product data to find dimension ranges
  useEffect(() => {
    if (results && results.hits && results.hits.length > 0) {
      // Extract dimension values from all products
      const values = results.hits
        .map(hit => hit[dimensionType] as number | undefined)
        .filter((val): val is number => typeof val === 'number' && !isNaN(val))
      
      if (values.length > 0) {
        // Calculate min and max values
        const minValue = Math.min(...values)
        const maxValue = Math.max(...values)
        
        setDimensionRange({ min: minValue, max: maxValue })
      }
    }
  }, [results, dimensionType])

  // Validate input is numeric
  const dimensionChangeHandler = (field: string, value: string) => {
    // Allow empty string or numbers (including decimals for dimensions)
    const reg = new RegExp("^[0-9]*(\\.[0-9]+)?$")
    if (value === "" || reg.test(value)) {
      if (field === "min") setMin(value)
      if (field === "max") setMax(value)
    }
  }

  // Handle search button click - apply both min and max filters at once
  const applyFilters = () => {
    // Update both filters together to avoid state inconsistencies
    if (min !== searchParams.get(`min_${dimensionType}`) || 
        max !== searchParams.get(`max_${dimensionType}`)) {
      // Create a new URLSearchParams object to update multiple params at once
      const newParams = new URLSearchParams(searchParams.toString());
      
      // Update or remove min parameter
      if (min) {
        newParams.set(`min_${dimensionType}`, min);
      } else {
        newParams.delete(`min_${dimensionType}`);
      }
      
      // Update or remove max parameter
      if (max) {
        newParams.set(`max_${dimensionType}`, max);
      } else {
        newParams.delete(`max_${dimensionType}`);
      }
      
      // Replace the URL with all changes at once
      const url = new URL(window.location.href);
      url.search = newParams.toString();
      window.history.replaceState({}, '', url);
      
      // Force a page reload to apply filters
      window.location.href = url.toString();
    }
  }
  
  // Clear filters
  const clearFilters = () => {
    updateSearchParams(`min_${dimensionType}`, null)
    updateSearchParams(`max_${dimensionType}`, null)
    setMin("")
    setMax("")
  }

  // Check if any filter is active
  const hasActiveFilter = Boolean(min || max)
  
  return (
    <Accordion heading={title}>
      {dimensionRange && (
        <div className="text-xs mb-2 text-gray-500">
          Range: {dimensionRange.min}{unit} - {dimensionRange.max}{unit}
        </div>
      )}
      
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <Input
            placeholder="Min"
            icon={<span className="text-xs font-medium">{unit}</span>}
            onChange={(e) => dimensionChangeHandler("min", e.target.value)}
            value={min}
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Max"
            icon={<span className="text-xs font-medium">{unit}</span>}
            onChange={(e) => dimensionChangeHandler("max", e.target.value)}
            value={max}
          />
        </div>
      </div>
      
      {/* Add search button */}
      <button 
        onClick={applyFilters}
        className="w-full py-2 px-4 bg-primary text-white rounded-md mb-3 hover:bg-primary/90 transition-colors"
      >
        Szukaj
      </button>
      
      {hasActiveFilter && (
        <div className="mb-2">
          <button 
            onClick={clearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Clear {dimensionType} filter
          </button>
        </div>
      )}
    </Accordion>
  )
}

export default DimensionFilter
