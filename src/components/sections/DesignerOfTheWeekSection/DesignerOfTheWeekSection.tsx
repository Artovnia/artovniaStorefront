"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { SellerPost } from "@/app/[locale]/blog/lib/data"
import { urlFor } from "@/app/[locale]/blog/lib/sanity"

interface DesignerOfTheWeekSectionProps {
  className?: string
}

// Mock data for instant loading - no loading state needed
const defaultFeaturedPost: SellerPost = {
  _id: "mock-1",
  title: "Poznaj Ann Sayuri ART",
  slug: { current: "ann-sayuri-art" },
  sellerName: "Ann Sayuri ART",
  shortDescription: "Oryginalne, ręcznie malowane obrazy abstrakcyjne w żywej kolorystyce",
  sellerHandle: "ann-sayuri-art",
  mainImage: {
    asset: null, // Removed invalid reference
    alt: "Ann Sayuri w swojej pracowni"
  },
  secondaryImage: {
    asset: null, // Removed invalid reference
    alt: "Abstrakcyjny obraz Ann Sayuri"
  },
  publishedAt: new Date().toISOString(),
  content: [],
  seo: undefined,
  featuredOnHomepage: true
}

export function DesignerOfTheWeekSection({ className = "" }: DesignerOfTheWeekSectionProps) {
  const [featuredPost, setFeaturedPost] = useState<SellerPost>(defaultFeaturedPost)

  useEffect(() => {
    // Fetch real data from Sanity in the background and update
    // This runs after the component has already rendered with mock data
    const fetchRealData = async () => {
      try {
        // Import the data fetching function dynamically to avoid SSR issues
        const { getFeaturedSellerPost } = await import("@/app/[locale]/blog/lib/data")
        const realPost = await getFeaturedSellerPost()
        if (realPost) {
          setFeaturedPost(realPost)
        }
      } catch (error) {
        console.error("Error fetching real featured post:", error)
        // Keep using mock data on error
      }
    }

    // Delay the fetch slightly to prioritize initial render
    const timeoutId = setTimeout(fetchRealData, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <section className={`mx-auto max-w-[1920px] w-full px-4 lg:px-8 py-2 md:py-8 font-instrument-sans ${className}`}>
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
        
        {/* Images - First on mobile, Second on desktop */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2">
          <div className="flex items-start justify-center lg:justify-start gap-4 md:gap-6 lg:gap-8 xl:gap-12 2xl:gap-16">
            {/* Main Image - Large (3x bigger) */}
            <div className="flex-shrink-0 w-48 h-64 sm:w-56 sm:h-72 md:w-64 md:h-80 lg:w-72 lg:h-88 xl:w-80 xl:h-96 2xl:w-[28rem] 2xl:h-[30rem]">
              <div className="relative w-full h-full overflow-hidden shadow-lg">
                <Image
                  src={featuredPost.mainImage && featuredPost.mainImage.asset ? 
                    urlFor(featuredPost.mainImage).width(448).height(480).url() : 
                    "/images/hero/Image.jpg"
                  }
                  alt={featuredPost.mainImage?.alt || "Featured seller image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 288px, (max-width: 1536px) 320px, 384px"
                  priority
                />
              </div>
            </div>
            
            {/* Secondary Image - Smaller (hidden on mobile) */}
            <div className="hidden md:block flex-shrink-0 w-32 h-40 lg:w-40 lg:h-48 xl:w-52 xl:h-60 2xl:w-60 2xl:h-72">
              <div className="relative w-full h-full overflow-hidden shadow-lg border-4 border-[#F4F0EB]">
                <Image
                  src={featuredPost.secondaryImage && featuredPost.secondaryImage.asset ? 
                    urlFor(featuredPost.secondaryImage).width(240).height(288).url() : 
                    "/images/hero/Image.jpg"
                  }
                  alt={featuredPost.secondaryImage?.alt || "Secondary seller image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 144px, (max-width: 1280px) 160px, (max-width: 1536px) 160px, 192px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content - Second on mobile, First on desktop */}
        <div className="w-full lg:w-1/2 order-2 lg:order-1 flex flex-col justify-center space-y-2 lg:space-y-8 xl:space-y-10 2xl:space-y-12 items-center">
          {/* Header */}
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-instrument-serif text-[#3B3634] tracking-wide mb-3 md:mb-6">
           <span className="font-instrument-serif">Projektant</span> <span className="font-instrument-serif italic">tygodnia</span>
          </h2>
          
          {/* Seller Name */}
          <h3 className="text-xl lg:text-2xl xl:text-3xl text-[#3B3634]font-medium">
          <span className="font-instrument-serif">Poznaj</span> <span className="text-[#3B3634] font-instrument-serif italic">{featuredPost.sellerName}</span>
          </h3>
          
          {/* Description */}
          <p className="text-base lg:text-lg text-[#3B3634] leading-relaxed max-w-md font-instrument-sans text-center ">
            {featuredPost.shortDescription}
          </p>
          
          {/* Button */}
          <Link 
            href={`/blog/${featuredPost.slug.current}`}
            className="inline-flex items-center justify-center px-8 py-3 ring-1 ring-[#3B3634] text-[#3B3634] font-medium text-sm lg:text-base hover:bg-[#3B3634] hover:text-white transition-colors duration-300 w-fit"
          >
            ZOBACZ POST
          </Link>
        </div>
      </div>
    </section>
  )
}