"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Pagination } from '@/components/cells/Pagination/Pagination'
import { PRODUCT_LIMIT } from "@/const"
import { listProductsWithSort } from '@/lib/data/products'
import { getUserWishlists } from '@/lib/data/wishlist'
import { SerializableWishlist } from '@/types/wishlist'

export function SellerProductListingClient({
  seller_id,
  user,
  initialProducts,
  initialTotalCount,
  initialWishlists,
}: {
  seller_id: string
  user: HttpTypes.StoreCustomer | null
  initialProducts?: HttpTypes.StoreProduct[]
  initialTotalCount?: number
  initialWishlists?: SerializableWishlist[]
}) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts || [])
  const [totalCount, setTotalCount] = useState(initialTotalCount || 0)
  const [currentPage, setCurrentPage] = useState(1)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>(initialWishlists || [])
  const [isLoading, setIsLoading] = useState(!initialProducts)
  
  // Fetch products on page change
  useEffect(() => {
    const fetchData = async () => {
      // Use initial data for first page if available
      if (currentPage === 1 && initialProducts && initialProducts.length > 0) {
        setProducts(initialProducts)
        setTotalCount(initialTotalCount || 0)
        setWishlist(initialWishlists || [])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const offset = (currentPage - 1) * PRODUCT_LIMIT
        
        const [productsResult, wishlistData] = await Promise.all([
          listProductsWithSort({
            seller_id,
            countryCode: "pl",
            sortBy: "created_at",
            queryParams: { limit: PRODUCT_LIMIT, offset },
          }),
          user ? getUserWishlists() : Promise.resolve({ wishlists: [] })
        ])

        setProducts(productsResult?.response?.products || [])
        setTotalCount(productsResult?.response?.count || 0)
        setWishlist(wishlistData.wishlists || [])
      } catch (error) {
        console.error('Error fetching seller products:', error)
        setProducts([])
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [seller_id, currentPage, user, initialProducts, initialTotalCount, initialWishlists])

  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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