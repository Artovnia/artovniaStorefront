import { Metadata } from 'next'
import Image from 'next/image'
import { SellerListing } from '@/components/sections/SellerListing/SellerListing'

export const metadata: Metadata = {
  title: 'Sprzedawcy - Artovnia',
  description: 'Przeglądaj wszystkich sprzedawców na platformie Artovnia. Znajdź swoich ulubionych artystów i odkryj nowe talenty.',
}

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section with Image and Overlay */}
      <section 
        className="relative w-full h-[300px] sm:h-[350px] md:h-[350px] lg:h-[400px] xl:h-[400px] overflow-hidden"
        aria-labelledby="sellers-heading"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/sprzedawcy/sellers.webp"
            alt="Ceramiczne naczynia i dekoracje - sprzedawcy Artovnia"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            quality={90}
          />
          {/* Gradient Overlay for better text readability (WCAG AA contrast) */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"
            aria-hidden="true"
          />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-full text-center">
            {/* Main Heading with high contrast for accessibility */}
            <h1 
              id="sellers-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-instrument-serif italic font-normal text-white mb-4 sm:mb-6 drop-shadow-2xl"
            >
              Sprzedawcy
            </h1>
            
            {/* Subtitle with accessible contrast */}
            <p className="text-md sm:text-lg md:text-xl lg:text-2xl text-white font-instrument-sans max-w-3xl drop-shadow-lg">
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
        {/* Seller Listing Component */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <SellerListing />
        </div>
      </div>
    </div>
  )
}
