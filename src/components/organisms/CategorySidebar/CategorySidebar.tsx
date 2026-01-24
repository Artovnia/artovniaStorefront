"use client"

import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useParams, useSearchParams } from "next/navigation"
import { useMemo } from "react"

interface CategorySidebarProps {
  parentCategoryHandle?: string
  className?: string
  categories: HttpTypes.StoreProductCategory[] // Required - no fallback fetching
  currentCategory?: HttpTypes.StoreProductCategory // Current category for header display
  resultsCount?: number // Number of products found in search results
}

export const CategorySidebar = ({ 
  parentCategoryHandle,
  className,
  categories,
  currentCategory,
  resultsCount
}: CategorySidebarProps) => {
  const params = useParams()
  const searchParams = useSearchParams()
  const rawCategoryHandle = params.category
  // Decode URL-encoded category handle (e.g., "sto%C5%82y" → "stoły")
  const currentCategoryHandle = rawCategoryHandle ? decodeURIComponent(rawCategoryHandle as string) : null
  
  // Helper function to preserve existing filters when switching categories
  const buildCategoryUrl = (categoryHandle: string) => {
    const baseUrl = categoryHandle ? `/categories/${categoryHandle}` : '/categories'
    const currentFilters = searchParams.toString()
    return currentFilters ? `${baseUrl}?${currentFilters}` : baseUrl
  }
  
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
  
  // Find the current parent category and its tree
  const currentParentCategoryTree = useMemo(() => {
    if (!categories || categories.length === 0) {
      console.log('🔍 CategorySidebar: No categories provided')
      return null
    }
    
    // Remove any duplicate categories by ID first
    const uniqueCategories = Array.from(
      new Map(categories.map(cat => [cat.id, cat])).values()
    )
    
    // Get all top-level categories
    const topLevel = uniqueCategories.filter(cat => {
      const hasNoParentId = !cat.parent_category_id || cat.parent_category_id === null
      const hasNoParentObj = !cat.parent_category || 
                           cat.parent_category === null || 
                           (typeof cat.parent_category === 'object' && !cat.parent_category.id)
      
      return hasNoParentId && hasNoParentObj
    })
    
    console.log('🔍 CategorySidebar Debug:', {
      currentCategoryHandle,
      totalCategories: categories.length,
      topLevelCount: topLevel.length,
      topLevelNames: topLevel.map(c => c.name),
      topLevelWithChildren: topLevel.map(c => ({ 
        name: c.name, 
        handle: c.handle,
        childrenCount: c.category_children?.length || 0 
      }))
    })
    
    // If no current category, return null (show "All Products" only)
    if (!currentCategoryHandle) {
      return null
    }
    
    // Find which top-level category contains the current category
    const findTopLevelParent = (targetHandle: string): HttpTypes.StoreProductCategory | null => {
      // Helper function to check if a category contains the target (recursively)
      const containsTarget = (category: HttpTypes.StoreProductCategory, target: string): boolean => {
        if (category.handle === target) return true
        
        if (category.category_children && category.category_children.length > 0) {
          return category.category_children.some(child => containsTarget(child, target))
        }
        
        return false
      }
      
      // Find which top-level category contains our target
      for (const topLevelCategory of topLevel) {
        if (containsTarget(topLevelCategory, targetHandle)) {
          return topLevelCategory
        }
      }
      
      return null
    }
    
    // Find the parent category for the current category
    const parentCategory = findTopLevelParent(currentCategoryHandle)
    
    console.log('🔍 CategorySidebar: Found parent category:', {
      currentHandle: currentCategoryHandle,
      parentFound: !!parentCategory,
      parentName: parentCategory?.name,
      parentHandle: parentCategory?.handle,
      parentChildrenCount: parentCategory?.category_children?.length || 0
    })
    
    return parentCategory
  }, [categories, currentCategoryHandle])

  return (
    <div className="w-full sticky top-24 py-12">
      <div className={cn("w-full", className)}>
        {/* Results Count - Placed at the top of sidebar for stickiness */}
        {resultsCount !== undefined && (
          <div className="mb-4">
            <div className="label-md">{`${resultsCount} wyników`}</div>
          </div>
        )}

        {/* Current Category Header */}
        {resolvedCurrentCategory ? (
          <div className="mb-6">
            <h1 className="heading-xl uppercase">{resolvedCurrentCategory.name}</h1>
            {resolvedCurrentCategory.description && (
              <p className="text-base-regular text-ui-fg-subtle mb-6">
                {resolvedCurrentCategory.description}
              </p>
            )}
          </div>
        ) : (
          !currentCategoryHandle && (
            <div className="mb-6">
              <h1 className="heading-xl uppercase">Wszystkie produkty</h1>
            </div>
          )
        )}

        {/* Navigation */}
        <nav className="space-y-1">
          {/* All Products Link */}
          <Link
            href={buildCategoryUrl('')}
            className={cn(
              "flex items-center justify-between px-3 py-2 text-md font-medium font-instrument-sans rounded-md transition-colors group",
              !currentCategoryHandle 
                ? "bg-primary text-black underline decoration-1 underline-offset-4" 
                : "text-black hover:bg-gray-100"
            )}
          >
            <span className="flex-1">Wszystkie produkty</span>
          </Link>

          {/* Category Tree - Show specific tree when category selected, or all parent categories when viewing all products */}
          {currentParentCategoryTree ? (
            <CategorySidebarItem
              key={currentParentCategoryTree.id}
              category={currentParentCategoryTree}
              currentCategoryHandle={currentCategoryHandle as string}
              buildCategoryUrl={buildCategoryUrl}
              currentParentCategoryTree={currentParentCategoryTree}
            />
          ) : (
            // When viewing "Wszystkie produkty", show all parent categories
            !currentCategoryHandle && categories && categories.length > 0 && (
              <>
                {categories
                  .filter(cat => {
                    const hasNoParentId = !cat.parent_category_id || cat.parent_category_id === null
                    const hasNoParentObj = !cat.parent_category || 
                                         cat.parent_category === null || 
                                         (typeof cat.parent_category === 'object' && !cat.parent_category.id)
                    return hasNoParentId && hasNoParentObj
                  })
                  .map((category) => (
                    <CategorySidebarItem
                      key={category.id}
                      category={category}
                      currentCategoryHandle={currentCategoryHandle as string}
                      buildCategoryUrl={buildCategoryUrl}
                      currentParentCategoryTree={null}
                      showChildrenByDefault={false}
                    />
                  ))}
              </>
            )
          )}
        </nav>

        {/* Category Tree Info */}
        {currentParentCategoryTree && (
          <div className="mt-6 pt-4 border-t border-[#3B3634]">
            <p className="text-md text-black font-instrument-sans">
              Kategoria: {currentParentCategoryTree.name}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface CategorySidebarItemProps {
  category: HttpTypes.StoreProductCategory
  currentCategoryHandle: string
  level?: number
  buildCategoryUrl: (categoryHandle: string) => string
  currentParentCategoryTree?: HttpTypes.StoreProductCategory | null
  showChildrenByDefault?: boolean
}

const CategorySidebarItem = ({ 
  category, 
  currentCategoryHandle,
  level = 0,
  buildCategoryUrl,
  currentParentCategoryTree,
  showChildrenByDefault = true
}: CategorySidebarItemProps) => {
  const hasChildren = category.category_children && category.category_children.length > 0
  const isActive = category.handle === currentCategoryHandle
  const isParentOfActive = category.category_children?.some((child: HttpTypes.StoreProductCategory) => 
    child.handle === currentCategoryHandle
  )

  // Always show full tree, but only expand branches that lead to the current category
  const isInCurrentPath = useMemo(() => {
    if (!currentCategoryHandle) return false
    
    // Check if current category is this category
    if (category.handle === currentCategoryHandle) return true
    
    // Check if current category is a descendant of this category
    const isDescendant = (cat: HttpTypes.StoreProductCategory, targetHandle: string): boolean => {
      if (cat.category_children && cat.category_children.length > 0) {
        for (const child of cat.category_children) {
          if (child.handle === targetHandle || isDescendant(child, targetHandle)) {
            return true
          }
        }
      }
      return false
    }
    
    // Check if this category is an ancestor of the current category
    const isAncestor = isDescendant(category, currentCategoryHandle)
    
    return isAncestor
  }, [category, currentCategoryHandle])
  
  // FIXED: Show full tree when viewing a parent category
  // When viewing a top-level category, we want to show its complete tree structure
  const isViewingTopLevelCategory = currentParentCategoryTree?.handle === currentCategoryHandle
  
  // Expansion logic:
  // - Level 0 (top-level): Expanded if showChildrenByDefault OR if in current path
  // - If viewing top-level category: Show complete tree (expand all levels)
  // - Otherwise: Only expand if in current path, active, or parent of active
  const isExpanded = (level === 0 && showChildrenByDefault) || 
                    isViewingTopLevelCategory || 
                    isInCurrentPath || 
                    isActive || 
                    isParentOfActive

  return (
    <div>
      <Link
        href={buildCategoryUrl(category.handle)}
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
              buildCategoryUrl={buildCategoryUrl}
              currentParentCategoryTree={currentParentCategoryTree}
              showChildrenByDefault={showChildrenByDefault}
            />
          ))}
        </div>
      )}
    </div>
  )
}