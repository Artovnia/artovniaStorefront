'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Product {
  title: string
  image_url: string
  url: string
}

interface FeaturedProductsBlockData {
  title?: string
  product_ids?: string[] // Legacy support
  product_handles?: string[] // Legacy support
  products?: Product[] // New: metadata-based cards
  columns: 2 | 3 | 4
}

interface FeaturedProductsBlockProps {
  data: FeaturedProductsBlockData
  sellerId: string
}

export const FeaturedProductsBlock = ({ data }: FeaturedProductsBlockProps) => {
  const { title, products = [], columns = 3 } = data

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif italic text-[#3B3634]">{title}</h2>
      )}
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {products.map((product, index) => (
          <Link
            key={index}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl overflow-hidden border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative aspect-square overflow-hidden bg-[#F4F0EB]">
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* External link icon */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                <svg className="w-4 h-4 text-[#3B3634]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-instrument-serif text-lg text-[#3B3634] group-hover:text-[#8B7355] transition-colors duration-300 line-clamp-2">
                {product.title}
              </h3>
              
              {/* View product link */}
              <div className="mt-3 flex items-center text-sm text-[#8B7355] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Zobacz produkt</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
