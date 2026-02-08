"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { MobilePromotionsFilterModal } from '@/components/organisms/MobilePromotionsFilterModal/MobilePromotionsFilterModal'
import { CategoryFilter } from '@/components/cells/CategoryFilter'
import { useFilterStore } from '@/stores/filterStore'
import { Check, Search } from 'lucide-react'

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
      const dropdownWidth = 280
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

      {mounted && typeof window !== 'undefined' && isOpen && createPortal(
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
  categoryNames?: { id: string; name: string }[]
}

export const PromotionsFilterBar = ({ 
  className,
  promotionNames = [],
  sellerNames = [],
  campaignNames = [],
  categoryNames = []
}: PromotionsFilterBarProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const updateSearchParams = useUpdateSearchParams()
  const { setPendingCategories } = useFilterStore()
  const [, forceUpdate] = useState({})

  // Flatten the category tree into a Map<id, name> for active filter label lookups
  // categoryNames is a tree structure with nested category_children,
  // so a simple .find() on the top-level array misses child categories
  const flatCategoryMap = React.useMemo(() => {
    const map = new Map<string, string>()
    const flatten = (categories: { id: string; name: string; category_children?: any[] }[]) => {
      categories.forEach(cat => {
        map.set(cat.id, cat.name)
        if (cat.category_children && cat.category_children.length > 0) {
          flatten(cat.category_children)
        }
      })
    }
    flatten(categoryNames)
    return map
  }, [categoryNames])
  
  // Get current filter values from URL
  const promotionParam = searchParams.get("promotion")
  const sellerParam = searchParams.get("seller")
  const campaignParam = searchParams.get("campaign")
  const categoryParam = searchParams.get("category")
  
  // Force re-render when URL params change
  useEffect(() => {
 
    forceUpdate({})
  }, [promotionParam, sellerParam, campaignParam, categoryParam])

  const hasActiveFilters = Boolean(
    promotionParam ||
    sellerParam ||
    campaignParam ||
    categoryParam
  )

  // Build active filters array - directly depends on URL params
  const activeFilters = React.useMemo(() => {
 
    
    const filters = []
    
    if (promotionParam) {
      filters.push({
        key: 'promotion',
        label: `Promocja: ${promotionParam}`,
        onRemove: () => updateSearchParams("promotion", "")
      })
    }
    
    if (sellerParam) {
      const sellerName = sellerNames.find(s => s.id === sellerParam)?.name || sellerParam
      filters.push({
        key: 'seller',
        label: `Sprzedawca: ${sellerName}`,
        onRemove: () => updateSearchParams("seller", "")
      })
    }
    
    if (campaignParam) {
      filters.push({
        key: 'campaign',
        label: `Kampania: ${campaignParam}`,
        onRemove: () => updateSearchParams("campaign", "")
      })
    }
    
    if (categoryParam) {
      const categoryIds = categoryParam.split(',').filter(Boolean)
      categoryIds.forEach(categoryId => {
        const categoryName = flatCategoryMap.get(categoryId) || categoryId
        filters.push({
          key: `category-${categoryId}`,
          label: `Kategoria: ${categoryName}`,
          onRemove: () => {
            const remaining = categoryIds.filter(id => id !== categoryId)
            updateSearchParams("category", remaining.length > 0 ? remaining.join(',') : "")
            setPendingCategories(remaining)
          }
        })
      })
    }
    
   
    return filters
  }, [promotionParam, sellerParam, campaignParam, categoryParam, sellerNames, flatCategoryMap, updateSearchParams, setPendingCategories])

  const handleClearAll = () => {
 
    
    // Clear pending categories state
    setPendingCategories([])
    
    // Navigate to clean URL without any query params using Next.js router
    router.replace(pathname, { scroll: false })
    
   
  }

  return (
    <div className={cn("w-full bg-primary pt-4 px-4 sm:px-6 border-t border-[#3B3634] max-w-[1200px] mx-auto", className)}>
      {/* Mobile */}
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

      {/* Desktop */}
      <div className="hidden md:flex flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-2">
        <SortFilter />
        
        {promotionNames.length > 0 && (
          <PromotionNameFilterDropdown promotionNames={promotionNames} />
        )}
        
        {sellerNames.length > 0 && (
          <SellerFilterDropdown sellerNames={sellerNames} />
        )}
        
        {campaignNames.length > 0 && (
          <CampaignFilterDropdown campaignNames={campaignNames} />
        )}
        
        {categoryNames.length > 0 && (
          <CategoryFilterDropdown categoryNames={categoryNames} />
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
      {(() => {
 
        return activeFilters.length > 0 && (
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
        )
      })()}
    </div>
  )
}

// Reusable filter item component
interface FilterItemProps {
  label: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

const FilterItem = ({ label, isSelected, onClick, disabled }: FilterItemProps) => (
  <div className="relative">
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between py-2.5 text-left transition-colors",
        !disabled && "cursor-pointer hover:bg-[#3B3634]/5"
      )}
    >
      <span className={cn(
        "text-sm font-instrument-sans select-none",
        isSelected ? "text-[#3B3634] font-medium" : "text-[#3B3634]/90"
      )}>
        {label}
      </span>
      <Check 
        className={cn(
          "w-4 h-4 text-[#3B3634] transition-opacity duration-150",
          isSelected ? "opacity-100" : "opacity-0"
        )}
        strokeWidth={2.5} 
      />
    </button>
    {/* Thin centered divider line */}
    <div className="flex justify-center">
      <div className="w-[99%] h-px bg-[#3B3634]/10" />
    </div>
  </div>
)

// Search input component
interface FilterSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

const FilterSearch = ({ value, onChange, placeholder }: FilterSearchProps) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3B3634]/70" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-9 pr-3 py-2.5 border border-[#3B3634]/15 text-sm font-instrument-sans bg-white focus:outline-none focus:border-[#3B3634]/30 transition-colors"
    />
  </div>
)

// Sort Filter
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
      <div className="p-4">
        {sortOptions.map((option) => (
          <FilterItem
            key={option.value}
            label={option.label}
            isSelected={currentSort === option.value}
            onClick={() => updateSearchParams("sortBy", option.value)}
          />
        ))}
      </div>
    </FilterDropdown>
  )
}

// Promotion Filter
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
    <div className="flex flex-col">
      <div className="p-3 border-b border-[#3B3634]/10">
        <FilterSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Szukaj promocji..."
        />
      </div>

      <div className="p-4 max-h-[280px] overflow-y-auto">
        {filteredPromotions.length === 0 ? (
          <p className="text-sm text-[#3B3634]/50 font-instrument-sans text-center py-6 italic">
            Brak wyników
          </p>
        ) : (
          filteredPromotions.map((name) => (
            <FilterItem
              key={name}
              label={name}
              isSelected={currentPromotion === name}
              onClick={() => updateSearchParams("promotion", currentPromotion === name ? "" : name)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Seller Filter
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
    <div className="flex flex-col">
      <div className="p-3 border-b border-[#3B3634]/10">
        <FilterSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Szukaj sprzedawcy..."
        />
      </div>

      <div className="p-4 max-h-[280px] overflow-y-auto">
        {filteredSellers.length === 0 ? (
          <p className="text-sm text-[#3B3634]/50 font-instrument-sans text-center py-6 italic">
            Brak wyników
          </p>
        ) : (
          filteredSellers.map((seller) => (
            <FilterItem
              key={seller.id}
              label={seller.name}
              isSelected={currentSeller === seller.id}
              onClick={() => updateSearchParams("seller", currentSeller === seller.id ? "" : seller.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Campaign Filter
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
    <div className="flex flex-col">
      <div className="p-3 border-b border-[#3B3634]/10">
        <FilterSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Szukaj kampanii..."
        />
      </div>

      <div className="p-4 max-h-[280px] overflow-y-auto">
        {filteredCampaigns.length === 0 ? (
          <p className="text-sm text-[#3B3634] font-instrument-sans text-center py-6 italic">
            Brak wyników
          </p>
        ) : (
          filteredCampaigns.map((name) => (
            <FilterItem
              key={name}
              label={name}
              isSelected={currentCampaign === name}
              onClick={() => updateSearchParams("campaign", currentCampaign === name ? "" : name)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Category Filter
const CategoryFilterDropdown = ({ categoryNames }: { categoryNames: { id: string; name: string }[] }) => {
  const { pendingCategories, setPendingCategories } = useFilterStore()
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  
  const urlCategories = searchParams.get("category")?.split(',').filter(Boolean) || []
  const isActive = urlCategories.length > 0
  
  useEffect(() => {
    setPendingCategories(urlCategories)
  }, [urlCategories.join(','), setPendingCategories])

  const handleCategoryChange = (categoryIds: string[]) => {
    setPendingCategories(categoryIds)
  }

  const handleApply = () => {
    if (pendingCategories.length > 0) {
      updateSearchParams("category", pendingCategories.join(','))
    } else {
      updateSearchParams("category", "")
    }
  }

  return (
    <FilterDropdown 
      label={`Kategoria${isActive ? ` (${urlCategories.length})` : ''}`} 
      isActive={isActive} 
      onApply={handleApply}
    >
      <div className="p-2 max-h-[350px] overflow-y-auto">
        <CategoryFilter
          categories={categoryNames}
          selectedCategories={pendingCategories}
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </FilterDropdown>
  )
}