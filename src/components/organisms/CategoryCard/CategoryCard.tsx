"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { useState } from "react"
import { ArrowRightIcon} from "@/icons"


export function CategoryCard({
  category,
  size = "small"
}: {
  category: { id: number; name: string; handle: string }
  size?: "large" | "small"
}) {
  const [isHovered, setIsHovered] = useState(false)

  // 🎯 HEIGHT FINE-TUNING GUIDE:
  // Large card height = (2 × small card height) + gap between rows
  // Gap values from HomeCategories.tsx: gap-4 (16px), lg:gap-6 (24px), xl:gap-8 (32px)
  // 
  // FORMULA for each breakpoint:
  // - Mobile (gap-4 = 16px):    small × 2 + 16px = large
  // - Desktop lg (gap-6 = 24px): small × 2 + 24px = large  
  // - Desktop xl (gap-8 = 32px): small × 2 + 32px = large
  //
  // TO ADJUST: Change the pixel values below while maintaining the formula above
  
  const isLarge = size === "large"
  const heightClass = isLarge 
    ? "h-[416px] sm:h-[516px] md:h-[624px] lg:h-[724px] xl:h-[822px]" // Large: (small × 2) + gap
    : "h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[395px]"  // Small: base heights

  return (
    <Link
      href={`/categories/${category.handle}`}
      className={`group relative block w-full ${heightClass} overflow-hidden bg-primary transition-all duration-300 will-change-transform`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
    >
      {/* Category Image */}
      <div className="relative w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
        <Image
          src={`/images/categories/${category.handle}.webp`}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes={isLarge ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
          quality={90}
          priority={isLarge}
          style={{ backfaceVisibility: 'hidden' }}
        />

        {/* Artistic Hover Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-[#3B3634]/95 via-[#3B3634]/70 to-transparent transition-opacity duration-500 flex items-center justify-center ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="text-center px-4 transform transition-transform duration-500" style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(20px)'
          }}>
            <p className="text-white font-instrument-serif italic text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
              Zobacz kategorię
            </p>
            <p className="text-white font-instrument-serif font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mt-2">
              {category.name}
            </p>
          </div>
        </div>

        {/* Category Name Below Image (Always Visible) */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary backdrop-blur-sm py-3 px-4">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-[#3B3634] font-instrument-sans font-normal text-center text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap uppercase">
              {category.name} 
            </h3>
            <ArrowRightIcon className="w-4 h-4 text-[#3B3634] flex-shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  )
}
