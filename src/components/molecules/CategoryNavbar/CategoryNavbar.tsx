"use client"

import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useParams } from "next/navigation"
import { useMemo } from "react"
// TODO: Re-enable category icons later
// import { getCategoryIcon } from '@/const/category-icons'

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
  // Main categories don't have icons

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
          "flex items-center my-3 md:my-0",
          category.handle === currentCategoryHandle && "md:border-b-2 md:border-primary text-primary",
          isActive && "bg-primary/5",
          "font-['Instrument_Sans']"
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
    {children.map((child, idx) => (
      <div 
        key={child.id} 
        className={cn(
          "space-y-4 pr-4",
          idx !== children.length - 1 && "border-r border-gray-200"
        )}
      >
        <Link
          href={`/categories/${child.handle}`}
          onClick={handleCategoryClick}
          className={cn(
            "flex items-center gap-2 text-lg font-semibold text-black hover:text-primary transition-colors hover:underline uppercase",
            child.handle === currentCategoryHandle && "text-primary"
          )}
        >
          {/* TODO: Re-enable category icons later */}
          {/* {(() => {
            const IconComponent = getCategoryIcon(child.handle || '')
            console.log('Category handle:', child.handle, 'Icon:', IconComponent ? 'Found' : 'Not found')
            return IconComponent ? <IconComponent className="w-5 h-5 flex-shrink-0" /> : null
          })()} */}
          <span>{child.name}</span>
        </Link>

        {child.category_children?.length > 0 && (
          <div className="space-y-2">
            {child.category_children.map((grandchild) => (
              <Link
                key={grandchild.id}
                href={`/categories/${grandchild.handle}`}
                onClick={handleCategoryClick}
                className={cn(
                  "block text-sm text-gray-700 hover:text-primary hover:underline transition-colors capitalize",
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

      {/* Promotions Link - Always at the right */}
      <Link
        href="/promotions"
        onClick={() => onClose?.()}
        className={cn(
          "uppercase my-3 md:my-0 flex items-center justify-between text-lg hover:bg-red-50 transition-colors ml-auto",
          "px-4 py-2 font-medium text-red-600 hover:text-red-700",
          "font-['Instrument_Sans']"
        )}
      >
        Promocje
      </Link>

      {/* Dropdown is now handled at the Navbar level */}
    </nav>
  )
}