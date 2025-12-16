import { listCategoriesWithProducts } from "@/lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import { isServerSideBot } from "@/lib/utils/server-bot-detection"
import { SmartProductsListing } from '@/components/sections/ProductListing/SmartProductsListing'
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { JsonLd } from '@/components/JsonLd'
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
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={collectionJsonLd} />
      
    <PromotionDataProvider countryCode="PL" productIds={[]} limit={0}>
      <BatchPriceProvider currencyCode="PLN">
        <main className="mx-auto max-w-[1920px] pt-2 xl:pt-24 pb-12 xl:pb-24">
          {/* ✅ No Suspense needed - SmartProductsListing handles its own loading states */}
          <SmartProductsListing 
            locale={locale}
            categories={allCategoriesWithTree}
            serverSideIsBot={serverSideIsBot}
          />
        </main>
      </BatchPriceProvider>
    </PromotionDataProvider>
    </>
  )
}

export default AllCategories