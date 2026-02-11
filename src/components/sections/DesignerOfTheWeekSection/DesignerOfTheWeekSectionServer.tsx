// ✅ SERVER COMPONENT: Optimized for performance
// Fetches Sanity data during server render with caching

import Image from "next/image"
import Link from "next/link"
import { getFeaturedSellerPost } from "@/app/[locale]/(main)/blog/lib/data"
import { urlFor } from "@/app/[locale]/(main)/blog/lib/sanity"
import { unstable_cache } from "next/cache"

interface DesignerOfTheWeekSectionProps {
  className?: string
}

export async function DesignerOfTheWeekSectionServer({
  className = "",
}: DesignerOfTheWeekSectionProps) {
  const getCachedFeaturedPost = unstable_cache(
    async () => {
      try {
        return await getFeaturedSellerPost()
      } catch (error) {
        console.error("Error fetching featured post:", error)
        return null
      }
    },
    ["designer-of-week-featured"],
    {
      revalidate: 600,
      tags: ["designer-of-week", "blog"],
    }
  )

  const featuredPost = await getCachedFeaturedPost()

  if (!featuredPost) {
    return null
  }

  // 🧪 TEST MODE: Set to true to test with local bright image
  const TEST_WITH_BRIGHT_IMAGE = false

  return (
    <section
      className={`mx-auto max-w-[1920px] w-full px-4 lg:px-8 py-6 md:py-8 font-instrument-sans ${className}`}
      aria-labelledby="designer-of-week-heading"
    >
      {/* ========== MOBILE LAYOUT (below md) ========== */}
      <div className="block md:hidden">
        <Link
          href={`/blog/seller/${featuredPost.slug.current}`}
          className="group block"
          aria-label={`Poznaj ${featuredPost.sellerName} – projektant tygodnia`}
        >
          {/* Hero Card with Overlay */}
          <div className="relative w-full aspect-[3/4] max-h-[70vh] overflow-hidden shadow-xl">
            {/* Background Image - TEST MODE */}
            {TEST_WITH_BRIGHT_IMAGE ? (
              <Image
                src="/images/categories/Zwierzeta.jpg"
                alt="Test bright image"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="100vw"
                priority={false}
              />
            ) : featuredPost.mainImage && featuredPost.mainImage.asset ? (
              <Image
                src={urlFor(featuredPost.mainImage).width(800).height(1067).url()}
                alt={featuredPost.mainImage.alt || "Featured seller image"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="100vw"
                priority={false}
              />
            ) : (
              <Image
                src="/images/hero/Image.jpg"
                alt="Placeholder"
                fill
                className="object-cover"
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3B3634]/90 via-[#3B3634]/50 to-transparent" aria-hidden="true" />

            {/* Content Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10 bg-gradient-to-b from-transparent via-[#3B3634]/80 to-transparent" aria-hidden="true">
              {/* Seller Name with decorative line */}
              <div className="mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px w-8 bg-white/60" />
                  <span className="text-white/80 text-xs font-medium tracking-widest uppercase">
                    Poznaj
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl text-white font-instrument-serif italic leading-tight">
                  {featuredPost.sellerName}
                </h3>
              </div>

              {/* Description */}
              <p className="text-white/85 text-sm leading-relaxed mb-4 line-clamp-2">
                {featuredPost.shortDescription}
              </p>

              {/* CTA Button */}
              <span className="inline-flex items-center justify-center w-full py-3.5 text-white font-medium text-sm tracking-wide group-hover:bg-white group-hover:text-[#3B3634] border border-white transition-colors duration-300">
                ZOBACZ POST
                <svg
                  className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* ========== DESKTOP LAYOUT (md and above) ========== */}
      <div className="hidden md:flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
        {/* Images */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <div className="flex items-start justify-center lg:justify-start gap-4 md:gap-6 lg:gap-8 xl:gap-12 2xl:gap-16">
            {/* Main Image */}
            <div className="flex-shrink-0 w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-88 xl:w-80 xl:h-96 2xl:w-[28rem] 2xl:h-[30rem]">
              <div className="relative w-full h-full overflow-hidden shadow-lg">
                {featuredPost.mainImage && featuredPost.mainImage.asset ? (
                  <Image
                    src={urlFor(featuredPost.mainImage)
                      .width(448)
                      .height(480)
                      .url()}
                    alt={featuredPost.mainImage.alt || "Featured seller image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, (max-width: 1024px) 288px, (max-width: 1280px) 320px, (max-width: 1536px) 320px, 448px"
                  />
                ) : (
                  <Image
                    src="/images/hero/Image.jpg"
                    alt="Placeholder"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            {/* Secondary Image */}
            <div className="flex-shrink-0 w-32 h-40 lg:w-40 lg:h-48 xl:w-52 xl:h-60 2xl:w-60 2xl:h-72">
              <div className="relative w-full h-full overflow-hidden shadow-lg border-4 border-[#F4F0EB]">
                {featuredPost.secondaryImage &&
                featuredPost.secondaryImage.asset ? (
                  <Image
                    src={urlFor(featuredPost.secondaryImage)
                      .width(240)
                      .height(288)
                      .url()}
                    alt={
                      featuredPost.secondaryImage.alt || "Secondary seller image"
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, (max-width: 1280px) 208px, 240px"
                  />
                ) : (
                  <Image
                    src="/images/hero/Image.jpg"
                    alt="Placeholder"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Text Content - CENTERED */}
        <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col justify-center items-center space-y-4 lg:space-y-8 xl:space-y-10 2xl:space-y-12 text-center">
          {/* Header */}
          <h2 id="designer-of-week-heading" className="text-2xl lg:text-3xl xl:text-4xl font-instrument-serif text-[#3B3634] tracking-wide">
            <span className="font-instrument-serif">Projektant</span>{" "}
            <span className="font-instrument-serif italic">tygodnia</span>
          </h2>

          {/* Seller Name */}
          <h3 className="text-xl lg:text-2xl xl:text-3xl text-[#3B3634] font-medium">
            <span className="font-instrument-serif">Poznaj</span>{" "}
            <span className="text-[#3B3634] font-instrument-serif italic">
              {featuredPost.sellerName}
            </span>
          </h3>

          {/* Description */}
          <p className="text-base lg:text-lg text-[#3B3634] leading-relaxed max-w-md font-instrument-sans">
            {featuredPost.shortDescription}
          </p>

          {/* Button */}
          <Link
            href={`/blog/seller/${featuredPost.slug.current}`}
            className="inline-flex items-center justify-center px-8 py-3 ring-1 ring-[#3B3634] text-[#3B3634] font-medium text-sm lg:text-base hover:bg-[#3B3634] hover:text-white transition-colors duration-300 w-fit"
            aria-label={`Zobacz post o ${featuredPost.sellerName}`}
          >
            ZOBACZ POST
          </Link>
        </div>
      </div>
    </section>
  )
}