'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CategoryMetadata {
  title: string
  image_url: string
  url: string
}

interface CategoriesBlockData {
  title?: string
  category_ids?: string[] // Legacy support
  category_handles?: string[] // Legacy support
  categories?: CategoryMetadata[] // New: metadata-based cards
  columns?: number
}

interface CategoriesBlockProps {
  data: CategoriesBlockData
  sellerHandle?: string
}

export const CategoriesBlock = ({ data }: CategoriesBlockProps) => {
  const { title, categories = [], columns = 3 } = data

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif italic text-center text-[#3B3634]">{title}</h2>
      )}
      
      <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-6`}>
        {categories.map((category, index) => (
          <Link
            key={index}
            href={category.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl overflow-hidden border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F0EB]">
              <Image
                src={category.image_url}
                alt={category.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* External link icon */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                <svg className="w-4 h-4 text-[#3B3634]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              
              {/* Category title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <h3 className="text-white font-instrument-serif text-lg text-center group-hover:scale-105 transition-transform duration-300">
                  {category.title}
                </h3>
              </div>
            </div>
            
            {/* Browse category link */}
            <div className="p-4 flex items-center justify-center text-sm text-[#8B7355] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Przeglądaj kategorię</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
