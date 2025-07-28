"use client"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useState } from "react"
import { CollapseIcon } from "@/icons"

export const CategoryNavbar = ({
  categories,
  onClose,
}: {
  categories: HttpTypes.StoreProductCategory[]
  onClose?: (state: boolean) => void
}) => {
  const { category } = useParams()
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set())

  const toggleDropdown = (categoryId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    setOpenDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

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

  return (
    <nav className="flex md:items-center flex-col md:flex-row">
      <Link
        href="/categories"
        onClick={() => (onClose ? onClose(false) : null)}
        className={cn(
          "label-md uppercase px-4 my-3 md:my-0 flex items-center justify-between"
        )}
      >
        Wszystkie produkty
      </Link>
      {categories?.map(({ id, handle, name, category_children }) => {
        const hasChildren = category_children && category_children.length > 0
        const isOpen = openDropdowns.has(id)
        
        return (
          <div key={id} className="relative">
            <div className="flex items-center">
              <Link
                href={`/categories/${handle}`}
                onClick={() => handleCategoryClick(hasChildren)}
                className={cn(
                  "label-md uppercase px-4 my-3 md:my-0 flex items-center justify-between flex-1",
                  handle === category && "md:border-b md:border-primary"
                )}
              >
                {name}
              </Link>
              {hasChildren && (
                <button
                  onClick={(e) => toggleDropdown(id, e)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  aria-label={`Toggle ${name} subcategories`}
                >
                  <CollapseIcon 
                    size={18} 
                    className={cn(
                      "transition-transform duration-200",
                      isOpen ? "rotate-0" : "-rotate-90"
                    )} 
                  />
                </button>
              )}
            </div>
            
            {/* Subcategories Dropdown */}
            {hasChildren && isOpen && (
              <div className={cn(
                "md:absolute md:top-full md:left-0 md:bg-white md:border md:border-gray-200 md:rounded-md md:shadow-lg md:min-w-48 md:z-10",
                "flex flex-col pl-4 md:pl-0"
              )}>
                {category_children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.handle}`}
                    onClick={handleSubcategoryClick}
                    className={cn(
                      "label-sm uppercase px-4 py-2 hover:bg-gray-50 transition-colors",
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
