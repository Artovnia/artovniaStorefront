import { Metadata } from 'next'
import Image from 'next/image'
import { SellerListing } from '@/components/sections/SellerListing/SellerListing'
import { getSellers } from '@/lib/data/seller'
import { generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from '@/lib/helpers/seo'

export const metadata: Metadata = {
  title: 'Sprzedawcy - Poznaj Polskich Artystów i Twórców',
  description:
    'Przeglądaj wszystkich sprzedawców na platformie Artovnia. Znajdź swoich ulubionych artystów, odkryj nowe talenty i kup unikalne dzieła sztuki bezpośrednio od twórców.',
  keywords: [
    'polscy artyści',
    'sprzedawcy sztuki',
    'twórcy rękodzieła',
    'artyści marketplace',
    'galeria artystów',
  ].join(', '),
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/sellers`,
    languages: {
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/sellers`,
      'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/sellers`,
      'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/sellers`,
    },
  },
  openGraph: {
    title: 'Sprzedawcy - Poznaj Polskich Artystów',
    description:
      'Przeglądaj wszystkich sprzedawców na platformie Artovnia. Znajdź swoich ulubionych artystów i odkryj nowe talenty.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/sellers`,
    siteName: 'Artovnia',
    type: 'website',
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@artovnia',
    creator: '@artovnia',
    title: 'Sprzedawcy',
    description: 'Poznaj polskich artystów i twórców na Artovnia',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ✅ PERFORMANCE: Cache with revalidation for better performance
export const revalidate = 300 // Revalidate every 5 minutes

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

  // Generate structured data for SEO
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Sprzedawcy", path: "/sellers" },
  ])
  const collectionJsonLd = generateCollectionPageJsonLd(
    "Sprzedawcy - Polscy Artyści",
    "Przeglądaj wszystkich sprzedawców na platformie Artovnia. Znajdź swoich ulubionych artystów i odkryj nowe talenty.",
    `${process.env.NEXT_PUBLIC_BASE_URL}/sellers`
  )

  return (
    <>
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      
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
            quality={75}
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
        {/* Seller Listing Component - No Suspense needed, data already fetched on server */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <SellerListing 
            initialSellers={sellersData.sellers}
            initialCount={sellersData.count}
            initialPage={page}
            limit={limit}
          />
        </div>
      </div>
    </div>
    </>
  )
}