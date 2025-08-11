"use client"

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Input, StarRating } from "@/components/atoms"
import { FilterCheckboxOption } from "@/components/molecules"
import { ColorFilter, SizeFilter, ProductRatingFilter } from "@/components/cells"
import { CombinedDimensionFilter } from "@/components/cells/CombinedDimensionFilter/CombinedDimensionFilter"
import { useSearchParams } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { useRefinementList } from 'react-instantsearch'
import { useFilterStore } from '@/stores/filterStore'
import useFilters from '@/hooks/useFilters'

interface FilterDropdownProps {
  label: string
  children: React.ReactNode
  isActive?: boolean
  className?: string
}

const FilterDropdown = ({ label, children, isActive, className }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200",
          "text-sm font-medium whitespace-nowrap",
          isActive || isOpen
            ? "bg-primary text-black border-primary shadow-md"
            : "bg-primary text-black border-[#3B3634] hover:border-[#3B3634] hover:shadow-sm"
        )}
      >
        <span>{label}</span>
        <svg
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-primary border border-[#3B3634] rounded-lg shadow-lg z-50 min-w-[250px] max-w-[400px]">
          <div className="p-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface ProductFilterBarProps {
  className?: string
}

export const ProductFilterBar = ({ className }: ProductFilterBarProps) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  
  // Get color and rating selections from Zustand store
  const { selectedColors, clearColors, selectedRating, clearRating } = useFilterStore()
  
  // Algolia color refinement hook - this triggers the actual filtering
  const { items: colorFacetItems, refine: refineColor } = useRefinementList({
    attribute: 'color_families',
    limit: 100,
    operator: 'or',
  })
  
  // Algolia rating refinement hook - this triggers the actual filtering
  const { items: ratingFacetItems, refine: refineRating } = useRefinementList({
    attribute: 'average_rating',
    limit: 5,
    sortBy: ['name:desc'],
  })
  
  // Sync Zustand color selections with Algolia refinements
  useEffect(() => {
    if (colorFacetItems.length === 0) return; // Wait for Algolia to be ready
    
    const algoliaRefinedColors = colorFacetItems
      .filter(item => item.isRefined)
      .map(item => item.value);
    
    // Check if synchronization is needed
    const zustandSet = new Set(selectedColors);
    const algoliaSet = new Set(algoliaRefinedColors);
    
    const needsSync = 
      zustandSet.size !== algoliaSet.size ||
      selectedColors.some(color => !algoliaSet.has(color)) ||
      algoliaRefinedColors.some(color => !zustandSet.has(color));
    
    if (needsSync) {
      // Batch all refinements to prevent multiple re-renders
      const refinementsToApply: string[] = [];
      
      // Collect colors that need to be unrefined
      algoliaRefinedColors.forEach(color => {
        if (!zustandSet.has(color)) {
          refinementsToApply.push(color);
        }
      });
      
      // Collect colors that need to be refined
      selectedColors.forEach(color => {
        if (!algoliaSet.has(color)) {
          refinementsToApply.push(color);
        }
      });
      
      // Apply all refinements in a single batch to minimize re-renders
      if (refinementsToApply.length > 0) {
        // Use requestAnimationFrame to defer refinements until after current render cycle
        requestAnimationFrame(() => {
          refinementsToApply.forEach(color => {
            refineColor(color);
          });
        });
      }
    }
  }, [selectedColors, colorFacetItems, refineColor])
  
  // Sync Zustand rating selection with Algolia refinements
  useEffect(() => {
    if (ratingFacetItems.length === 0) return; // Wait for Algolia to be ready
    
    const algoliaRefinedRating = ratingFacetItems.find(item => item.isRefined)?.label || null;
    
    // Check if synchronization is needed
    const needsSync = selectedRating !== algoliaRefinedRating;
    
    if (needsSync) {
      // Use requestAnimationFrame to defer refinements until after current render cycle
      requestAnimationFrame(() => {
        // Clear current refinement if there is one
        if (algoliaRefinedRating && algoliaRefinedRating !== selectedRating) {
          refineRating(algoliaRefinedRating);
        }
        
        // Apply new refinement if needed
        if (selectedRating && selectedRating !== algoliaRefinedRating) {
          refineRating(selectedRating);
        }
      });
    }
  }, [selectedRating, ratingFacetItems, refineRating])
  
  // Check if any filters are active
  const hasActiveFilters = Boolean(
    searchParams.get("min_price") ||
    searchParams.get("max_price") ||
    selectedColors.length > 0 ||
    selectedRating ||
    searchParams.get("size")
  )

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []
    
    const minPrice = searchParams.get("min_price")
    const maxPrice = searchParams.get("max_price")
    if (minPrice || maxPrice) {
      const priceLabel = minPrice && maxPrice 
        ? `${minPrice}zł - ${maxPrice}zł`
        : minPrice 
          ? `Od ${minPrice}zł`
          : `Do ${maxPrice}zł`
      filters.push({
        key: 'price',
        label: `Cena: ${priceLabel}`,
        onRemove: () => {
          updateSearchParams("min_price", "")
          updateSearchParams("max_price", "")
        }
      })
    }
    
    // Add color filters from Zustand store
    selectedColors.forEach((colorValue: string, index: number) => {
      filters.push({
        key: `color-${index}`,
        label: `Kolor: ${colorValue}`,
        onRemove: () => {
          // Remove from Zustand store - this will trigger UI update
          const { removeColor } = useFilterStore.getState()
          removeColor(colorValue)
        }
      })
    })
    
    const size = searchParams.get("size")
    if (size) {
      filters.push({
        key: 'size',
        label: `Rozmiar: ${size}`,
        onRemove: () => updateSearchParams("size", "")
      })
    }
    
    // Add rating filter from Zustand store
    if (selectedRating) {
      filters.push({
        key: 'rating',
        label: `Ocena: ${selectedRating}+`,
        onRemove: () => {
          // Remove from Zustand store - this will trigger UI update
          const { clearRating } = useFilterStore.getState()
          clearRating()
        }
      })
    }
    
    const condition = searchParams.get("condition")
    if (condition) {
      filters.push({
        key: 'condition',
        label: `Stan: ${condition}`,
        onRemove: () => updateSearchParams("condition", "")
      })
    }
    
    return filters
  }

  const activeFilters = getActiveFilters()

  return (
    <div className={cn("w-full bg-primary border-b border-[#3B3634] py-4", className)}>
      {/* Filter Buttons Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Sort Filter */}
        <SortFilter />
        
        {/* Price Filter */}
        <PriceFilterDropdown />
        
        {/* Color Filter */}
        <ColorFilterDropdown colorFacetItems={colorFacetItems} />
        
        {/* Size Filter */}
        <SizeFilterDropdown />
        
        {/* Dimensions Filter */}
        <DimensionsFilterDropdown />
        
        {/* Rating Filter */}
        <RatingFilterDropdown ratingFacetItems={ratingFacetItems} />
        
       

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              // Clear URL-based filters
              updateSearchParams("min_price", "")
              updateSearchParams("max_price", "")
              updateSearchParams("size", "")
              updateSearchParams("condition", "")
              
              // Clear all Zustand store filters
              const { clearColors, clearRating, clearAllFilters } = useFilterStore.getState()
              clearAllFilters() // This should clear all Zustand filters at once
            }}
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              fontSize: '16px',
              fontWeight: 'medium',
              fontFamily: 'var(--font-instrument-sans)',
              color: '#000000',
              textDecoration: 'underline',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#000000'
            }}
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      {/* Active Filters Row */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-black font-medium font-instrument-sans mr-2">Aktywne filtry:</span>
          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="flex items-center gap-2 px-3 py-1 bg-[#3B3634] text-white text-sm rounded-full border border-[#3B3634]"
            >
              <span>{filter.label}</span>
              <button
                onClick={filter.onRemove}
                className="ml-1 text-gray-500 hover:text-red-600 transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Sort Filter Component
const SortFilter = () => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sortBy") || ""

  const sortOptions = [
    { label: "Domyślne", value: "" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
  ]

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || "Domyślne"

  return (
    <FilterDropdown label={`Sortuj według: ${currentSortLabel}`} isActive={Boolean(currentSort)}>
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 mb-3">Sortuj według</h4>
        {sortOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value={option.value}
              checked={currentSort === option.value}
              onChange={() => updateSearchParams("sortBy", option.value)}
              className="text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </FilterDropdown>
  )
}

// Price Filter Component
const PriceFilterDropdown = () => {
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMin(searchParams.get("min_price") || "")
    setMax(searchParams.get("max_price") || "")
  }, [searchParams])

  const isActive = Boolean(searchParams.get("min_price") || searchParams.get("max_price"))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (min) updateSearchParams("min_price", min)
    if (max) updateSearchParams("max_price", max)
  }

  return (
    <FilterDropdown label="Cena" isActive={isActive}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="font-medium text-black">Zakres cen</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            icon={<span className="text-xs font-medium">zł</span>}
            value={min}
            onChange={(e) => {
              const value = e.target.value
              if (/^[0-9]*$/.test(value)) setMin(value)
            }}
            className="flex-1"
          />
          <Input
            placeholder="Max"
            icon={<span className="text-xs font-medium">zł</span>}
            value={max}
            onChange={(e) => {
              const value = e.target.value
              if (/^[0-9]*$/.test(value)) setMax(value)
            }}
            className="flex-1"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-black py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          Zastosuj
        </button>
      </form>
    </FilterDropdown>
  )
}

// Color Filter Component
const ColorFilterDropdown = ({ colorFacetItems }: { colorFacetItems: any[] }) => {
  const { selectedColors } = useFilterStore()
  const isActive = selectedColors.length > 0

  return (
    <FilterDropdown label="Kolor" isActive={isActive}>
      <div>
        <h4 className="font-medium text-black mb-3">Wybierz kolor</h4>
        <ColorFilter algoliaFacetItems={colorFacetItems} />
      </div>
    </FilterDropdown>
  )
}

// Size Filter Component
const SizeFilterDropdown = () => {
  const searchParams = useSearchParams()
  const isActive = Boolean(searchParams.get("size"))

  return (
    <FilterDropdown label="Rozmiar" isActive={isActive}>
      <div>
        <h4 className="font-medium text-black mb-3">Wybierz rozmiar</h4>
        <SizeFilter />
      </div>
    </FilterDropdown>
  )
}

// Dimensions Filter Component
const DimensionsFilterDropdown = () => {
  const searchParams = useSearchParams()
  const isActive = Boolean(
    searchParams.get("width") || 
    searchParams.get("height") || 
    searchParams.get("depth")
  )

  return (
    <FilterDropdown label="Wymiary" isActive={isActive}>
      <div>
        <h4 className="font-medium text-black mb-3">Wymiary produktu</h4>
        <CombinedDimensionFilter />
      </div>
    </FilterDropdown>
  )
}

// Rating Filter Component
const RatingFilterDropdown = ({ ratingFacetItems }: { ratingFacetItems: any[] }) => {
  const { selectedRating } = useFilterStore()
  const isActive = Boolean(selectedRating)

  return (
    <FilterDropdown label="Ocena" isActive={isActive}>
      <div>
        <h4 className="font-medium text-black mb-3">Minimalna ocena</h4>
        <ProductRatingFilter algoliaRatingItems={ratingFacetItems} />
      </div>
    </FilterDropdown>
  )
}

