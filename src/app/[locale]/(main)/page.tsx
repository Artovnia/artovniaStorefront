import {
  BannerSection,
  BlogSection,
  Hero,
  HomePopularBrandsSection,
  ShopByStyleSection,
  HomeNewestProductsSection,
  SmartBestProductsSection,
  HomeCategories,
  DesignerOfTheWeekSection,
} from "@/components/sections"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { Suspense } from "react"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { listProductsWithPromotions } from "@/lib/data/products"
import type { Metadata } from "next"

// Blog loading skeleton for Suspense fallback
const BlogSkeleton = () => (
  <div className="w-full bg-white py-2 md:py-8">
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
  title: "Home",
  description:
    "Artovnia - market sztuki i rękodzieła",
  openGraph: {
    title: "Artovnia - market sztuki i rękodzieła",
    description:
      "Artovnia - market sztuki i rękodzieła",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Artovnia - market sztuki i rękodzieła",
    type: "website",
    images: [
      {
        url: "/B2C_Storefront_Open_Graph.png",
        width: 1200,
        height: 630,
        alt: "Artovnia - market sztuki i rękodzieła",
      },
    ],
  },
}

// Loading skeleton components for Suspense fallbacks
const HeroSkeleton = () => (
  <div className="w-full h-[20vh] sm:h-[40vh] lg:h-[50vh] min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] bg-gray-200 animate-pulse" />
)

const ProductsSkeleton = () => (
  <div className="py-2 md:py-8 w-full">
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

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // ✅ OPTIMIZATION: PARALLEL DATA FETCHING ON SERVER
  // Fetch user data and promotional products simultaneously to eliminate waterfall
  const [userResult, promotionalDataResult] = await Promise.allSettled([
    // Fetch user and wishlist
    retrieveCustomer()
      .then(async (user) => {
        if (user) {
          const wishlistData = await getUserWishlists()
          return { user, wishlist: wishlistData.wishlists || [] }
        }
        return { user: null, wishlist: [] }
      })
      .catch((error) => {
        // User not authenticated - this is normal
        if ((error as any)?.status !== 401) {
          console.error("Error fetching user data:", error)
        }
        return { user: null, wishlist: [] }
      }),
    
    // ✅ NEW: Fetch promotional products on server (eliminates 3.3s client-side delay)
    listProductsWithPromotions({
      page: 1,
      limit: 30,
      countryCode: 'PL'
    }).catch((error) => {
      console.error("Error fetching promotional data:", error)
      return { response: { products: [], count: 0 }, nextPage: null }
    })
  ])

  // Extract results
  const { user, wishlist } = userResult.status === 'fulfilled' 
    ? userResult.value 
    : { user: null, wishlist: [] }
  
  const promotionalData = promotionalDataResult.status === 'fulfilled'
    ? promotionalDataResult.value
    : { response: { products: [], count: 0 }, nextPage: null }

  // ✅ Convert products array to Map for PromotionDataProvider
  const promotionalProductsMap = new Map(
    promotionalData.response.products.map(p => [p.id, p])
  )

  return (
    <PromotionDataProvider 
      countryCode="PL" 
      limit={30}
      initialData={promotionalProductsMap}
    >
      <BatchPriceProvider currencyCode="PLN">
        <main className="flex flex-col text-primary">
          {/* ✅ PHASE 1.4: SUSPENSE BOUNDARIES FOR STREAMING */}
          {/* Hero section with Suspense for faster initial paint */}
          <div className="mx-auto max-w-[1920px] w-full">
            <Suspense fallback={<HeroSkeleton />}>
              <Hero />
            </Suspense>
          </div>
          
          {/* Smart Best Products Section with Suspense */}
          <div className="mx-auto max-w-[1920px] w-full mb-8 min-h-[400px] py-2 md:py-8">
            <Suspense fallback={<ProductsSkeleton />}>
              <SmartBestProductsSection user={user} wishlist={wishlist} />
            </Suspense>
          </div>
         
          {/* Full width dark section */}
          <div className="w-full bg-[#3B3634]">
            {/* Content container inside full-width section */}
            <div className="mx-auto max-w-[1920px] w-full min-h-[400px] py-2 md:py-8 font-instrument-sans">
              <Suspense fallback={<ProductsSkeleton />}>
                <HomeNewestProductsSection 
                  heading="Nowości" 
                  locale={locale}
                  limit={8}
                  home={true}
                  user={user}
                  wishlist={wishlist}
                />
              </Suspense>
            </div>
          </div>

          {/* Categories Section - Static, no Suspense needed */}
          <div className="w-full bg-primary py-2 md:py-8">
            <HomeCategories heading="Wybrane" headingItalic="kategorie" />
          </div>
          
          {/* Designer of the Week Section - Client component, no Suspense needed */}
          <div className="w-full bg-[#F4F0EB] min-h-[400px] py-2 md:py-8">
            <DesignerOfTheWeekSection />
          </div>

          {/* ✅ PHASE 1.4: BLOG SECTION WITH SUSPENSE (Below fold) */}
          {/* Note: In Next.js 15, Suspense with async components provides lazy loading */}
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
  )
}
