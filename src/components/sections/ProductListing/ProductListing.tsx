"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/organisms"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { CategorySidebar } from "@/components/organisms"
import { ProductFilterBar } from "@/components/organisms"
// Simple loading component since skeleton import has issues
const ProductListingSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
      <div className="lg:col-span-4">
        <div className="h-16 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
import { PRODUCT_LIMIT } from "@/const"
import { listProductsWithSort } from '@/lib/data/products'
import { retrieveCustomer } from '@/lib/data/customer'
import { getUserWishlists } from '@/lib/data/wishlist'
import { SerializableWishlist } from '@/types/wishlist'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Pagination } from '@/components/cells'

// Define props interface matching AlgoliaProductsListing
interface ProductListingProps {
  category_id?: string
  category_ids?: string[]
  categories?: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
  collection_id?: string
  seller_id?: string
  showSidebar?: boolean
}

export const ProductListing = ({
  seller_id,
  category_id,
  collection_id,
  categories
}: ProductListingProps) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<HttpTypes.StoreCustomer | null>(null)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>([])
  
  // Get URL search parameters for filtering and pagination
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // ✅ Get current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

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

  // Fetch products data with URL-based filtering
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl"

      // Build query parameters from URL search params
      const offset = (currentPage - 1) * PRODUCT_LIMIT
      const queryParams: any = {
        limit: PRODUCT_LIMIT,
        offset,
      }

      // Add color filtering
      const colorParam = searchParams.get("color")
      if (colorParam) {
        queryParams.color = colorParam // Pass color filter to backend
      }

      // Add size filtering
      const sizeParam = searchParams.get("size")
      if (sizeParam) {
        queryParams.size = sizeParam
      }

      // Add price filtering
      const minPrice = searchParams.get("min_price")
      const maxPrice = searchParams.get("max_price")
      if (minPrice) queryParams.min_price = minPrice
      if (maxPrice) queryParams.max_price = maxPrice

      // Add condition filtering
      const condition = searchParams.get("condition")
      if (condition) {
        queryParams.condition = condition
      }

      // Add dimension filtering
      const dimensionParams = ['min_length', 'max_length', 'min_width', 'max_width', 'min_height', 'max_height', 'min_weight', 'max_weight']
      dimensionParams.forEach(param => {
        const value = searchParams.get(param)
        if (value) queryParams[param] = value
      })


      const result = await listProductsWithSort({
        seller_id,
        category_id,
        collection_id,
        countryCode: DEFAULT_REGION,
        sortBy: "created_at",
        queryParams,
      })

      // ✅ SAFETY CHECK: Handle undefined or invalid result
      if (!result || !result.response) {
        console.warn('listProductsWithSort returned invalid result')
        setProducts([])
        setCount(0)
        return
      }

      const { response } = result

      setProducts(response.products || [])
      setCount(response.count || 0)  // ✅ FIX: Use count from response, not products.length
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch when component mounts or filters change
  useEffect(() => {
    fetchUserData()
  }, [])

  // Fetch products when filters, category, or page changes
  useEffect(() => {
    fetchProducts()
  }, [category_id, collection_id, seller_id, searchParams, currentPage])

  if (isLoading) return <ProductListingSkeleton />

  return (
    <>
      {/* Main Layout: (Results Count + Category Sidebar) + (Filter Bar + Products) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Results Count + Category Sidebar - Hidden below 768px (md breakpoint) */}
        <div className="hidden lg:block lg:col-span-1">
          {/* Results Count - Above category sidebar */}
          <div className="mb-4">
            <div className="label-md">{`${count} wyników`}</div>
          </div>
          
          {/* Category Sidebar */}
          <div className="sticky top-24">
            <CategorySidebar 
              parentCategoryHandle={category_id ? undefined : undefined} 
              className="bg-primary p-4"
              categories={categories || []}
            />
          </div>
        </div>

        {/* Right Column: Filter Bar + Products */}
        <div className="lg:col-span-4">
          {/* Filter Bar - Above products */}
          <div className="mb-6">
            <ProductFilterBar 
              colorFacetItems={[]} // No Algolia facet data in Postgres mode
              ratingFacetItems={[]} // No Algolia facet data in Postgres mode
              refineColor={undefined} // No Algolia refinement in Postgres mode
              refineRating={undefined} // No Algolia refinement in Postgres mode
            />
          </div>

          {/* Products Grid - Below filter bar */}
          <div className="w-full">
            {!products.length ? (
              <div className="text-center w-full my-10">
                <h2 className="uppercase text-primary heading-lg">Brak wyników</h2>
                <p className="mt-4 text-lg">
                  Nie znaleziono produktów spełniających Twoje kryteria
                </p>
              </div>
            ) : (
              <BatchPriceProvider currencyCode="PLN" days={30}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              </BatchPriceProvider>
            )}
          </div>

          {/* Pagination */}
          {count > PRODUCT_LIMIT && (
            <div className="mt-8 flex justify-center">
              <Pagination
                pages={Math.ceil(count / PRODUCT_LIMIT)}
                setPage={(page: number) => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('page', page.toString())
                  router.push(`${pathname}?${params.toString()}`)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                currentPage={currentPage}
              />
            </div>
          )}

          {/* Mobile Results Count - Only visible below lg breakpoint */}
          <div className="lg:hidden mt-8 text-center">
            <div className="label-md text-gray-600">{`${count} wyników`}</div>
          </div>
        </div>
      </div>
    </>
  )
}
