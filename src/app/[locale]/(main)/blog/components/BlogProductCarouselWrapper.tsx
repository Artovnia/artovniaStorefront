'use client'

import { useEffect, useState } from 'react'
import BlogProductCarousel from './BlogProductCarousel'
import { HttpTypes } from '@medusajs/types'

interface ProductCarouselItem {
  productHandle: string
  customTitle?: string
}

interface BlogProductCarouselWrapperProps {
  title?: string
  productItems: ProductCarouselItem[]
  showPrices?: boolean
  showSellerName?: boolean
}

export default function BlogProductCarouselWrapper({
  title,
  productItems,
  showPrices = true,
  showSellerName = true,
}: BlogProductCarouselWrapperProps) {
  const [products, setProducts] = useState<(HttpTypes.StoreProduct & { seller?: any })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      if (!productItems || productItems.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        const handles = productItems.map((item) => item.productHandle).filter(Boolean)
        
        if (handles.length === 0) {
          setIsLoading(false)
          return
        }

        // Fetch products from API route
        const response = await fetch('/api/blog/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ handles }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        console.error('Error fetching blog carousel products:', err)
        setError('Nie udało się załadować produktów')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [productItems])

  if (isLoading) {
    return (
      <div className="my-8 py-6 bg-white rounded-lg border border-[#BFB7AD]/30">
        {title && (
          <h3 className="text-xl md:text-2xl font-instrument-serif text-[#3B3634] mb-4 px-4 md:px-6">
            {title}
          </h3>
        )}
        <div className="flex gap-4 px-4 md:px-6 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[160px] sm:w-[180px] bg-[#F4F0EB] rounded-lg overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-3">
                <div className="h-3 bg-gray-200 rounded mb-2 w-1/2" />
                <div className="h-4 bg-gray-200 rounded mb-1" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || products.length === 0) {
    return null
  }

  return (
    <BlogProductCarousel
      title={title}
      products={products}
      productItems={productItems}
      showPrices={showPrices}
      showSellerName={showSellerName}
    />
  )
}
