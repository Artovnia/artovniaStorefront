"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { ColorFilter, SizeFilter, ProductRatingFilter, PriceFilter } from "@/components/cells"
import { CombinedDimensionFilter } from "@/components/cells/CombinedDimensionFilter/CombinedDimensionFilter"
import { useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/stores/filterStore'
import { useApplyFilters } from '@/hooks/useApplyFilters'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { Check } from 'lucide-react'

interface MobileFilterModalProps {
  colorFacetItems?: any[]
  ratingFacetItems?: any[]
  hasActiveFilters: boolean
  onClearAll: () => void
}

export const MobileFilterModal = ({ 
  colorFacetItems = [],
  ratingFacetItems = [],
  hasActiveFilters,
  onClearAll
}: MobileFilterModalProps) => {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const applyFilters = useApplyFilters()
  
  // CRITICAL FIX: Use URL hash to persist modal state across router.push re-renders
  // This prevents the modal from closing when sorting triggers a page re-render
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    // Check if modal should be open based on hash
    if (typeof window !== 'undefined' && window.location.hash === '#filters') {
      setIsOpen(true)
    }
  }, [])
  
  // Sync modal state with hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setIsOpen(window.location.hash === '#filters')
    }
    
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  
  // Update hash when modal opens/closes
  const handleSetIsOpen = (open: boolean) => {
    if (open) {
      window.location.hash = 'filters'
    } else {
      // Remove hash without adding to history
      if (window.location.hash === '#filters') {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
    setIsOpen(open)
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleApplyFilters = () => {
    applyFilters()
    handleSetIsOpen(false)
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => handleSetIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-primary rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3B3634]">
          <h2 className="text-xl font-semibold font-instrument-sans text-black">Filtry</h2>
          <button
            onClick={() => handleSetIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Zamknij"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Sort Filter */}
          <SortFilterSection />
          
          {/* Price Filter */}
          <FilterSection title="Cena">
            <PriceFilter />
          </FilterSection>
          
          {/* Color Filter */}
          <FilterSection title="Kolor">
            <ColorFilter algoliaFacetItems={colorFacetItems} />
          </FilterSection>
          
          {/* Size Filter */}
          <FilterSection title="Rozmiar">
            <SizeFilter />
          </FilterSection>
          
          {/* Dimensions Filter */}
          <FilterSection title="Wymiary produktu">
            <CombinedDimensionFilter />
          </FilterSection>
          
          {/* Rating Filter */}
          <FilterSection title="Ocena">
            <ProductRatingFilter algoliaRatingItems={ratingFacetItems} />
          </FilterSection>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-[#3B3634] p-4 space-y-2 bg-primary">
          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearAll()
                handleSetIsOpen(false)
              }}
              className="w-full py-3 px-4 text-center font-instrument-sans font-medium text-black border border-[#3B3634]  hover:bg-gray-50 transition-colors"
            >
              Wyczyść wszystkie filtry
            </button>
          )}
          <button
            onClick={handleApplyFilters}
            className="w-full py-3 px-4 bg-[#3B3634] text-white font-instrument-sans font-semibold  hover:bg-opacity-90 transition-colors"
          >
            Zastosuj filtry
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => handleSetIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200",
          "text-sm font-medium font-instrument-sans",
          hasActiveFilters
            ? "bg-[#3B3634] text-white border-[#3B3634]"
            : "bg-primary text-black border-[#3B3634] hover:border-[#3B3634] hover:shadow-sm"
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filtry</span>
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 bg-white text-[#3B3634] text-xs font-bold rounded-full">
            {/* Count active filters */}
            {[
              searchParams.get("min_price") || searchParams.get("max_price"),
              useFilterStore.getState().selectedColors.length > 0,
              searchParams.get("size"),
              useFilterStore.getState().selectedRating,
              searchParams.get("min_length") || searchParams.get("max_length") ||
              searchParams.get("min_width") || searchParams.get("max_width") ||
              searchParams.get("min_height") || searchParams.get("max_height") ||
              searchParams.get("min_weight") || searchParams.get("max_weight")
            ].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Portal Modal */}
      {mounted && typeof window !== 'undefined' && createPortal(
        modalContent,
        document.body
      )}
    </>
  )
}

// Helper component for filter sections
const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="font-medium text-black font-instrument-sans text-base">{title}</h3>
    <div>{children}</div>
  </div>
)

// Sort Filter Section
const SortFilterSection = () => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  const currentSort = searchParams.get("sortBy") || ""

  const sortOptions = [
    { label: "Domyślne", value: "" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
  ]

  // CRITICAL FIX: Handle sort change without closing modal
  // Use event.preventDefault and stopPropagation to prevent modal close
  const handleSortChange = (value: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateSearchParams("sortBy", value)
    // Modal will stay open because we're not calling setIsOpen(false)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-black font-instrument-sans text-base">Sortuj według</h3>
      <div className="space-y-1">
        {sortOptions.map((option) => (
          <div key={option.value} className="relative">
            <button
              type="button"
              onClick={(e) => handleSortChange(option.value, e)}
              className="w-full flex items-center justify-between py-2.5 px-3 text-left transition-colors cursor-pointer hover:bg-[#3B3634]/5 rounded-lg"
            >
              <span className={cn(
                "text-sm font-instrument-sans select-none",
                currentSort === option.value ? "text-[#3B3634] font-medium" : "text-[#3B3634]/90"
              )}>
                {option.label}
              </span>
              <Check 
                className={cn(
                  "w-4 h-4 text-[#3B3634] transition-opacity duration-150",
                  currentSort === option.value ? "opacity-100" : "opacity-0"
                )}
                strokeWidth={2.5} 
              />
            </button>
            <div className="flex justify-center">
              <div className="w-[99%] h-px bg-[#3B3634]/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
