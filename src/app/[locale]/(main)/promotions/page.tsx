import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
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
      <div className="min-h-screen bg-primary max-w-[1920px] w-full mx-auto">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="bg-primary px-4 sm:px-6 py-8">
            <div className="mx-auto max-w-[1200px]">
              <h1 className="text-3xl font-bold text-[#3B3634] mb-2 font-instrument-serif italic text-center">
                Promocje
              </h1>
              <p className="text-[#3B3634] font-instrument-sans text-center">
                Najlepsze okazje i promocyjne ceny na wybrane produkty
              </p>
              {count > 0 && (
                <p className="text-[#3B3634] mt-2 font-instrument-sans text-sm text-center mb-4">
                  Znaleziono {count} produktów w promocji
                </p>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <PromotionsFilterBar
            promotionNames={filterOptions.promotionNames}
            sellerNames={filterOptions.sellerNames}
            campaignNames={filterOptions.campaignNames}
          />

          {/* Products Listing */}
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
    )
  } catch (error) {
    console.error("Error fetching promotions:", error)
    
    return (
      <div className="w-full max-w-[1920px] mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2 font-serif">
            Promocje
          </h1>
          <p className="text-gray-600 font-sans">
            Najlepsze okazje i promocyjne ceny na wybrane produkty
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-bold mb-4 font-serif">Wystąpił błąd</h2>
          <p className="text-gray-600 mb-6 font-sans">
            Nie udało się załadować promocji. Spróbuj ponownie później.
          </p>
        </div>
      </div>
    )
  }
}
