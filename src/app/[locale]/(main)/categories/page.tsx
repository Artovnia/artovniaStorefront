import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Suspense } from "react"
import { listCategoriesWithProducts } from "@/lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import { isServerSideBot } from "@/lib/utils/server-bot-detection"
import { SmartProductsListing } from "@/components/sections/ProductListing/SmartProductsListing"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import type { Metadata } from "next"
import { generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/helpers/seo"

export const metadata: Metadata = {
  title: "Wszystkie Kategorie - Artovnia | Przeglądaj Sztukę i Rękodzieło",
  description:
    "Przeglądaj wszystkie kategorie sztuki i rękodzieła na Artovnia. Znajdź unikalne dzieła w kategoriach: ceramika, malarstwo, rzeźba, biżuteria i więcej.",
  keywords: [
    'kategorie sztuki',
    'przeglądaj sztukę',
    'kategorie rękodzieła',
    'ceramika',
    'malarstwo',
    'rzeźba',
    'biżuteria artystyczna',
  ].join(', '),
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
    languages: {
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/categories`,
      'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/categories`,
      'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
    },
  },
  openGraph: {
    title: "Wszystkie Kategorie - Artovnia",
    description:
      "Przeglądaj wszystkie kategorie sztuki i rękodzieła. Znajdź unikalne dzieła od polskich artystów.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
    siteName: "Artovnia",
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    site: "@artovnia",
    creator: "@artovnia",
    title: "Wszystkie Kategorie - Artovnia",
    description: "Przeglądaj wszystkie kategorie sztuki i rękodzieła",
  },
  robots: {
    index: true,
    follow: true,
  },
}


async function AllCategories({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Server-side bot detection to prevent Algolia queries for bots
  const serverSideIsBot = await isServerSideBot()

  // Fetch only categories with products (same as Header/Navbar for consistency)
  let allCategoriesWithTree: HttpTypes.StoreProductCategory[] = []
  
  try {
    // Use listCategoriesWithProducts to show only populated categories in sidebar
    const categoriesData = await listCategoriesWithProducts()
    
    if (categoriesData && categoriesData.categories) {
      allCategoriesWithTree = categoriesData.categories
    }
  } catch (error) {
    console.error("Error retrieving categories with listCategories:", error)
    allCategoriesWithTree = []
  }

  const breadcrumbsItems = [
    {
      path: "/",
      label: "Strona główna",
    },
    {
      path: "/categories",
      label: "Kategorie",
    },
  ]

    // Generate structured data for SEO
    const breadcrumbJsonLd = generateBreadcrumbJsonLd([
      { label: "Strona główna", path: "/" },
      { label: "Kategorie", path: "/categories" },
    ])
    const collectionJsonLd = generateCollectionPageJsonLd(
      "Kategorie Produktów",
      "Przeglądaj wszystkie kategorie produktów na Artovnia - sztuka, rękodzieło, design i więcej.",
      `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
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
      
    <PromotionDataProvider countryCode="PL" limit={50}>
      <BatchPriceProvider currencyCode="PLN">
        <main className="mx-auto max-w-[1920px] pt-24 pb-24">
          <Suspense 
            fallback={
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <ProductListingSkeleton />
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">Loading components...</span>
                  </div>
                </div>
              </div>
            }
          >
            <SmartProductsListing 
              locale={locale}
              categories={allCategoriesWithTree}
              serverSideIsBot={serverSideIsBot}
            />
          </Suspense>
        </main>
      </BatchPriceProvider>
    </PromotionDataProvider>
    </>
  )
}

export default AllCategories