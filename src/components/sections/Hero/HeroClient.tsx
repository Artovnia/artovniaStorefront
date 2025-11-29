"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"
import { HeroBanner } from "./Hero"
import { HERO_CONFIG } from "@/config/hero-banners"

interface HeroClientProps {
  banners: HeroBanner[]
  className?: string
  pauseOnHover?: boolean
}

/**
 * Client-side carousel functionality for Hero section
 * Handles: auto-play, navigation, touch gestures, hover states
 * 
 * This is separated from the main Hero component to allow the first banner
 * to be server-rendered for optimal LCP performance.
 */
export const HeroClient = ({ 
  banners, 
  className = "",
  pauseOnHover = HERO_CONFIG.pauseOnHover
}: HeroClientProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const minSwipeDistance = 50

  // Auto-switch functionality
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, HERO_CONFIG.autoSwitchInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, banners.length])

  // Navigation handlers
  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [banners.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [banners.length])

  // Touch handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrevious()
    }
  }, [touchStart, touchEnd, handleNext, handlePrevious])

  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (pauseOnHover) {
      setIsAutoPlaying(false)
    }
  }, [pauseOnHover])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (pauseOnHover) {
      setIsAutoPlaying(true)
    }
  }, [pauseOnHover])

  const currentBanner = banners[currentIndex]

  return (
    <div 
      className={`absolute inset-0 w-full h-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* All banner images with transitions */}
      {banners.map((banner, index) => {
        const isActive = index === currentIndex
        
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
            <div 
              className={`relative w-full h-full group ${
                banner.url ? 'cursor-pointer' : ''
              }`}
              onClick={() => banner.url && (window.location.href = banner.url)}
            >
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={index === 0} // Only first image is priority
                fetchPriority={index === 0 ? "high" : "auto"}
                quality={HERO_CONFIG.imageQuality}
                sizes="100vw"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Text Content */}
              {banner.content && (
                <div className={`absolute inset-0 z-10 flex items-${banner.content.verticalAlignment || 'center'} justify-${banner.content.alignment || 'center'} px-4 sm:px-6 lg:px-8`}>
                  <div className="w-full text-center">
                    {banner.content.heading && (
                      <h1 className="text-4xl sm:text-6xl lg:text-8xl font-instrument-serif text-white mb-4 sm:mb-6 drop-shadow-2xl">
                        {banner.content.heading.text}
                      </h1>
                    )}
                    
                    {banner.content.paragraph && (
                      <p className="font-instrument-sans uppercase text-base sm:text-lg lg:text-xl text-white mb-6 sm:mb-8 drop-shadow-lg max-w-2xl mx-auto">
                        {banner.content.paragraph.text}
                      </p>
                    )}
                    
                    {banner.content.cta && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (banner.url) {
                            window.location.href = banner.url
                          }
                        }}
                        className="px-6 sm:px-8 py-3 sm:py-4 font-instrument-sans font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#3B3634]"
                      >
                        {banner.content.cta.text}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Hover effect */}
              {banner.url && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </div>
          </div>
        )
      })}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon color="white" size={25} />
          </button>

          <button
            onClick={handleNext}
            className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Next slide"
          >
            <ArrowRightIcon color="white" size={25} />
          </button>
        </>
      )}

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
    </div>
  )
}
