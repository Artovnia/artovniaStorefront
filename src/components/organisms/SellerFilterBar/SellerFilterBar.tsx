"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { SellerAlphabetFilter } from '@/components/cells/SellerAlphabetFilter/SellerAlphabetFilter'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { MobileSellerFilterModal } from '@/components/organisms/MobileSellerFilterModal/MobileSellerFilterModal'
import { Check } from 'lucide-react'

interface FilterDropdownProps {
  label: string
  children: React.ReactNode
  isActive?: boolean
  className?: string
  onApply?: () => void
}

const FilterDropdown = ({ label, children, isActive, className, onApply }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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
      className="fixed bg-primary border border-[#3B3634]/15 shadow-xl z-[9999] min-w-[260px] max-w-[320px] flex flex-col overflow-hidden"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        maxHeight: `calc(100vh - ${dropdownPosition.top}px - 20px)`,
      }}
    >
      <div className="overflow-y-auto flex-1">
        {React.cloneElement(children as React.ReactElement, { onClose: () => setIsOpen(false) } as any)}
      </div>
      
      <div className="border-t border-[#3B3634]/10 p-3 bg-primary">
        <button
          onClick={() => {
            onApply?.()
            setIsOpen(false)
          }}
          className="w-full bg-[#3B3634] text-white py-2.5 px-4 font-instrument-sans text-sm font-medium hover:bg-[#2a2523] active:scale-[0.98] transition-all duration-200"
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

      {mounted && typeof window !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </div>
  )
}

interface SellerFilterBarProps {
  className?: string
}

export const SellerFilterBar = ({ className }: SellerFilterBarProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const updateSearchParams = useUpdateSearchParams()
  const [, forceUpdate] = useState({})
  
  // Check if any filters are active
  const hasActiveFilters = Boolean(searchParams.get("letter"))

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []
    
    const letter = searchParams.get("letter")
    if (letter) {
      filters.push({
        key: 'letter',
        label: `Litera: ${letter}`,
        onRemove: () => updateSearchParams("letter", "")
      })
    }
    
    return filters
  }

  const handleClearAll = () => {
    console.log('🧹 Clear All clicked - clearing all filters')
    router.replace(pathname, { scroll: false })
    console.log('✅ Router.replace called with clean pathname:', pathname)
  }

  const activeFilters = getActiveFilters()

  return (
    <div className={cn("w-full bg-primary pt-4 px-4 sm:px-6 border-t border-[#3B3634] max-w-[1200px] mx-auto", className)}>
      {/* Mobile: Single "Filtry" Button - Show only on screens < 768px */}
      <div className="md:hidden flex items-center gap-3 mb-4">
        <MobileSellerFilterModal
          hasActiveFilters={hasActiveFilters}
          onClearAll={handleClearAll}
        />
        
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="ml-auto text-sm font-medium text-black underline hover:text-red-600 transition-colors font-instrument-sans"
          >
            Wyczyść
          </button>
        )}
      </div>

      {/* Desktop: Filter Buttons Row - Show only on screens >= 768px */}
      <div className="hidden md:flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
        {/* Sort Filter */}
        <SortFilter />
        
        {/* Alphabet Filter */}
        <AlphabetFilterDropdown />

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="ml-auto px-3 py-1 text-sm font-medium font-instrument-sans text-black underline hover:text-red-600 transition-colors"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pb-4">
          <span className="text-sm text-black font-medium font-instrument-sans mr-2">Aktywne filtry:</span>
          {activeFilters.map((filter) => (
            <div
              key={filter.key}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#3B3634] text-white text-sm rounded-full"
            >
              <span className="font-instrument-sans">{filter.label}</span>
              <button
                onClick={filter.onRemove}
                className="text-white/60 hover:text-white transition-colors"
                aria-label={`Remove ${filter.label} filter`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
    { label: "Domyślne (A-Z)", value: "" },
    { label: "Nazwa: A-Z", value: "name_asc" },
    { label: "Nazwa: Z-A", value: "name_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
  ]

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || "Domyślne (A-Z)"

  return (
    <FilterDropdown label={`Sortuj: ${currentSortLabel}`} isActive={Boolean(currentSort)}>
      <div className="p-4">
        <h4 className="font-medium text-black mb-3 font-instrument-sans text-sm">Sortuj według</h4>
        <div className="space-y-1">
          {sortOptions.map((option) => (
            <div key={option.value} className="relative">
              <button
                type="button"
                onClick={() => updateSearchParams("sortBy", option.value)}
                className="w-full flex items-center justify-between py-2.5 text-left transition-colors cursor-pointer hover:bg-[#3B3634]/5"
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
    </FilterDropdown>
  )
}

// Alphabet Filter Component
const AlphabetFilterDropdown = () => {
  const searchParams = useSearchParams()
  const isActive = Boolean(searchParams.get("letter"))

  return (
    <FilterDropdown label="Filtruj A-Z" isActive={isActive}>
      <SellerAlphabetFilter />
    </FilterDropdown>
  )
}
