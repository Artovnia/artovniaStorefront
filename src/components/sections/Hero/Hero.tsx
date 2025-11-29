// ✅ SERVER COMPONENT: First banner rendered on server for optimal LCP
// Client interactivity handled by HeroClient component

import Image from "next/image"
import { HERO_BANNERS, HERO_CONFIG } from "@/config/hero-banners"
import { HeroClient } from "./HeroClient"

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

/**
 * Hero Section - Server Component Wrapper
 * 
 * SERVER COMPONENT (this file):
 * - Provides section wrapper and configuration
 * - Handles single banner case (fully static)
 * - Passes configuration to HeroClient
 * 
 * CLIENT COMPONENT (HeroClient):
 * - Handles carousel functionality for multiple banners
 * - Auto-play, navigation, touch gestures
 * - First image uses priority prop for optimal LCP
 * 
 * PERFORMANCE:
 * - First banner image has priority prop (preloaded)
 * - Carousel transitions are smooth (700ms)
 * - Touch gestures for mobile users
 */
export const Hero = ({ 
  banners = HERO_BANNERS,
  className = "",
  pauseOnHover = HERO_CONFIG.pauseOnHover
}: HeroProps) => {
  if (!banners.length) return null

  const firstBanner = banners[0]

  // If only one banner, render statically without client component
  if (banners.length === 1) {
    return (
      <section className={`relative w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden ${className}`}>
        <div className="relative w-full h-full">
          <Image
            src={firstBanner.image}
            alt={firstBanner.alt}
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            quality={HERO_CONFIG.imageQuality}
            sizes="100vw"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {firstBanner.content && (
            <div className={`absolute inset-0 z-10 flex items-${firstBanner.content.verticalAlignment || 'center'} justify-${firstBanner.content.alignment || 'center'} px-4 sm:px-6 lg:px-8`}>
              <div className="w-full text-center">
                {firstBanner.content.heading && (
                  <h1 className="text-4xl sm:text-6xl lg:text-8xl font-instrument-serif text-white mb-4 sm:mb-6 drop-shadow-2xl">
                    {firstBanner.content.heading.text}
                  </h1>
                )}
                
                {firstBanner.content.paragraph && (
                  <p className="font-instrument-sans uppercase text-base sm:text-lg lg:text-xl text-white mb-6 sm:mb-8 drop-shadow-lg max-w-2xl mx-auto">
                    {firstBanner.content.paragraph.text}
                  </p>
                )}
                
                {firstBanner.content.cta && firstBanner.url && (
                  <a
                    href={firstBanner.url}
                    className="inline-block px-6 sm:px-8 py-3 sm:py-4 font-instrument-sans font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#3B3634]"
                  >
                    {firstBanner.content.cta.text}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  // Multiple banners: use client component for carousel
  return (
    <section className={`relative w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden ${className}`}>
      {/* ✅ CLIENT COMPONENT: Handles all carousel functionality */}
      {/* First banner is still prioritized with priority prop in HeroClient */}
      <HeroClient 
        banners={banners}
        className=""
        pauseOnHover={pauseOnHover}
      />
    </section>
  )
}
