"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"
import { HeroBanner } from "./Hero"
import { HERO_CONFIG } from "@/config/hero-banners"

// Responsive focal point: returns mobile value on small screens, desktop on larger
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(true) // Default to mobile (SSR-safe)
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])
  
  return isMobile
}

// Track image loading errors for debugging
const imageLoadErrors = new Set<string>()

interface HeroClientProps {
  banners: HeroBanner[]
  className?: string
  pauseOnHover?: boolean
}

export const HeroClient = ({ 
  banners, 
  className = "",
  pauseOnHover = HERO_CONFIG.pauseOnHover
}: HeroClientProps) => {
  const isMobile = useIsMobile()
  // Create infinite scroll by duplicating first and last slides
  const extendedBanners = [
    banners[banners.length - 1], // Clone of last slide at beginning
    ...banners,
    banners[0] // Clone of first slide at end
  ]
  
  const [currentIndex, setCurrentIndex] = useState(1) // Start at first real slide (index 1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)

  const minSwipeDistance = 50

  // Handle infinite scroll transitions
  useEffect(() => {
    if (currentIndex === 0) {
      // At cloned last slide, jump to real last slide
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(banners.length)
        setTimeout(() => setIsTransitioning(true), 50)
      }, HERO_CONFIG.transitionDuration)
    } else if (currentIndex === extendedBanners.length - 1) {
      // At cloned first slide, jump to real first slide
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(1)
        setTimeout(() => setIsTransitioning(true), 50)
      }, HERO_CONFIG.transitionDuration)
    }
  }, [currentIndex, banners.length, extendedBanners.length])

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, HERO_CONFIG.autoSwitchInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, banners.length])

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index + 1) // Offset by 1 for cloned slide
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => prev - 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), HERO_CONFIG.resumeAfterManualNavigation)
  }, [])

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

  return (
    <div 
      className={`absolute inset-0 w-full h-full ${className}`}
      role="region"
      aria-roledescription="karuzela"
      aria-label="Baner główny"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-live="polite"
    >
      {extendedBanners.map((banner, index) => {
        const isActive = index === currentIndex
        const offset = (index - currentIndex) * 100
        
        return (
          <div
            key={`${banner.id}-${index}`}
            className={`absolute inset-0 ${
              isActive ? 'z-10' : 'z-0'
            }`}
            style={{
              transform: `translateX(${offset}%)`,
              transition: isTransitioning ? `transform ${HERO_CONFIG.transitionDuration}ms ease-in-out` : 'none'
            }}
          >
            <div 
              className={`relative w-full h-full group ${
                banner.url ? 'cursor-pointer' : ''
              }`}
              role={banner.url ? 'link' : undefined}
              tabIndex={banner.url && isActive ? 0 : -1}
              aria-label={banner.url ? banner.alt : undefined}
              onClick={() => banner.url && (window.location.href = banner.url)}
              onKeyDown={(e) => {
                if (banner.url && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  window.location.href = banner.url
                }
              }}
            >
              {/* Single image for all screen sizes */}
              <Image
                src={banner.image}
                alt={banner.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ objectPosition: (isMobile ? banner.focalPoint?.mobile : banner.focalPoint?.desktop) || banner.objectPosition || 'center' }}
                priority={index < HERO_CONFIG.priorityLoadCount}
                loading="eager"
                fetchPriority={index < HERO_CONFIG.priorityLoadCount ? "high" : "auto"}
                quality={HERO_CONFIG.imageQuality}
                sizes="100vw"
                unoptimized={banner.id === 'obrazy'}
                onError={(e) => {
                  if (!imageLoadErrors.has(banner.id)) {
                    imageLoadErrors.add(banner.id)
                    console.error(`[Hero] ❌ Failed to load image for banner: ${banner.id}`, {
                      image: banner.image,
                      index,
                      priority: index < HERO_CONFIG.priorityLoadCount,
                      error: e
                    })
                  }
                }}
               
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
              
              {banner.content && (
                <div className={`absolute inset-0 z-10 flex items-${banner.content.verticalAlignment || 'center'} justify-${banner.content.alignment || 'center'} px-4 sm:px-6 lg:px-8`}>
                  <div className={`w-full text-${banner.content.alignment || 'center'}`}>
                    {banner.content.useLogo ? (
                      <div className="flex justify-center mb-4 sm:mb-6">
                        <Image
                          src="/Logo.svg"
                          alt="Artovnia Logo"
                          width={400}
                          height={120}
                          className="h-8 sm:h-10 lg:h-16 w-auto brightness-0 invert"
                          priority
                        />
                      </div>
                    ) : banner.content.heading ? (
                      <h1 className={`text-4xl sm:text-5xl lg:text-6xl text-white mb-4 sm:mb-8 ${
                        banner.id === 'nowy-rok' ? 'font-instrument-serif italic' : 'font-instrument-serif'
                      }`}>
                        {banner.content.heading}
                      </h1>
                    ) : null}
                    
                    {banner.content.subheading && (
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-instrument-serif uppercase text-white mb-4 sm:mb-8">
                        {banner.content.subheading}
                      </h2>
                    )}
                    
                    {banner.content.paragraph && (
                      <p className="font-instrument-sans uppercase text-sm sm:text-lg lg:text-xl text-white mb-6 sm:mb-8  max-w-2xl mx-auto">
                        {banner.content.paragraph}
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
                        className="px-6 sm:px-8 py-3 sm:py-4 font-instrument-sans font-medium text-sm sm:text-sm lg:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-transparent border border-white text-white hover:bg-white hover:text-[#3B3634] uppercase"
                      >
                        {banner.content.cta}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {banner.url && (
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
              )}
          </div>
        </div>
      )
    })}

    {banners.length > 1 && (
      <>
        <button
          onClick={handlePrevious}
          className={`hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Poprzedni slajd"
        >
          <ArrowLeftIcon color="white" size={25} />
        </button>

        <button
          onClick={handleNext}
          className={`hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label="Następny slajd"
        >
          <ArrowRightIcon color="white" size={25} />
        </button>
      </>
    )}

    {banners.length > 1 && (
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20" role="tablist" aria-label="Slajdy banera">
        <div className="flex space-x-3">
          {banners.map((_, index) => {
            // Calculate actual current slide (accounting for cloned slides)
            const actualIndex = currentIndex === 0 ? banners.length - 1 : 
                                currentIndex === extendedBanners.length - 1 ? 0 : 
                                currentIndex - 1
            
            return (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  index === actualIndex
                    ? 'bg-white shadow-lg'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                role="tab"
                aria-selected={index === actualIndex}
                aria-label={`Slajd ${index + 1} z ${banners.length}`}
              />
            )
          })}
        </div>
      </div>
    )}
  </div>
  )
}