import { HomeProductsCarousel } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"
import { unstable_cache } from 'next/cache'

interface SmartBestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}

export const SmartBestProductsSection = async ({ 
  heading = "Najlepsze produkty",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 10,
  home = false,
  user = null,
  wishlist = []
}: SmartBestProductsSectionProps) => {
  try {
    // ✅ Use Next.js server-side cache to prevent skeleton loading on navigation
    // This caches on the server, so it persists between page navigations
    const getCachedProducts = unstable_cache(
      async () => {
        const result = await listProducts({
          countryCode: locale,
          queryParams: {
            limit: 15, // Optimized from 50 to 15 (only display 10, keep 5 as buffer)
            order: "created_at",
          },
        })
        
        return result?.response?.products || []
      },
      [`homepage-top-${locale}-${limit}`], // Cache key
      {
        revalidate: 600, // 10 minutes
        tags: ['homepage-products', 'products']
      }
    )
    
    const allProducts = await getCachedProducts()
    
    if (allProducts.length === 0) {
      return (
        <section className="py-8 w-full">
          <h2 className="mb-6 ml-0 lg:ml-12 font-bold tracking-tight normal-case font-instrument-serif italic">
            {heading}
          </h2>
          <div className="flex justify-center w-full py-8">
            <p className="text-gray-500">No products available</p>
          </div>
        </section>
      )
    }
    
    // Smart "best products" algorithm using available data
    const bestProducts = allProducts
      .map(product => {
        // Calculate various metrics for each product
        const metrics = {
          // Review metrics (if available)
          reviewCount: (product as any).reviews?.length || 0,
          averageRating: (product as any).reviews?.length > 0 
            ? (product as any).reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / (product as any).reviews.length
            : 0,
          
          // Product quality indicators
          variantCount: product.variants?.length || 0,
          imageCount: product.images?.length || 0,
          hasDescription: product.description ? 1 : 0,
          
          // Recency factor (newer products get slight boost)
          daysSinceCreated: Math.floor((Date.now() - new Date(product.created_at || 0).getTime()) / (1000 * 60 * 60 * 24)),
          
          // Metadata indicators (if you store custom data)
          isFeatured: (product.metadata as any)?.featured === 'true' ? 1 : 0,
          viewCount: parseInt((product.metadata as any)?.view_count || '0'),
          wishlistCount: parseInt((product.metadata as any)?.wishlist_count || '0'),
        }
        
        // Calculate composite score
        let score = 0
        
        // Review-based scoring (highest weight)
        score += metrics.reviewCount * 10 // 10 points per review
        score += metrics.averageRating * 20 // Up to 100 points for 5-star rating
        
        // Quality indicators
        score += metrics.variantCount * 5 // 5 points per variant
        score += metrics.imageCount * 3 // 3 points per image
        score += metrics.hasDescription * 10 // 10 points for having description
        
        // Engagement metrics (if available in metadata)
        score += metrics.viewCount * 0.1 // 0.1 points per view
        score += metrics.wishlistCount * 15 // 15 points per wishlist add
        
        // Featured products get bonus
        score += metrics.isFeatured * 50 // 50 point bonus for featured
        
        // Slight penalty for very old products (encourage freshness)
        if (metrics.daysSinceCreated > 365) {
          score -= Math.min(metrics.daysSinceCreated - 365, 100) * 0.1
        }
        
        return {
          ...product,
          _score: score,
          _metrics: metrics
        }
      })
      .sort((a, b) => b._score - a._score) // Sort by score descending
      .slice(0, limit) // Take top products
    
    
    
    return (
      <BatchPriceProvider currencyCode="PLN" days={30}>
        <section className="py-2 md:py-8 w-full">
          <h2 className="mb-6 md:mb-12 heading-lg font-bold tracking-tight font-instrument-serif italic  ml-4 lg:ml-[68px] ">
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
    console.error("Error in SmartBestProductsSection:", error)
    return (
      <section className="py-2 md:py-8 w-full">
        <h2 className="mb-12 heading-lg font-bold tracking-tight font-instrument-serif ml-[68px]">
          {heading}
        </h2>
        <div className="flex justify-center w-full py-2 md:py-8">
          <p className="text-red-500">Unable to load best products. Please try again later.</p>
        </div>
      </section>
    )
  }
}
