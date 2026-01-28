'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Product {
  title: string
  image_url: string
  url: string
  price?: string
  description?: string
}

interface FeaturedProductsBlockData {
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  product_ids?: string[] // Legacy support
  product_handles?: string[] // Legacy support
  products?: Product[] // New: metadata-based cards
  layout?: 'classic' | 'minimal' | 'editorial' | 'overlay' | 'polaroid'
  columns: 2 | 3 | 4
  rounded_edges?: boolean
}

interface FeaturedProductsBlockProps {
  data: FeaturedProductsBlockData
  sellerId: string
}

export const FeaturedProductsBlock = ({ data }: FeaturedProductsBlockProps) => {
  const { 
    title, 
    title_alignment = 'center',
    title_italic = false,
    products = [], 
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

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }

  if (products.length === 0) {
    return null
  }

  // Render different layouts based on selection
  const renderLayout = () => {
    switch (layout) {
      case 'minimal':
        return <MinimalLayout products={products} columns={columns} columnClasses={columnClasses} roundedEdges={rounded_edges} />
      case 'editorial':
        return <EditorialLayout products={products} columns={columns} columnClasses={columnClasses} roundedEdges={rounded_edges} />
      case 'overlay':
        return <OverlayLayout products={products} columns={columns} columnClasses={columnClasses} roundedEdges={rounded_edges} />
      case 'polaroid':
        return <PolaroidLayout products={products} columns={columns} columnClasses={columnClasses} roundedEdges={rounded_edges} />
      case 'classic':
      default:
        return <ClassicLayout products={products} columns={columns} columnClasses={columnClasses} roundedEdges={rounded_edges} />
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
const ClassicLayout = ({ products, columns, columnClasses, roundedEdges }: any) => (
  <div className={`grid ${columnClasses[columns]} gap-4`}>
    {products.map((product: Product, index: number) => (
      <Link
        key={index}
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block bg-white border border-[#3B3634]/10 hover:border-[#3B3634]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${roundedEdges ? 'rounded-lg overflow-hidden' : ''}`}
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
        </div>
        
        <div className="p-3 bg-primary">
          <h3 className="font-instrument-serif text-base text-[#3B3634] group-hover:text-[#8B7355] transition-colors duration-300 line-clamp-2">
            {product.title}
          </h3>
          {product.price && (
            <p className="mt-1 text-sm text-[#8B7355] font-medium">{product.price}</p>
          )}
          <div className="mt-2 flex items-center text-xs text-[#8B7355] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Zobacz produkt</span>
            <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    ))}
  </div>
)

// Minimal Layout - Clean, typography-focused design
const MinimalLayout = ({ products, columns, columnClasses, roundedEdges }: any) => (
  <div className={`grid ${columnClasses[columns]} gap-6`}>
    {products.map((product: Product, index: number) => (
      <Link
        key={index}
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className={`relative aspect-[3/4] overflow-hidden bg-[#F4F0EB] mb-3 ${roundedEdges ? 'rounded-lg' : ''}`}>
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-instrument-serif text-lg text-[#3B3634] group-hover:text-[#8B7355] transition-colors duration-300 line-clamp-2">
            {product.title}
          </h3>
          {product.price && (
            <p className="text-sm text-[#8B7355] font-medium">{product.price}</p>
          )}
          {product.description && (
            <p className="text-[#666] text-xs line-clamp-2">{product.description}</p>
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

// Editorial Layout - Magazine-style with text overlay on hover
const EditorialLayout = ({ products, columns, columnClasses, roundedEdges }: any) => {
  return (
    <div className={`grid ${columnClasses[columns]} gap-4`}>
      {products.map((product: Product, index: number) => (
        <Link
          key={index}
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block border border-[#3B3634] p-1 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3B3634]/95 via-[#3B3634]/70 to-transparent transition-opacity duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-center px-4 flex flex-col items-center gap-3 transform transition-transform duration-500 translate-y-5 group-hover:translate-y-0">
                {product.description && (
                  <p className="text-white text-sm line-clamp-3">{product.description}</p>
                )}
                {product.price && (
                  <p className="text-white font-medium text-lg">{product.price}</p>
                )}
                <span className="text-white font-instrument-serif text-xl flex items-center gap-2">
                  Zobacz więcej
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
            
            {/* Permanent title section */}
            <div className="py-2 px-4 bg-primary absolute bottom-0 w-full min-h-[3.5rem] overflow-hidden">
              <h3 className="font-instrument-serif text-base line-clamp-2 text-[#3B3634]">
                {product.title}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// Overlay Layout - Full hover reveal with dramatic effect
const OverlayLayout = ({ products, columns, columnClasses, roundedEdges }: any) => (
  <div className={`grid ${columnClasses[columns]} gap-4`}>
    {products.map((product: Product, index: number) => (
      <Link
        key={index}
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block relative aspect-square overflow-hidden ${roundedEdges ? 'rounded-lg' : ''}`}
      >
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Hover overlay with full info */}
        <div className="absolute inset-0 bg-[#3B3634]/95 flex items-center justify-center transition-opacity duration-500 opacity-0 group-hover:opacity-100">
          <div className="text-center text-white space-y-3 px-6">
            <h3 className="font-instrument-serif text-2xl">{product.title}</h3>
            {product.description && (
              <p className="text-sm line-clamp-4">{product.description}</p>
            )}
            {product.price && (
              <p className="font-medium text-xl">{product.price}</p>
            )}
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium border border-white px-4 py-2 rounded-full">
                Zobacz produkt
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
)

// Polaroid Layout - Vintage photo-style cards
const PolaroidLayout = ({ products, columns, columnClasses, roundedEdges }: any) => (
  <div className={`grid ${columnClasses[columns]} gap-6`}>
    {products.map((product: Product, index: number) => (
      <Link
        key={index}
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className={`bg-white p-3 shadow-lg hover:shadow-2xl transform group-hover:-rotate-1 transition-all duration-300 ${roundedEdges ? 'rounded-lg' : ''}`}>
          <div className="relative aspect-square overflow-hidden bg-[#F4F0EB] mb-3">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="font-instrument-serif text-base text-[#3B3634] line-clamp-2">
              {product.title}
            </h3>
            {product.price && (
              <p className="text-sm text-[#8B7355] font-medium">{product.price}</p>
            )}
            {product.description && (
              <p className="text-[#666] text-xs line-clamp-2">{product.description}</p>
            )}
          </div>
        </div>
      </Link>
    ))}
  </div>
)
