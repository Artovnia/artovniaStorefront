import { HomeProductsCarousel } from "@/components/organisms"
import { getBestSellers } from "@/lib/data/best-sellers"
import { Product } from "@/types/product"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"

interface BestSellersSectionProps {
  heading?: string
  locale?: string
  limit?: number
  days?: number
  home?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}

export const BestSellersSection = async ({
  heading = "Najczęściej kupowane",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 10,
  days = 90,
  home = false,
  user = null,
  wishlist = [],
}: BestSellersSectionProps) => {
  try {
    const { products: allProducts } = await getBestSellers(
      locale,
      50,
      days
    )

    if (allProducts.length === 0) {
      return (
        <section className="py-8 w-full">
          <h2 className="mb-6 ml-0 lg:ml-12 font-bold tracking-tight normal-case font-instrument-serif italic">
            {heading}
          </h2>
          <div className="flex justify-center w-full py-8">
            <p className="text-gray-500">No best sellers available</p>
          </div>
        </section>
      )
    }

    const MAX_PER_SELLER = 3
    const diversifiedProducts: typeof allProducts = []
    const sellerCounts: Record<string, number> = {}

    for (const product of allProducts) {
      const sellerId = (product.metadata as any)?.seller_id || "default"
      const count = sellerCounts[sellerId] || 0

      if (count < MAX_PER_SELLER) {
        diversifiedProducts.push(product)
        sellerCounts[sellerId] = count + 1
      }

      if (diversifiedProducts.length >= limit * 1.5) break
    }

    const shuffled = diversifiedProducts
      .slice(0, limit)
      .sort(() => Math.random() - 0.5)

    const bestProducts = shuffled

    return (
      <BatchPriceProvider currencyCode="PLN" days={30}>
        <section className="py-2 md:py-8 w-full">
          <h2 className="mb-6 md:mb-12 heading-lg font-bold tracking-tight font-instrument-serif italic ml-4 lg:ml-[68px]">
            {heading}
          </h2>

          <HomeProductsCarousel
            locale={locale}
            sellerProducts={bestProducts as unknown as Product[]}
            home={home}
            user={user}
            wishlist={wishlist}
          />
        </section>
      </BatchPriceProvider>
    )
  } catch (error) {
    console.error("Error in BestSellersSection:", error)
    return (
      <section className="py-2 md:py-8 w-full">
        <h2 className="mb-12 heading-lg font-bold tracking-tight font-instrument-serif ml-[68px]">
          {heading}
        </h2>
        <div className="flex justify-center w-full py-2 md:py-8">
          <p className="text-red-500">
            Unable to load best sellers. Please try again later.
          </p>
        </div>
      </section>
    )
  }
}
