"use client"

import { useEffect, useState } from "react"
import { HomeProductsCarousel } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { useViewTracker } from "@/lib/utils/view-tracker"

interface ViewBasedBestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
}

export const ViewBasedBestProductsSection = ({ 
  heading = "Najczęściej oglądane",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 4,
  home = false
}: ViewBasedBestProductsSectionProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getMostViewed, getAnalytics } = useViewTracker()

  useEffect(() => {
    const fetchViewBasedProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get most viewed product IDs from local tracking
        const mostViewed = getMostViewed(limit * 2) // Get more to account for missing products
        const analytics = getAnalytics()

    
        if (mostViewed.length === 0) {
          // Fallback: show newest products if no view data yet
          const result = await listProducts({
            countryCode: locale,
            queryParams: {
              limit: limit,
              order: "created_at",
            },
          })
          
          const fallbackProducts = result?.response?.products || []
          setProducts(fallbackProducts as unknown as Product[])
          return
        }

        // Fetch all products to match with view data
        const result = await listProducts({
          countryCode: locale,
          queryParams: {
            limit: 50, // Get more products to find matches
            order: "created_at",
          },
        })

        const allProducts = result?.response?.products || []
        
        // Match products with view data and sort by view count
        const viewBasedProducts = mostViewed
          .map(viewData => {
            const product = allProducts.find(p => p.id === viewData.productId)
            return product ? {
              ...product,
              _viewCount: viewData.viewCount,
              _lastViewed: viewData.lastViewed
            } : null
          })
          .filter(Boolean) // Remove null entries
          .slice(0, limit) // Limit results

        // If we don't have enough view-based products, fill with newest
        if (viewBasedProducts.length < limit) {
          const usedIds = new Set(viewBasedProducts.map(p => p!.id))
          const fillProducts = allProducts
            .filter(p => !usedIds.has(p.id))
            .slice(0, limit - viewBasedProducts.length)
          
          viewBasedProducts.push(...fillProducts.map(p => ({ ...p, _viewCount: 0, _lastViewed: 0 })))
        }

        setProducts(viewBasedProducts as unknown as Product[])
      } catch (err) {
        console.error('Error fetching view-based products:', err)
        setError('Failed to load most viewed products')
      } finally {
        setLoading(false)
      }
    }

    fetchViewBasedProducts()
  }, [locale, limit, getMostViewed, getAnalytics])

  if (loading) {
    return (
      <section className="py-8 w-full">
        <h2 className="mb-6 heading-lg  tracking-tight uppercase font-instrument-serif">
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8 w-full">
        <h2 className="mb-6 heading-lg font-bold tracking-tight uppercase font-instrument-serif">
          {heading}
        </h2>
        <div className="flex justify-center w-full py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    )
  }

  if (!products.length) {
    return (
      <section className="py-8 w-full">
        <h2 className="mb-6 heading-lg font-bold tracking-tight uppercase font-instrument-serif">
          {heading}
        </h2>
        <div className="flex justify-center w-full py-8">
          <p className="text-gray-500">No viewed products yet</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 w-full">
      <h2 className="mb-6 heading-lg font-bold tracking-tight uppercase font-instrument-serif">
        {heading}
      </h2>
      <HomeProductsCarousel
        locale={locale}
        sellerProducts={products}
        home={home}
      />
    </section>
  )
}
