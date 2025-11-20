import { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'
import { SellerListing } from '@/components/sections/SellerListing/SellerListing'
import { getSellers } from '@/lib/data/seller'

export const metadata: Metadata = {
  title: 'Sprzedawcy - Artovnia',
  description:
    'Przeglądaj wszystkich sprzedawców na platformie Artovnia. Znajdź swoich ulubionych artystów i odkryj nowe talenty.',
}

// Loading skeleton for Suspense
const SellerListingSkeleton = () => (
  <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
      {Array.from({ length: 12 }).map((_, index) => (
        <div 
          key={index} 
          className="w-[252px] h-[380px] bg-primary shadow-md animate-pulse"
        >
          {/* Top 60% - Image skeleton */}
          <div className="h-[60%] bg-[#F4F0EB]" />
          
          {/* Bottom 40% - Content skeleton */}
          <div className="h-[40%] bg-primary p-4 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center items-center gap-2">
              <div className="h-5 bg-[#BFB7AD]/30 rounded w-32" />
              <div className="h-3 bg-[#BFB7AD]/20 rounded w-40" />
            </div>
            <div className="flex justify-center pt-2">
              <div className="h-2 bg-[#BFB7AD]/15 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default async function SellersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const letter = typeof params.letter === 'string' ? params.letter : ''
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : ''
  
  // ✅ OPTIMIZATION: Fetch sellers on server-side for better SEO and performance
  const limit = 20
  const offset = (page - 1) * limit
  
  const sellersData = await getSellers({
    limit,
    offset,
    ...(letter && { letter }),
    ...(sortBy && { sortBy })
  })

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section with Image and Overlay */}
      <section
        className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden"
        aria-labelledby="sellers-heading"
      >
        {/* Background Image */}
        <div className="absolute inset-0 max-w-[1920px] mx-auto">
          <Image
            src="/images/sprzedawcy/sellers.webp"
            alt="Ceramiczne naczynia i dekoracje - sprzedawcy Artovnia"
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center 2xl:object-contain"
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
            quality={70}
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
          />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Main Heading with high contrast for accessibility */}
            <h1
              id="sellers-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-instrument-serif italic font-normal text-white mb-4 sm:mb-6 drop-shadow-2xl"
            >
              Sprzedawcy
            </h1>

            {/* Subtitle with accessible contrast */}
            <p className="text-md sm:text-lg md:text-xl lg:text-xl text-white font-instrument-sans uppercase max-w-3xl drop-shadow-lg">
              Odkryj utalentowanych artystów i sprzedawców na naszej platformie
            </p>
          </div>
        </div>

        {/* Skip to content link for keyboard navigation (WCAG 2.4.1) */}
        <a
          href="#sellers-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#3B3634] focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:ring-offset-2"
        >
          Przejdź do treści sprzedawców
        </a>
      </section>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto" id="sellers-content">
        {/* Seller Listing Component with Suspense */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <Suspense fallback={<SellerListingSkeleton />}>
            <SellerListing 
              initialSellers={sellersData.sellers}
              initialCount={sellersData.count}
              initialPage={page}
              limit={limit}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}