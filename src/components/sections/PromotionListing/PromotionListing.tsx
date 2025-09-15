"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { listProductsWithPromotions } from "@/lib/data/products"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { Button } from "@/components/atoms"

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
}

export const PromotionListing = ({
  initialProducts = [],
  initialCount = 0,
  initialPage = 1,
  countryCode = "PL"
}: PromotionListingProps) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(null)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>([])

  // Remove artificial promotion assignment - products now come with real promotions from backend

  // Fetch user and wishlist data
  const fetchUserData = async () => {
    try {
      const customer = await retrieveCustomer()
      setUser(customer)
      
      if (customer) {
        const wishlistData = await getUserWishlists()
        setWishlist(wishlistData.wishlists || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUser(null)
      setWishlist([])
    }
  }

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

  // Load more products
  const loadMoreProducts = async () => {
    if (isLoading || !hasNextPage) return

    try {
      setIsLoading(true)
      
      const { response, nextPage } = await listProductsWithPromotions({
        page: currentPage + 1,
        limit: 12,
        countryCode,
      })

      if (response.products.length > 0) {
        setProducts(prev => [...prev, ...response.products])
        setCurrentPage(prev => prev + 1)
        setHasNextPage(nextPage !== null)
      } else {
        setHasNextPage(false)
      }
    } catch (error) {
      console.error('Error loading more products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize user data on mount
  useEffect(() => {
    fetchUserData()
  }, [])

  // Set initial pagination state
  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts)
      setHasNextPage(initialProducts.length >= 12) // Assume more if we got full page
    }
  }, [initialProducts])

  return (
    <div className="w-full flex justify-center">
      {/* Products Grid */}
      <div className="w-full max-w-[1920px] px-4">
{isLoading ? (
          <PromotionListingSkeleton />
        ) : !products.length ? (
          <div className="text-center w-full my-10">
            <h2 className="uppercase text-primary heading-lg">Brak promocji</h2>
            <p className="mt-4 text-lg">
              Obecnie nie ma produktów w promocyjnych cenach
            </p>
          </div>
        ) : (
          <>
            <BatchPriceProvider currencyCode="PLN" days={30}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center w-full max-w-[1200px] mb-24 mx-auto">
                {products.map((product) => (
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

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMoreProducts}
                  disabled={isLoading}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold uppercase"
                >
                  {isLoading ? "Ładowanie..." : "Załaduj więcej"}
                </Button>
              </div>
            )}

            {/* Loading skeleton for load more */}
            {isLoading && (
              <div className="mt-6">
                <PromotionListingSkeleton />
              </div>
            )}
          </>
        )}
      </div>

      
    </div>
  )
}
