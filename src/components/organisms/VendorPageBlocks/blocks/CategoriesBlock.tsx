'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  handle: string
  thumbnail?: string
}

interface CategoriesBlockData {
  title?: string
  category_ids?: string[] // Legacy support
  category_handles?: string[] // New: use handles from URLs
  columns?: number
}

interface CategoriesBlockProps {
  data: CategoriesBlockData
  sellerHandle?: string
}

export const CategoriesBlock = ({ data, sellerHandle }: CategoriesBlockProps) => {
  const { title, category_ids = [], category_handles = [], columns = 3 } = data
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Use handles if available, otherwise fall back to IDs
  const hasHandles = category_handles.length > 0
  const hasIds = category_ids.length > 0

  useEffect(() => {
    const fetchCategories = async () => {
      if (!hasHandles && !hasIds) {
        setLoading(false)
        return
      }

      try {
        let fetchedCategories: Category[] = []
        
        if (hasHandles) {
          // Fetch categories by handles (one by one)
          const categoryPromises = category_handles.map(async (handle) => {
            try {
              const response = await fetch(`/api/store/product-categories?handle=${handle}`)
              if (response.ok) {
                const data = await response.json()
                return data.product_categories?.[0] || null
              }
              return null
            } catch {
              return null
            }
          })
          const results = await Promise.all(categoryPromises)
          fetchedCategories = results.filter(Boolean)
        } else if (hasIds) {
          // Legacy: Fetch categories by IDs
          const response = await fetch(`/api/store/product-categories?id[]=${category_ids.join('&id[]=')}`)
          if (response.ok) {
            const data = await response.json()
            fetchedCategories = data.product_categories || []
          }
        }
        
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [category_handles, category_ids, hasHandles, hasIds])

  const itemCount = hasHandles ? category_handles.length : category_ids.length
  if (itemCount === 0) {
    return null
  }

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif italic text-center">{title}</h2>
      )}
      
      {loading ? (
        <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-6`}>
          {Array.from({ length: Math.min(itemCount, 6) }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-[4/3] bg-[#F4F0EB] rounded-lg mb-3" />
              <div className="h-4 bg-[#F4F0EB] rounded w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-6`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={sellerHandle ? `/sellers/${sellerHandle}?category=${category.handle}` : `/categories/${category.handle}`}
              className="group"
            >
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#F4F0EB] mb-3">
                {category.thumbnail ? (
                  <Image
                    src={category.thumbnail}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#3B3634]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <h3 className="text-center font-instrument-sans text-lg group-hover:text-[#3B3634]/70 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
