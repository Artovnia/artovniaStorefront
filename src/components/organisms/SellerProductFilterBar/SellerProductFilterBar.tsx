"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'

interface FilterDropdownProps {
  label: string
  children: React.ReactNode
  isActive?: boolean
  className?: string
}

const FilterDropdown = ({ label, children, isActive, className }: FilterDropdownProps) => {
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
      className="fixed bg-primary border border-[#3B3634] rounded-lg shadow-lg z-[9999] min-w-[250px] max-w-[400px] flex flex-col"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        maxHeight: `calc(100vh - ${dropdownPosition.top}px - 20px)`,
      }}
    >
      <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex-1">
        {React.cloneElement(children as React.ReactElement, { onClose: () => setIsOpen(false) } as any)}
      </div>
      
      <div className=" bg-primary rounded-b-lg">
        <button
          onClick={() => setIsOpen(false)}
          className="w-full bg-[#3B3634] rounded-b-lg text-white py-2 px-4 font-instrument-sans text-sm hover:bg-opacity-90 transition-colors"
        >
          Zapisz
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
  categories?: Array<{ id: string; name: string; handle: string }>
}

export const SellerProductFilterBar = ({ className, categories = [] }: SellerProductFilterBarProps) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  
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
    const activeFilters = getActiveFilters()
    activeFilters.forEach(filter => {
      if (filter.onRemove) {
        filter.onRemove()
      }
    })
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

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
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
      <div className="space-y-2">
        <h4 className="font-medium text-black mb-3 font-instrument-sans">Sortuj według</h4>
        {sortOptions.map((option) => (
          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value={option.value}
              checked={currentSort === option.value}
              onChange={() => updateSearchParams("sortBy", option.value)}
              className="font-instrument-sans focus:ring-primary"
            />
            <span className="text-sm text-black font-instrument-sans">{option.label}</span>
          </label>
        ))}
      </div>
    </FilterDropdown>
  )
}

const CategoryFilter = ({ categories }: { categories: Array<{ id: string; name: string; handle: string }> }) => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || ""

  const isActive = Boolean(currentCategory)
  const currentCategoryName = categories.find(cat => cat.id === currentCategory)?.name || "Wszystkie"

  return (
    <FilterDropdown label={`Kategoria: ${currentCategoryName}`} isActive={isActive}>
      <div className="space-y-2">
        <h4 className="font-medium text-black mb-3 font-instrument-sans">Filtruj według kategorii</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="category"
            value=""
            checked={currentCategory === ""}
            onChange={() => updateSearchParams("category", "")}
            className="font-instrument-sans focus:ring-primary"
          />
          <span className="text-sm text-black font-instrument-sans">Wszystkie kategorie</span>
        </label>
        {categories.map((category) => (
          <label key={category.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value={category.id}
              checked={currentCategory === category.id}
              onChange={() => updateSearchParams("category", category.id)}
              className="font-instrument-sans focus:ring-primary"
            />
            <span className="text-sm text-black font-instrument-sans">{category.name}</span>
          </label>
        ))}
      </div>
    </FilterDropdown>
  )
}
