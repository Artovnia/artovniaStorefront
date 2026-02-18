"use client"

import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"
import { MobileProductSearch } from "@/components/molecules/MobileProductSearch"
import { FullWidthDropdown } from "@/components/molecules/CategoryNavbar/CategoryNavbar"
import { useState, useRef, useCallback } from "react"
import { mockCategoryData } from "@/components/molecules/CategoryNavbar/mockCategoryData"

const USE_MOCK_DATA = false

export const Navbar = ({
  categories: propCategories,
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const [dropdownActiveCategory, setDropdownActiveCategory] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const categories = USE_MOCK_DATA ? mockCategoryData : (propCategories || [])

  // Cancel any pending close timeout
  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  // Schedule dropdown close with delay
  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownVisible(false)
      setDropdownActiveCategory(null)
    }, 250)
  }, [cancelClose])

  // Called by CategoryNavbar when hovering parent items
  const handleDropdownStateChange = useCallback((activeCategory: HttpTypes.StoreProductCategory | null, isVisible: boolean) => {
    cancelClose()
    if (activeCategory && isVisible) {
      setDropdownActiveCategory(activeCategory)
      setIsDropdownVisible(true)
    } else {
      // Category without children hovered — close dropdown
      setIsDropdownVisible(false)
      setDropdownActiveCategory(null)
    }
  }, [cancelClose])

  // Mouse enters the dropdown panel — keep it open
  const handleDropdownMouseEnter = useCallback(() => {
    cancelClose()
  }, [cancelClose])

  // Mouse leaves the dropdown panel — schedule close
  const handleDropdownMouseLeave = useCallback(() => {
    scheduleClose()
  }, [scheduleClose])

  // Mouse leaves the entire navbar container — schedule close
  const handleNavbarMouseLeave = useCallback(() => {
    scheduleClose()
  }, [scheduleClose])

  // Immediate close (e.g. clicking a link)
  const handleClose = useCallback(() => {
    cancelClose()
    setIsDropdownVisible(false)
    setDropdownActiveCategory(null)
  }, [cancelClose])

  return (
    <>
      {/* Mobile Search - Only visible on mobile, hidden on desktop */}
      <div className="xl:hidden">
        <MobileProductSearch />
      </div>

      {/* Desktop Navbar */}
      <div 
        className="hidden xl:block w-full bg-primary relative border-t border-[#BFB7AD]/50"
        role="navigation"
        onMouseLeave={handleNavbarMouseLeave}
        aria-label="Nawigacja po kategoriach"
      >
        <div className="flex py-2  justify-between max-w-[1920px] mx-auto">
          <div className="hidden xl:flex w-full">
            <CategoryNavbar 
              categories={categories}
              activeCategory={dropdownActiveCategory}
              onDropdownStateChange={handleDropdownStateChange}
            />
          </div>

          <div className="hidden xl:flex mr-4">
            <NavbarSearch />
          </div>
        </div>
      
        {/* Full-Width Dropdown at Navbar level - Positioned absolutely to overlay */}
        {isDropdownVisible && dropdownActiveCategory && (
          <div 
            className="absolute left-0 right-0 top-full w-full z-40"
            role="region"
            aria-label={`Podkategorie: ${dropdownActiveCategory?.name || ''}`}
            onMouseEnter={handleDropdownMouseEnter}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <FullWidthDropdown
              activeCategory={dropdownActiveCategory}
              isVisible={isDropdownVisible}
              onClose={handleClose}
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            />
          </div>
        )}
      </div>
    </>
  )
}
