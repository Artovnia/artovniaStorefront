"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Input, StarRating } from "@/components/atoms"
import { FilterCheckboxOption } from "@/components/molecules"
import { ColorFilter, SizeFilter, ProductRatingFilter, PriceFilter } from "@/components/cells"
import { CombinedDimensionFilter } from "@/components/cells/CombinedDimensionFilter/CombinedDimensionFilter"
import { useSearchParams } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { useRefinementList } from 'react-instantsearch'
import { useFilterStore } from '@/stores/filterStore'
import useFilters from '@/hooks/useFilters'
import { MobileFilterModal } from '@/components/organisms/MobileFilterModal/MobileFilterModal'
import { useApplyFilters } from '@/hooks/useApplyFilters'
import { useSyncFiltersFromURL } from '@/hooks/useSyncFiltersFromURL'
import { useRouter, usePathname } from '@/i18n/routing'

interface FilterDropdownProps {
  label: string
  children: React.ReactNode
  isActive?: boolean
  className?: string
  onApply?: () => void
}

const FilterDropdown = ({ label, children, isActive, className, onApply }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Calculate dropdown position - updates on scroll and resize
  const updatePosition = useCallback(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 300 // Approximate dropdown width
      const screenWidth = window.innerWidth
      const spaceOnRight = screenWidth - rect.right
      
      // If dropdown would overflow on the right, align it to the right edge of button
      const shouldAlignRight = spaceOnRight < dropdownWidth && rect.left > dropdownWidth
      
      setDropdownPosition({
        top: rect.bottom + 8, // 8px margin below button
        left: shouldAlignRight ? rect.right - dropdownWidth : rect.left,
        right: window.innerWidth - rect.right
      })
    }
  }, [isOpen])

  // Update position on open, scroll, and resize
  useEffect(() => {
    if (isOpen) {
      updatePosition()
      
      window.addEventListener('scroll', updatePosition, true) // Use capture phase for all scrolls
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const dropdownContent = isOpen && (
    <div 
      ref={dropdownRef}
      className="fixed bg-primary border border-[#3B3634] rounded-lg shadow-lg z-[9999] min-w-[250px] max-w-[400px] flex flex-col"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        maxHeight: 'calc(100vh - ' + dropdownPosition.top + 'px - 20px)', // Dynamic max height to prevent overflow
      }}
    >
      {/* Scrollable content area */}
      <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex-1">
        {React.cloneElement(children as React.ReactElement, { onClose: () => setIsOpen(false) } as any)}
      </div>
      
      {/* Fixed button area - show for all filters including price */}
      <div className="border-t border-[#3B3634] bg-primary rounded-b-lg">
        <button
          onClick={() => {
            if (onApply) {
              onApply()
            }
            setIsOpen(false)
          }}
          className="w-full bg-[#3B3634] rounded-b-lg text-white py-2 px-4 font-instrument-sans text-sm hover:bg-opacity-90 transition-colors"
        >
          Zastosuj
        </button>
      </div>
    </div>
  )

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full border transition-all duration-200",
          "text-xs sm:text-sm font-medium whitespace-nowrap min-w-0 font-instrument-sans",
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

      {typeof window !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </div>
  )
}

interface ProductFilterBarProps {
  className?: string
  // SOLUTION 1: Accept centralized facet data as props to reduce Algolia queries
  colorFacetItems?: any[]
  ratingFacetItems?: any[]
  refineColor?: (value: string) => void
  refineRating?: (value: string) => void
}

export const ProductFilterBar = ({ 
  className,
  colorFacetItems = [],
  ratingFacetItems = [],
  refineColor,
  refineRating
}: ProductFilterBarProps) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  const applyFilters = useApplyFilters()
  const router = useRouter()
  const pathname = usePathname()
  
  // Sync store FROM URL (URL is source of truth)
  useSyncFiltersFromURL()
  
  // Get color and rating selections from Zustand store
  const { selectedColors, clearColors, selectedRating, clearRating } = useFilterStore()
  
  // SOLUTION 1: Removed useRefinementList hooks - now using centralized facet data from props
  // This eliminates multiple Algolia queries and reduces total query count significantly

  // SOLUTION 2: Debounced synchronization to prevent rapid-fire queries
  const debouncedSyncColors = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (colors: string[], facetItems: any[], refine?: (value: string) => void) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (!refine || facetItems.length === 0) return

          const algoliaRefinedColors = facetItems
            .filter(item => item.isRefined)
            .map(item => item.value)

          const zustandSet = new Set(colors)
          const algoliaSet = new Set(algoliaRefinedColors)

          const needsSync = 
            zustandSet.size !== algoliaSet.size ||
            colors.some(color => !algoliaSet.has(color)) ||
            algoliaRefinedColors.some(color => !zustandSet.has(color))

          if (needsSync) {
            const refinementsToApply: string[] = []
            
            algoliaRefinedColors.forEach(color => {
              if (!zustandSet.has(color)) {
                refinementsToApply.push(color)
              }
            })
            
            colors.forEach(color => {
              if (!algoliaSet.has(color)) {
                refinementsToApply.push(color)
              }
            })

            if (refinementsToApply.length > 0) {
              requestAnimationFrame(() => {
                refinementsToApply.forEach(color => {
                  refine(color)
                })
              })
            }
          }
        }, 300) // 300ms debounce
      }
    })(),
    []
  )

  // Sync Zustand color selections with Algolia refinements using debounced approach
  useEffect(() => {
    debouncedSyncColors(selectedColors, colorFacetItems, refineColor)
  }, [selectedColors, colorFacetItems, refineColor, debouncedSyncColors])
  
  // Sync Zustand rating selection with Algolia refinements
  useEffect(() => {
    if (ratingFacetItems.length === 0) return; // Wait for Algolia to be ready
    
    const algoliaRefinedRating = ratingFacetItems.find(item => item.isRefined)?.label || null;
    
    // Check if synchronization is needed
    const needsSync = selectedRating !== algoliaRefinedRating;
    
    if (needsSync && refineRating) {
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
  // Read price from store for immediate updates
  const { minPrice, maxPrice } = useFilterStore()
  const hasActiveFilters = Boolean(
    minPrice ||
    maxPrice ||
    selectedColors.length > 0 ||
    selectedRating ||
    searchParams.get("size") ||
    searchParams.get("condition") ||
    searchParams.get("min_length") ||
    searchParams.get("max_length") ||
    searchParams.get("min_width") ||
    searchParams.get("max_width") ||
    searchParams.get("min_height") ||
    searchParams.get("max_height") ||
    searchParams.get("min_weight") ||
    searchParams.get("max_weight")
  )

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []
    
    // Read price from store instead of URL for immediate UI updates
    const { minPrice, maxPrice } = useFilterStore.getState()
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
          // Get store actions
          const { setMinPrice, setMaxPrice, setPendingMinPrice, setPendingMaxPrice, setIsEditingPrice } = useFilterStore.getState()
          
          // Reset editing flag
          setIsEditingPrice(false)
          
          // Clear store immediately for instant UI update
          setMinPrice('')
          setMaxPrice('')
          setPendingMinPrice('')
          setPendingMaxPrice('')
          
          // Clear URL params
          const params = new URLSearchParams(searchParams.toString())
          params.delete("min_price")
          params.delete("max_price")
          
          // Use router.push to trigger proper navigation and re-render
          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
      })
    }
    
    // Add color filters from Algolia facet items (for proper Clear All functionality)
    if (colorFacetItems && refineColor) {
      colorFacetItems
        .filter(item => item.isRefined) // Only show refined/selected colors
        .forEach((item, index) => {
          filters.push({
            key: `color-${index}`,
            label: `Kolor: ${item.label}`,
            onRemove: () => {
              // Use Algolia refine function to properly clear the refinement
              refineColor(item.value)
              
              // Also remove from Zustand store for UI consistency
              const { removeColor } = useFilterStore.getState()
              removeColor(item.value)
            }
          })
        })
    }
    
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
        label: `Ocena: ${selectedRating}★`,
        onRemove: () => {
          // Clear URL param
          updateSearchParams("rating", "")
          
          // Clear Zustand store (both active and pending)
          const { setSelectedRating, setPendingRating } = useFilterStore.getState()
          setSelectedRating(null)
          setPendingRating(null)
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
    
    // Add dimension filters from URL parameters
    const dimensionParams = [
      { key: 'min_length', label: 'Min długość', unit: 'mm' },
      { key: 'max_length', label: 'Max długość', unit: 'mm' },
      { key: 'min_width', label: 'Min szerokość', unit: 'mm' },
      { key: 'max_width', label: 'Max szerokość', unit: 'mm' },
      { key: 'min_height', label: 'Min wysokość', unit: 'mm' },
      { key: 'max_height', label: 'Max wysokość', unit: 'mm' },
      { key: 'min_weight', label: 'Min waga', unit: 'g' },
      { key: 'max_weight', label: 'Max waga', unit: 'g' },
    ]
    
    dimensionParams.forEach(({ key, label, unit }) => {
      const value = searchParams.get(key)
      if (value) {
        filters.push({
          key: key,
          label: `${label}: ${value}${unit}`,
          onRemove: () => updateSearchParams(key, "")
        })
      }
    })
    
    return filters
  }

  const activeFilters = getActiveFilters()

  // Clear all filters handler
  const handleClearAll = () => {
    const activeFilters = getActiveFilters()
    activeFilters.forEach(filter => {
      if (filter.onRemove) {
        filter.onRemove()
      }
    })
  }

  return (
    <div className={cn("w-full bg-primary border-b border-[#3B3634] py-4 px-4 sm:px-6", className)}>
      {/* Mobile: Single "Filtry" Button - Show only on screens < 768px */}
      <div className="md:hidden flex items-center gap-3 ">
        <MobileFilterModal 
          colorFacetItems={colorFacetItems}
          ratingFacetItems={ratingFacetItems}
          hasActiveFilters={hasActiveFilters}
          onClearAll={handleClearAll}
        />
        
        {/* Clear All Filters - Mobile */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm font-medium font-instrument-sans text-black underline hover:text-red-600 transition-colors"
          >
            Wyczyść
          </button>
        )}
      </div>

      {/* Desktop: Individual Filter Dropdowns - Show only on screens >= 768px */}
      <div className="hidden md:flex flex-wrap items-center gap-2 sm:gap-3  overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
        {/* Sort Filter */}
        <SortFilter onApply={applyFilters} />
        
        {/* Price Filter */}
        <PriceFilterDropdown onApply={applyFilters} />
        
        {/* Color Filter */}
        <ColorFilterDropdown colorFacetItems={colorFacetItems} onApply={applyFilters} />
        
        {/* Size Filter */}
        <SizeFilterDropdown onApply={applyFilters} />
        
        {/* Dimensions Filter */}
        <DimensionsFilterDropdown onApply={applyFilters} />
        
        {/* Rating Filter */}
        <RatingFilterDropdown ratingFacetItems={ratingFacetItems} onApply={applyFilters} />
        
       

        {/* Clear All Filters - Desktop */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
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
const SortFilter = ({ onApply }: { onApply?: () => void }) => {
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
    <FilterDropdown label={`Sortuj według: ${currentSortLabel}`} isActive={Boolean(currentSort)} onApply={onApply}>
      <div className="space-y-2">
        <h4 className="font-medium text-black mb-3 font-instrument-sans">Sortuj według</h4>
        {sortOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="radio"
              name="sort"
              value={option.value}
              checked={currentSort === option.value}
              onChange={() => updateSearchParams("sortBy", option.value)}
              className="w-4 h-4 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] focus:ring-2 cursor-pointer"
              style={{
                accentColor: '#3B3634'
              }}
            />
            <span className="text-sm text-black font-instrument-sans select-none">{option.label}</span>
          </label>
        ))}
      </div>
    </FilterDropdown>
  )
}

// Price Filter Component
const PriceFilterDropdown = ({ onApply }: { onApply?: () => void }) => {
  const searchParams = useSearchParams()
  const isActive = Boolean(searchParams.get("min_price") || searchParams.get("max_price"))

  return (
    <FilterDropdown label="Cena" isActive={isActive} onApply={onApply}>
      <PriceFilterContent />
    </FilterDropdown>
  )
}

const PriceFilterContent = ({ onClose }: { onClose?: () => void }) => (
  <div>
    <PriceFilter onClose={onClose} />
  </div>
)

// Color Filter Component
const ColorFilterDropdown = ({ colorFacetItems, onApply }: { colorFacetItems: any[], onApply?: () => void }) => {
  const { selectedColors } = useFilterStore()
  const isActive = selectedColors.length > 0

  return (
    <FilterDropdown label="Kolor" isActive={isActive} onApply={onApply}>
      <ColorFilterContent colorFacetItems={colorFacetItems} />
    </FilterDropdown>
  )
}

const ColorFilterContent = ({ colorFacetItems, onClose }: { colorFacetItems: any[], onClose?: () => void }) => (
  <div>
    <h4 className="font-medium text-black mb-3 font-instrument-sans">Wybierz kolor</h4>
    <ColorFilter algoliaFacetItems={colorFacetItems} onClose={onClose} />
  </div>
)

// Size Filter Component
const SizeFilterDropdown = ({ onApply }: { onApply?: () => void }) => {
  const searchParams = useSearchParams()
  const isActive = Boolean(searchParams.get("size"))

  return (
    <FilterDropdown label="Rozmiar" isActive={isActive} onApply={onApply}>
      <SizeFilterContent />
    </FilterDropdown>
  )
}

const SizeFilterContent = ({ onClose }: { onClose?: () => void }) => (
  <div>
    <h4 className="font-medium text-black mb-3 font-instrument-sans">Wybierz rozmiar</h4>
    <SizeFilter onClose={onClose} />
  </div>
)

// Dimensions Filter Component
const DimensionsFilterDropdown = ({ onApply }: { onApply?: () => void }) => {
  const searchParams = useSearchParams()
  const isActive = Boolean(
    searchParams.get("width") || 
    searchParams.get("height") || 
    searchParams.get("depth")
  )

  return (
    <FilterDropdown label="Wymiary" isActive={isActive} onApply={onApply}>
      <DimensionsFilterContent />
    </FilterDropdown>
  )
}

const DimensionsFilterContent = ({ onClose }: { onClose?: () => void }) => (
  <div>
    <h4 className="font-medium text-black mb-3 font-instrument-sans">Wymiary produktu</h4>
    <CombinedDimensionFilter onClose={onClose} />
  </div>
)

// Rating Filter Component
const RatingFilterDropdown = ({ ratingFacetItems, onApply }: { ratingFacetItems: any[], onApply?: () => void }) => {
  const { selectedRating } = useFilterStore()
  const isActive = Boolean(selectedRating)

  return (
    <FilterDropdown label="Ocena" isActive={isActive} onApply={onApply}>
      <RatingFilterContent ratingFacetItems={ratingFacetItems} />
    </FilterDropdown>
  )
}

const RatingFilterContent = ({ ratingFacetItems, onClose }: { ratingFacetItems: any[], onClose?: () => void }) => (
  <div>
    <h4 className="font-medium text-black mb-3 font-instrument-sans">Minimalna ocena</h4>
    <ProductRatingFilter algoliaRatingItems={ratingFacetItems} onClose={onClose} />
  </div>
)