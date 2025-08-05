import { HomeProductsCarousel } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"

interface HomeNewestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
}

export const HomeNewestProductsSection = async ({ 
  heading = "Najnowsze produkty",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 4,
  home = false
}: HomeNewestProductsSectionProps) => {
  try {
    // Fetch newest products using the existing listProducts function
    const result = await listProducts({
      countryCode: locale,
      queryParams: {
        limit: limit,
        order: "created_at", // This will get the newest products first
      },
    })
    
    const products = result?.response?.products || []
    
    return (
      <section className="py-8 w-full">
        <h2 className="mb-6 heading-lg font-bold tracking-tight uppercase font-instrument-serif">
          {heading}
        </h2>

        <HomeProductsCarousel
          locale={locale}
          sellerProducts={products as unknown as Product[]}
          home={home}
        />
      </section>
    )
  } catch (error) {
    console.error("Error in HomeNewestProductsSection:", error)
    return (
      <section className="py-8 w-full">
        <h2 className="mb-6 heading-lg font-bold tracking-tight uppercase font-instrument-serif">
          {heading}
        </h2>
        <div className="flex justify-center w-full py-8">
          <p className="text-red-500">Unable to load newest products. Please try again later.</p>
        </div>
      </section>
    )
  }
}
