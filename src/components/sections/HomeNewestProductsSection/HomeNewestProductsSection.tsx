import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"

interface HomeNewestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  products: (HttpTypes.StoreProduct & { seller?: unknown })[]
}

export const HomeNewestProductsSection = async ({ 
  heading = "Najnowsze produkty",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 12,
  home = false,
  user = null,
  wishlist = [],
  products,
}: HomeNewestProductsSectionProps) => {
  try {
    const resolvedProducts = products.slice(0, limit)
    
    return (
      <section className="py-2 md:py-8 w-full" aria-labelledby="newest-products-heading">
        <h2 id="newest-products-heading" className="mb-6 md:mb-12 heading-lg  tracking-tight font-instrument-serif italic text-white text-center">
          {heading}
        </h2>

        <HomeProductsCarousel
          locale={locale}
          sellerProducts={resolvedProducts as unknown as Product[]}
          home={home}
          theme="light"
          user={user}
          wishlist={wishlist}
        />
      </section>
    )
  } catch (error) {
    console.error("Error in HomeNewestProductsSection:", error)
    return (
      <section className="py-2 md:py-8 w-full" aria-labelledby="newest-products-heading-error">
        <h2 id="newest-products-heading-error" className="mb-6 heading-lg  tracking-tight uppercase font-instrument-serif">
          {heading}
        </h2>
        <div className="flex justify-center w-full py-8" role="alert">
          <p className="text-red-500">Unable to load newest products. Please try again later.</p>
        </div>
      </section>
    )
  }
}