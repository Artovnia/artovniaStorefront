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
import { Suspense } from "react"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { listProductsWithPromotions } from "@/lib/data/products"
import type { Metadata } from "next"
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/helpers/seo"

// Loading skeletons for initial load - unified cache prevents these on navigation
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
  title: "Artovnia - Marketplace Sztuki i Rękodzieła Artystycznego | Unikalne Dzieła",
  description:
    "Odkryj unikalne dzieła sztuki i rękodzieła od polskich artystów. Ceramika, malarstwo, rzeźba i więcej. Kup oryginalną sztukę bezpośrednio od twórców na Artovnia.",
  keywords: [
    'marketplace sztuki',
    'rękodzieło artystyczne',
    'polska sztuka',
    'ceramika artystyczna',
    'unikalne dzieła sztuki',
    'polscy artyści',
    'oryginalna sztuka',
    'marketplace rękodzieła',
  ].join(', '),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL,
    languages: {
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl`,
      'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en`,
      'x-default': process.env.NEXT_PUBLIC_BASE_URL,
    },
  },
  openGraph: {
    title: "Artovnia - Marketplace Sztuki i Rękodzieła Artystycznego",
    description:
      "Odkryj unikalne dzieła sztuki i rękodzieła od polskich artystów. Kup oryginalną sztukę bezpośrednio od twórców.",
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
    title: 'Artovnia - Marketplace Sztuki',
    description: 'Odkryj unikalne dzieła sztuki i rękodzieła od polskich artystów',
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

  // Generate structured data for SEO
  const organizationJsonLd = generateOrganizationJsonLd()
  const websiteJsonLd = generateWebsiteJsonLd()


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
          console.error("❌ [PAGE DEBUG] Error fetching user data:", error)
        }
        return { user: null, wishlist: [] }
      }),
    
    // ✅ Fetch promotional products on server (eliminates client-side delay)
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
    <>
      {/* ✅ Preload first hero image - Eliminates 1820ms Resource Load Delay on mobile */}
      {/* Hero is a Client Component, so browser doesn't discover image until JS executes */}
      {/* Preload starts download immediately when HTML loads, before JS runs */}
      <link
        rel="preload"
        as="image"
        href="/images/hero/Hero01.webp"
        // @ts-ignore - imageSrcSet is valid but not in types
        imageSrcSet="/_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=640&q=90 640w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=750&q=90 750w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=828&q=90 828w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=1080&q=90 1080w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=1200&q=90 1200w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=1920&q=90 1920w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=2048&q=90 2048w, /_next/image?url=%2Fimages%2Fhero%2FHero01.webp&w=3840&q=90 3840w"
        // @ts-ignore - fetchPriority is valid but not in types
        fetchPriority="high"
      />
      
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      
      <PromotionDataProvider 
      countryCode="PL" 
      limit={30}
      initialData={promotionalProductsMap}
    >
      <BatchPriceProvider currencyCode="PLN">
        <main className="flex flex-col text-primary">
          {/* ✅ Hero renders immediately - no async dependencies */}
          <div className="mx-auto max-w-[1920px] w-full">
            <Hero />
          </div>
          
          {/* Smart Best Products - cached, renders immediately on navigation */}
          <div className="mx-auto max-w-[1920px] w-full mb-8 min-h-[400px] py-2 md:py-8">
            <SmartBestProductsSection user={user} wishlist={wishlist} />
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
