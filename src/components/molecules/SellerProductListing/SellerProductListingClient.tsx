"use client"

import { useState, useEffect, useMemo } from 'react'
import { HttpTypes } from '@medusajs/types'
import { ProductCard } from '@/components/organisms'
import { Pagination } from '@/components/cells/Pagination/Pagination'
import { getProductsPromotionsBatch, listProductsWithSort } from '@/lib/data/products'
import { getUserWishlists } from '@/lib/data/wishlist'
import { ProductListingSkeleton } from '@/components/organisms/ProductListingSkeleton/ProductListingSkeleton'
import { PromotionDataProvider } from '@/components/context/PromotionDataProvider'
import { BatchPriceProvider } from '@/components/context/BatchPriceProvider'
import { SellerProductFilterBar } from "@/components/organisms/SellerProductFilterBar/SellerProductFilterBar"
import { useSearchParams } from 'next/navigation'
import { SerializableWishlist } from '@/types/wishlist'
import { LowestPriceData } from '@/types/price-history'
import { PRODUCT_LIMIT } from '@/const'

export function SellerProductListingClient({
  seller_id,
  user,
  initialProducts,
  initialTotalCount,
  initialWishlists,
  initialPriceData,
  categories,
}: {
  seller_id: string
  user: HttpTypes.StoreCustomer | null
  initialProducts?: HttpTypes.StoreProduct[]
  initialTotalCount?: number
  initialWishlists?: SerializableWishlist[]
  initialPriceData?: Record<string, LowestPriceData | null>
  categories?: Array<{ 
    id: string; 
    name: string; 
    handle?: string;
    rank?: number;
    parent_category_id?: string | null;
    mpath?: string;
    category_children?: any[];
  }>
}) {
  const searchParams = useSearchParams()
  
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts || [])
  const [totalCount, setTotalCount] = useState(initialTotalCount || 0)
  const [currentPage, setCurrentPage] = useState(1)
  const [wishlist, setWishlist] = useState<SerializableWishlist[]>(initialWishlists || [])
  // ✅ Start with no loading if we have initial data
  const [isLoading, setIsLoading] = useState(!(initialProducts && initialProducts.length > 0))
  const [promotionalSeedProducts, setPromotionalSeedProducts] = useState<HttpTypes.StoreProduct[]>(initialProducts || [])
  
  // ✅ OPTIMIZATION: Memoize user ID to prevent unnecessary re-fetches
  const userId = user?.id
  
  // ✅ Get filter parameters from URL
  const sortBy = searchParams.get('sortBy') || ''
  const categoryId = searchParams.get('category') || ''
  
  // ✅ CRITICAL FIX: Fetch on page change, filter change
  // Uses server-provided page-1 data directly to avoid duplicate initial fetch.
  useEffect(() => {
    const fetchData = async () => {
      const shouldUseInitialData =
        currentPage === 1 &&
        !sortBy &&
        !categoryId &&
        Boolean(initialProducts && initialProducts.length > 0)

      if (shouldUseInitialData) {
        setProducts(initialProducts || [])
        setTotalCount(initialTotalCount || initialProducts?.length || 0)
        setWishlist(initialWishlists || [])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const offset = (currentPage - 1) * PRODUCT_LIMIT
        
        // ✅ CRITICAL: Fetch only the current page with filters applied
        const [productsResult, wishlistData] = await Promise.all([
          listProductsWithSort({
            seller_id,
            countryCode: "pl",
            sortBy: (sortBy || 'created_at_desc') as any,
            category_id: categoryId || undefined,
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
    // ✅ Re-fetch when page, filters, or seller changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller_id, currentPage, sortBy, categoryId, initialProducts, initialTotalCount, initialWishlists])

  // Enrich current page products with targeted promotion payloads.
  // This avoids relying on global promotions listing, which may omit many seller products.
  useEffect(() => {
    let isCancelled = false

    const enrichProductsWithPromotions = async () => {
      if (!products.length) {
        setPromotionalSeedProducts([])
        return
      }

      const promotionsByProduct = await getProductsPromotionsBatch(
        products.map((product) => product.id)
      )

      const enrichedProducts = products.map((product) => {
        const promotions = promotionsByProduct[product.id] || []
        return {
          ...product,
          promotions,
          has_promotions: promotions.length > 0 || Boolean((product as any).has_promotions),
        } as HttpTypes.StoreProduct
      })

      if (!isCancelled) {
        setPromotionalSeedProducts(enrichedProducts)
      }
    }

    enrichProductsWithPromotions()

    return () => {
      isCancelled = true
    }
  }, [products])
  
  // ✅ Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy, categoryId])

  const totalPages = Math.ceil(totalCount / PRODUCT_LIMIT)

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    
    // ✅ Update page immediately - useEffect will handle the fetch
    setCurrentPage(page)
    
    // ✅ Scroll to top after state update
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
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

  // Extract product IDs for promotion data provider
  const productIds = products.map(p => p.id)
  const promotionSeedKey = useMemo(
    () =>
      promotionalSeedProducts
        .map((product) => {
          const productWithPromotions = product as HttpTypes.StoreProduct & {
            promotions?: unknown[]
            has_promotions?: boolean
          }
          return `${product.id}:${productWithPromotions.promotions?.length || 0}:${productWithPromotions.has_promotions ? 1 : 0}`
        })
        .join('|'),
    [promotionalSeedProducts]
  )

  if (isLoading) {
    return <ProductListingSkeleton />
  }

  return (
    <PromotionDataProvider 
      key={promotionSeedKey}
      countryCode="PL"
      productIds={productIds}
      initialData={promotionalSeedProducts}
      serverDataProvided={true}
    >
      <div>
        {/* Filter Bar */}
        <SellerProductFilterBar categories={categories} />
        
        <div className="mt-8">
          {!products.length ? (
          <div className="text-center my-10">
            <h2 className="uppercase heading-lg">Brak produktów</h2>
            <p className="mt-4 text-lg">
              Ten sprzedawca nie ma jeszcze żadnych produktów
            </p>
          </div>
        ) : (
          <BatchPriceProvider 
            currencyCode="PLN"
            preloadVariantIds={products.map(p => p.variants?.[0]?.id).filter(Boolean) as string[]}
            initialPriceData={initialPriceData}
          >
            <div className="w-full">
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
            </div>
          </BatchPriceProvider>
        )}
        </div>
      </div>
    </PromotionDataProvider>
  )
}