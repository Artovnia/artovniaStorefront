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
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"

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
  // ✅ Track if we have server-side data (only check once on mount)
  const hasInitialData = Boolean(initialProducts && initialProducts.length > 0)
  
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts || [])
  const [totalCount, setTotalCount] = useState(initialTotalCount || 0)
  const [currentPage, setCurrentPage] = useState(1)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>(initialWishlists || [])
  // ✅ No loading state if we have initial data from server
  const [isLoading, setIsLoading] = useState(!hasInitialData)
  
  // ✅ OPTIMIZATION: Memoize user ID to prevent unnecessary re-fetches
  const userId = user?.id
  
  // ✅ PERFORMANCE: Only fetch on page change (page > 1) or if no initial data
  useEffect(() => {
    const fetchData = async () => {
      // ✅ Skip fetch for page 1 if we have initial data from server
      if (currentPage === 1 && hasInitialData) {
        // Data already set in useState initialization
        return
      }

      setIsLoading(true)
      try {
        const offset = (currentPage - 1) * PRODUCT_LIMIT
        
        // ✅ CRITICAL: Fetch only the current page (20 products), not all 200
        const [productsResult, wishlistData] = await Promise.all([
          listProductsWithSort({
            seller_id,
            countryCode: "pl",
            sortBy: "created_at",
            queryParams: { limit: PRODUCT_LIMIT, offset },
          }),
          userId ? getUserWishlists() : Promise.resolve({ wishlists: [] })
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
    // ✅ Only re-fetch when page changes or seller changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller_id, currentPage, hasInitialData])

  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    
    // ✅ CRITICAL: Scroll BEFORE state update to prevent loading skeleton from resetting position
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Small delay to ensure scroll starts before state update triggers re-render
    setTimeout(() => {
      setCurrentPage(page)
    }, 0)
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

  // Extract product IDs for promotion data provider
  const productIds = products.map(p => p.id)

  return (
    <PromotionDataProvider 
      countryCode="PL"
      productIds={productIds}
    >
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-y-4 mx-auto">
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
    </PromotionDataProvider>
  )
}