"use client"

import { useEffect, useState } from "react"
import { HomeProductsCarousel } from "@/components/organisms"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { useViewTracker } from "@/lib/utils/view-tracker"

interface HybridBestProductsSectionProps {
  heading?: string
  locale?: string
  limit?: number
  home?: boolean
}

export const HybridBestProductsSection = ({ 
  heading = "Najlepsze produkty",
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  limit = 4,
  home = false
}: HybridBestProductsSectionProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getMostViewed, getAnalytics } = useViewTracker()

  useEffect(() => {
    const fetchHybridBestProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get view tracking data
        const mostViewed = getMostViewed(limit * 3) // Get more for better selection
        const analytics = getAnalytics()


        // Fetch all products with their backend data
        const result = await listProducts({
          countryCode: locale,
          queryParams: {
            limit: 50, // Get more products for better selection
            order: "created_at",
          },
        })

        const allProducts = result?.response?.products || []
        
        if (allProducts.length === 0) {
          setError('No products available')
          return
        }

        // HYBRID SCORING ALGORITHM
        const scoredProducts = allProducts.map(product => {
          // Get view tracking data for this product
          const viewData = mostViewed.find(v => v.productId === product.id)
          
          // Backend-based metrics (SmartBestProductsSection logic)
          const backendMetrics = {
            reviewCount: (product as any).reviews?.length || 0,
            averageRating: (product as any).reviews?.length > 0 
              ? (product as any).reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / (product as any).reviews.length
              : 0,
            variantCount: product.variants?.length || 0,
            imageCount: product.images?.length || 0,
            hasDescription: product.description ? 1 : 0,
            isFeatured: (product.metadata as any)?.featured === 'true' ? 1 : 0,
            daysSinceCreated: Math.floor((Date.now() - new Date(product.created_at || 0).getTime()) / (1000 * 60 * 60 * 24)),
          }

          // Frontend-based metrics (ViewBasedBestProductsSection logic)
          const frontendMetrics = {
            viewCount: viewData?.viewCount || 0,
            lastViewed: viewData?.lastViewed || 0,
            isRecentlyViewed: viewData ? (Date.now() - viewData.lastViewed) < (7 * 24 * 60 * 60 * 1000) : false
          }

          // HYBRID SCORING CALCULATION
          let score = 0

          // Backend scoring (60% weight)
          const backendScore = (
            backendMetrics.reviewCount * 10 +           // 10 points per review
            backendMetrics.averageRating * 20 +         // Up to 100 points for 5-star rating
            backendMetrics.variantCount * 5 +           // 5 points per variant
            backendMetrics.imageCount * 3 +             // 3 points per image
            backendMetrics.hasDescription * 10 +        // 10 points for description
            backendMetrics.isFeatured * 50              // 50 point bonus for featured
          ) * 0.6 // 60% weight

          // Frontend scoring (40% weight)
          const frontendScore = (
            frontendMetrics.viewCount * 2 +             // 2 points per view
            (frontendMetrics.isRecentlyViewed ? 25 : 0) // 25 point bonus for recent views
          ) * 0.4 // 40% weight

          // Combine scores
          score = backendScore + frontendScore

          // Slight penalty for very old products (encourage freshness)
          if (backendMetrics.daysSinceCreated > 365) {
            score -= Math.min(backendMetrics.daysSinceCreated - 365, 50) * 0.1
          }

          return {
            ...product,
            _hybridScore: score,
            _backendScore: backendScore,
            _frontendScore: frontendScore,
            _backendMetrics: backendMetrics,
            _frontendMetrics: frontendMetrics
          }
        })

        // Sort by hybrid score and take top products
        const bestProducts = scoredProducts
          .sort((a, b) => b._hybridScore - a._hybridScore)
          .slice(0, limit)

        // Debug logging
        console.log('🏆 Hybrid Best Products Results:', bestProducts.map(p => ({
          title: p.title,
          hybridScore: Math.round(p._hybridScore),
          backendScore: Math.round(p._backendScore),
          frontendScore: Math.round(p._frontendScore),
          viewCount: p._frontendMetrics.viewCount,
          reviewCount: p._backendMetrics.reviewCount,
          rating: p._backendMetrics.averageRating
        })))

        setProducts(bestProducts as unknown as Product[])
      } catch (err) {
        console.error('Error fetching hybrid best products:', err)
        setError('Failed to load best products')
      } finally {
        setLoading(false)
      }
    }

    fetchHybridBestProducts()
  }, [locale, limit, getMostViewed, getAnalytics])

  if (loading) {
    return (
      <section className="py-8 w-full">
        <h2 className="mb-6 heading-lg tracking-tight uppercase font-instrument-serif">
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
        <h2 className="mb-6 heading-lg  tracking-tight uppercase font-instrument-serif">
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
          <p className="text-gray-500">No best products available</p>
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
