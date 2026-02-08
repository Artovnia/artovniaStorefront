import Image, { StaticImageData } from "next/image"

// ✅ PERFORMANCE: Static import = build-time optimization + automatic blur placeholder
// No runtime image processing needed on Vercel, eliminates image flash
import heroImage from "../../../../public/images/promotions/promotions.webp"

interface PageHeroProps {
  /** Page heading text */
  title: string
  /** Subtitle text below the heading */
  subtitle: string
  /** HTML id for the heading element (for aria-labelledby) */
  headingId: string
  /** HTML id for the skip-to-content anchor target */
  contentId: string
  /** Skip-to-content link text */
  skipLinkText: string
  /** Alt text for the background image */
  imageAlt: string
  /** Optional custom hero image (static import). Defaults to shared hero image */
  image?: StaticImageData
}

/**
 * Shared hero section component for listing pages (promotions, sellers, etc.)
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Static image import: optimized at build time, not runtime
 * - placeholder="blur": automatic blurDataURL from static import, no image flash
 * - priority + fetchPriority="high": browser starts downloading immediately
 * - Pure server component: zero client-side JS
 */
export const PageHero = ({
  title,
  subtitle,
  headingId,
  contentId,
  skipLinkText,
  imageAlt,
  image = heroImage,
}: PageHeroProps) => {
  return (
    <section
      className="relative w-full max-w-[1920px] mx-auto h-[250px] sm:h-[250px] md:h-[300px] lg:h-[300px] xl:h-[400px] overflow-hidden"
      aria-labelledby={headingId}
    >
      {/* Background Image - Build-time optimized with blur placeholder */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        loading="eager"
        fetchPriority="high"
        className="object-cover object-center"
        sizes="100vw"
        quality={85}
        placeholder="blur"
      />

      {/* Content Overlay */}
      <div className="relative h-full w-full px-4 sm:px-6 lg:px-8 z-10">
        <div className="flex flex-col items-center justify-center h-full text-center">
          {/* Main Heading */}
          <h1
            id={headingId}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-instrument-serif italic font-normal text-white mb-4 sm:mb-6 drop-shadow-2xl"
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-md sm:text-lg md:text-xl lg:text-xl text-white font-instrument-sans max-w-3xl drop-shadow-lg uppercase">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Skip to content link for keyboard navigation (WCAG 2.4.1) */}
      <a
        href={`#${contentId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#3B3634] focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:ring-offset-2"
      >
        {skipLinkText}
      </a>
    </section>
  )
}
