import { HomeProductsCarousel } from "@/components/organisms"
import { listProductsLean } from "@/lib/data/products"
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
    // Fetch products directly without caching IDs - using LEAN version for homepage
    const result = await listProductsLean({
      countryCode: locale,
      queryParams: {
        limit: 50,
        order: "-created_at",
      },
    })
    const allProducts = result?.response?.products || []
    
    
    if (allProducts.length === 0) {
      console.warn('⚠️ [SMART BEST] No products found')
      return (
        <section className="py-8 w-full" aria-labelledby="smart-best-heading-empty">
          <h2 id="smart-best-heading-empty" className="mb-6 ml-0 lg:ml-12 font-bold tracking-tight normal-case font-instrument-serif italic">
            {heading}
          </h2>
          <div className="flex justify-center w-full py-8" role="status">
            <p className="text-gray-500">No products available</p>
          </div>
        </section>
      )
    }
    
    // ✅ FIX: Use stable timestamp for SSR/CSR consistency
    // Generate a deterministic seed from the cache key to ensure same results on server and client
    const cacheTimestamp = Math.floor(Date.now() / (1000 * 60 * 10)) // Stable for 10 minutes
    const currentTime = cacheTimestamp * (1000 * 60 * 10)
    
    // ✅ FIX: Deterministic pseudo-random using product ID as seed
    const deterministicRandom = (productId: string, salt: number = 0): number => {
      let hash = 0
      const str = productId + salt.toString()
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return Math.abs(hash % 1000) / 1000 // Returns 0-1
    }
    
    // Enhanced scoring algorithm
    const scoredProducts = allProducts
      .map(product => {
        const createdAt = new Date(product.created_at || 0).getTime()
        const updatedAt = new Date((product as any).updated_at || product.created_at || 0).getTime()
        
        const metrics = {
          // Quality indicators
          variantCount: product.variants?.length || 0,
          imageCount: product.images?.length || 0,
          hasDescription: product.description ? 1 : 0,
          descriptionLength: product.description?.length || 0,
          
          // Recency
          daysSinceCreated: Math.floor(
            (currentTime - createdAt) / (1000 * 60 * 60 * 24)
          ),
          daysSinceUpdated: Math.floor(
            (currentTime - updatedAt) / (1000 * 60 * 60 * 24)
          ),
          
          // Categorization
          hasCollection: (product as any).collection_id ? 1 : 0,
          tagCount: product.tags?.length || 0,
          
          // Metadata
          isFeatured: (product.metadata as any)?.featured === 'true' ? 1 : 0,
          isNew: (currentTime - createdAt) < (30 * 24 * 60 * 60 * 1000) ? 1 : 0,
          viewCount: parseInt((product.metadata as any)?.view_count || '0'),
          wishlistCount: parseInt((product.metadata as any)?.wishlist_count || '0'),
          
          // Seller diversity
          sellerId: (product.metadata as any)?.seller_id || 'default',
        }
        
        let score = 0
        
        // RECENCY: Strong preference for new products (heaviest weight)
        if (metrics.daysSinceCreated <= 7) {
          score += 200 // Last week
        } else if (metrics.daysSinceCreated <= 30) {
          score += 150 // Last month
        } else if (metrics.daysSinceCreated <= 90) {
          score += 100 // Last 3 months
        } else if (metrics.daysSinceCreated <= 180) {
          score += 50 // Last 6 months
        } else {
          // Penalty for old products
          score -= Math.min((metrics.daysSinceCreated - 180) * 0.5, 150)
        }
        
        // Recently updated products get boost
        if (metrics.daysSinceUpdated <= 7) {
          score += 40
        } else if (metrics.daysSinceUpdated <= 30) {
          score += 20
        }
        
        // QUALITY: Content richness
        score += Math.min(metrics.imageCount * 8, 40)
        score += metrics.hasDescription * 25
        score += Math.min(metrics.descriptionLength / 100, 25)
        score += Math.min(metrics.variantCount * 6, 30)
        
        // CATEGORIZATION
        score += metrics.hasCollection * 30
        score += Math.min(metrics.tagCount * 4, 20)
        
        // FEATURED & NEW
        score += metrics.isFeatured * 150
        score += metrics.isNew * 80
        
        // ENGAGEMENT (if tracked in metadata)
        score += metrics.viewCount * 0.05
        score += metrics.wishlistCount * 12
        
        // ✅ FIX: DETERMINISTIC RANDOMNESS: Break ties using product ID as seed
        score += deterministicRandom(product.id, cacheTimestamp) * 15
        
        return {
          ...product,
          _score: score,
          _metrics: metrics
        }
      })
      .sort((a, b) => b._score - a._score)
    
    // SELLER DIVERSITY: Max 3 products per seller
    const MAX_PER_SELLER = 3
    const diversifiedProducts: typeof scoredProducts = []
    const sellerCounts: Record<string, number> = {}
    
    // First pass: enforce diversity limit
    for (const product of scoredProducts) {
      const sellerId = product._metrics.sellerId
      const count = sellerCounts[sellerId] || 0
      
      if (count < MAX_PER_SELLER) {
        diversifiedProducts.push(product)
        sellerCounts[sellerId] = count + 1
      }
      
      if (diversifiedProducts.length >= limit) break
    }
    
    // Second pass: fill remaining slots if needed
    if (diversifiedProducts.length < limit) {
      for (const product of scoredProducts) {
        if (!diversifiedProducts.includes(product)) {
          diversifiedProducts.push(product)
          if (diversifiedProducts.length >= limit) break
        }
      }
    }
    
    // ✅ FIX: Deterministic shuffle using product IDs as seed
    const shuffled = diversifiedProducts
      .slice(0, limit)
      .map((product, index) => ({
        product,
        sortKey: deterministicRandom(product.id, index + cacheTimestamp)
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(item => item.product)
    
    const bestProducts = shuffled
    
    return (
      <BatchPriceProvider currencyCode="PLN" days={30}>
        <section className="py-2 md:py-8 w-full" aria-labelledby="smart-best-heading">
          <h2 id="smart-best-heading" className="mb-6 md:mb-12 heading-lg  tracking-tight font-instrument-serif italic ml-4 lg:ml-[68px]">
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
      <section className="py-2 md:py-8 w-full" aria-labelledby="smart-best-heading-error">
        <h2 id="smart-best-heading-error" className="mb-12 heading-lg font-bold tracking-tight font-instrument-serif ml-[68px]">
          {heading}
        </h2>
        <div className="flex justify-center w-full py-2 md:py-8" role="alert">
          <p className="text-red-500">Unable to load best products. Please try again later.</p>
        </div>
      </section>
    )
  }
}