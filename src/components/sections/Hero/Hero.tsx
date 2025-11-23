"use client"

import { Link } from "@/i18n/routing"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { HERO_BANNERS, HERO_CONFIG } from "@/config/hero-banners"
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"

// Banner configuration interface
export interface HeroBanner {
  id: string
  image: string
  mobileImage?: string // Optional separate mobile image
  alt: string
  url?: string
  content?: {
    heading: {
      text: string
      highlightedWord?: string // Word to highlight with different font style
      highlightedWordIndex?: number // Which word to highlight (0-based)
      font?: 'regular' | 'italic' // font-instrument-serif (regular) or font-instrument-serif italic
      highlightFont?: 'regular' | 'italic' // Highlighted word style
      uppercase?: boolean // Make heading uppercase
      size?: {
        mobile: string // e.g., "text-4xl"
        tablet: string // e.g., "text-6xl"
        desktop: string // e.g., "text-8xl" - ADJUST SIZES HERE IN hero-banners.ts
      }
    }
    paragraph?: {
      text: string
      // Paragraph always uses font-instrument-sans uppercase - no font option needed
      size?: {
        mobile: string
        tablet: string
        desktop: string
      }
    }
    cta?: {
      text: string
      variant?: 'primary' | 'secondary' | 'outline'
    }
    textColor?: 'white' | 'black' | 'custom'
    customTextColor?: string
    alignment?: 'left' | 'center' | 'right'
    verticalAlignment?: 'top' | 'center' | 'bottom'
  }
}

// Hero component props
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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50

  // Helper function to render heading with highlighted word
  const renderHeading = (heading?: NonNullable<HeroBanner['content']>['heading']) => {
    if (!heading) return null
    
    const words = heading.text.split(' ')
    const baseFont = heading.font === 'italic' ? 'font-instrument-serif italic' : 'font-instrument-serif'
    const highlightFont = heading.highlightFont === 'italic' ? 'font-instrument-serif italic' : 'font-instrument-serif'
    const uppercaseClass = heading.uppercase ? 'uppercase' : ''
    
    // Map Tailwind classes to rem values for inline styles
    const sizeMap: Record<string, string> = {
      'text-4xl': '2.25rem',   // 36px
      'text-5xl': '3rem',      // 48px
      'text-6xl': '3.75rem',   // 60px
      'text-7xl': '4.5rem',    // 72px
      'text-8xl': '6rem',      // 96px
      'text-9xl': '8rem',      // 128px
      'text-10xl': '10rem',    // 160px
      'text-11xl': '12rem',    // 192px
      'text-12xl': '14rem',    // 224px
    }
    
    const mobileSize = sizeMap[heading.size?.mobile || 'text-4xl'] || '2.25rem'
    const tabletSize = sizeMap[heading.size?.tablet || 'text-6xl'] || '3.75rem'
    const desktopSize = sizeMap[heading.size?.desktop || 'text-9xl'] || '8rem'
    
    // Check if word should be highlighted (supports multi-word phrases)
    const highlightWords = heading.highlightedWord ? heading.highlightedWord.split(' ') : []
    const isWordHighlighted = (word: string, idx: number) => {
      // Check by index
      if (idx === heading.highlightedWordIndex) return true
      // Check if this word is part of the highlighted phrase
      if (highlightWords.length > 0) {
        // Find if current word starts a match for the phrase
        for (let i = 0; i < highlightWords.length; i++) {
          if (words[idx + i] === highlightWords[i]) {
            if (i === highlightWords.length - 1) return true // All words matched
            continue
          } else {
            break
          }
        }
        // Check if word is part of ongoing phrase
        for (let start = Math.max(0, idx - highlightWords.length + 1); start <= idx; start++) {
          let matches = true
          for (let i = 0; i < highlightWords.length; i++) {
            if (words[start + i] !== highlightWords[i]) {
              matches = false
              break
            }
          }
          if (matches && idx >= start && idx < start + highlightWords.length) {
            return true
          }
        }
      }
      return false
    }
    
    const renderWords = (words: string[]) => {
      return words.map((word: string, idx: number) => {
        const isHighlighted = isWordHighlighted(word, idx)
        return (
          <span key={idx} className={isHighlighted ? highlightFont : ''}>
            {word}{idx < words.length - 1 ? ' ' : ''}
          </span>
        )
      })
    }
    
    return (
      <>
        {/* Mobile */}
        <h1 
          className={`${baseFont} ${uppercaseClass} mb-4 sm:mb-6 drop-shadow-2xl text-white sm:hidden`}
          style={{ fontSize: mobileSize }}
        >
          {renderWords(words)}
        </h1>
        
        {/* Tablet */}
        <h1 
          className={`${baseFont} ${uppercaseClass} mb-4 sm:mb-6 drop-shadow-2xl text-white hidden sm:block lg:hidden`}
          style={{ fontSize: tabletSize }}
        >
          {renderWords(words)}
        </h1>
        
        {/* Desktop */}
        <h1 
          className={`${baseFont} ${uppercaseClass} mb-4 sm:mb-6 drop-shadow-2xl text-white hidden lg:block`}
          style={{ fontSize: desktopSize }}
        >
          {renderWords(words)}
        </h1>
      </>
    )
  }

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

  // Handle arrow navigation
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

  // Touch handlers for mobile swipe
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
  }, [touchStart, touchEnd, handleNext, handlePrevious, minSwipeDistance])

  // Handle hover pause/resume
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
      className={`relative w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner: HeroBanner, index: number) => {
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
                  fetchPriority={index === 0 ? "high" : "auto"} // ✅ High priority for LCP image
                  quality={HERO_CONFIG.imageQuality}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                  onLoad={() => handleImageLoad(banner.id)}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Text Content Overlay */}
                {banner.content && (
                  <div className={`absolute inset-0 z-10 flex items-${banner.content.verticalAlignment || 'center'} justify-${banner.content.alignment || 'center'} px-4 sm:px-6 lg:px-8`}>
                    <div className="w-full text-center">
                      {/* Heading */}
                      {banner.content.heading && renderHeading(banner.content.heading)}
                      
                      {/* Paragraph */}
                      {banner.content.paragraph && (
                        <p className={`font-instrument-sans uppercase ${banner.content.paragraph.size?.mobile || 'text-base'} sm:${banner.content.paragraph.size?.tablet || 'text-lg'} lg:${banner.content.paragraph.size?.desktop || 'text-xl'} text-white mb-6 sm:mb-8 drop-shadow-lg max-w-2xl mx-auto`}>
                          {banner.content.paragraph.text}
                        </p>
                      )}
                      
                      {/* CTA Button */}
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
                
                {/* Hover effect overlay */}
                {banner.url && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows - Desktop only, visible on hover */}
      {banners.length > 1 && (
        <>
          {/* Previous Arrow */}
          <button
            onClick={handlePrevious}
            className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon color="white" size={25} />
          </button>

          {/* Next Arrow */}
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
            {banners.map((_: HeroBanner, index: number) => (
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
