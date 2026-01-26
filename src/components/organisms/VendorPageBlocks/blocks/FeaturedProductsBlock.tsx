'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/organisms'

interface FeaturedProductsBlockData {
  title?: string
  product_ids?: string[] // Legacy support
  product_handles?: string[] // New: use handles from URLs
  columns: 2 | 3 | 4
}

interface FeaturedProductsBlockProps {
  data: FeaturedProductsBlockData
  sellerId: string
}

export const FeaturedProductsBlock = ({ data, sellerId }: FeaturedProductsBlockProps) => {
  const { title, product_ids = [], product_handles = [], columns = 3 } = data
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Use handles if available, otherwise fall back to IDs
  const hasHandles = product_handles.length > 0
  const hasIds = product_ids.length > 0

  useEffect(() => {
    if (!hasHandles && !hasIds) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        let fetchedProducts: any[] = []
        
        if (hasHandles) {
          // Fetch products by handles (one by one since API may not support batch)
          const productPromises = product_handles.map(async (handle) => {
            try {
              const response = await fetch(`/api/products/${handle}`)
              if (response.ok) {
                const data = await response.json()
                return data.product
              }
              return null
            } catch {
              return null
            }
          })
          const results = await Promise.all(productPromises)
          fetchedProducts = results.filter(Boolean)
        } else if (hasIds) {
          // Legacy: Fetch products by IDs
          const response = await fetch(`/api/products?ids=${product_ids.join(',')}`)
          const data = await response.json()
          fetchedProducts = data.products || []
        }
        
        setProducts(fetchedProducts)
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [product_handles, product_ids, hasHandles, hasIds])

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }

  const itemCount = hasHandles ? product_handles.length : product_ids.length
  if (itemCount === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif italic">{title}</h2>
      )}
      {loading ? (
        <div className={`grid ${columnClasses[columns]} gap-4`}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <div key={index} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className={`grid ${columnClasses[columns]} gap-4`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              user={null}
              wishlist={[]}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">Brak produktów do wyświetlenia</p>
      )}
    </div>
  )
}
