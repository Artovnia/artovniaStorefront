"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { HERO_BANNERS, HERO_CONFIG } from "@/config/hero-banners"

// Banner configuration interface
export interface HeroBanner {
  id: string
  image: string
  alt: string
  url?: string
}

type HeroProps = {
  banners?: HeroBanner[]
  autoSwitchInterval?: number
  className?: string
  pauseOnHover?: boolean
}

export const Hero = ({ 
  banners = HERO_BANNERS, 
  autoSwitchInterval = HERO_CONFIG.autoSwitchInterval,
  className = "",
  pauseOnHover = HERO_CONFIG.pauseOnHover
}: HeroProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({})

  // Auto-switch functionality
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoSwitchInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, banners.length, autoSwitchInterval])

  // Handle dot navigation
  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    // Resume auto-play after configured time
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [])

  // Handle hover pause/resume
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsAutoPlaying(false)
    }
  }, [pauseOnHover])

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsAutoPlaying(true)
    }
  }, [pauseOnHover])

  // Handle banner click
  const handleBannerClick = useCallback((banner: HeroBanner) => {
    if (banner.url) {
      window.location.href = banner.url
    }
  }, [])

  // Track image load states for optimization
  const handleImageLoad = useCallback((bannerId: string) => {
    setImageLoadStates(prev => ({ ...prev, [bannerId]: true }))
  }, [])

  if (!banners.length) return null

  const currentBanner = banners[currentIndex]

  return (
    <section 
      className={`relative w-full h-[40vh] sm:h-[45vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] max-h-[500px] sm:max-h-[600px] lg:max-h-[800px] overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex
          const isNext = index === (currentIndex + 1) % banners.length
          const isPrev = index === (currentIndex - 1 + banners.length) % banners.length
          
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive 
                  ? 'opacity-100 scale-100 z-10' 
                  : 'opacity-0 scale-105 z-0'
              }`}
              style={{
                transform: isActive ? 'translateX(0)' : 
                          index > currentIndex ? 'translateX(100%)' : 'translateX(-100%)'
              }}
            >
              {/* Clickable banner area */}
              <div 
                className={`relative w-full h-full group ${
                  banner.url ? 'cursor-pointer' : ''
                }`}
                onClick={() => handleBannerClick(banner)}
              >
                {/* Optimized Image with priority loading for first 2 banners */}
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={index < HERO_CONFIG.priorityLoadCount} // Priority load for first images
                  quality={HERO_CONFIG.imageQuality}
                  sizes="100vw"
                  onLoad={() => handleImageLoad(banner.id)}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
               
                
                {/* Hover effect overlay */}
                {banner.url && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === currentIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator for images */}
      {!imageLoadStates[currentBanner.id] && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-5" />
      )}
    </section>
  )
}
