"use client"

import { cn } from "@/lib/utils"
import { HttpTypes } from "@medusajs/types"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useParams } from "next/navigation"
import { useState, useMemo, useEffect } from "react"

interface CategoryNavbarProps {
  categories: HttpTypes.StoreProductCategory[]
  onClose?: () => void
}

const CategoryItem = ({ 
  category, 
  level = 0,
  onClose,
  onAnyDescendantHover,
  activeParentId,
  onParentHover
}: { 
  category: HttpTypes.StoreProductCategory
  level?: number
  onClose?: () => void
  onAnyDescendantHover?: (categoryId: string, isHovered: boolean) => void
  activeParentId?: string | null
  onParentHover?: (categoryId: string, isHovered: boolean) => void
}) => {
  const { category: currentCategoryHandle } = useParams()
  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [descendantHovered, setDescendantHovered] = useState(false)
  
  // Use the properly built category_children from the recursive tree
  const children = category.category_children || []
  const hasChildren = children.length > 0

  

  const handleCategoryClick = () => {
    if (onClose) {
      onClose()
    }
  }

  // Handle when any descendant (child, grandchild, etc.) is hovered
  const handleDescendantHover = (categoryId: string, isHovered: boolean) => {
    setDescendantHovered(isHovered)
    
    if (isHovered) {
      // A descendant is hovered, keep this dropdown open
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        setHoverTimeout(null)
      }
    }
    
    // Propagate up to parent
    onAnyDescendantHover?.(category.id, isHovered)
  }

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    
    setIsHovered(true)
    
    // Handle parent-level mutual exclusion
    if (level === 0) {
      onParentHover?.(category.id, true)
    } else {
      // For child levels, notify parent about descendant hover
      onAnyDescendantHover?.(category.id, true)
    }
    
  }

  const handleMouseLeave = () => {
    // Only close if no descendant is hovered
    const timeout = setTimeout(() => {
      if (!descendantHovered) {
        setIsHovered(false)
        
        // Handle parent-level mutual exclusion
        if (level === 0) {
          onParentHover?.(category.id, false)
        } else {
          // For child levels, notify parent about descendant hover
          onAnyDescendantHover?.(category.id, false)
        }
        
      }
    }, 500) // 500ms delay for better UX
    
    setHoverTimeout(timeout)
    
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/categories/${category.handle}`}
        onClick={handleCategoryClick}
        className={cn(
          "uppercase px-4 py-2 hover:bg-primary transition-colors text-lg block whitespace-nowrap",
          category.handle === currentCategoryHandle && "bg-primary md:bg-primary/10",
          level === 0 && "my-3 md:my-0 flex items-center justify-between",
          level === 0 && category.handle === currentCategoryHandle && "md:border-b md:border-primary",
          level > 0 && "hover:bg-primary/20 text-base"
        )}
      >
        <span className="flex items-center justify-between w-full">
          {category.name}
          {hasChildren && (
            <span className="ml-2 text-sm">
              {level === 0 ? "" : "▶"}
            </span>
          )}
        </span>
      </Link>
      
      {/* Dropdown for children */}
      {hasChildren && (
        // For parent level (0): only show if this is the active parent
        // For child levels (1+): show if hovered or descendant hovered
        level === 0 
          ? activeParentId === category.id
          : (isHovered || descendantHovered)
      ) && (
        <div 
          className={cn(
            "absolute z-50 bg-white border border-gray-200 shadow-lg rounded-sm min-w-[200px]",
            level === 0 
              ? "top-full left-0 mt-0" 
              : "top-0 left-full ml-1"
          )}
          style={{
            zIndex: 50 + level
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children.map((child) => (
            <CategoryItem 
              key={child.id} 
              category={child} 
              level={level + 1}
              onClose={onClose}
              onAnyDescendantHover={handleDescendantHover}
              activeParentId={activeParentId}
              onParentHover={onParentHover}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const CategoryNavbar = ({ categories, onClose }: CategoryNavbarProps) => {
  const [activeParentId, setActiveParentId] = useState<string | null>(null)
  const [globalTimeout, setGlobalTimeout] = useState<NodeJS.Timeout | null>(null)

  
  

  // Handle parent category hover - only one parent can be active at a time
  const handleParentHover = (categoryId: string, isHovered: boolean) => {
    if (isHovered) {
      // Clear any existing global timeout
      if (globalTimeout) {
        clearTimeout(globalTimeout)
        setGlobalTimeout(null)
      }
      
      setActiveParentId(categoryId)
      
      // Set a safety timeout to close dropdown after 5 seconds of inactivity
      const timeout = setTimeout(() => {
        setActiveParentId(null)
      }, 5000) // 5 second safety timeout (longer for deep navigation)
      
      setGlobalTimeout(timeout)
    } else {
      // Only clear if this was the active parent
      if (activeParentId === categoryId) {
        setActiveParentId(null)
        if (globalTimeout) {
          clearTimeout(globalTimeout)
          setGlobalTimeout(null)
        }
      }
    }
  }

  // Smart navbar mouse leave - only close if mouse is truly leaving navbar area
  const handleNavbarMouseLeave = (e: React.MouseEvent) => {
    if (!activeParentId) return
    
    // Get the navbar element bounds
    const navbar = e.currentTarget as HTMLElement
    const navbarRect = navbar.getBoundingClientRect()
    
    // Add buffer zone for dropdowns (they extend below/right of navbar)
    const bufferZone = {
      top: navbarRect.top,
      left: navbarRect.left,
      right: navbarRect.right + 300, // 300px buffer for right-side dropdowns
      bottom: navbarRect.bottom + 400 // 400px buffer for dropdown height
    }
    
    // Check if mouse is still within the extended buffer zone
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    const isWithinBuffer = (
      mouseX >= bufferZone.left &&
      mouseX <= bufferZone.right &&
      mouseY >= bufferZone.top &&
      mouseY <= bufferZone.bottom
    )
    
    // Only close if mouse is truly outside the navbar + dropdown area
    if (!isWithinBuffer) {
      setActiveParentId(null)
      if (globalTimeout) {
        clearTimeout(globalTimeout)
        setGlobalTimeout(null)
      }
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (globalTimeout) {
        clearTimeout(globalTimeout)
      }
    }
  }, [globalTimeout])

  return (
    <nav 
      className="flex md:items-center flex-col md:flex-row relative"
      onMouseLeave={handleNavbarMouseLeave}
    >
      <Link
        href="/categories"
        onClick={() => onClose?.()}
        className="uppercase px-4 my-3 md:my-0 flex items-center justify-between text-lg hover:bg-primary/10 transition-colors"
      >
        Wszystkie produkty
      </Link>
      
      {categories.map((category) => (
        <CategoryItem 
          key={category.id} 
          category={category}
          onClose={onClose}
          activeParentId={activeParentId}
          onParentHover={handleParentHover}
        />
      ))}
    </nav>
  )
}