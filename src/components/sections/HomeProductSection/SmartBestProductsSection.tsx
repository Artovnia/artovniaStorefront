import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"

interface SmartBestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  products: (HttpTypes.StoreProduct & { seller?: unknown })[]
}

export const SmartBestProductsSection = async ({ 
  heading = "Najlepsze produkty",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 12,
  home = false,
  user = null,
  wishlist = [],
  products,
}: SmartBestProductsSectionProps) => {
  try {
    const getSellerKey = (product: HttpTypes.StoreProduct & { seller?: unknown }): string => {
      const seller = product.seller as { id?: string; handle?: string; name?: string } | undefined
      const metadataSellerId = (product.metadata as any)?.seller_id as string | undefined

      if (seller?.id) return `id:${seller.id}`
      if (seller?.handle) return `handle:${seller.handle}`
      if (metadataSellerId) return `meta:${metadataSellerId}`
      if (seller?.name) return `name:${seller.name}`

      // Unknown seller identity: keep product renderable without collapsing all unknowns into one bucket.
      return `unknown:${product.id}`
    }

    const allProducts = products

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

    // Rotate every 30 minutes to keep homepage fresh while remaining deterministic during a render.
    const rotationSeed = Math.floor(Date.now() / (1000 * 60 * 30))

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

    // Lightweight score: mostly randomized, with small quality/popularity boosts.
    // This avoids "just newest products" behavior while keeping query cost low.
    const scoredProducts = allProducts
      .map(product => {
        const metrics = {
          variantCount: product.variants?.length || 0,
          imageCount: product.images?.length || 0,
          hasDescription: product.description ? 1 : 0,
          descriptionLength: product.description?.length || 0,

          isFeatured: (product.metadata as any)?.featured === 'true' ? 1 : 0,
          viewCount: parseInt((product.metadata as any)?.view_count || '0'),
          wishlistCount: parseInt((product.metadata as any)?.wishlist_count || '0'),
          sellerId: getSellerKey(product),
        }

        const qualityScore =
          Math.min(metrics.imageCount * 3, 15) +
          metrics.hasDescription * 10 +
          Math.min(metrics.descriptionLength / 220, 8) +
          Math.min(metrics.variantCount * 2, 10)

        const engagementScore =
          Math.min(metrics.viewCount * 0.01, 6) +
          Math.min(metrics.wishlistCount * 2, 12)

        const featuredScore = metrics.isFeatured * 10

        // Main driver: deterministic pseudo-random ranking refreshed every 30 minutes.
        const randomScore = deterministicRandom(product.id, rotationSeed) * 100

        const score = randomScore + qualityScore + engagementScore + featuredScore

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
    const selectedIds = new Set<string>()

    // First pass: enforce diversity limit
    for (const product of scoredProducts) {
      const sellerId = product._metrics.sellerId
      const count = sellerCounts[sellerId] || 0

      if (count < MAX_PER_SELLER) {
        diversifiedProducts.push(product)
        sellerCounts[sellerId] = count + 1
        selectedIds.add(product.id)
      }

      if (diversifiedProducts.length >= limit) break
    }

    // Second pass: fill remaining slots while preserving seller cap
    if (diversifiedProducts.length < limit) {
      for (const product of scoredProducts) {
        if (!selectedIds.has(product.id)) {
          const sellerId = product._metrics.sellerId
          const count = sellerCounts[sellerId] || 0

          if (count < MAX_PER_SELLER) {
            diversifiedProducts.push(product)
            sellerCounts[sellerId] = count + 1
            selectedIds.add(product.id)
            if (diversifiedProducts.length >= limit) break
          }
        }
      }
    }

    // Third pass: if seller cap still leaves holes, relax cap to guarantee full section size.
    if (diversifiedProducts.length < limit) {
      for (const product of scoredProducts) {
        if (selectedIds.has(product.id)) continue
        diversifiedProducts.push(product)
        selectedIds.add(product.id)
        if (diversifiedProducts.length >= limit) break
      }
    }

    // ✅ FIX: Deterministic shuffle using product IDs as seed
    const shuffled = diversifiedProducts
      .slice(0, limit)
      .map((product, index) => ({
        product,
        sortKey: deterministicRandom(product.id, index + rotationSeed)
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(item => item.product)

    const bestProducts = shuffled

    return (
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