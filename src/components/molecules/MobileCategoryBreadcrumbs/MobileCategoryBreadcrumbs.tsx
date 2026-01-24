"use client"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/routing"
import { HttpTypes } from "@medusajs/types"

const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

interface MobileCategoryBreadcrumbsProps {
  currentCategory?: HttpTypes.StoreProductCategory
  className?: string
  resultsCount?: number
}

export const MobileCategoryBreadcrumbs = ({ currentCategory, className, resultsCount }: MobileCategoryBreadcrumbsProps) => {
  // Show "All Products" header when no category is selected
  if (!currentCategory) {
    return (
      <div className={cn("md:hidden w-full", className)}>
        <div className="px-4 py-4 border-b border-[#3B3634]/10">
          <h1 className="text-2xl font-instrument-serif text-[#3B3634] tracking-tight uppercase mb-2">
            Wszystkie produkty
          </h1>
          {resultsCount !== undefined && (
            <div className="text-sm text-[#3B3634]/70">{`${resultsCount} wyników`}</div>
          )}
        </div>
      </div>
    )
  }

  // Build breadcrumb trail from current category up to root
  const buildBreadcrumbs = (category: HttpTypes.StoreProductCategory): Array<{ label: string; path: string }> => {
    const breadcrumbs: Array<{ label: string; path: string }> = []
    
    let current: HttpTypes.StoreProductCategory | undefined = category
    
    while (current) {
      breadcrumbs.unshift({
        label: current.name || '',
        path: `/categories/${current.handle}`
      })
      
      // Move to parent category
      current = current.parent_category as HttpTypes.StoreProductCategory | undefined
    }
    
    // Add "All Categories" as root
    breadcrumbs.unshift({
      label: "Wszystkie",
      path: "/categories"
    })
    
    return breadcrumbs
  }

  const breadcrumbs = buildBreadcrumbs(currentCategory)

  return (
    <div className={cn("md:hidden w-full", className)}>
      <nav className="w-full px-4 py-2 backdrop-blur-sm border-b border-[#3B3634]/10" aria-label="Category breadcrumb">
        <div className="flex items-center gap-1 flex-wrap">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            
            return (
              <div key={item.path} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRightIcon className="text-[#3B3634]/40 flex-shrink-0" />
                )}
                {isLast ? (
                  <span className="text-sm font-semibold text-[#3B3634] break-words">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="text-sm text-[#3B3634]/70 hover:text-[#3B3634] transition-colors break-words"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </nav>
      
      {resultsCount !== undefined && (
        <div className="px-4 py-2">
          <div className="text-sm text-[#3B3634]/70">{`${resultsCount} wyników`}</div>
        </div>
      )}
    </div>
  )
}
