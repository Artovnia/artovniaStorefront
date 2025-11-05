import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { listProductsWithPromotions } from "@/lib/data/products"
import { getPromotionFilterOptions } from "@/lib/data/promotions"
import { PromotionListing } from "@/components/sections"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { PromotionsFilterBar } from "@/components/organisms/PromotionsFilterBar"

const REGION = "PL" // Default region for promotions

export const metadata: Metadata = {
  title: "Promocje | Artovnia",
  description: "Odkryj najlepsze promocje i okazje w Artovnia. Produkty w obniżonych cenach.",
  openGraph: {
    title: "Promocje | Artovnia",
    description: "Odkryj najlepsze promocje i okazje w Artovnia. Produkty w obniżonych cenach.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/promotions`,
    siteName: "Artovnia",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/B2C_Storefront_Open_Graph.png`,
        width: 1200,
        height: 630,
        alt: "Artovnia - Promocje",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
}

interface PromotionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PromotionsPage({ searchParams }: PromotionsPageProps) {
  const resolvedSearchParams = await searchParams
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1
  
  try {
    // Fetch products with promotions and filter options in parallel
    const [productsResult, filterOptions] = await Promise.all([
      listProductsWithPromotions({
        page,
        limit: 12,
        countryCode: REGION,
      }),
      getPromotionFilterOptions()
    ])

    const { response, nextPage } = productsResult
    const { products, count } = response

    return (
      <div className="min-h-screen bg-primary">
        {/* Hero Section with Image and Overlay */}
        <section 
          className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden"
          aria-labelledby="promotions-heading"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/promotions/15.webp"
              alt="Ceramiczne naczynia i dekoracje - promocje Artovnia"
              fill
              priority
              fetchPriority="high"
              className="object-cover object-[center] 2xl:object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
            />
          </div>

          {/* Content Overlay */}
          <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-full text-center">
              {/* Main Heading with high contrast for accessibility */}
              <h1 
                id="promotions-heading"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-instrument-serif italic font-normal text-white mb-4 sm:mb-6 drop-shadow-2xl"
              >
                Promocje
              </h1>
              
              {/* Subtitle with accessible contrast */}
              <p className="text-md sm:text-lg md:text-xl lg:text-2xl text-white font-instrument-sans max-w-3xl drop-shadow-lg uppercase">
                Najlepsze okazje i promocyjne ceny na wybrane produkty
              </p>
              
              
            </div>
          </div>

          {/* Skip to content link for keyboard navigation (WCAG 2.4.1) */}
          <a 
            href="#promotions-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#3B3634] focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:ring-offset-2"
          >
            Przejdź do treści promocji
          </a>
        </section>

        {/* Main Content */}
        <div className="max-w-[1920px] mx-auto" id="promotions-content">

          {/* Filter Bar */}
          <div className="px-4 sm:px-6 lg:px-8 pt-6">
            <PromotionsFilterBar
              promotionNames={filterOptions.promotionNames}
              sellerNames={filterOptions.sellerNames}
              campaignNames={filterOptions.campaignNames}
            />
          </div>

          {/* Products Listing */}
          <div className="px-4 sm:px-6 lg:px-8">
            <PromotionDataProvider countryCode={REGION}>
              <PromotionListing
                initialProducts={products}
                initialCount={count}
                initialPage={page}
                countryCode={REGION}
                limit={12}
              />
            </PromotionDataProvider>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching promotions:", error)
    
    return (
      <div className="min-h-screen bg-primary">
        {/* Error Hero Section */}
        <section className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/promotions/15.webp"
              alt="Ceramiczne naczynia i dekoracje - promocje Artovnia"
              fill
              priority
              fetchPriority="high"
              className="object-cover object-center 2xl:object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" aria-hidden="true" />
          </div>
          <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-instrument-serif italic text-white drop-shadow-2xl">
              Promocje
            </h1>
          </div>
        </section>
        
        {/* Error Message */}
        <div className="max-w-[1920px] mx-auto px-4 py-12">
          <div 
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
            role="alert"
            aria-live="assertive"
          >
            <h2 className="text-2xl font-bold mb-4 font-instrument-serif text-red-600">Wystąpił błąd</h2>
            <p className="text-[#3B3634] mb-6 font-instrument-sans">
              Nie udało się załadować promocji. Spróbuj ponownie później.
            </p>
          </div>
        </div>
      </div>
    )
  }
}