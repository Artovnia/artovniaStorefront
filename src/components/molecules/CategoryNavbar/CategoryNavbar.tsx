"use client"

import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useParams } from "next/navigation"
import { useMemo } from "react"

interface CategoryNavbarProps {
  categories: HttpTypes.StoreProductCategory[]
  onClose?: () => void
  onDropdownStateChange?: (activeCategory: HttpTypes.StoreProductCategory | null, isVisible: boolean) => void
  shouldResetDropdown?: boolean
}

interface CategoryDropdownProps {
  category: HttpTypes.StoreProductCategory
  onClose?: () => void
}

// Parent Category Item - just the navbar button

const CategoryNavItem = ({ category, isActive, onHover, onClose }: {
  category: HttpTypes.StoreProductCategory
  isActive: boolean
  onHover: () => void
  onClose?: () => void
}) => {
  const { category: currentCategoryHandle } = useParams()

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
          "flex items-center justify-between my-3 md:my-0",
          category.handle === currentCategoryHandle && "md:border-b-2 md:border-primary text-primary",
          isActive && "bg-primary/5",
          "font-['Instrument_Sans']"
        )}
      >
        <span className="flex items-center justify-between w-full">
          {category.name}
        </span>
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
      <div className="max-w-[768px] justify-start mx-auto p-6">
        {/* Multi-column Grid Layout - Centered and Compact */}
        <div className={cn(
          "grid gap-6 justify-start",
          children.length === 1 && "grid-cols-1 max-w-xs mx-auto",
          children.length === 2 && "grid-cols-2 max-w-lg mx-auto", 
          children.length === 3 && "grid-cols-3 max-w-3xl mx-auto",
          children.length >= 4 && "grid-cols-4 max-w-4xl mx-auto"
        )}>
          {children.map((child: HttpTypes.StoreProductCategory) => (
            <div key={child.id} className="space-y-3">
              {/* Child Category Header (Semibold) */}
              <Link
                href={`/categories/${child.handle}`}
                onClick={handleCategoryClick}
                className={cn(
                  "block text-lg font-semibold text-black hover:text-primary transition-colors hover:underline ",
                  child.handle === currentCategoryHandle && "text-primary"
                )}
              >
                {child.name}
              </Link>
              
              {/* Grandchildren List */}
              {child.category_children && child.category_children.length > 0 && (
                <div className="space-y-2">
                  {child.category_children.map((grandchild: HttpTypes.StoreProductCategory) => (
                    <Link
                      key={grandchild.id}
                      href={`/categories/${grandchild.handle}`}
                      onClick={handleCategoryClick}
                      className={cn(
                        "block text-sm font-normal text-black hover:text-gray-900 hover:underline transition-colors capitalize",
                        grandchild.handle === currentCategoryHandle && "text-primary font-medium"
                      )}
                    >
                      {grandchild.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const CategoryNavbar = ({ categories, onClose, onDropdownStateChange }: CategoryNavbarProps) => {

  // Process categories to show only top-level categories with proper children
  const topLevelCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return []
    }
    
    // Filter to get only top-level categories (no parent_category_id)
    const topLevel = categories.filter(cat => {
      const hasNoParentId = !cat.parent_category_id || cat.parent_category_id === null
      const hasNoParentObj = !cat.parent_category || 
                           cat.parent_category === null || 
                           (typeof cat.parent_category === 'object' && !cat.parent_category.id)
      
      return hasNoParentId && hasNoParentObj
    })
    
    
    
    return topLevel
  }, [categories])

  const handleCategoryHover = (category: HttpTypes.StoreProductCategory) => {
    const hasChildren = category.category_children && category.category_children.length > 0
    if (hasChildren && onDropdownStateChange) {
      onDropdownStateChange(category, true)
    }
  }



  return (
    <nav 
      className={cn(
        "flex md:items-center flex-col md:flex-row relative",
        "font-['Instrument_Sans']"
      )}
    >
      {/* All Products Link */}
      <Link
        href="/categories"
        onClick={() => onClose?.()}
        className={cn(
          "uppercase my-3 md:my-0 flex items-center justify-between text-lg hover:bg-primary/10 transition-colors mr-2",
          "px-4 py-2 font-medium",
          "font-['Instrument_Sans']"
        )}
      >
        Wszystkie produkty
      </Link>
      
      {/* Parent Category Navigation Items */}
      {topLevelCategories.map((category) => (
        <CategoryNavItem
          key={category.id} 
          category={category}
          isActive={false} // Simplified - no active state tracking in CategoryNavbar
          onHover={() => handleCategoryHover(category)}
          onClose={onClose}
        />
      ))}

      {/* Dropdown is now handled at the Navbar level */}
    </nav>
  )
}