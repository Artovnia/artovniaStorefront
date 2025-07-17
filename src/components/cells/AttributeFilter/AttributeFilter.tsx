"use client"

import { useEffect, useMemo, useState } from "react"
import { Chip } from "@/components/atoms"
import { Accordion, SelectField, RangeSlider } from "@/components/molecules"
import useFilters from "@/hooks/useFilters"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { useSearchParams } from "next/navigation"

export interface AttributeValue {
  id: string
  value: string
  rank?: number
}

export interface Attribute {
  id: string
  name: string
  handle: string
  description?: string
  is_filterable: boolean
  ui_component: string
  possible_values?: AttributeValue[]
}

export interface ProductPhysicalAttribute {
  type: 'weight' | 'length' | 'height' | 'width'
  min: number
  max: number
  unit: string
}

interface AttributeFilterProps {
  attribute?: Attribute
  physicalAttribute?: ProductPhysicalAttribute
}

export const AttributeFilter = ({ attribute, physicalAttribute }: AttributeFilterProps) => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  
  // Filter state management based on attribute type
  const filterKey = attribute?.handle || physicalAttribute?.type || ""
  const { updateFilters, isFilterActive, getActiveFilters } = useFilters(filterKey)
  
  // Range filter state (for numerical and physical attributes)
  const [rangeValues, setRangeValues] = useState<[number, number]>([0, 100])
  
  // Initialize range values from URL or defaults
  useEffect(() => {
    if (physicalAttribute) {
      const minParam = searchParams.get(`${filterKey}_min`)
      const maxParam = searchParams.get(`${filterKey}_max`)
      
      setRangeValues([
        minParam ? parseFloat(minParam) : physicalAttribute.min,
        maxParam ? parseFloat(maxParam) : physicalAttribute.max
      ])
    }
  }, [physicalAttribute, filterKey, searchParams])

  // Handle standard attribute value selection
  const handleAttributeValueSelect = (value: string) => {
    updateFilters(value)
  }

  // Handle range filter changes
  const handleRangeChange = (values: [number, number]) => {
    setRangeValues(values)
  }

  // Apply range filter
  const applyRangeFilter = () => {
    updateSearchParams(`${filterKey}_min`, rangeValues[0].toString())
    updateSearchParams(`${filterKey}_max`, rangeValues[1].toString())
  }

  const renderFilterContent = () => {
    // Handle physical attributes (weight, length, height, width)
    if (physicalAttribute) {
      return (
        <div className="mt-3">
          <RangeSlider
            min={physicalAttribute.min}
            max={physicalAttribute.max}
            value={rangeValues}
            onChange={handleRangeChange}
            onChangeComplete={applyRangeFilter}
            unit={physicalAttribute.unit}
          />
        </div>
      )
    }
    
    // Handle custom attributes based on UI component type
    if (attribute?.ui_component && attribute.possible_values?.length) {
      switch (attribute.ui_component) {
        case 'select':
        case 'multivalue':
          return (
            <ul className="grid grid-cols-3 mt-2 gap-2">
              {attribute.possible_values.map((option) => (
                <li key={option.id}>
                  <Chip
                    selected={isFilterActive(option.value)}
                    onSelect={() => handleAttributeValueSelect(option.value)}
                    value={option.value}
                    className="w-full !justify-center !py-2 !font-normal"
                  />
                </li>
              ))}
            </ul>
          )
        
        case 'color_picker':
          return (
            <ul className="grid grid-cols-4 mt-2 gap-2">
              {attribute.possible_values.map((option) => {
                const colorValue = option.value.startsWith('#') ? option.value : `#${option.value}`
                return (
                  <li key={option.id}>
                    <button
                      onClick={() => handleAttributeValueSelect(option.value)}
                      className={`w-8 h-8 rounded-full border ${isFilterActive(option.value) ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                      style={{ backgroundColor: colorValue }}
                      title={option.value}
                    />
                  </li>
                )
              })}
            </ul>
          )
          
        case 'toggle':
          return (
            <div className="mt-2">
              {attribute.possible_values.map((option) => (
                <label key={option.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isFilterActive(option.value)}
                    onChange={() => handleAttributeValueSelect(option.value)}
                    className="w-4 h-4"
                  />
                  <span>{option.value}</span>
                </label>
              ))}
            </div>
          )
          
        default:
          return (
            <p className="text-sm text-gray-500 mt-2">
              Ten typ filtra nie jest wspierany
            </p>
          )
      }
    }

    return (
      <p className="text-sm text-gray-500 mt-2">
    Brak dostępnyhc opcji filtra
      </p>
    )
  }

  // Don't render anything if we have no attribute or physical attribute
  if (!attribute && !physicalAttribute) return null

  return (
    <Accordion heading={attribute?.name || physicalAttribute?.type || "Filter"}>
      {renderFilterContent()}
    </Accordion>
  )
}
