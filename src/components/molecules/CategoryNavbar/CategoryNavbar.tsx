"use client"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useState } from "react"

export const CategoryNavbar = ({
  categories,
  onClose,
}: {
  categories: HttpTypes.StoreProductCategory[]
  onClose?: (state: boolean) => void
}) => {
  const { category } = useParams()
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleCategoryClick = (hasChildren: boolean) => {
    if (!hasChildren && onClose) {
      onClose(false)
    }
  }

  const handleSubcategoryClick = () => {
    if (onClose) {
      onClose(false)
    }
  }

  const handleMouseEnter = (categoryId: string) => {
    setHoveredCategory(categoryId)
  }

  const handleMouseLeave = () => {
    setHoveredCategory(null)
  }

  return (
    <nav className="flex md:items-center flex-col md:flex-row">
      <Link
        href="/categories"
        onClick={() => (onClose ? onClose(false) : null)}
        className={cn(
          "uppercase px-4 my-3 md:my-0 flex items-center justify-between text-xl"
        )}
      >
        Wszystkie produkty
      </Link>
      {categories?.map(({ id, handle, name, category_children }) => {
        const hasChildren = category_children && category_children.length > 0
        const isHovered = hoveredCategory === id
        
        return (
          <div 
            key={id} 
            className="relative"
            onMouseEnter={() => hasChildren && handleMouseEnter(id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={`/categories/${handle}`}
              onClick={() => handleCategoryClick(hasChildren)}
              className={cn(
                "uppercase px-4 my-3 md:my-0 flex items-center justify-between text-xl",
                handle === category && "md:border-b md:border-primary",
                hasChildren && "md:hover:bg-gray-50 transition-colors"
              )}
            >
              {name}
            </Link>
            
            {/* Subcategories Dropdown */}
            {hasChildren && isHovered && (
              <div className={cn(
                "md:absolute md:top-full md:left-0 md:bg-white md:border md:border-gray-200 md:rounded-sm md:shadow-lg md:min-w-[15rem] md:z-10",
                "flex flex-col pl-4 md:pl-0"
              )}>
                {category_children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.handle}`}
                    onClick={handleSubcategoryClick}
                    className={cn(
                      "uppercase px-4 py-2 hover:bg-gray-50 transition-colors text-lg",
                      child.handle === category && "bg-gray-100 md:bg-primary/10"
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
