"use client"

import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"
import { FullWidthDropdown } from "@/components/molecules/CategoryNavbar/CategoryNavbar"
import { useState, useEffect } from "react"
import { getTopLevelCategories } from "@/components/molecules/CategoryNavbar/mockCategoryData"
import { CountrySelector } from "@/components/cells/CountrySelector/CountrySelector"

// Set to true to force using mock data for development
const USE_MOCK_DATA = false

export const Navbar = ({
  categories: propCategories,
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const [dropdownActiveCategory, setDropdownActiveCategory] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([])
  
  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Always use mock data when USE_MOCK_DATA is true
      const mockCategories = getTopLevelCategories();
     
      setCategories(mockCategories);
      
      // For testing - show first category dropdown automatically
      if (mockCategories.length > 0) {
        setTimeout(() => {
          setDropdownActiveCategory(mockCategories[0])
          setIsDropdownVisible(true)
        }, 1000)
      }
    } else if (propCategories && propCategories.length > 0) {
      // Use provided categories if available and not in mock mode
      setCategories(propCategories);
    } else {
      // Fallback to mock data if no categories provided
      const mockCategories = getTopLevelCategories();
      setCategories(mockCategories);
    }
  }, [propCategories])

  const handleDropdownStateChange = (activeCategory: HttpTypes.StoreProductCategory | null, isVisible: boolean) => {
    setDropdownActiveCategory(activeCategory)
    setIsDropdownVisible(isVisible)
  }

  const handleDropdownMouseEnter = () => {
    // Clear any pending timeouts to prevent dropdown from closing
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    
    // Ensure dropdown remains visible
    if (!isDropdownVisible && dropdownActiveCategory) {
      setIsDropdownVisible(true)
    }
  }

  const handleDropdownMouseLeave = () => {
    // Set a timeout before closing the dropdown to allow moving between items
    const timeout = setTimeout(() => {
      setIsDropdownVisible(false)
      setDropdownActiveCategory(null)
    }, 300) // Slightly increased timeout for better UX
    setHoverTimeout(timeout)
  }

  return (
    <div 
      className="hidden md:block w-full border ring-1 ring-[#BFB7AD] bg-primary relative"
      onMouseLeave={handleDropdownMouseLeave}
      aria-label="Main navigation bar with categories"
    >
      <div className="flex py-4 justify-between max-w-[1920px] mx-auto">
        <div className="hidden md:flex w-full">
          <CategoryNavbar 
            categories={categories} 
            onDropdownStateChange={handleDropdownStateChange}
          />
        </div>

        <div className="hidden md:flex px-0 mr-4">
          <NavbarSearch />
        </div>
      </div>
      
      {/* Full-Width Dropdown at Navbar level - Positioned absolutely to overlay */}
      {isDropdownVisible && dropdownActiveCategory && (
        <div 
          className="absolute left-0 right-0 top-full w-full z-40 bg-primary shadow-lg"
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          <FullWidthDropdown
            activeCategory={dropdownActiveCategory}
            isVisible={isDropdownVisible}
            onClose={() => {
              setIsDropdownVisible(false)
              setDropdownActiveCategory(null)
            }}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          />
        </div>
      )}
    </div>
  )
}
