"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"
import { PRODUCT_LIMIT } from "@/const"
import { listProductsWithSort } from '@/lib/data/products'
import { retrieveCustomer } from '@/lib/data/customer'
import { getUserWishlists } from '@/lib/data/wishlist'
import { SerializableWishlist } from '@/types/wishlist'
import { Pagination } from '@/components/cells/Pagination/Pagination'

// Simple loading component
const SellerProductListingSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
)

interface SellerProductListingProps {
  seller_id: string
  className?: string
}

export const SellerProductListing = ({
  seller_id,
  className
}: SellerProductListingProps) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(null)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Function to refresh wishlist data after wishlist changes
  const refreshWishlist = async () => {
    if (!user) return;
    
    try {
      const wishlistData = await getUserWishlists()
      setWishlist(wishlistData.wishlists || [])
    } catch (error) {
      console.error('Error refreshing wishlist:', error)
    }
  }
  
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

  // Fetch products data 
  const fetchProducts = async (page: number = 1) => {
    try {
      setIsLoading(true)
      const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl"
      const offset = (page - 1) * PRODUCT_LIMIT

      const result = await listProductsWithSort({
        seller_id,
        countryCode: DEFAULT_REGION,
        sortBy: "created_at",
        queryParams: {
          limit: PRODUCT_LIMIT,
          offset
        },
      })

      // ✅ SAFETY CHECK: Handle undefined or invalid result
      if (!result || !result.response) {
        console.warn('listProductsWithSort returned invalid result')
        setProducts([])
        setCount(0)
        setTotalCount(0)
        return
      }

      const { response } = result
      
      setProducts(response.products || [])
      setCount(response.count || 0)
      setTotalCount(response.count || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setCount(0)
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch when component mounts
  useEffect(() => {
    fetchUserData()
  }, [])

  // Fetch products when seller changes
  useEffect(() => {
    if (seller_id) {
      fetchProducts(1)
    }
  }, [seller_id])

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT)
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchProducts(page)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (isLoading) return <SellerProductListingSkeleton />

  return (
    <div className={className}>
      {/* Products Grid */}
      <div className="flex flex-col items-center mx-auto w-full mt-8">
        {!products.length ? (
          <div className="text-center w-full my-10">
            <h2 className="uppercase text-primary heading-lg">Brak produktów</h2>
            <p className="mt-4 text-lg">
              Ten sprzedawca nie ma jeszcze żadnych produktów
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 w-full">
              <div className="label-md text-gray-600">{`${count} produkt${count === 1 ? '' : count < 5 ? 'y' : 'ów'}`}</div>
            </div>
          
            {/* Products Grid - 3 columns max for two-column page layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full justify-items-center">
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
          </>
        )}
      </div>

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
    </div>
  )
}
