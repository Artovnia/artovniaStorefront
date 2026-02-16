import Image from "next/image"
import { HERO_BANNERS, HERO_CONFIG } from "@/config/hero-banners"
import { HeroClient } from "./HeroClient"

export interface HeroBanner {
  id: string
  image: string
  mobileImage?: string
  alt: string
  url?: string
  objectPosition?: string
  focalPoint?: {
    desktop?: string // CSS object-position value for desktop (e.g., '50% 30%', 'center top')
    mobile?: string  // CSS object-position value for mobile (e.g., '70% 50%', 'right center')
  }
  content?: {
    useLogo?: boolean
    heading?: string
    subheading?: string
    paragraph?: string
    cta?: string
    alignment?: 'left' | 'center' | 'right'
    verticalAlignment?: 'top' | 'center' | 'bottom'
  }
}

type HeroProps = {
  banners?: HeroBanner[]
  className?: string
  pauseOnHover?: boolean
}

/**
 * ✅ OPTIMIZED HERO FOR MOBILE LCP
 * 
 * Strategy:
 * 1. Server-render first banner image immediately (no JS dependency)
 * 2. Use CSS for responsive focal points (no useIsMobile hook needed for first image)
 * 3. HeroClient hydrates on top for carousel functionality
 * 4. First image visible instantly, carousel takes over after hydration
 */
export const Hero = ({ 
  banners = HERO_BANNERS,
  className = "",
  pauseOnHover = HERO_CONFIG.pauseOnHover
}: HeroProps) => {
  if (!banners.length) return null

  const firstBanner = banners[0]

  if (banners.length === 1) {
    return (
      <section className={`relative w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden ${className}`} aria-label="Baner główny">
        <div className="relative w-full h-full">
          <Image
            src={firstBanner.image}
            alt={firstBanner.alt}
            fill
            className="object-cover"
            style={{ objectPosition: firstBanner.focalPoint?.mobile || firstBanner.focalPoint?.desktop || firstBanner.objectPosition || 'center' }}
            priority
            fetchPriority="high"
            quality={HERO_CONFIG.imageQuality}
            sizes="100vw"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
          
          {firstBanner.content && (
            <div className={`absolute inset-0 z-10 flex items-${firstBanner.content.verticalAlignment || 'center'} justify-${firstBanner.content.alignment || 'center'} px-4 sm:px-6 lg:px-8`}>
              <div className={`w-full text-${firstBanner.content.alignment || 'center'}`}>
                {firstBanner.content.heading && (
                  <h1 className={`text-3xl sm:text-4xl lg:text-5xl text-white mb-4 sm:mb-6 ${
                    firstBanner.id === 'nowy-rok' ? 'font-instrument-serif italic' : 'font-instrument-serif'
                  }`}>
                    {firstBanner.content.heading}
                  </h1>
                )}
                
                {firstBanner.content.subheading && (
                  <h2 className="text-4xl sm:text-5xl lg:text-7xl font-instrument-serif uppercase text-white mb-4 sm:mb-6">
                    {firstBanner.content.subheading}
                  </h2>
                )}
                
                {firstBanner.content.paragraph && (
                  <p className="font-instrument-sans uppercase text-base sm:text-lg lg:text-xl text-white mb-6 sm:mb-8  max-w-2xl mx-auto">
                    {firstBanner.content.paragraph}
                  </p>
                )}
                
                {firstBanner.content.cta && firstBanner.url && (
                  <a
                    href={firstBanner.url}
                    className="inline-block px-6 sm:px-8 py-3 sm:py-4 font-instrument-sans font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105  bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#3B3634] uppercase"
                    aria-label={firstBanner.content.cta}
                  >
                    {firstBanner.content.cta}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  // ✅ CRITICAL LCP FIX: Server-render first image immediately
  // HeroClient will hydrate on top and take over carousel functionality
  return (
    <section className={`relative w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden ${className}`} aria-label="Baner główny">
      {/* ✅ Server-rendered first image - visible immediately without JS */}
      <div className="absolute inset-0 z-0">
        {/* ✅ Mobile-optimized image - uses mobile focal point for LCP */}
        {/* HeroClient will take over with proper responsive focal points after hydration */}
        <Image
          src={firstBanner.image}
          alt={firstBanner.alt}
          fill
          className="object-cover"
          style={{ 
            objectPosition: firstBanner.focalPoint?.mobile || firstBanner.focalPoint?.desktop || 'center' 
          }}
          priority
          fetchPriority="high"
          quality={HERO_CONFIG.imageQuality}
          sizes="100vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
        
        {/* Server-rendered content overlay */}
        {firstBanner.content && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8`}>
            <div className="w-full text-center">
              {firstBanner.content.useLogo ? (
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
              ) : firstBanner.content.heading ? (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-4 sm:mb-8 font-instrument-serif">
                  {firstBanner.content.heading}
                </h1>
              ) : null}
              
              {firstBanner.content.paragraph && (
                <p className="font-instrument-sans uppercase text-sm sm:text-lg lg:text-xl text-white mb-6 sm:mb-8 max-w-2xl mx-auto">
                  {firstBanner.content.paragraph}
                </p>
              )}
              
              {firstBanner.content.cta && firstBanner.url && (
                <a
                  href={firstBanner.url}
                  className="inline-block px-6 sm:px-8 py-3 sm:py-4 font-instrument-sans font-medium text-sm sm:text-sm lg:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-transparent border border-white text-white hover:bg-white hover:text-[#3B3634] uppercase"
                >
                  {firstBanner.content.cta}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* ✅ Client carousel hydrates on top - takes over after JS loads */}
      <HeroClient 
        banners={banners}
        className=""
        pauseOnHover={pauseOnHover}
      />
    </section>
  )
}