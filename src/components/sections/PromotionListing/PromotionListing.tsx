"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"
import { listProductsWithPromotions } from "@/lib/data/products"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { useSearchParams } from "next/navigation"
import { Pagination } from "@/components/cells/Pagination/Pagination"

// Client-side page cache entry with TTL
interface CachedPage {
  products: HttpTypes.StoreProduct[]
  count: number
  timestamp: number
}

const PAGE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Loading skeleton component
const PromotionListingSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-12">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
        <div className="aspect-square bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    ))}
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
  limit = 14,
  user: initialUser = null,
  wishlist: initialWishlist = []
}: PromotionListingProps) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false)
  // ✅ OPTIMIZATION: Use props instead of fetching again
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(initialUser)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>(initialWishlist)
  
  const searchParams = useSearchParams()
  
  // Get filter values from URL
  const promotionFilter = searchParams.get("promotion") || ""
  const sellerFilter = searchParams.get("seller") || ""
  const campaignFilter = searchParams.get("campaign") || ""
  const categoryFilter = searchParams.get("category") || ""
  const sortBy = searchParams.get("sortBy") || ""
  
  // Track previous filter values to detect changes
  const prevFiltersRef = useRef({ promotionFilter, sellerFilter, campaignFilter, categoryFilter, sortBy })
  const isInitialMount = useRef(true)

  // ✅ PERFORMANCE: Client-side page cache — revisiting a page is instant
  const pageCacheRef = useRef<Map<string, CachedPage>>(new Map())

  // Build cache key from current filters + page
  const buildCacheKey = useCallback((page: number) => {
    return `${page}:${promotionFilter}:${sellerFilter}:${campaignFilter}:${categoryFilter}:${sortBy}`
  }, [promotionFilter, sellerFilter, campaignFilter, categoryFilter, sortBy])

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

  // ✅ PERFORMANCE: Fetch with client-side cache — no skeleton on cached pages
  const fetchProductsForPage = useCallback(async (page: number) => {
    if (isLoadingRef.current) return

    const cacheKey = buildCacheKey(page)

    // ✅ Check client-side cache first — instant page switch
    const cached = pageCacheRef.current.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < PAGE_CACHE_TTL) {
      setProducts(cached.products)
      setCount(cached.count)
      setCurrentPage(page)
      return
    }

    try {
      // ✅ OPTIMISTIC UI: Keep old products visible, just mark as loading
      isLoadingRef.current = true
      setIsLoading(true)
      
      const { response } = await listProductsWithPromotions({
        page,
        limit,
        countryCode,
        sortBy: sortBy || undefined,
        promotion: promotionFilter || undefined,
        seller: sellerFilter || undefined,
        campaign: campaignFilter || undefined,
        category: categoryFilter || undefined,
      })

      const newProducts = response.products || []
      const newCount = response.count || 0

      // ✅ Cache the result for instant revisits
      pageCacheRef.current.set(cacheKey, {
        products: newProducts,
        count: newCount,
        timestamp: Date.now(),
      })

      setProducts(newProducts)
      setCount(newCount)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setCount(0)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
    }
  }, [buildCacheKey, limit, countryCode, sortBy, promotionFilter, sellerFilter, campaignFilter, categoryFilter])

  // Seed cache with initial server-rendered data
  useEffect(() => {
    if (initialProducts.length > 0) {
      const cacheKey = buildCacheKey(initialPage)
      pageCacheRef.current.set(cacheKey, {
        products: initialProducts,
        count: initialCount,
        timestamp: Date.now(),
      })
    }
  }, []) // Only on mount

  // Set initial products and count
  useEffect(() => {
    setProducts(initialProducts)
    setCount(initialCount)
    setCurrentPage(initialPage)
  }, [initialProducts, initialCount, initialPage])

  // ✅ FIXED: Refetch when filters change + clear stale cache
  useEffect(() => {
    // Skip on initial mount - use server-rendered data
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    // Check if filters actually changed
    const filtersChanged = 
      prevFiltersRef.current.promotionFilter !== promotionFilter ||
      prevFiltersRef.current.sellerFilter !== sellerFilter ||
      prevFiltersRef.current.campaignFilter !== campaignFilter ||
      prevFiltersRef.current.categoryFilter !== categoryFilter ||
      prevFiltersRef.current.sortBy !== sortBy
    
    if (filtersChanged) {
      // Update ref with new filter values
      prevFiltersRef.current = { promotionFilter, sellerFilter, campaignFilter, categoryFilter, sortBy }
      
      // ✅ Clear page cache when filters change (old data is stale)
      pageCacheRef.current.clear()
      
      // Reset to page 1 and fetch new data
      fetchProductsForPage(1)
    }
  }, [promotionFilter, sellerFilter, campaignFilter, categoryFilter, sortBy, countryCode, limit])

  // Calculate total pages
  const totalPages = Math.ceil(count / limit)

  // Handle page change — scroll immediately, then fetch
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      fetchProductsForPage(page)
    }
  }

  return (
    <div className="w-full pt-2 xl:pt-24 pb-12 xl:pb-24">
      {/* Results Info */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 font-instrument-sans max-w-[1450px] mx-auto ">
          {isLoading ? (
            "Ładowanie..."
          ) : (
            <>
              Strona {currentPage} z {totalPages}
            </>
          )}
        </p>
      </div>

      {/* Content Area */}
      {/* ✅ PERFORMANCE: Skeleton only on true initial load (no products yet) */}
      {/* On page switch, old products stay visible with loading overlay */}
      {isLoading && products.length === 0 ? (
        <PromotionListingSkeleton />
      ) : filteredProducts.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-800 mb-2 font-instrument-serif">
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
          {/* ✅ OPTIMIZED: Removed nested BatchPriceProvider - uses parent provider from page.tsx */}
          {/* Parent provider already has initialPriceData from server, no need for duplicate provider */}
          <div className={`w-full flex justify-center transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-12 w-fit mx-auto ">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  user={user}
                  wishlist={wishlist}
                  onWishlistChange={refreshWishlist}
                />
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="w-full mt-10">
              <div className="flex justify-center">
                <Pagination 
                  pages={totalPages} 
                  setPage={handlePageChange} 
                  currentPage={currentPage} 
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
