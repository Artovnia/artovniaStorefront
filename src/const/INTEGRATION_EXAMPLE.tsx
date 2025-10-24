/**
 * EXAMPLE: How to integrate category icons into CategoryNavbar
 * 
 * This file shows the changes needed to add icons to your navbar.
 * Copy the relevant parts to your actual CategoryNavbar.tsx file.
 */

"use client"

import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { getCategoryIcon, NAVBAR_ICON_CONFIG } from '@/const/category-icons'

// ============================================
// EXAMPLE 1: CategoryNavItem with Icon
// ============================================

const CategoryNavItemWithIcon = ({ category, isActive, onHover, onClose }: {
  category: HttpTypes.StoreProductCategory
  isActive: boolean
  onHover: () => void
  onClose?: () => void
}) => {
  const { category: currentCategoryHandle } = useParams()
  const IconComponent = getCategoryIcon(category.handle || '')

  const handleCategoryClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div onMouseEnter={onHover}>
      <Link
        href={`/categories/${category.handle}`}
        onClick={handleCategoryClick}
        className={cn(
          "uppercase px-4 py-2 hover:bg-primary/10 transition-colors text-lg block whitespace-nowrap font-medium",
          "flex items-center gap-2 my-3 md:my-0", // Added gap-2 for icon spacing
          category.handle === currentCategoryHandle && "md:border-b-2 md:border-primary text-primary",
          isActive && "bg-primary/5",
          "font-['Instrument_Sans']"
        )}
      >
        {/* Icon before text */}
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        <span className="flex items-center justify-between flex-1">
          {category.name}
        </span>
      </Link>
    </div>
  )
}

// ============================================
// EXAMPLE 2: FullWidthDropdown with Icons
// ============================================

export const FullWidthDropdownWithIcons = ({ 
  activeCategory, 
  isVisible, 
  onClose,
  onMouseEnter,
  onMouseLeave 
}: {
  activeCategory: HttpTypes.StoreProductCategory | null
  isVisible: boolean
  onClose?: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) => {
  const { category: currentCategoryHandle } = useParams()

  const handleCategoryClick = () => {
    if (onClose) {
      onClose()
    }
  }

  if (!isVisible || !activeCategory) return null

  const children = activeCategory.category_children || []

  return (
    <div 
      className={cn(
        "w-full z-50",
        "bg-primary border-t border-[#3B3634] shadow-lg ring-1 ring-[#BFB7AD]",
        "max-h-[400px] overflow-y-auto",
        "font-['Instrument_Sans']"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid gap-x-6 gap-y-6 grid-cols-[repeat(auto-fit,minmax(180px,max-content))] auto-rows-min w-full">
          {children.map((child, idx) => {
            const IconComponent = getCategoryIcon(child.handle || '')
            
            return (
              <div 
                key={child.id} 
                className={cn(
                  "space-y-4 pr-4",
                  idx !== children.length - 1 && "border-r border-gray-200"
                )}
              >
                {/* Parent subcategory with icon */}
                <Link
                  href={`/categories/${child.handle}`}
                  onClick={handleCategoryClick}
                  className={cn(
                    "flex items-center gap-2 text-lg font-semibold text-black hover:text-primary transition-colors hover:underline uppercase",
                    child.handle === currentCategoryHandle && "text-primary"
                  )}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span>{child.name}</span>
                </Link>

                {/* Grandchildren without icons (optional: add icons here too) */}
                {child.category_children?.length > 0 && (
                  <div className="space-y-2">
                    {child.category_children.map((grandchild) => (
                      <Link
                        key={grandchild.id}
                        href={`/categories/${grandchild.handle}`}
                        onClick={handleCategoryClick}
                        className={cn(
                          "block text-sm text-gray-700 hover:text-primary hover:underline transition-colors capitalize pl-7", // pl-7 to align with parent text
                          grandchild.handle === currentCategoryHandle && "text-primary font-medium"
                        )}
                      >
                        {grandchild.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================
// EXAMPLE 3: Alternative - Icons only on hover
// ============================================

const CategoryNavItemHoverIcon = ({ category, isActive, onHover, onClose }: {
  category: HttpTypes.StoreProductCategory
  isActive: boolean
  onHover: () => void
  onClose?: () => void
}) => {
  const { category: currentCategoryHandle } = useParams()
  const IconComponent = getCategoryIcon(category.handle || '')

  return (
    <div onMouseEnter={onHover} className="group">
      <Link
        href={`/categories/${category.handle}`}
        onClick={() => onClose?.()}
        className={cn(
          "uppercase px-4 py-2 hover:bg-primary/10 transition-colors text-lg block whitespace-nowrap font-medium",
          "flex items-center gap-2 my-3 md:my-0",
          category.handle === currentCategoryHandle && "md:border-b-2 md:border-primary text-primary",
          isActive && "bg-primary/5",
          "font-['Instrument_Sans']"
        )}
      >
        {/* Icon appears on hover */}
        <IconComponent className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        <span>{category.name}</span>
      </Link>
    </div>
  )
}

// ============================================
// EXAMPLE 4: Icons with different sizes per level
// ============================================

const MultiLevelIconExample = ({ category }: { category: HttpTypes.StoreProductCategory }) => {
  const MainIcon = getCategoryIcon(category.handle || '')
  
  return (
    <div className="space-y-4">
      {/* Main category - Large icon */}
      <div className="flex items-center gap-3">
        <MainIcon className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">{category.name}</h2>
      </div>
      
      {/* Subcategories - Medium icon */}
      {category.category_children?.map((child) => {
        const ChildIcon = getCategoryIcon(child.handle || '')
        return (
          <div key={child.id} className="flex items-center gap-2 pl-4">
            <ChildIcon className="w-5 h-5 text-gray-600" />
            <span className="text-lg">{child.name}</span>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// EXAMPLE 5: Conditional icon rendering
// ============================================

import { hasCategoryIcon } from '@/const/category-icons'

const ConditionalIconExample = ({ category }: { category: HttpTypes.StoreProductCategory }) => {
  const IconComponent = getCategoryIcon(category.handle || '')
  const hasIcon = hasCategoryIcon(category.handle || '')
  
  return (
    <Link href={`/categories/${category.handle}`} className="flex items-center gap-2">
      {hasIcon && <IconComponent className="w-5 h-5" />}
      <span>{category.name}</span>
    </Link>
  )
}

export {
  CategoryNavItemWithIcon,
  CategoryNavItemHoverIcon,
  MultiLevelIconExample,
  ConditionalIconExample,
}
