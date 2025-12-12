"use client"

import { useEffect, useState } from "react"
import { client } from "@/lib/client"
import { ProductCard } from "@/components/organisms"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { Hit } from "instantsearch.js"
import { HttpTypes } from "@medusajs/types"

export const AlgoliaTrendingListings = () => {
  const [products, setProducts] = useState<Hit<HttpTypes.StoreProduct>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBestProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Search for products with multiple criteria for "best" products
        const searchResponse = await client.search([
          {
            indexName: 'products',
            params: {
              query: '', // Empty query to get all products
              hitsPerPage: 20, // Get more products to have better selection
              // Remove status filter to see if that's the issue
              // filters: 'status:published',
              attributesToRetrieve: [
                'objectID',
                'id', 
                'title',
                'handle',
                'thumbnail',
                'images',
                'variants',
                'created_at',
                'status',
                'metadata'
              ]
            }
          }
        ])
        
        const firstResult = searchResponse.results[0]
        const productHits = (firstResult && 'hits' in firstResult ? firstResult.hits : []) as Hit<HttpTypes.StoreProduct>[]
        
        if (productHits.length === 0) {
          setError('No products found in search index')
          return
        }
        
        // Sort products by a "best" criteria - you can customize this logic
        // For now, we'll use a combination of factors to determine "best"
        const sortedProducts = productHits.sort((a, b) => {
          // Priority 1: Products with more variants (more options = potentially better)
          const variantsA = Array.isArray(a.variants) ? a.variants.length : 0
          const variantsB = Array.isArray(b.variants) ? b.variants.length : 0
          
          if (variantsA !== variantsB) {
            return variantsB - variantsA // More variants first
          }
          
          // Priority 2: Newer products (as a tiebreaker)
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA // Newer first
        })
        
        setProducts(sortedProducts.slice(0, 4)) // Limit to 4 products
      } catch (err) {
        setError('Failed to load best products')
      } finally {
        setLoading(false)
      }
    }

    fetchBestProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-8 w-full">
        <h2 className="mb-6 heading-lg racking-tight uppercase font-instrument-serif">
          Najlepsze produkty
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
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
        <h2 className="mb-6 heading-lg tracking-tight uppercase font-instrument-serif">
          Najlepsze produkty
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
        <h2 className="mb-6 heading-lg  tracking-tight uppercase font-instrument-serif">
          Najlepsze produkty
        </h2>
        <div className="flex justify-center w-full py-8">
          <p className="text-gray-500">No best products available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 w-full">
      <h2 className="mb-6 heading-lg  tracking-tight uppercase font-instrument-serif">
        Najlepsze produkty
      </h2>
      <BatchPriceProvider currencyCode="PLN" days={30}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.objectID}
              product={product}
            />
          ))}
        </div>
      </BatchPriceProvider>
    </section>
  )
}
