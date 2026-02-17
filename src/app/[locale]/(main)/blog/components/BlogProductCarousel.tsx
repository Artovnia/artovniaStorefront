'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { HttpTypes } from '@medusajs/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProductPrice } from '@/lib/helpers/get-product-price'

interface ProductCarouselItem {
  productHandle: string
  customTitle?: string
}

interface BlogProductCarouselProps {
  title?: string
  products: (HttpTypes.StoreProduct & { seller?: { name?: string; store_name?: string } })[]
  productItems: ProductCarouselItem[]
  showPrices?: boolean
  showSellerName?: boolean
}

export default function BlogProductCarousel({
  title,
  products,
  productItems,
  showPrices = true,
  showSellerName = true,
}: BlogProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Check scroll position to show/hide navigation arrows
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollPosition)
      }
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const cardWidth = 200 // Approximate card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (!products || products.length === 0) {
    return null
  }

  // Map products to their custom titles if provided
  const getCustomTitle = (handle: string) => {
    const item = productItems.find((p) => p.productHandle === handle)
    return item?.customTitle
  }

  return (
    <div className="my-8 py-6 bg-white rounded-lg border border-[#BFB7AD]/30">
      {title && (
        <h3 className="text-xl md:text-2xl font-instrument-serif text-[#3B3634] mb-4 px-4 md:px-6">
          {title}
        </h3>
      )}

      <div className="relative">
        {/* Left Arrow - Hidden on mobile, visible on desktop */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg items-center justify-center transition-all"
            aria-label="Przewiń w lewo"
          >
            <ChevronLeft className="w-6 h-6 text-[#3B3634]" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-6 pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => {
            const customTitle = getCustomTitle(product.handle || '')
            const { cheapestPrice } = getProductPrice({ product })
            const sellerName = product.seller?.name || product.seller?.store_name

            return (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="flex-shrink-0 snap-start group"
              >
                <article className="w-[160px] sm:w-[180px] bg-[#F4F0EB] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-[#F4F0EB] overflow-hidden">
                    {product.thumbnail || product.images?.[0]?.url ? (
                      <Image
                        src={product.thumbnail || product.images?.[0]?.url || ''}
                        alt={customTitle || product.title || 'Product image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 160px, 180px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[#BFB7AD] text-sm">Brak zdjęcia</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    {/* Seller Name */}
                    {showSellerName && sellerName && (
                      <p className="text-xs text-[#3B3634]/70 font-instrument-sans truncate mb-1">
                        {sellerName}
                      </p>
                    )}

                    {/* Product Title */}
                    <h4 className="text-sm font-medium text-[#3B3634] font-instrument-sans line-clamp-2 min-h-[2.5rem]">
                      {customTitle || product.title}
                    </h4>

                    {/* Price */}
                    {showPrices && cheapestPrice?.calculated_price && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#3B3634] font-instrument-sans">
                          {cheapestPrice.calculated_price.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                        </span>
                        {cheapestPrice.calculated_price !== cheapestPrice.original_price && (
                          <span className="text-xs text-gray-500 line-through">
                            {cheapestPrice.original_price?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        {/* Right Arrow - Hidden on mobile, visible on desktop */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg items-center justify-center transition-all"
            aria-label="Przewiń w prawo"
          >
            <ChevronRight className="w-6 h-6 text-[#3B3634]" />
          </button>
        )}
      </div>

      {/* Mobile scroll indicator */}
      <div className="flex md:hidden justify-center mt-3 gap-1">
        <span className="text-xs text-[#3B3634]/50 font-instrument-sans">
          ← Przesuń, aby zobaczyć więcej →
        </span>
      </div>
    </div>
  )
}
