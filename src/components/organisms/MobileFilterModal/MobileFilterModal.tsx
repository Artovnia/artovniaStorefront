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
import { useRouter } from '@/i18n/routing'
import { usePathname } from 'next/navigation'

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
  
  // CRITICAL FIX: Use Zustand store to persist modal state across router.push re-renders
  // Local state gets reset when router.push triggers component re-render
  // Zustand state survives the re-render
  const isOpen = useFilterStore((state) => state.isMobileFilterModalOpen)
  const setIsOpen = useFilterStore((state) => state.setIsMobileFilterModalOpen)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when modal is open + Escape key to close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false)
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, setIsOpen])

  const handleApplyFilters = () => {
    applyFilters()
    setIsOpen(false)
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-primary rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3B3634]">
          <h2 id="mobile-filter-title" className="text-xl font-semibold font-instrument-sans text-black">Filtry</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Zamknij panel filtrów"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                setIsOpen(false)
              }}
              className="w-full py-3 px-4 text-center font-instrument-sans font-medium text-black border border-[#3B3634]  hover:bg-gray-50 transition-colors"
              aria-label="Wyczyść wszystkie filtry"
            >
              Wyczyść wszystkie filtry
            </button>
          )}
          <button
            onClick={handleApplyFilters}
            className="w-full py-3 px-4 bg-[#3B3634] text-white font-instrument-sans font-semibold  hover:bg-opacity-90 transition-colors"
            aria-label="Zastosuj wybrane filtry"
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
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Otwórz panel filtrów"
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200",
          "text-sm font-medium font-instrument-sans",
          hasActiveFilters
            ? "bg-[#3B3634] text-white border-[#3B3634]"
            : "bg-primary text-black border-[#3B3634] hover:border-[#3B3634] hover:shadow-sm"
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Filtry</span>
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 bg-white text-[#3B3634] text-xs font-bold rounded-full" aria-hidden="true">
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
  const pendingSort = useFilterStore((state) => state.pendingSort)
  const setPendingSort = useFilterStore((state) => state.setPendingSort)
  
  // Show current URL sort if no pending sort is set
  const currentUrlSort = searchParams.get("sortBy") || ""
  const displaySort = pendingSort !== null ? pendingSort : currentUrlSort

  const sortOptions = [
    { label: "Domyślne", value: "" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
  ]

  // CRITICAL FIX: Stage sort in pending state instead of applying immediately
  // Sort will be applied when user clicks "Zastosuj" button
  const handleSortChange = (value: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPendingSort(value)
  }

  return (
    <div className="space-y-3">
      <h3 id="mobile-sort-heading" className="font-medium text-black font-instrument-sans text-base">Sortuj według</h3>
      <div className="space-y-1" role="radiogroup" aria-labelledby="mobile-sort-heading">
        {sortOptions.map((option) => (
          <div key={option.value} className="relative">
            <button
              type="button"
              role="radio"
              aria-checked={displaySort === option.value}
              onClick={(e) => handleSortChange(option.value, e)}
              className="w-full flex items-center justify-between py-2.5 px-3 text-left transition-colors cursor-pointer hover:bg-[#3B3634]/5 rounded-lg"
            >
              <span className={cn(
                "text-sm font-instrument-sans select-none",
                displaySort === option.value ? "text-[#3B3634] font-medium" : "text-[#3B3634]/90"
              )}>
                {option.label}
              </span>
              <Check 
                className={cn(
                  "w-4 h-4 text-[#3B3634] transition-opacity duration-150",
                  displaySort === option.value ? "opacity-100" : "opacity-0"
                )}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </button>
            <div className="flex justify-center" aria-hidden="true">
              <div className="w-[99%] h-px bg-[#3B3634]/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
