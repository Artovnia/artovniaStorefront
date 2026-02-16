import {
  BannerSection,
  BlogSection,
  Hero,
  HomePopularBrandsSection,
  ShopByStyleSection,
  HomeNewestProductsSection,
  SmartBestProductsSection,
  HomeCategories,
} from "@/components/sections"
import { BestSellersSection } from "@/components/sections/HomeProductSection/BestSellersSection"
import { DesignerOfTheWeekSectionServer } from "@/components/sections/DesignerOfTheWeekSection/DesignerOfTheWeekSectionServer"
import { Suspense } from "react"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { listProductsWithPromotions } from "@/lib/data/products"
import type { Metadata } from "next"
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/helpers/seo"
import { JsonLd } from "@/components/JsonLd"
import { getBatchLowestPrices } from "@/lib/data/price-history"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"

// Loading skeletons for initial load - unified cache prevents these on navigation
const BlogSkeleton = () => (
  <div className="w-full bg-white py-2 md:py-8" role="status" aria-label="Ładowanie sekcji bloga">
    <div className="mx-auto max-w-[1920px] w-full px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)



export const metadata: Metadata = {
  title: {
    absolute: "Rękodzieło i Sztuka Handmade | Artovnia - Polski Marketplace"
  },
  description:
    "Rękodzieło, biżuteria handmade, obrazy, ceramika, rzeźby i meble od polskich artystów. Kup unikalne dzieła sztuki lub sprzedawaj swoje prace na Artovnia.",
  keywords: [
    // Primary keywords (highest search volume)
    'rękodzieło',
    'handmade',
    'sztuka',
    'rękodzieło artystyczne',
    'polskie rękodzieło',
    // Biżuteria (jewelry - high search volume)
    'biżuteria handmade',
    'naszyjniki handmade',
    'kolczyki handmade',
    'bransoletki',
    'pierścionki',
    'broszki',
    'biżuteria personalizowana',
    // Ubrania i moda (clothing)
    'ubrania handmade',
    'sukienki handmade',
    'swetry ręcznie robione',
    'torebki handmade',
    'plecaki handmade',
    // Dom i dekoracje (home & decor)
    'dekoracje do domu',
    'obrazy na sprzedaż',
    'obrazy polskich artystów',
    'ceramika artystyczna',
    'ceramika dekoracyjna',
    'świece handmade',
    'wazony',
    'rzeźby',
    'makramy',
    'poduszki dekoracyjne',
    // Meble (furniture)
    'meble ręcznie robione',
    'meble drewniane',
    'krzesła handmade',
    'stoły drewniane',
    // Dzieci (children)
    'zabawki handmade',
    'ubranka dla dzieci',
    'maskotki handmade',
    'dekoracje do pokoju dziecięcego',
    // Prezenty (gifts)
    'prezenty handmade',
    'prezenty personalizowane',
    'prezent na urodziny',
    'prezent ślubny',
    'kartki okolicznościowe',
    // Vintage
    'vintage',
    'antyki',
    'biżuteria vintage',
    // Marketplace keywords
    'marketplace rękodzieła',
    'marketplace sztuki',
    'polska sztuka',
    'polscy artyści',
    'kupić rękodzieło',
    'sprzedawać rękodzieło',
  ].join(', '),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL,
    languages: {
      'pl': process.env.NEXT_PUBLIC_BASE_URL,
      'x-default': process.env.NEXT_PUBLIC_BASE_URL,
    },
  },
  openGraph: {
    title: "Rękodzieło i Sztuka Handmade | Artovnia",
    description:
      "Rękodzieło, biżuteria handmade, obrazy, ceramika, rzeźby i meble od polskich artystów. Kup unikalne dzieła sztuki lub sprzedawaj swoje prace.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Artovnia",
    type: "website",
    locale: "pl_PL",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/ArtovniaOgImage.png`,
        width: 1200,
        height: 630,
        alt: "Artovnia - Marketplace Sztuki i Rękodzieła",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@artovnia',
    creator: '@artovnia',
    title: 'Rękodzieło i Sztuka Handmade | Artovnia',
    description: 'Rękodzieło, biżuteria handmade, obrazy, ceramika i meble od polskich artystów. Kup unikalne dzieła sztuki.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/ArtovniaOgImage.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}


const DesignerOfTheWeekSkeleton = () => (
  <div className="w-full bg-[#F4F0EB] min-h-[400px] py-2 md:py-8" role="status" aria-label="Ładowanie sekcji projektant tygodnia">
    <div className="mx-auto max-w-[1920px] w-full px-4 lg:px-8 py-6 md:py-8 font-instrument-sans">
      {/* Mobile skeleton */}
      <div className="block md:hidden">
        <div className="relative w-full aspect-[3/4] max-h-[70vh] overflow-hidden shadow-xl bg-gray-300/40 animate-pulse rounded" />
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
        {/* Text Content - Left */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center space-y-4 lg:space-y-8 xl:space-y-10 text-center animate-pulse">
          <div className="h-8 lg:h-10 bg-gray-300/50 rounded w-64" />
          <div className="h-7 lg:h-8 bg-gray-300/50 rounded w-48" />
          <div className="space-y-2 w-full max-w-md">
            <div className="h-4 bg-gray-300/40 rounded w-full" />
            <div className="h-4 bg-gray-300/40 rounded w-5/6 mx-auto" />
            <div className="h-4 bg-gray-300/40 rounded w-4/6 mx-auto" />
          </div>
          <div className="h-12 bg-gray-300/50 rounded w-48" />
        </div>

        {/* Images - Right */}
        <div className="w-full lg:w-1/2">
          <div className="flex items-start justify-center lg:justify-start gap-4 md:gap-6 lg:gap-8 xl:gap-12 2xl:gap-16">
            {/* Main Image placeholder */}
            <div className="flex-shrink-0 w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-88 xl:w-80 xl:h-96 2xl:w-[28rem] 2xl:h-[30rem] bg-gray-300/40 animate-pulse rounded shadow-lg" />
            {/* Secondary Image placeholder */}
            <div className="flex-shrink-0 w-32 h-40 lg:w-40 lg:h-48 xl:w-52 xl:h-60 2xl:w-60 2xl:h-72 bg-gray-300/40 animate-pulse rounded shadow-lg border-4 border-[#F4F0EB]" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ProductsSkeleton = () => (
  <div className="py-2 md:py-8 w-full" role="status" aria-label="Ładowanie produktów">
    <div className="h-8 bg-gray-200 rounded w-48 mb-6 md:mb-12 ml-4 lg:ml-[68px] animate-pulse"></div>
    <div className="flex gap-4 overflow-hidden px-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex-shrink-0 w-[252px]">
          <div className="h-[315px] bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
)

const CategoriesSkeleton = () => (
  <div className="w-full bg-primary py-2 md:py-8" role="status" aria-label="Ładowanie kategorii">
    <div className="mx-auto max-w-[1920px] w-full px-4 lg:px-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 lg:mb-12 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
        <div className="h-[300px] lg:h-[400px] bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4 lg:gap-6 xl:gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[140px] lg:h-[190px] bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

/**
 * ✅ OPTIMIZATION: Async wrapper for SmartBestProductsSection
 * Fetches user data in parallel with rendering, doesn't block LCP
 */
async function SmartBestProductsSectionWithUser({ locale }: { locale: string }) {
  // Fetch user data - this doesn't block Hero rendering due to Suspense
  let user: HttpTypes.StoreCustomer | null = null
  let wishlist: SerializableWishlist[] = []
  
  try {
    const userData = await retrieveCustomer().catch(() => null)
    if (userData) {
      user = userData
      const wishlistData = await getUserWishlists().catch(() => ({ wishlists: [] }))
      wishlist = wishlistData.wishlists || []
    }
  } catch {
    // Silent fail - user not authenticated
  }
  
  return (
    <SmartBestProductsSection 
      user={user} 
      wishlist={wishlist} 
    />
  )
}

/**
 * ✅ OPTIMIZATION: Async wrapper for HomeNewestProductsSection
 * Fetches user data in parallel, doesn't block above-the-fold content
 */
async function HomeNewestProductsSectionWithUser({ locale }: { locale: string }) {
  let user: HttpTypes.StoreCustomer | null = null
  let wishlist: SerializableWishlist[] = []
  
  try {
    const userData = await retrieveCustomer().catch(() => null)
    if (userData) {
      user = userData
      const wishlistData = await getUserWishlists().catch(() => ({ wishlists: [] }))
      wishlist = wishlistData.wishlists || []
    }
  } catch {
    // Silent fail
  }
  
  return (
    <HomeNewestProductsSection 
      heading="Nowości" 
      locale={locale}
      limit={8}
      home={true}
      user={user}
      wishlist={wishlist}
    />
  )
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Generate structured data for SEO
  const organizationJsonLd = generateOrganizationJsonLd()
  const websiteJsonLd = generateWebsiteJsonLd()

  // ✅ CRITICAL LCP OPTIMIZATION: Don't block initial render with data fetching
  // User data is now fetched inside Suspense-wrapped components
  // Promotional data is fetched in parallel but doesn't block Hero
  
  // Fetch promotional products - this runs in parallel with rendering
  // but doesn't block the initial HTML response
  const promotionalDataPromise = listProductsWithPromotions({
    page: 1,
    limit: 30,
    countryCode: 'PL'
  }).catch((error) => {
    console.error("Error fetching promotional data:", error)
    return { response: { products: [], count: 0 }, nextPage: null }
  })
  
  // Await promotional data (this is needed for BatchPriceProvider)
  const promotionalData = await promotionalDataPromise

  // ✅ Convert products array to Map for PromotionDataProvider
  const promotionalProductsMap = new Map(
    promotionalData.response.products.map(p => [p.id, p])
  )

  // ✅ OPTIMIZATION: Server-side price fetching for instant rendering
  // Extract all variant IDs from promotional products
  const variantIds = promotionalData.response.products
    .flatMap(p => p.variants?.map(v => v.id) || [])
    .filter(Boolean)
  
  // Fetch price data on server (eliminates client-side loading delay)
  const priceData = await getBatchLowestPrices(variantIds, 'PLN', undefined, 30)

  return (
    <>
      {/* Structured Data (JSON-LD) for SEO */}
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      
      <PromotionDataProvider 
      countryCode="PL" 
      limit={30}
      initialData={promotionalProductsMap}
    >
      <BatchPriceProvider 
        currencyCode="PLN"
        preloadVariantIds={variantIds}
        initialPriceData={priceData}
      >
        <main className="flex flex-col text-primary" aria-label="Strona główna Artovnia">
          {/* ✅ CRITICAL: Hero renders FIRST - no async dependencies, no Suspense */}
          <div className="mx-auto max-w-[1920px] w-full">
            <Hero />
          </div>
          
          {/* ✅ OPTIMIZATION: SmartBestProducts in Suspense - doesn't block Hero LCP */}
          {/* User data fetched inside component, not blocking page render */}
          <div className="mx-auto max-w-[1920px] w-full mb-8 min-h-[400px] py-2 md:py-8">
            <Suspense fallback={<ProductsSkeleton />}>
              <SmartBestProductsSectionWithUser locale={locale} />
            </Suspense>
          </div>

          {/* Best Sellers - based on actual sales data */}
        {/*   <div className="mx-auto max-w-[1920px] w-full mb-8 min-h-[400px] py-2 md:py-8">
            <Suspense fallback={<ProductsSkeleton />}>
            <BestSellersSection 
                heading="Najczęściej kupowane"
                locale={locale}
                limit={10}
                days={90}
                home={true}
                user={user}
                wishlist={wishlist}
              />
            </Suspense> 
          </div> */}
         
          {/* Full width dark section */}
          <div className="w-full bg-[#3B3634]">
            {/* Content container inside full-width section */}
            <div className="mx-auto max-w-[1920px] w-full min-h-[400px] py-2 md:py-8 font-instrument-sans">
              <Suspense fallback={<ProductsSkeleton />}>
                <HomeNewestProductsSectionWithUser locale={locale} />
              </Suspense>
            </div>
          </div>

          {/* Categories Section - wrapped in Suspense for streaming */}
          <Suspense fallback={<CategoriesSkeleton />}>
            <div className="w-full bg-primary py-2 md:py-8">
              <HomeCategories heading="Wybrane" headingItalic="kategorie" />
            </div>
          </Suspense>
          
          {/* Designer of the Week Section - ✅ SERVER COMPONENT: Optimized for performance */}
          {/* Fetches Sanity data during server render with 10-min caching */}
          <Suspense fallback={<DesignerOfTheWeekSkeleton />}>
          <div className="w-full bg-[#F4F0EB] min-h-[400px] py-2 md:py-8">
            <DesignerOfTheWeekSectionServer />
          </div>
          </Suspense>

          {/* Blog Section - cached for 10 minutes with unified cache */}
          <div className="w-full bg-white py-2 md:py-8">
            <div className="mx-auto max-w-[1920px] w-full">
              <Suspense fallback={<BlogSkeleton />}>
                <BlogSection />
              </Suspense>
            </div>
          </div>

         

    
        </main>
      </BatchPriceProvider>
    </PromotionDataProvider>
    </>
  )
}