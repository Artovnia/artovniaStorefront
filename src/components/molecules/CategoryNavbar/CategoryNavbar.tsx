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
  
  const children = category.category_children || []
  const hasChildren = children.length > 0

  const handleCategoryClick = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleDescendantHover = (categoryId: string, isHovered: boolean) => {
    setDescendantHovered(isHovered)
    
    if (isHovered) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        setHoverTimeout(null)
      }
    }
    
    onAnyDescendantHover?.(category.id, isHovered)
  }

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    
    setIsHovered(true)
    
    if (level === 0) {
      onParentHover?.(category.id, true)
    } else {
      onAnyDescendantHover?.(category.id, true)
    }
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      if (!descendantHovered) {
        setIsHovered(false)
        
        if (level === 0) {
          onParentHover?.(category.id, false)
        } else {
          onAnyDescendantHover?.(category.id, false)
        }
      }
    }, 500)
    
    setHoverTimeout(timeout)
  }

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
      
      {/* Dropdown for children - NOW SEAMLESSLY CONNECTED */}

      {hasChildren && (
        level === 0 
          ? activeParentId === category.id
          : (isHovered || descendantHovered)
      ) && (
        <div 
        className={cn(
          "absolute bg-[#FFFFFF] min-w-[200px]",
          // Level 0: Dropdown from navbar - connected to bottom
          level === 0 && [
            "top-full left-0 z-50",
            
            "rounded-bl-sm " // Round bottom corners only
          ],
          // Level 1+: Dropdown from side - connected to right
          level > 0 && [
            "top-0 left-full z-50", // Same z-index for all levels
           
            "rounded-tr-sm rounded-br-sm" // Round right corners only
          ]
        )}
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

  const handleParentHover = (categoryId: string, isHovered: boolean) => {
    if (isHovered) {
      if (globalTimeout) {
        clearTimeout(globalTimeout)
        setGlobalTimeout(null)
      }
      
      setActiveParentId(categoryId)
      
      const timeout = setTimeout(() => {
        setActiveParentId(null)
      }, 5000)
      
      setGlobalTimeout(timeout)
    } else {
      if (activeParentId === categoryId) {
        setActiveParentId(null)
        if (globalTimeout) {
          clearTimeout(globalTimeout)
          setGlobalTimeout(null)
        }
      }
    }
  }

  const handleNavbarMouseLeave = (e: React.MouseEvent) => {
    if (!activeParentId) return
    
    const navbar = e.currentTarget as HTMLElement
    const navbarRect = navbar.getBoundingClientRect()
    
    const bufferZone = {
      top: navbarRect.top,
      left: navbarRect.left,
      right: navbarRect.right + 300,
      bottom: navbarRect.bottom + 400
    }
    
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    const isWithinBuffer = (
      mouseX >= bufferZone.left &&
      mouseX <= bufferZone.right &&
      mouseY >= bufferZone.top &&
      mouseY <= bufferZone.bottom
    )
    
    if (!isWithinBuffer) {
      setActiveParentId(null)
      if (globalTimeout) {
        clearTimeout(globalTimeout)
        setGlobalTimeout(null)
      }
    }
  }

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
        className="uppercase  my-3 md:my-0 flex items-center justify-between text-lg hover:bg-primary/10 transition-colors"
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