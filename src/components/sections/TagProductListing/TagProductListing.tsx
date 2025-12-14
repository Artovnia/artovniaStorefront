'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { listProductsByTag } from '@/lib/data/tags'
import { ProductCard } from '@/components/organisms/ProductCard/ProductCard'
import { Pagination } from '@/components/cells/Pagination/Pagination'
import { PromotionDataProvider } from '@/components/context/PromotionDataProvider'
import { BatchPriceProvider } from '@/components/context/BatchPriceProvider'

interface TagProductListingProps {
  initialProducts: any[]
  initialCount: number
  initialPage: number
  limit: number
  tagValue: string
}

const ProductListingSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-12">
    {Array.from({ length: 12 }).map((_, index) => (
      <div
        key={index}
        className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden"
      >
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

export function TagProductListing({
  initialProducts,
  initialCount,
  initialPage,
  limit,
  tagValue,
}: TagProductListingProps) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(initialCount)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const searchParams = useSearchParams()

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true)
      setError(null)

      const offset = (page - 1) * limit
      const data = await listProductsByTag(tagValue, {
        limit,
        offset,
      })

      setProducts(data.products)
      setTotalCount(data.count)
      setCurrentPage(page)
    } catch (err) {
      console.error('Error fetching products by tag:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      setProducts([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Set initial data when props change
  useEffect(() => {
    setProducts(initialProducts)
    setTotalCount(initialCount)
    setCurrentPage(initialPage)
  }, [initialProducts, initialCount, initialPage])

  const totalPages = Math.ceil(totalCount / limit)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      fetchProducts(page)
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-red-600 mb-2 font-instrument-sans">
          Wystąpił błąd
        </h2>
        <p className="text-gray-600 font-instrument-sans ">{error}</p>
        <button
          onClick={() => fetchProducts(currentPage)}
          className="mt-4 px-4 py-2 bg-primary text-black rounded-lg hover:bg-opacity-90 transition-colors font-instrument-sans"
        >
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  return (
    <PromotionDataProvider countryCode="PL" limit={50}>
      <BatchPriceProvider currencyCode="PLN">
        <div className="w-full">
          {/* Results Info - Aligned with product grid */}
          <div className="w-full flex justify-center xl:justify-start mb-6 max-w-[1450px] mx-auto">
            <div className="w-fit ">
              <p className="text-sm text-gray-600 font-instrument-sans ">
                {loading ? (
                  'Ładowanie...'
                ) : (
                  <>
                    Strona {currentPage} z {totalPages}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Content Area */}
          {loading ? (
            <ProductListingSkeleton />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-bold text-gray-800 mb-2 font-instrument-sans">
                Brak produktów
              </h2>
              <p className="text-gray-600 font-instrument-sans">
                Nie znaleziono produktów z tym tagiem
              </p>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="w-full flex justify-center ">
                
                
                <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-12 w-fit mx-auto ">
                  
                  {products.map((product: any, index: number) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
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
      </BatchPriceProvider>
    </PromotionDataProvider>
  )
}
