import { Metadata } from "next"
import { Suspense } from "react"
import { listProductsWithPromotions } from "@/lib/data/products"
import { PromotionListing, PageHero } from "@/components/sections"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { PromotionsFilterBar } from "@/components/organisms/PromotionsFilterBar"
import { detectUserCountry } from "@/lib/helpers/country-detection"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/helpers/seo"
import { getBatchLowestPrices } from "@/lib/data/price-history"
import { extractFilterOptions } from "@/lib/utils/extract-filter-options"
import { extractCategoriesWithHierarchy } from "@/lib/data/category-hierarchy"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { getRegion } from "@/lib/data/regions"

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
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/promotions`,
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

// ✅ PERFORMANCE: Async sub-component for data fetching
// Wrapped in Suspense so the hero section streams to the browser immediately
// while this component fetches data from the backend
async function PromotionsContent({ page }: { page: number }) {
  // ✅ OPTIMIZATION: Detect country first (needed by downstream calls)
  const countryCode = await detectUserCountry()

  // ✅ OPTIMIZATION: Fetch products, region, and user data in parallel
  const [productsResult, region, userData] = await Promise.all([
    listProductsWithPromotions({
      page,
      limit: 15,
      countryCode,
    }),
    getRegion(countryCode),
    // User data fetch (non-critical, won't fail the page)
    (async () => {
      try {
        const user = await retrieveCustomer()
        if (user) {
          const wishlistData = await getUserWishlists()
          return { user, wishlist: wishlistData.wishlists || [] }
        }
        return { user: null, wishlist: [] as any[] }
      } catch (error) {
        if ((error as any)?.status !== 401) {
          console.error("Error fetching user data:", error)
        }
        return { user: null, wishlist: [] as any[] }
      }
    })(),
  ])

  const { response } = productsResult
  const { products, count } = response
  const { user, wishlist } = userData

  // ✅ OPTIMIZATION: Extract filter options and categories in parallel
  const [filterOptions, categoriesWithHierarchy] = await Promise.all([
    Promise.resolve(extractFilterOptions(products)),
    extractCategoriesWithHierarchy(products),
  ])

  // ✅ OPTIMIZATION: Convert products to Map for PromotionDataProvider
  const promotionalProductsMap = new Map(
    products.map(p => [p.id, p])
  )

  // Extract all variant IDs and fetch price data
  const variantIds = products
    .flatMap(p => p.variants?.map(v => v.id) || [])
    .filter(Boolean)

  const priceData = await getBatchLowestPrices(variantIds, 'PLN', region?.id, 30)

  return (
    <>
      {/* Filter Bar */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <PromotionsFilterBar
          promotionNames={filterOptions.promotionNames}
          sellerNames={filterOptions.sellerNames}
          campaignNames={filterOptions.campaignNames}
          categoryNames={categoriesWithHierarchy}
        />
      </div>

      {/* Products Listing */}
      <div className="px-4 sm:px-6 lg:px-8 mx-auto">
        <PromotionDataProvider
          countryCode={countryCode}
          productIds={[]}
          initialData={promotionalProductsMap}
        >
          <BatchPriceProvider
            currencyCode="PLN"
            regionId={region?.id}
            days={30}
            initialPriceData={priceData}
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
          </BatchPriceProvider>
        </PromotionDataProvider>
      </div>
    </>
  )
}

// ✅ PERFORMANCE: Minimal fallback — no skeleton on cached navigations
// This only shows on the very first uncached load while data streams in
function PromotionsContentFallback() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-6">
          <div className="h-4 bg-gray-200/50 rounded w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-12">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
              <div className="aspect-square bg-gray-200/50" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200/50 rounded w-3/4" />
                <div className="h-4 bg-gray-200/50 rounded w-1/2" />
                <div className="h-6 bg-gray-200/50 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function PromotionsPage({ searchParams }: PromotionsPageProps) {
  const resolvedSearchParams = await searchParams
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1

  // Generate structured data for SEO (non-blocking, no API calls)
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
        {/* ✅ PERFORMANCE: Hero renders instantly via streaming (no data dependency) */}
        {/* Static image import = build-time optimization + blur placeholder */}
        <PageHero
          title="Promocje"
          subtitle="Najlepsze okazje i promocyjne ceny na wybrane produkty"
          headingId="promotions-heading"
          contentId="promotions-content"
          skipLinkText="Przejdź do treści promocji"
          imageAlt="Ceramiczne naczynia i dekoracje - promocje Artovnia"
        />

        {/* Main Content */}
        <div className="max-w-[1920px] mx-auto w-full" id="promotions-content">
          {/* ✅ PERFORMANCE: Suspense streams hero immediately, data loads in background */}
          {/* On cached navigations (ISR warm), this resolves instantly — no fallback shown */}
          <Suspense fallback={<PromotionsContentFallback />}>
            <PromotionsContent page={page} />
          </Suspense>
        </div>
      </div>
    </>
  )
}