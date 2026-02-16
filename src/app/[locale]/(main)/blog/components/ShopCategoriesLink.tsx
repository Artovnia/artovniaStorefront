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
      className="mt-12 p-6 bg-primary text-[#3b3634]"
      aria-labelledby="shop-categories-heading"
    >
      <h2 
        id="shop-categories-heading"
        className="text-xl md:text-2xl font-instrument-serif mb-4"
      >
        Odkryj nasze rękodzieło
      </h2>
      
      <p className="text-[#3b3634]/90 font-instrument-sans text-sm mb-6">
        Zainspirowany? Zobacz unikalne dzieła polskich artystów w naszym sklepie.
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="list">
        {popularCategories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="flex items-center gap-2 p-3 ring-1 ring-[#3b3634]/20 rounded-lg hover:ring-[#3b3634]/40 transition-colors group"
            role="listitem"
          >
         
            <span className="text-sm font-instrument-sans  transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 px-4 py-2 text-[#3B3634] font-instrument-sans font-medium  overflow-hidden transition-all duration-300 hover:text-white hover:bg-[#3B3634] text-sm border border-[#3B3634] mx-auto"
        >
          Zobacz wszystkie kategorie
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </aside>
  )
}
