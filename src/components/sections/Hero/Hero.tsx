import Image from "next/image"
import { HERO_BANNERS, HERO_CONFIG } from "@/config/hero-banners"
import { HeroClient } from "./HeroClient"

export interface HeroBanner {
  id: string
  image: string
  mobileImage?: string
  alt: string
  url?: string
  content?: {
    heading?: string
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

export const Hero = ({ 
  banners = HERO_BANNERS,
  className = "",
  pauseOnHover = HERO_CONFIG.pauseOnHover
}: HeroProps) => {
  if (!banners.length) return null

  const firstBanner = banners[0]

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
              <div className={`w-full text-${firstBanner.content.alignment || 'center'}`}>
                {firstBanner.content.heading && (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-instrument-serif text-white mb-4 sm:mb-6 ">
                    {firstBanner.content.heading}
                  </h1>
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

  return (
    <section className={`relative w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] overflow-hidden ${className}`}>
      <HeroClient 
        banners={banners}
        className=""
        pauseOnHover={pauseOnHover}
      />
    </section>
  )
}