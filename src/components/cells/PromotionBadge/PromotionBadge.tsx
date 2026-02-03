"use client"

import { memo } from "react"
import clsx from "clsx"

interface PromotionBadgeProps {
  discountPercentage: number
  variant?: "card" | "detail" | "simple"
  className?: string
}

/**
 * 🎨 Artisanal Promotion Badge
 * 
 * Designed for marketplace aesthetic with craft tag styling
 * - Card variant: Compact tag with string (for product cards)
 * - Detail variant: Larger, more prominent badge (for product detail page)
 * 
 * Responsive breakpoints:
 * - Mobile (<640px): Smaller sizing
 * - Desktop (640px+): Full sizing
 */
const PromotionBadgeComponent = ({
  discountPercentage,
  variant = "card",
  className = ""
}: PromotionBadgeProps) => {
  
  if (variant === "card") {
    // Compact craft tag for product cards
    return (
      <div className={clsx("absolute top-0 left-4 z-10", className)} suppressHydrationWarning>
        {/* String */}
        <div className="w-px h-2 bg-[#3b3634] mx-auto" />
        {/* Tag */}
        <div 
          className="relative bg-[#F5F0E8] px-1 py-2"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
          }}
        >
          {/* Hole punch effect */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3B3634]/45" />
          <p 
            className="text-[#3B3634] text-xs font-medium font-instrument-sans mt-1 text-center" 
            style={{ fontFamily: 'cursive' }}
          >
            -{discountPercentage}%
          </p>
        </div>
      </div>
    )
  }

  if (variant === "simple") {
    // Simple border variant for product detail header
    return (
      <span 
        className={clsx(
          "inline-flex items-center justify-center",
          "px-2 py-1",
          "border border-[#3B3634]",
          "text-[#3B3634] text-xs font-medium font-instrument-sans",
          className
        )}
        suppressHydrationWarning
      >
        -{discountPercentage}%
      </span>
    )
  }

  // Detail variant: Inline craft tag for product detail header
  return (
    <div className={clsx("inline-flex flex-col items-center", className)} suppressHydrationWarning>
      {/* String */}
      <div className="w-px h-2 bg-[#3b3634]" />
      {/* Tag */}
      <div 
        className="relative bg-white px-2 py-2"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
        }}
      >
        {/* Hole punch effect */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3B3634]/45" />
        <p 
          className="text-[#3B3634] text-xs font-medium font-instrument-sans mt-1 text-center whitespace-nowrap" 
          style={{ fontFamily: 'cursive' }}
        >
          -{discountPercentage}%
        </p>
      </div>
    </div>
  )
}

export const PromotionBadge = memo(PromotionBadgeComponent)
