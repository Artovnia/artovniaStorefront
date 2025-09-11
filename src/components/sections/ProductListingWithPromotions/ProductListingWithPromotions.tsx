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
const ProductListingSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center w-full max-w-[1200px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[315px] w-[252px] bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
)

interface ProductListingWithPromotionsProps {
  initialProducts?: HttpTypes.StoreProduct[]
  initialCount?: number
  initialPage?: number
  countryCode?: string
  showLoadMore?: boolean
  maxProducts?: number
}

export const ProductListingWithPromotions = ({
  initialProducts = [],
  initialCount = 0,
  initialPage = 1,
  countryCode = "PL",
  showLoadMore = true,
  maxProducts
}: ProductListingWithPromotionsProps) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts)
  const [count, setCount] = useState(initialCount)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(null)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>([])

  // Fetch user and wishlist data
  const fetchUserData = async () => {
    try {
      const customer = await retrieveCustomer()
      setUser(customer)
      
      if (customer?.id) {
        const userWishlists = await getUserWishlists()
        setWishlist(userWishlists.wishlists || [])
      }
    } catch (error) {
      console.warn('Failed to fetch user data:', error)
    }
  }

  // Handle wishlist changes
  const handleWishlistChange = () => {
    if (user?.id) {
      fetchUserData() // Refetch to get updated wishlist
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

  // Set initial pagination state and log promotion data
  useEffect(() => {
    if (initialProducts.length > 0) {
      setProducts(initialProducts)
      setHasNextPage(initialProducts.length >= 12) // Assume more if we got full page
    }
  }, [initialProducts])

  // Apply max products limit if specified
  const displayProducts = maxProducts ? products.slice(0, maxProducts) : products

  return (
    <div className="w-full flex justify-center">
      {/* Products Grid */}
      <div className="w-full max-w-[1920px] px-4">
        {isLoading && products.length === 0 ? (
          <ProductListingSkeleton />
        ) : !displayProducts.length ? (
          <div className="text-center w-full my-10">
            <h2 className="uppercase text-primary heading-lg">Brak promocji</h2>
            <p className="mt-4 text-lg">
              Obecnie nie ma produktów w promocyjnych cenach
            </p>
          </div>
        ) : (
          <BatchPriceProvider currencyCode="PLN">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center w-full max-w-[1200px] mx-auto">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  user={user}
                  wishlist={wishlist}
                  onWishlistChange={handleWishlistChange}
                />
              ))}
            </div>

            {/* Load More Button */}
            {showLoadMore && hasNextPage && !maxProducts && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMoreProducts}
                  disabled={isLoading}
                  className="bg-[#3B3634] text-white px-8 py-3 hover:bg-[#2A2522] transition-colors"
                >
                  {isLoading ? 'Ładowanie...' : 'Załaduj więcej'}
                </Button>
              </div>
            )}
          </BatchPriceProvider>
        )}
      </div>
    </div>
  )
}
