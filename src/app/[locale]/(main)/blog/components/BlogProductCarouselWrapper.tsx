'use client'

import { useEffect, useMemo, useState } from 'react'
import BlogProductCarousel from './BlogProductCarousel'
import { HttpTypes } from '@medusajs/types'

interface ProductCarouselItem {
  productHandle: string
  customTitle?: string
}

type RawProductCarouselItem = ProductCarouselItem & {
  handle?: string
  title?: string
  productUrl?: string
  product_url?: string
  product?: {
    handle?: string
  }
}

interface BlogProductCarouselWrapperProps {
  title?: string
  productItems: RawProductCarouselItem[]
  showPrices?: boolean
  showSellerName?: boolean
}

const normalizeProductHandle = (rawHandle?: string): string => {
  if (!rawHandle) return ''

  let trimmed = String(rawHandle).trim()
  try {
    trimmed = decodeURIComponent(trimmed)
  } catch {
    // Keep original value if decoding fails
  }

  if (!trimmed) return ''

  // Support legacy values like "/products/handle", full URLs and query/hash fragments
  const withoutQuery = trimmed.split('?')[0].split('#')[0]
  const normalizedPath = withoutQuery.replace(/^https?:\/\/[^/]+/i, '')
  const withoutPrefix = normalizedPath.replace(/^\/?products\//i, '')

  return withoutPrefix.replace(/^\/+|\/+$/g, '').toLowerCase()
}

const normalizeProductItems = (items: RawProductCarouselItem[]): ProductCarouselItem[] => {
  const byHandle = new Map<string, ProductCarouselItem>()

  items.forEach((item) => {
    const rawHandle =
      item.productHandle ||
      item.handle ||
      item.product?.handle ||
      item.productUrl ||
      item.product_url

    const productHandle = normalizeProductHandle(rawHandle)
    if (!productHandle) return

    byHandle.set(productHandle, {
      productHandle,
      customTitle: item.customTitle || item.title,
    })
  })

  return Array.from(byHandle.values())
}

export default function BlogProductCarouselWrapper({
  title,
  productItems,
  showPrices = true,
  showSellerName = true,
}: BlogProductCarouselWrapperProps) {
  const normalizedProductItems = useMemo(
    () => normalizeProductItems(productItems || []),
    [productItems]
  )

  const [products, setProducts] = useState<(HttpTypes.StoreProduct & { seller?: any })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      if (!normalizedProductItems || normalizedProductItems.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        const handles = normalizedProductItems
          .map((item) => item.productHandle)
          .filter(Boolean)
        
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
  }, [normalizedProductItems])

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
      productItems={normalizedProductItems}
      showPrices={showPrices}
      showSellerName={showSellerName}
    />
  )
}
