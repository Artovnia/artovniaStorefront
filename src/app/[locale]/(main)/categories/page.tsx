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
  title: "Rękodzieło i Sztuka - Wszystkie Kategorie | Artovnia",
  description:
    "Przeglądaj kategorie rękodzieła i sztuki handmade: biżuteria, obrazy, ceramika, rzeźby, meble, dekoracje, ubrania. Unikalne dzieła od polskich artystów.",
  keywords: [
    // Primary keywords
    'rękodzieło',
    'handmade',
    'sztuka',
    'polskie rękodzieło',
    // Biżuteria
    'biżuteria handmade',
    'naszyjniki',
    'kolczyki',
    'bransoletki',
    'pierścionki',
    // Ubrania i moda
    'ubrania handmade',
    'sukienki',
    'torebki handmade',
    // Dom i dekoracje
    'dekoracje do domu',
    'obrazy na sprzedaż',
    'ceramika artystyczna',
    'świece',
    'wazony',
    'rzeźby',
    'makramy',
    'lampy',
    // Meble
    'meble ręcznie robione',
    'meble drewniane',
    // Dzieci
    'zabawki handmade',
    'ubranka dla dzieci',
    // Prezenty
    'prezenty handmade',
    'kartki okolicznościowe',
    // Vintage
    'vintage',
    'antyki',
    // Marketplace keywords
    'kategorie rękodzieła',
    'kategorie sztuki',
    'polscy artyści',
  ].join(', '),
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
    languages: {
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
      
      'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
    },
  },
  openGraph: {
    title: "Rękodzieło i Sztuka - Wszystkie Kategorie | Artovnia",
    description:
      "Przeglądaj kategorie rękodzieła i sztuki handmade: biżuteria, obrazy, ceramika, rzeźby, meble, dekoracje. Unikalne dzieła od polskich artystów.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
    siteName: "Artovnia",
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    site: "@artovnia",
    creator: "@artovnia",
    title: "Rękodzieło i Sztuka - Wszystkie Kategorie | Artovnia",
    description: "Przeglądaj kategorie rękodzieła i sztuki handmade: biżuteria, obrazy, ceramika, rzeźby, meble, dekoracje.",
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
        <main className="container">
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