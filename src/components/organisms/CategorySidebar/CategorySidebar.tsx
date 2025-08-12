"use client"

import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useParams } from "next/navigation"
import { useMemo } from "react"

interface CategorySidebarProps {
  parentCategoryHandle?: string
  className?: string
  categories: HttpTypes.StoreProductCategory[] // Required - no fallback fetching
  currentCategory?: HttpTypes.StoreProductCategory // Current category for header display
}

export const CategorySidebar = ({ 
  parentCategoryHandle,
  className,
  categories,
  currentCategory
}: CategorySidebarProps) => {
  const params = useParams()
  const rawCategoryHandle = params.category
  // Decode URL-encoded category handle (e.g., "sto%C5%82y" → "stoły")
  const currentCategoryHandle = rawCategoryHandle ? decodeURIComponent(rawCategoryHandle as string) : null
  
  // Find the current category from the categories list if not provided
  const resolvedCurrentCategory = useMemo(() => {
    if (currentCategory) {
      return currentCategory
    }
    if (!currentCategoryHandle || !categories) {
      return null
    }
    
    // Simple recursive search through categories
    const findCategoryByHandle = (cats: HttpTypes.StoreProductCategory[], handle: string): HttpTypes.StoreProductCategory | null => {
      for (const cat of cats) {
        if (cat.handle === handle) {
          return cat
        }
        if (cat.category_children && cat.category_children.length > 0) {
          const found = findCategoryByHandle(cat.category_children, handle)
          if (found) return found
        }
      }
      return null
    }
    
    return findCategoryByHandle(categories, currentCategoryHandle as string)
  }, [currentCategory, currentCategoryHandle, categories])
  
  // Process categories for display - always show full tree structure
  const topLevelCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return []
    }
    
    // AGGRESSIVE DEDUPLICATION: Remove any duplicate categories by ID first
    const uniqueCategories = Array.from(
      new Map(categories.map(cat => [cat.id, cat])).values()
    )
    
    // Enhanced parent detection - check both parent_category_id and parent_category object
    const topLevel = uniqueCategories.filter(cat => {
      const hasNoParentId = !cat.parent_category_id || cat.parent_category_id === null
      const hasNoParentObj = !cat.parent_category || 
                           cat.parent_category === null || 
                           (typeof cat.parent_category === 'object' && !cat.parent_category.id)
      
      return hasNoParentId && hasNoParentObj
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 CategorySidebar: ${categories.length} total categories → ${uniqueCategories.length} unique → ${topLevel.length} top-level`);
      
      // Check for duplicates
      const ids = categories.map(c => c.id)
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
      if (duplicateIds.length > 0) {
        console.warn(`⚠️ CategorySidebar: Found duplicate category IDs:`, [...new Set(duplicateIds)]);
      }
    }
    
    return topLevel
  }, [categories])

  return (
    <div className={cn("w-full", className)}>
      {/* Current Category Header */}
      {resolvedCurrentCategory && (
        <div className="mb-6">
          <h1 className="heading-xl uppercase">{resolvedCurrentCategory.name}</h1>
          {resolvedCurrentCategory.description && (
            <p className="text-base-regular text-ui-fg-subtle mb-6">
              {resolvedCurrentCategory.description}
            </p>
          )}
        </div>
      )}

      {/* Category List */}
      <nav className="space-y-1">
        {/* "All Products" link */}
        <Link
          href="/categories"
          className={cn(
            "block px-3 py-2 text-md font-medium font-instrument-sans rounded-md transition-colors",
            !currentCategoryHandle 
              ? "bg-primary text-black underline decoration-1 underline-offset-4" 
              : "text-black hover:bg-gray-100"
          )}
        >
          Wszystkie produkty
        </Link>

        {/* All Top-Level Categories (Full Tree) */}
        {topLevelCategories.map((category: HttpTypes.StoreProductCategory) => (
          <CategorySidebarItem
            key={category.id}
            category={category}
            currentCategoryHandle={currentCategoryHandle as string}
          />
        ))}
      </nav>

      {/* Category Count */}
      {topLevelCategories.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#3B3634]">
          <p className="text-md text-black font-instrument-sans">
            {topLevelCategories.length} {topLevelCategories.length === 1 ? 'kategoria' : 'kategorii'}
          </p>
        </div>
      )}
    </div>
  )
}

interface CategorySidebarItemProps {
  category: HttpTypes.StoreProductCategory
  currentCategoryHandle: string
  level?: number
}

const CategorySidebarItem = ({ 
  category, 
  currentCategoryHandle,
  level = 0 
}: CategorySidebarItemProps) => {
  const hasChildren = category.category_children && category.category_children.length > 0
  const isActive = category.handle === currentCategoryHandle
  const isParentOfActive = category.category_children?.some((child: HttpTypes.StoreProductCategory) => 
    child.handle === currentCategoryHandle
  )

  // Always expand all categories to show full tree structure
  const isExpanded = true // Show full tree by default

 

  return (
    <div>
      <Link
        href={`/categories/${category.handle}`}
        className={cn(
          "flex items-center justify-between px-3 py-2 text-md font-medium font-instrument-sans rounded-md transition-colors group",
          isActive 
            ? "bg-primary text-black underline decoration-1 underline-offset-4" 
            : "text-black hover:bg-gray-100",
          level === 1 && "ml-4",
          level >= 2 && "ml-8"
        )}

      >
        <span className="flex-1">
          {category.name}
        </span>
        
        
      </Link>

      {/* Child Categories */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.category_children?.map((child: HttpTypes.StoreProductCategory) => (
            <CategorySidebarItem
              key={child.id}
              category={child}
              currentCategoryHandle={currentCategoryHandle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
