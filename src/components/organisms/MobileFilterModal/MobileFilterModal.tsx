"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { ColorFilter, SizeFilter, ProductRatingFilter, PriceFilter } from "@/components/cells"
import { CombinedDimensionFilter } from "@/components/cells/CombinedDimensionFilter/CombinedDimensionFilter"
import { useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/stores/filterStore'
import { useApplyFilters } from '@/hooks/useApplyFilters'

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
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const applyFilters = useApplyFilters()
  const { resetPendingFilters } = useFilterStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize pending filters when modal opens
  useEffect(() => {
    if (isOpen) {
      resetPendingFilters()
    }
  }, [isOpen, resetPendingFilters])

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
    setIsOpen(false)
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-primary rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3B3634]">
          <h2 className="text-xl font-semibold font-instrument-sans text-black">Filtry</h2>
          <button
            onClick={() => setIsOpen(false)}
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
                setIsOpen(false)
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
        onClick={() => setIsOpen(true)}
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
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sortBy") || "")

  const sortOptions = [
    { label: "Domyślne", value: "" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
  ]

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-black font-instrument-sans text-base">Sortuj według</h3>
      <div className="space-y-2">
        {sortOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <input
              type="radio"
              name="sort"
              value={option.value}
              checked={selectedSort === option.value}
              onChange={() => setSelectedSort(option.value)}
              className="w-5 h-5 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] focus:ring-2 cursor-pointer"
              style={{ accentColor: '#3B3634' }}
            />
            <span className="text-sm text-black font-instrument-sans select-none">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
