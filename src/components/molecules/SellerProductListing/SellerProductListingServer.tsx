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
}: {
  seller_id: string
  user: HttpTypes.StoreCustomer | null
  page?: number
}) {
  const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl"
  const offset = (page - 1) * PRODUCT_LIMIT

  // Parallel fetching
  const [productsResult, wishlistData] = await Promise.all([
    listProductsWithSort({
      seller_id,
      countryCode: DEFAULT_REGION,
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