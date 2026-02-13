// src/components/sections/SuggestedProductsGallery/SuggestedProductsGallery.tsx
import { HomeProductSection } from "@/components/sections/HomeProductSection/HomeProductSection"
import { Link } from "@/i18n/routing"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"

interface SuggestedProductsGalleryProps {
  products: (HttpTypes.StoreProduct & { seller?: any })[]
  categoryName?: string
  categoryHandle?: string
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}

export const SuggestedProductsGallery = ({
  products,
  categoryName = '',
  categoryHandle = '',
  user = null,
  wishlist = [],
}: SuggestedProductsGalleryProps) => {
  if (!products?.length) return null

  return (
    <section
      className="w-full"
      aria-label="Może Ci się spodobać"
    >
      {/* Heading with category link */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout: Grid with centered heading and right-aligned button */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div></div>
          <h2 className="heading-lg font-bold tracking-tight text-black text-center">
            <span className="font-instrument-serif">Może Ci się </span>
            <span className="font-instrument-serif italic">spodobać</span>
          </h2>
          <div className="flex justify-end">
            {categoryHandle && (
              <Link
                href={`/categories/${categoryHandle}`}
                className="group relative text-[#3B3634] font-instrument-sans font-medium px-4 py-2 overflow-hidden transition-all duration-300 hover:text-white"
                aria-label={categoryName ? `Zobacz więcej produktów z kategorii ${categoryName}` : 'Zobacz więcej produktów'}
              >
                <span className="absolute inset-0 bg-[#3B3634] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" aria-hidden="true"></span>
                <span className="relative flex items-center gap-2">
                  {categoryName ? `Więcej z ${categoryName}` : 'Zobacz więcej'}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          <h2 className="heading-lg font-bold tracking-tight text-black text-center">
            <span className="font-instrument-serif">Może Ci się </span>
            <span className="font-instrument-serif italic">spodobać</span>
          </h2>

          {categoryHandle && (
            <div className="flex justify-center">
              <Link
                href={`/categories/${categoryHandle}`}
                className="group inline-flex items-center gap-3 font-instrument-serif italic text-[17px] text-[#3B3634] border-b-[1.5px] border-[#3B3634] pb-0.5 active:opacity-60 transition-all duration-200"
                aria-label={categoryName ? `Zobacz więcej produktów z kategorii ${categoryName}` : 'Zobacz więcej produktów'}
              >
                <span className="relative">
                  {categoryName ? `Więcej z ${categoryName}` : 'Zobacz więcej'}
                  <span className="absolute -bottom-[1.5px] left-0 w-0 h-[1.5px] bg-[#3B3634] group-active:w-full transition-all duration-300"></span>
                </span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-active:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Product carousel — reuses the same component as seller products */}
      <HomeProductSection
        heading=""
        headingSpacing="mb-0"
        theme="dark"
        products={products as any}
        isSellerSection={true}
        user={user}
        wishlist={wishlist}
        noMobileMargin={true}
      />
    </section>
  )
}