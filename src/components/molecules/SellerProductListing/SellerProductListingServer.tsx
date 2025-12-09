// SellerProductListingServer.tsx - NEW: Server component wrapper
import { listProductsWithSort } from '@/lib/data/products'
import { getUserWishlists } from '@/lib/data/wishlist'
import { PRODUCT_LIMIT } from '@/const'
import { SellerProductListingClient } from './SellerProductListingClient'
import { HttpTypes } from "@medusajs/types"

export async function SellerProductListingServer({
  seller_id,
  user,
  page = 1,
  initialProducts,
  initialTotalCount,
  initialWishlists,
}: {
  seller_id: string
  user: HttpTypes.StoreCustomer | null
  page?: number
  initialProducts?: HttpTypes.StoreProduct[]
  initialTotalCount?: number
  initialWishlists?: any[]
}) {
  // If initial data is provided, use it directly (no fetch needed)
  if (initialProducts && initialTotalCount !== undefined && initialWishlists) {
    return (
      <SellerProductListingClient
        initialProducts={initialProducts}
        initialTotalCount={initialTotalCount}
        initialPage={page}
        seller_id={seller_id}
        user={user}
        initialWishlists={initialWishlists}
      />
    )
  }

  // Otherwise, fetch data (fallback for when not pre-fetched)
  // Get user's cart region instead of hardcoding
  const { getOrSetCart } = await import('@/lib/data/cart')
  const { getRegion, retrieveRegion } = await import('@/lib/data/regions')
  
  const cart = await getOrSetCart("pl").catch(() => null)
  const userRegion = cart?.region_id 
    ? await retrieveRegion(cart.region_id)
    : await getRegion("pl")
  const countryCode = userRegion?.countries?.[0]?.iso_2 || "pl"
  
  const offset = (page - 1) * PRODUCT_LIMIT

  // Parallel fetching
  const [productsResult, wishlistData] = await Promise.all([
    listProductsWithSort({
      seller_id,
      countryCode,
      sortBy: "created_at",
      queryParams: {
        limit: PRODUCT_LIMIT,
        offset
      },
    }),
    user ? getUserWishlists() : Promise.resolve({ wishlists: [] })
  ])

  const products = productsResult?.response?.products || []
  const totalCount = productsResult?.response?.count || 0
  const wishlists = wishlistData.wishlists || []

  return (
    <SellerProductListingClient
      initialProducts={products}
      initialTotalCount={totalCount}
      initialPage={page}
      seller_id={seller_id}
      user={user}
      initialWishlists={wishlists}
    />
  )
}