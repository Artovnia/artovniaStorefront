"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { CategoryFilter as CategoryFilterComponent } from '@/components/cells/CategoryFilter'
import { useFilterStore } from '@/stores/filterStore'
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

  const updatePosition = useCallback(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 300
      const screenWidth = window.innerWidth
      const spaceOnRight = screenWidth - rect.right
      
      const shouldAlignRight = spaceOnRight < dropdownWidth && rect.left > dropdownWidth
      
      setDropdownPosition({
        top: rect.bottom + 8,
        left: shouldAlignRight ? rect.right - dropdownWidth : rect.left,
        right: window.innerWidth - rect.right
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen, updatePosition])

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

interface SellerProductFilterBarProps {
  className?: string
  categories?: any[]
}

export const SellerProductFilterBar = ({ className, categories = [] }: SellerProductFilterBarProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const updateSearchParams = useUpdateSearchParams()
  const { setPendingCategories } = useFilterStore()
  const [, forceUpdate] = useState({})
  
  const hasActiveFilters = Boolean(
    searchParams.get("sortBy") || 
    searchParams.get("category")
  )

  const getActiveFilters = () => {
    const filters = []
    
    const sortBy = searchParams.get("sortBy")
    if (sortBy) {
      const sortOptions = [
        { label: "Najnowsze", value: "created_at_desc" },
        { label: "Najstarsze", value: "created_at_asc" },
        { label: "Cena: Niska do wysokiej", value: "price_asc" },
        { label: "Cena: Wysoka do niskiej", value: "price_desc" },
      ]
      const sortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || sortBy
      filters.push({
        key: 'sortBy',
        label: `Sortowanie: ${sortLabel}`,
        onRemove: () => updateSearchParams("sortBy", "")
      })
    }
    
    const categoryId = searchParams.get("category")
    if (categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === categoryId)
      if (category) {
        filters.push({
          key: 'category',
          label: `Kategoria: ${category.name}`,
          onRemove: () => updateSearchParams("category", "")
        })
      }
    }
    
    return filters
  }

  const handleClearAll = () => {
    setPendingCategories([])
    router.replace(pathname, { scroll: false })
  }

  const activeFilters = getActiveFilters()

  return (
    <div className={cn("w-full bg-primary pt-4 px-4 sm:px-6  max-w-[1200px] mx-auto", className)}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
        <SortFilter />
        
        {categories.length > 0 && (
          <CategoryFilter categories={categories} />
        )}

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

const SortFilter = () => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sortBy") || ""

  const sortOptions = [
    { label: "Domyślne (Najnowsze)", value: "" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
  ]

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || "Domyślne (Najnowsze)"

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

const CategoryFilter = ({ categories }: { categories: any[] }) => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const { pendingCategories, setPendingCategories } = useFilterStore()
  const currentCategory = searchParams.get("category") || ""
  const selectedCategories = currentCategory ? currentCategory.split(',').filter(Boolean) : []

  const isActive = Boolean(currentCategory)
  const categoryCount = selectedCategories.length
  const label = categoryCount > 0 ? `Kategoria (${categoryCount})` : "Kategoria"

  const handleCategoryChange = (categoryIds: string[]) => {
    setPendingCategories(categoryIds)
  }

  const handleApply = () => {
    updateSearchParams("category", pendingCategories.length > 0 ? pendingCategories.join(',') : "")
  }

  return (
    <FilterDropdown label={label} isActive={isActive} onApply={handleApply}>
      <div className="p-4">
        <h4 className="font-medium text-black mb-3 font-instrument-sans text-sm">Kategorie</h4>
        <CategoryFilterComponent
          categories={categories}
          selectedCategories={pendingCategories.length > 0 ? pendingCategories : selectedCategories}
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </FilterDropdown>
  )
}
