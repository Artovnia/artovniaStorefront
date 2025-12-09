"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Pagination } from '@/components/cells/Pagination/Pagination'
import { PRODUCT_LIMIT } from "@/const"
import { listProductsWithSort } from '@/lib/data/products'
import { getUserWishlists } from '@/lib/data/wishlist'
import { SerializableWishlist } from '@/types/wishlist'

export function SellerProductListingClient({
  initialProducts,
  initialTotalCount,
  initialPage,
  seller_id,
  user,
  initialWishlists,
}: {
  initialProducts: HttpTypes.StoreProduct[]
  initialTotalCount: number
  initialPage: number
  seller_id: string
  user: HttpTypes.StoreCustomer | null
  initialWishlists: SerializableWishlist[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [wishlist, setWishlist] = useState(initialWishlists)
  const [isLoading, setIsLoading] = useState(false)

  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT)

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    
    setIsLoading(true)
    try {
      // Get user's cart region dynamically
      const { getOrSetCart } = await import('@/lib/data/cart')
      const { getRegion, retrieveRegion } = await import('@/lib/data/regions')
      
      const cart = await getOrSetCart("pl").catch(() => null)
      const userRegion = cart?.region_id 
        ? await retrieveRegion(cart.region_id)
        : await getRegion("pl")
      const countryCode = userRegion?.countries?.[0]?.iso_2 || "pl"
      
      const offset = (page - 1) * PRODUCT_LIMIT
      const result = await listProductsWithSort({
        seller_id,
        countryCode,
        sortBy: "created_at",
        queryParams: { limit: PRODUCT_LIMIT, offset },
      })

      setProducts(result?.response?.products || [])
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshWishlist = async () => {
    if (!user) return
    try {
      const data = await getUserWishlists()
      setWishlist(data.wishlists || [])
    } catch (error) {
      console.error('Error refreshing wishlist:', error)
    }
  }

  if (isLoading) {
    return <ProductListingSkeleton />
  }

  return (
    <div className="mt-8">
      {!products.length ? (
        <div className="text-center my-10">
          <h2 className="uppercase heading-lg">Brak produktów</h2>
          <p className="mt-4 text-lg">
            Ten sprzedawca nie ma jeszcze żadnych produktów
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="label-md text-gray-600">
              {totalCount} produkt{totalCount === 1 ? '' : totalCount < 5 ? 'y' : 'ów'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                user={user}
                wishlist={wishlist}
                onWishlistChange={refreshWishlist}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                pages={totalPages}
                setPage={handlePageChange}
                currentPage={currentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}