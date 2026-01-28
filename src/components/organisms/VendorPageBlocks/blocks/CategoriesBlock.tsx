'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CategoryMetadata {
  title: string
  image_url: string
  url: string
  description?: string
}

interface CategoriesBlockData {
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  category_ids?: string[] // Legacy support
  category_handles?: string[] // Legacy support
  categories?: CategoryMetadata[] // New: metadata-based cards
  layout?: 'classic' | 'minimal' | 'bold' | 'artistic'
  columns?: number
  rounded_edges?: boolean
}

interface CategoriesBlockProps {
  data: CategoriesBlockData
  sellerHandle?: string
}

export const CategoriesBlock = ({ data }: CategoriesBlockProps) => {
  const { 
    title, 
    title_alignment = 'center',
    title_italic = false,
    categories = [], 
    layout = 'classic', 
    columns = 3, 
    rounded_edges = true 
  } = data

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const titleClasses = `text-xl md:text-2xl font-instrument-serif ${titleAlignmentClasses[title_alignment]} ${title_italic ? 'italic' : ''}`

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  if (categories.length === 0) {
    return null
  }

  // Render different layouts based on selection
  const renderLayout = () => {
    switch (layout) {
      case 'minimal':
        return <MinimalLayout categories={categories} columns={columns} gridCols={gridCols} roundedEdges={rounded_edges} />
      case 'bold':
        return <BoldLayout categories={categories} columns={columns} gridCols={gridCols} roundedEdges={rounded_edges} />
      case 'artistic':
        return <ArtisticLayout categories={categories} columns={columns} gridCols={gridCols} roundedEdges={rounded_edges} />
      case 'classic':
      default:
        return <ClassicLayout categories={categories} columns={columns} gridCols={gridCols} roundedEdges={rounded_edges} />
    }
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className={titleClasses}>{title}</h2>
      )}
      {renderLayout()}
    </div>
  )
}

// Classic Layout - Enhanced version of current design
const ClassicLayout = ({ categories, columns, gridCols, roundedEdges }: any) => (
  <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-4`}>
    {categories.map((category: CategoryMetadata, index: number) => (
      <Link
        key={index}
        href={category.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block bg-white overflow-hidden border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${roundedEdges ? 'rounded-lg' : ''}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F4F0EB]">
          <Image
            src={category.image_url}
            alt={category.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Category title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-instrument-serif text-lg group-hover:scale-105 transition-transform duration-300">
              {category.title}
            </h3>
            {category.description && (
              <p className="text-white/80 text-xs mt-1 line-clamp-2">{category.description}</p>
            )}
          </div>
        </div>
        
        {/* Browse category link */}
        <div className="p-3 bg-primary flex items-center justify-center text-xs text-[#8B7355] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Przeglądaj kategorię</span>
          <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    ))}
  </div>
)

// Minimal Layout - Clean, typography-focused
const MinimalLayout = ({ categories, columns, gridCols, roundedEdges }: any) => (
  <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-6`}>
    {categories.map((category: CategoryMetadata, index: number) => (
      <Link
        key={index}
        href={category.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className={`relative aspect-[3/2] overflow-hidden bg-[#F4F0EB] mb-3 ${roundedEdges ? 'rounded-lg' : ''}`}>
          <Image
            src={category.image_url}
            alt={category.title}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-instrument-serif text-lg text-[#3B3634] group-hover:text-[#8B7355] transition-colors duration-300">
            {category.title}
          </h3>
          {category.description && (
            <p className="text-[#666] text-xs line-clamp-2">{category.description}</p>
          )}
          <div className="flex items-center text-xs text-[#8B7355] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Odkryj więcej</span>
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    ))}
  </div>
)

// Bold Layout - Dramatic full-image cards with strong overlays
const BoldLayout = ({ categories, columns, gridCols, roundedEdges }: any) => {
  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-4`}>
      {categories.map((category: CategoryMetadata, index: number) => (
        <Link
          key={index}
          href={category.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group block relative aspect-square overflow-hidden ${roundedEdges ? 'rounded-lg' : ''}`}
        >
          <Image
            src={category.image_url}
            alt={category.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Always visible gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3B3634]/80 via-[#3B3634]/40 to-transparent" />
          
          {/* Title - always visible */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 group-hover:-translate-y-2">
            <h3 className="text-white font-instrument-serif text-lg mb-1">
              {category.title}
            </h3>
            {category.description && (
              <p className="text-white/80 text-xs line-clamp-2">{category.description}</p>
            )}
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#3B3634]/90 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            <div className="text-center text-white space-y-2">
              <h3 className="font-instrument-serif text-xl">{category.title}</h3>
              {category.description && (
                <p className="text-xs px-4 line-clamp-3">{category.description}</p>
              )}
              <div className="flex items-center justify-center gap-2 text-xs font-medium pt-2">
                <span>Przeglądaj</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// Artistic Layout - Creative borders and artistic effects
const ArtisticLayout = ({ categories, columns, gridCols, roundedEdges }: any) => (
  <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} gap-6`}>
    {categories.map((category: CategoryMetadata, index: number) => {
      // Alternate border styles for artistic variety
      const borderStyles = [
        'border-4 border-[#3B3634]',
        'border-2 border-[#8B7355]',
        'border-[6px] border-[#F4F0EB]',
      ]
      const borderStyle = borderStyles[index % borderStyles.length]
      
      return (
        <Link
          key={index}
          href={category.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className={`relative overflow-hidden ${borderStyle} p-2 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:rotate-1 ${roundedEdges ? 'rounded-lg' : ''}`}>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={category.image_url}
                alt={category.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4F0EB]/80 transform rotate-45 translate-x-8 -translate-y-8" />
            </div>
            
            <div className="p-3 bg-primary">
              <h3 className="font-instrument-serif text-base text-[#3B3634] text-center mb-1">
                {category.title}
              </h3>
              {category.description && (
                <p className="text-[#666] text-xs text-center line-clamp-2">{category.description}</p>
              )}
              
              {/* Decorative line */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-[#8B7355]" />
                <svg className="w-4 h-4 text-[#8B7355]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                <div className="h-px w-8 bg-[#8B7355]" />
              </div>
            </div>
          </div>
        </Link>
      )
    })}
  </div>
)
