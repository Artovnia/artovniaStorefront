import { Metadata } from 'next'
import { Suspense } from 'react'
import { SellerListing } from '@/components/sections/SellerListing/SellerListing'
import { PageHero } from '@/components/sections'
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
      'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/sellers`,
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

// ✅ PERFORMANCE: Async sub-component for data fetching
// Wrapped in Suspense so the hero section streams to the browser immediately
async function SellersContent({
  page,
  letter,
  sortBy,
  limit
}: {
  page: number
  letter: string
  sortBy: string
  limit: number
}) {
  const offset = (page - 1) * limit

  const sellersData = await getSellers({
    limit,
    offset,
    ...(letter && { letter }),
    ...(sortBy && { sortBy })
  })

  return (
    <SellerListing
      initialSellers={sellersData.sellers}
      initialCount={sellersData.count}
      initialPage={page}
      limit={limit}
    />
  )
}

// ✅ PERFORMANCE: Minimal fallback — only shows on very first uncached load
function SellersContentFallback() {
  return (
    <div className="w-full">
      {/* Filter Bar Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="flex gap-4 mb-4">
          <div className="h-10 bg-gray-200/50 rounded w-32" />
          <div className="h-10 bg-gray-200/50 rounded w-32" />
        </div>
      </div>

      {/* Sellers Grid Skeleton */}
      <div className="px-4 sm:px-6 py-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="w-[270px] h-[380px] bg-primary shadow-md animate-pulse"
            >
              <div className="h-[60%] bg-[#F4F0EB]" />
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
    </div>
  )
}

export default async function SellersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1
  const letter = typeof params.letter === 'string' ? params.letter : ''
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : ''
  const limit = 20

  // ✅ Generate structured data for SEO (non-blocking)
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
        {/* ✅ PERFORMANCE: Hero renders instantly via streaming (no data dependency) */}
        {/* Static image import = build-time optimization + blur placeholder */}
        <PageHero
          title="Sprzedawcy"
          subtitle="Odkryj utalentowanych artystów i sprzedawców na naszej platformie"
          headingId="sellers-heading"
          contentId="sellers-content"
          skipLinkText="Przejdź do treści sprzedawców"
          imageAlt="Ceramiczne naczynia i dekoracje - sprzedawcy Artovnia"
        />

        {/* Main Content */}
        <div className="max-w-[1920px] mx-auto" id="sellers-content">
          {/* ✅ PERFORMANCE: Suspense streams hero immediately, data loads in background */}
          {/* On cached navigations (ISR warm), this resolves instantly — no fallback shown */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Suspense fallback={<SellersContentFallback />}>
              <SellersContent
                page={page}
                letter={letter}
                sortBy={sortBy}
                limit={limit}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}