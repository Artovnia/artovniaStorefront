'use client'

import Link from 'next/link'

/**
 * ShopCategoriesLink - Links from blog to shop categories
 * Improves SEO by creating internal links between blog and shop
 * Helps search engines understand the relationship between content and products
 */
export default function ShopCategoriesLink() {
  const popularCategories = [
    { name: 'Biżuteria handmade', href: '/categories/bizuteria' },
    { name: 'Ceramika', href: '/categories/ceramika-dekoracyjna' },
    { name: 'Obrazy', href: '/categories/obrazy' },
    { name: 'Dekoracje', href: '/categories/dekoracje' },
    { name: 'Meble', href: '/categories/meble' },
    { name: 'Prezenty', href: '/categories/prezenty-i-okazje' },
  ]

  return (
    <aside
      className="relative mt-12 bg-[#F4F0EB]/60 backdrop-blur-sm border border-[#3B3634]/10 p-8"
      aria-labelledby="shop-categories-heading"
    >
   
      

      <h2
        id="shop-categories-heading"
        className="text-xl md:text-2xl font-instrument-serif text-[#3B3634] mb-2"
      >
        Odkryj nasze rękodzieło
      </h2>

      {/* Brush stroke divider */}
      <div className="flex mb-5">
        <svg
          className="w-40 h-3 text-[#3B3634]/20"
          viewBox="0 0 200 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6c25-4 55-2 85 0s65 4 90 1c8-1 15-2 19-1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <p className="text-[#3B3634]/70 font-instrument-sans text-sm mb-6 max-w-md leading-relaxed">
        Zainspirowany? Zobacz unikalne dzieła polskich artystów w naszym
        sklepie.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="list">
        {popularCategories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group relative flex items-center gap-2 p-3 bg-white/50 border border-[#3B3634]/10 hover:border-[#3B3634]/30 hover:bg-white/80 transition-all duration-200"
            role="listitem"
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0 text-[#3B3634]/30 group-hover:text-[#3B3634]/60 transition-colors duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3m3 3l7.5-7.5a2.12 2.12 0 00-3-3L9 12m3 3l-3-3" />
            </svg>
            <span className="text-sm font-instrument-sans text-[#3B3634]/80 group-hover:text-[#3B3634] transition-colors duration-200">
              {category.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-7 text-center">
        <Link
          href="/categories"
          className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-instrument-sans font-medium text-[#3B3634] border border-[#3B3634] hover:bg-[#3B3634] hover:text-white transition-all duration-300"
        >
          Zobacz wszystkie kategorie
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </aside>
  )
}