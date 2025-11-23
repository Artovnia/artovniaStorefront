import { HomeProductsCarousel } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"
import { unstable_cache } from 'next/cache'

interface HomeNewestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}

export const HomeNewestProductsSection = async ({ 
  heading = "Najnowsze produkty",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 4,
  home = false,
  user = null,
  wishlist = []
}: HomeNewestProductsSectionProps) => {
  try {
    // ✅ Use Next.js server-side cache to prevent skeleton loading on navigation
    const getCachedProducts = unstable_cache(
      async () => {
        const result = await listProducts({
          countryCode: locale,
          queryParams: {
            limit: limit,
            order: "-created_at", // Descending order: newest products first (left side of carousel)
          },
        })
        return result?.response?.products || []
      },
      [`homepage-newest-${locale}-${limit}`], // Cache key
      {
        revalidate: 600, // 10 minutes
        tags: ['homepage-products', 'products']
      }
    )
    
    const products = await getCachedProducts()
    
    return (
      <section className="py-2 md:py-8 w-full">
        <h2 className="mb-6 md:mb-12 heading-lg font-bold tracking-tight font-instrument-serif italic text-white text-center">
          {heading}
        </h2>

        <HomeProductsCarousel
          locale={locale}
          sellerProducts={products as unknown as Product[]}
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
      <section className="py-2 md:py-8 w-full">
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
