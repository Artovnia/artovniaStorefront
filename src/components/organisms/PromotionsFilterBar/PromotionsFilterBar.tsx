"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { MobilePromotionsFilterModal } from '@/components/organisms/MobilePromotionsFilterModal/MobilePromotionsFilterModal'

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

      {/* Dropdown - rendered via portal to escape overflow container */}
      {mounted && typeof window !== 'undefined' && isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed bg-primary border border-[#3B3634] rounded-lg shadow-lg z-[9999] min-w-[250px] max-w-[400px] flex flex-col"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            maxHeight: `calc(100vh - ${dropdownPosition.top}px - 20px)`, // Dynamic max height to prevent overflow
          }}
        >
          {/* Scrollable content area */}
          <div className="p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex-1">
            {React.cloneElement(children as React.ReactElement, { onClose: () => setIsOpen(false) } as any)}
          </div>
          
          {/* Fixed button area */}
          <div className="border-t border-[#3B3634] bg-primary rounded-b-lg">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#3B3634] rounded-b-lg text-white py-2 px-4 font-instrument-sans text-sm hover:bg-opacity-90 transition-colors"
            >
              Zapisz
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

interface PromotionsFilterBarProps {
  className?: string
  promotionNames?: string[]
  sellerNames?: { id: string; name: string }[]
  campaignNames?: string[]
}

export const PromotionsFilterBar = ({ 
  className,
  promotionNames = [],
  sellerNames = [],
  campaignNames = []
}: PromotionsFilterBarProps) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  
  // Check if any filters are active
  const hasActiveFilters = Boolean(
    searchParams.get("promotion") ||
    searchParams.get("seller") ||
    searchParams.get("campaign")
  )

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []
    
    const promotion = searchParams.get("promotion")
    if (promotion) {
      filters.push({
        key: 'promotion',
        label: `Promocja: ${promotion}`,
        onRemove: () => updateSearchParams("promotion", "")
      })
    }
    
    const seller = searchParams.get("seller")
    if (seller) {
      const sellerName = sellerNames.find(s => s.id === seller)?.name || seller
      filters.push({
        key: 'seller',
        label: `Sprzedawca: ${sellerName}`,
        onRemove: () => updateSearchParams("seller", "")
      })
    }
    
    const campaign = searchParams.get("campaign")
    if (campaign) {
      filters.push({
        key: 'campaign',
        label: `Kampania: ${campaign}`,
        onRemove: () => updateSearchParams("campaign", "")
      })
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
    <div className={cn("w-full bg-primary pt-4 px-4 sm:px-6 border-t border-[#3B3634] max-w-[1200px] mx-auto", className)}>
      {/* Mobile: Single "Filtry" Button - Show only on screens < 768px */}
      <div className="md:hidden flex items-center gap-3 mb-4">
        <MobilePromotionsFilterModal
          promotionNames={promotionNames}
          sellerNames={sellerNames}
          campaignNames={campaignNames}
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
      <div className="hidden md:flex flex-wrap items-center gap-2 sm:gap-3  overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
        {/* Sort Filter */}
        <SortFilter />
        
        {/* Promotion Name Filter */}
        {promotionNames.length > 0 && (
          <PromotionNameFilterDropdown promotionNames={promotionNames} />
        )}
        
        {/* Seller Filter */}
        {sellerNames.length > 0 && (
          <SellerFilterDropdown sellerNames={sellerNames} />
        )}
        
        {/* Campaign Filter */}
        {campaignNames.length > 0 && (
          <CampaignFilterDropdown campaignNames={campaignNames} />
        )}

        {/* Clear All Filters */}
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
const SortFilter = () => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sortBy") || ""

  const sortOptions = [
    { label: "Domyślne", value: "" },
    { label: "Największa zniżka", value: "discount_desc" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
  ]

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || "Domyślne"

  return (
    <FilterDropdown label={`Sortuj: ${currentSortLabel}`} isActive={Boolean(currentSort)}>
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

// Promotion Name Filter Component
const PromotionNameFilterDropdown = ({ promotionNames }: { promotionNames: string[] }) => {
  const searchParams = useSearchParams()
  const isActive = Boolean(searchParams.get("promotion"))

  return (
    <FilterDropdown label="Promocja" isActive={isActive}>
      <PromotionNameFilter promotionNames={promotionNames} />
    </FilterDropdown>
  )
}

const PromotionNameFilter = ({ promotionNames }: { promotionNames: string[] }) => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const currentPromotion = searchParams.get("promotion") || ""
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPromotions = promotionNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-black mb-3 font-instrument-sans">Wybierz promocję</h4>
      
      {/* Search input */}
      <input
        type="text"
        placeholder="Szukaj promocji..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-[#3B3634] rounded-md text-sm font-instrument-sans focus:outline-none focus:ring-2 focus:ring-[#3B3634]"
      />

      {/* Promotion list */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {filteredPromotions.length === 0 ? (
          <p className="text-sm text-gray-500 font-instrument-sans text-center py-2">
            Brak wyników
          </p>
        ) : (
          filteredPromotions.map((name) => (
            <label key={name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="radio"
                name="promotion"
                value={name}
                checked={currentPromotion === name}
                onChange={() => updateSearchParams("promotion", name)}
                className="w-4 h-4 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] cursor-pointer"
                style={{ accentColor: '#3B3634' }}
              />
              <span className="text-sm text-black font-instrument-sans select-none">{name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

// Seller Filter Component
const SellerFilterDropdown = ({ sellerNames }: { sellerNames: { id: string; name: string }[] }) => {
  const searchParams = useSearchParams()
  const isActive = Boolean(searchParams.get("seller"))

  return (
    <FilterDropdown label="Sprzedawca" isActive={isActive}>
      <SellerFilter sellerNames={sellerNames} />
    </FilterDropdown>
  )
}

const SellerFilter = ({ sellerNames }: { sellerNames: { id: string; name: string }[] }) => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const currentSeller = searchParams.get("seller") || ""
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSellers = sellerNames.filter(seller =>
    seller.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-black mb-3 font-instrument-sans">Wybierz sprzedawcę</h4>
      
      {/* Search input */}
      <input
        type="text"
        placeholder="Szukaj sprzedawcy..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-[#3B3634] rounded-md text-sm font-instrument-sans focus:outline-none focus:ring-2 focus:ring-[#3B3634]"
      />

      {/* Seller list */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {filteredSellers.length === 0 ? (
          <p className="text-sm text-gray-500 font-instrument-sans text-center py-2">
            Brak wyników
          </p>
        ) : (
          filteredSellers.map((seller) => (
            <label key={seller.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="radio"
                name="seller"
                value={seller.id}
                checked={currentSeller === seller.id}
                onChange={() => updateSearchParams("seller", seller.id)}
                className="w-4 h-4 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] cursor-pointer"
                style={{ accentColor: '#3B3634' }}
              />
              <span className="text-sm text-black font-instrument-sans select-none">{seller.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}

// Campaign Filter Component
const CampaignFilterDropdown = ({ campaignNames }: { campaignNames: string[] }) => {
  const searchParams = useSearchParams()
  const isActive = Boolean(searchParams.get("campaign"))

  return (
    <FilterDropdown label="Kampania" isActive={isActive}>
      <CampaignFilter campaignNames={campaignNames} />
    </FilterDropdown>
  )
}

const CampaignFilter = ({ campaignNames }: { campaignNames: string[] }) => {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const currentCampaign = searchParams.get("campaign") || ""
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCampaigns = campaignNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-black mb-3 font-instrument-sans">Wybierz kampanię</h4>
      
      {/* Search input */}
      <input
        type="text"
        placeholder="Szukaj kampanii..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-[#3B3634] rounded-md text-sm font-instrument-sans focus:outline-none focus:ring-2 focus:ring-[#3B3634]"
      />

      {/* Campaign list */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {filteredCampaigns.length === 0 ? (
          <p className="text-sm text-gray-500 font-instrument-sans text-center py-2">
            Brak wyników
          </p>
        ) : (
          filteredCampaigns.map((name) => (
            <label key={name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
              <input
                type="radio"
                name="campaign"
                value={name}
                checked={currentCampaign === name}
                onChange={() => updateSearchParams("campaign", name)}
                className="w-4 h-4 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] cursor-pointer"
                style={{ accentColor: '#3B3634' }}
              />
              <span className="text-sm text-black font-instrument-sans select-none">{name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}