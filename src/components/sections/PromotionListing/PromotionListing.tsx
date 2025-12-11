"use client"

import { useState, useEffect, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { listProductsWithPromotions } from "@/lib/data/products"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { Button } from "@/components/atoms"
import { useSearchParams } from "next/navigation"
import { SellerProps } from "@/types/seller"
import { Pagination } from "@/components/cells/Pagination/Pagination"

// Loading skeleton component
const PromotionListingSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center w-full max-w-[1200px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[315px] w-[252px] bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
)

interface PromotionListingProps {
  initialProducts?: HttpTypes.StoreProduct[]
  initialCount?: number
  initialPage?: number
  countryCode?: string
  limit?: number
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}

export const PromotionListing = ({
  initialProducts = [],
  initialCount = 0,
  initialPage = 1,
  countryCode = "PL",
  limit = 12,
  user: initialUser = null,
  wishlist: initialWishlist = []
}: PromotionListingProps) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  // ✅ OPTIMIZATION: Use props instead of fetching again
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(initialUser)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>(initialWishlist)
  
  const searchParams = useSearchParams()
  
  // Get filter values from URL
  const promotionFilter = searchParams.get("promotion") || ""
  const sellerFilter = searchParams.get("seller") || ""
  const campaignFilter = searchParams.get("campaign") || ""
  const sortBy = searchParams.get("sortBy") || ""

  // Backend handles filtering and sorting, so we just use products directly
  const filteredProducts = products

  // ✅ REMOVED: fetchUserData - now using props from page level

  // Function to refresh wishlist data after wishlist changes
  const refreshWishlist = async () => {
    if (!user) return
    
    try {
      const wishlistData = await getUserWishlists()
      setWishlist(wishlistData.wishlists || [])
    } catch (error) {
      console.error('Error refreshing wishlist:', error)
    }
  }

  // Fetch products for a specific page
  const fetchProductsForPage = async (page: number) => {
    if (isLoading) return

    try {
      setIsLoading(true)
      
      const { response } = await listProductsWithPromotions({
        page,
        limit,
        countryCode,
        sortBy: sortBy || undefined,
        promotion: promotionFilter || undefined,
        seller: sellerFilter || undefined,
        campaign: campaignFilter || undefined,
      })

      setProducts(response.products || [])
      setCount(response.count || 0)
      setCurrentPage(page)
      
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Set initial products and count
  useEffect(() => {
    setProducts(initialProducts)
    setCount(initialCount)
    setCurrentPage(initialPage)
  }, [initialProducts, initialCount, initialPage])

  // Refetch when filters change
  useEffect(() => {
    // Skip initial render
    if (products.length === 0 && initialProducts.length > 0) return
    
    fetchProductsForPage(1)
  }, [promotionFilter, sellerFilter, campaignFilter, sortBy])

  // Calculate total pages
  const totalPages = Math.ceil(count / limit)

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchProductsForPage(page)
    }
  }

  return (
    <div className="w-full">
      {/* Results Info */}
      <div className="px-4 sm:px-6 py-4 bg-primary max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 font-instrument-sans">
            {isLoading ? (
              "Ładowanie..."
            ) : (
              <>
                Strona {currentPage} z {totalPages} 
                {filteredProducts.length > 0 && (
                  <span className="ml-2">
                    ({filteredProducts.length} {filteredProducts.length === 1 ? "produkt" : "produktów"})
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 py-8 max-w-[1200px] mx-auto">
        {isLoading ? (
          <PromotionListingSkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-800 mb-2 font-instrument-serif">
              {products.length === 0 ? "Brak promocji" : "Brak wyników"}
            </h2>
            <p className="text-gray-600 font-instrument-sans">
              {products.length === 0 
                ? "Obecnie nie ma produktów w promocyjnych cenach" 
                : "Nie znaleziono produktów spełniających wybrane kryteria"}
            </p>
          </div>
        ) : (
          <>
            <BatchPriceProvider currencyCode="PLN" days={30}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center mb-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard
                      product={product}
                      user={user}
                      wishlist={wishlist}
                      onWishlistChange={refreshWishlist}
                    />
                  </div>
                ))}
              </div>
            </BatchPriceProvider>

            {/* Pagination */}
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
    </div>
  )
}
