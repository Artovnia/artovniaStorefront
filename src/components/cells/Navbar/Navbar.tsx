"use client"

import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"
import { FullWidthDropdown } from "@/components/molecules/CategoryNavbar/CategoryNavbar"
import { useState } from "react"

export const Navbar = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  const [dropdownActiveCategory, setDropdownActiveCategory] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleDropdownStateChange = (activeCategory: HttpTypes.StoreProductCategory | null, isVisible: boolean) => {
    setDropdownActiveCategory(activeCategory)
    setIsDropdownVisible(isVisible)
  }

  const handleDropdownMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }

  const handleDropdownMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownVisible(false)
      setDropdownActiveCategory(null)
    }, 200)
    setHoverTimeout(timeout)
  }

  return (
    <div className="w-full border ring-1 ring-[#BFB7AD] relative">
      <div className="flex py-4 justify-between max-w-[1920px] mx-auto">
        <div className="hidden md:flex w-full">
          <CategoryNavbar 
            categories={categories} 
            onDropdownStateChange={handleDropdownStateChange}
          />
        </div>

        <div className="px-0">
          <NavbarSearch />
        </div>
      </div>
      
      {/* Full-Width Dropdown at Navbar level */}
      {isDropdownVisible && (
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
      )}
    </div>
  )
}
