"use client"

import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useParams } from "next/navigation"
import { useMemo, useCallback } from "react"
import { getCategoryIcon } from "@/components/atoms/icons/subcategories/getCategoryIcon"

interface CategoryNavbarProps {
  categories: HttpTypes.StoreProductCategory[]
  activeCategory: HttpTypes.StoreProductCategory | null
  onClose?: () => void
  onDropdownStateChange?: (activeCategory: HttpTypes.StoreProductCategory | null, isVisible: boolean) => void
}

// Check if the current route handle matches this category or any of its descendants
const isHandleInCategory = (category: HttpTypes.StoreProductCategory, handle: string | string[] | undefined): boolean => {
  if (!handle) return false
  const h = Array.isArray(handle) ? handle[0] : handle
  if (category.handle === h) return true
  if (category.category_children) {
    for (const child of category.category_children) {
      if (isHandleInCategory(child, h)) return true
    }
  }
  return false
}

// Parent Category Item - just the navbar button
const CategoryNavItem = ({ category, isActive, isCurrentRoute, onHover, onClose }: {
  category: HttpTypes.StoreProductCategory
  isActive: boolean
  isCurrentRoute: boolean
  onHover: () => void
  onClose?: () => void
}) => {
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
          "uppercase px-4 py-1 text-lg block whitespace-nowrap font-normal transition-colors",
          "flex items-center",
          "font-instrument-sans",
          isCurrentRoute && "border-b-2 border-[#3B3634]",
          isActive && !isCurrentRoute && "border-b-2 border-[#3B3634]/40",
          !isActive && !isCurrentRoute && "hover:border-b-2 hover:border-[#3B3634]/20"
        )}
      >
        <span>{category.name}</span>
      </Link>
    </div>
  )
}

export const FullWidthDropdown = ({ 
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
  if (children.length === 0) return null

  return (
    <div 
      className={cn(
        "w-full z-50",
        "bg-primary shadow-md",
        "max-h-[400px] overflow-y-auto",
        "font-instrument-sans"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-[1920px] mx-auto px-6 py-5">
        <div className="grid gap-x-6 gap-y-6 grid-cols-[repeat(auto-fit,minmax(180px,max-content))] auto-rows-min w-full">
          {children.map((child, idx) => (
            <div 
              key={child.id} 
              className={cn(
                "space-y-3 pr-4",
                idx !== children.length - 1 && "border-r border-gray-200"
              )}
            >
              <div className="flex gap-2.5">
                {/* Icon column — fixed width, vertically centered to first line of text */}
                {(() => {
                  const Icon = getCategoryIcon(child.handle || "")
                  return Icon ? (
                    <div className="flex-shrink-0 w-5 h-[1.75rem] flex items-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  ) : null
                })()}

                {/* Content column — child name + grandchildren */}
                <div className="space-y-2.5">
                  <Link
                    href={`/categories/${child.handle}`}
                    onClick={handleCategoryClick}
                    className={cn(
                      "block text-lg leading-[1.75rem] font-normal text-black hover:text-primary transition-colors hover:underline uppercase",
                      child.handle === currentCategoryHandle && "text-primary"
                    )}
                  >
                    {child.name}
                  </Link>

                  {child.category_children && child.category_children.length > 0 && (
                    <div className="space-y-2">
                      {child.category_children.map((grandchild) => (
                        <Link
                          key={grandchild.id}
                          href={`/categories/${grandchild.handle}`}
                          onClick={handleCategoryClick}
                          className={cn(
                            "block text-sm text-gray-700 hover:text-primary hover:underline transition-colors",
                            grandchild.handle === currentCategoryHandle && "text-primary font-normal"
                          )}
                        >
                          {grandchild.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const CategoryNavbar = ({ categories, activeCategory, onClose, onDropdownStateChange }: CategoryNavbarProps) => {
  const { category: currentCategoryHandle } = useParams()

  // Process categories to show only top-level categories with proper children
  const topLevelCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return []
    }
    
    // Filter to get only top-level categories (no parent_category_id)
    return categories.filter(cat => {
      const hasNoParentId = !cat.parent_category_id || cat.parent_category_id === null
      const hasNoParentObj = !cat.parent_category || 
                           cat.parent_category === null || 
                           (typeof cat.parent_category === 'object' && !cat.parent_category.id)
      
      return hasNoParentId && hasNoParentObj
    })
  }, [categories])

  const handleCategoryHover = useCallback((category: HttpTypes.StoreProductCategory) => {
    const hasChildren = category.category_children && category.category_children.length > 0
    if (onDropdownStateChange) {
      if (hasChildren) {
        onDropdownStateChange(category, true)
      } else {
        // Close dropdown when hovering a category without children
        onDropdownStateChange(null, false)
      }
    }
  }, [onDropdownStateChange])

  return (
    <nav 
      className={cn(
        "flex md:items-center flex-col md:flex-row relative",
        "font-instrument-sans"
      )}
    >
      {/* All Products Link */}
      <div onMouseEnter={() => onDropdownStateChange?.(null, false)}>
        <Link
          href="/categories"
          onClick={() => onClose?.()}
          className={cn(
            "uppercase flex items-center justify-between text-lg transition-colors",
            "px-4 py-1 font-normal",
            "font-instrument-sans",
            "hover:border-b-2 hover:border-[#3B3634]/40"
          )}
        >
          Wszystkie
        </Link>
      </div>
      
      {/* Parent Category Navigation Items */}
      {topLevelCategories.map((category) => (
        <CategoryNavItem
          key={category.id} 
          category={category}
          isActive={activeCategory?.id === category.id}
          isCurrentRoute={isHandleInCategory(category, currentCategoryHandle)}
          onHover={() => handleCategoryHover(category)}
          onClose={onClose}
        />
      ))}

      {/* Promotions Link - Always at the right */}
      <div className="ml-auto" onMouseEnter={() => onDropdownStateChange?.(null, false)}>
        <Link
          href="/promotions"
          onClick={() => onClose?.()}
          className={cn(
            "uppercase flex items-center justify-between text-lg transition-colors",
            "px-4 py-1 font-normal text-red-600 hover:text-red-700",
            "font-instrument-sans",
            "hover:border-b-2 hover:border-red-600"
          )}
        >
          Promocje
        </Link>
      </div>
    </nav>
  )
}