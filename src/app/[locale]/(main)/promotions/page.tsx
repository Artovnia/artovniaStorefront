import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { Suspense } from "react"
import { listProductsWithPromotions } from "@/lib/data/products"
import { getPromotionFilterOptions } from "@/lib/data/promotions"
import { PromotionListing } from "@/components/sections"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { PromotionsFilterBar } from "@/components/organisms/PromotionsFilterBar"
import { detectUserCountry } from "@/lib/helpers/country-detection"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/helpers/seo"

export const metadata: Metadata = {
  title: "Promocje - Najlepsze Okazje na Sztukę i Rękodzieło",
  description: "Odkryj najlepsze promocje i wyprzedaże na Artovnia. Unikalne dzieła sztuki i rękodzieła w obniżonych cenach. Limitowane okazje od polskich artystów.",
  keywords: [
    'promocje sztuki',
    'wyprzedaż rękodzieła',
    'okazje artystyczne',
    'obniżki',
    'tanie dzieła sztuki',
    'promocje marketplace',
  ].join(', '),
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/promotions`,
    languages: {
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/promotions`,
      'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/promotions`,
      'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/promotions`,
    },
  },
  openGraph: {
    title: "Promocje - Najlepsze Okazje na Sztukę",
    description: "Odkryj najlepsze promocje i wyprzedaże. Unikalne dzieła sztuki i rękodzieła w obniżonych cenach.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/promotions`,
    siteName: "Artovnia",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/ArtovniaOgImage.png`,
        width: 1200,
        height: 630,
        alt: "Artovnia - Promocje",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    site: '@artovnia',
    creator: '@artovnia',
    title: 'Promocje',
    description: 'Najlepsze okazje na sztukę i rękodzieło w obniżonych cenach',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/ArtovniaOgImage.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ✅ PERFORMANCE: Cache with revalidation instead of force-dynamic
// This gives us both caching AND loading skeleton support
export const revalidate = 300 // Revalidate every 5 minutes

interface PromotionsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Loading skeleton for promotions
const PromotionsContentSkeleton = () => (
  <div className="px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-12">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default async function PromotionsPage({ searchParams }: PromotionsPageProps) {
  const resolvedSearchParams = await searchParams
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1
  
  try {
    // ✅ OPTIMIZATION 1: Use dynamic country detection instead of hardcoded "PL"
    const countryCode = await detectUserCountry()
    
    // ✅ OPTIMIZATION 2: Fetch user data once at page level (eliminate duplicate calls)
    let user = null
    let wishlist: any[] = []
    
    try {
      user = await retrieveCustomer()
      if (user) {
        const wishlistData = await getUserWishlists()
        wishlist = wishlistData.wishlists || []
      }
    } catch (error) {
      // User not authenticated - this is normal
      if ((error as any)?.status !== 401) {
        console.error("Error fetching user data:", error)
      }
    }
    
    // Fetch products with promotions and filter options in parallel
    const [productsResult, filterOptions] = await Promise.all([
      listProductsWithPromotions({
        page,
        limit: 12,
        countryCode,  // ✅ Use dynamic country
      }),
      getPromotionFilterOptions()
    ])

    const { response, nextPage } = productsResult
    const { products, count } = response
    
    // ✅ OPTIMIZATION 3: Extract product IDs for PromotionDataProvider
    // Only fetch promotion data for displayed products (12 instead of 100)
    const productIds = products.map(p => p.id)

    // Generate structured data for SEO
    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
      { label: "Strona główna", path: "/" },
      { label: "Promocje", path: "/promotions" },
    ])
    const collectionJsonLd = generateCollectionPageJsonLd(
      "Promocje - Najlepsze Okazje",
      "Odkryj najlepsze promocje i wyprzedaże na Artovnia. Unikalne dzieła sztuki i rękodzieła w obniżonych cenach.",
      `${process.env.NEXT_PUBLIC_BASE_URL}/promotions`
    )

    return (
      <>
        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
        
      <div className="min-h-screen bg-primary">
        {/* Hero Section with Image and Overlay */}
        <section 
          className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden"
          aria-labelledby="promotions-heading"
        >
          {/* Background Image - Optimized for immediate loading */}
          <Image
            src="/images/promotions/15.webp"
            alt="Ceramiczne naczynia i dekoracje - promocje Artovnia"
            fill
            priority
            loading="eager"
            fetchPriority="high"
            className="object-cover object-[center] 2xl:object-contain"
            sizes="100vw"
            quality={75}
            unoptimized={false}
          />

         
          {/* Content Overlay */}
          <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <div className="flex flex-col items-center justify-center h-full text-center">
              {/* Main Heading with high contrast for accessibility */}
              <h1 
                id="promotions-heading"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-instrument-serif italic font-normal text-white mb-4 sm:mb-6 drop-shadow-2xl"
              >
                Promocje
              </h1>
              
              {/* Subtitle with accessible contrast */}
              <p className="text-md sm:text-lg md:text-xl lg:text-xl text-white font-instrument-sans max-w-3xl drop-shadow-lg uppercase">
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
        <div className="max-w-[1920px] mx-auto w-full" id="promotions-content">

          {/* Filter Bar */}
          <div className="px-4 sm:px-6 lg:px-8 pt-6">
            <PromotionsFilterBar
              promotionNames={filterOptions.promotionNames}
              sellerNames={filterOptions.sellerNames}
              campaignNames={filterOptions.campaignNames}
            />
          </div>

          {/* Products Listing with Suspense */}
          <div className="px-4 sm:px-6 lg:px-8 mx-auto">
            <Suspense fallback={<PromotionsContentSkeleton />}>
              <PromotionDataProvider 
                countryCode={countryCode}
                productIds={productIds}
              >
                <PromotionListing
                  initialProducts={products}
                  initialCount={count}
                  initialPage={page}
                  countryCode={countryCode}
                  limit={12}
                  user={user}
                  wishlist={wishlist}
                />
              </PromotionDataProvider>
            </Suspense>
          </div>
        </div>
      </div>
      </>
    )
  } catch (error) {
    console.error("Error fetching promotions:", error)
    
    return (
      <div className="min-h-screen bg-primary">
        {/* Error Hero Section */}
        <section className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden">
          <Image
            src="/images/promotions/15.webp"
            alt="Ceramiczne naczynia i dekoracje - promocje Artovnia"
            fill
            priority
            loading="eager"
            fetchPriority="high"
            className="object-cover object-center 2xl:object-contain"
            sizes="100vw"
            quality={75}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" aria-hidden="true" />
          <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center z-10">
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
            <h2 className="text-2xl  mb-4 font-instrument-serif text-red-600">Wystąpił błąd</h2>
            <p className="text-[#3B3634] mb-6 font-instrument-sans">
              Nie udało się załadować promocji. Spróbuj ponownie później.
            </p>
          </div>
        </div>
      </div>
    )
  }
}