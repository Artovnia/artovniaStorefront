import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import { listProductsWithPromotions } from "@/lib/data/products"
import { PromotionListing } from "@/components/sections"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"

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
    // Fetch products with promotions
    const { response, nextPage } = await listProductsWithPromotions({
      page,
      limit: 12,
      countryCode: REGION,
    })

    const { products, count } = response

    return (
      <div className="w-full max-w-[1920px] mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8  ">
          <h1 className="text-3xl font-bold text-[#3B3634] mb-2 font-instrument-serif italic flex flex-row justify-center items-center mt-16">
            Promocje
          </h1>
          <p className="text-[#3B3634] font-instrument-sans flex flex-row justify-center items-center">
            Najlepsze okazje i promocyjne ceny na wybrane produkty
          </p>
          {count > 0 && (
            <p className="text-[#3B3634] mt-2 font-instrument-sans text-sm flex flex-row justify-center items-center mb-24">
              Znaleziono {count} produktów w promocji
            </p>
          )}
        </div>

        {/* Products Listing */}
        <PromotionDataProvider countryCode={REGION}>
          <PromotionListing
            initialProducts={products}
            initialCount={count}
            initialPage={page}
            countryCode={REGION}
          />
        </PromotionDataProvider>
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
