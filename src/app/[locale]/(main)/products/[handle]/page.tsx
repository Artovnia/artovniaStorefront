// src/app/[locale]/(main)/products/[handle]/page.tsx

import { ProductDetailsPage } from "@/components/sections"
import { listProductsForDetail } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { generateProductMetadata } from "@/lib/helpers/seo"
import { ScrollToTop } from "@/components/utils/ScrollToTop"
import type { Metadata } from "next"
import { cache } from 'react'

export const revalidate = 300

// ✅ OPTIMIZATION: Use React cache() for request-level deduplication
// This deduplicates parallel requests in the same render cycle (metadata + component)
// By passing regionId directly, we eliminate the internal getRegion() call
const getCachedProduct = cache(async (handle: string, regionId: string) => {
  const product = await listProductsForDetail({ handle, regionId })
  return product
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  try {
    // ✅ OPTIMIZATION: Get region first (cached by React cache())
    const region = await getRegion(locale)
    if (!region) {
      return {
        title: "Produkt nie znaleziony",
        description: "Nie znaleziono produktu.",
        robots: { index: false, follow: false },
      }
    }

    // ✅ OPTIMIZATION: React cache() deduplicates this with the component fetch
    const product = await getCachedProduct(handle, region.id)
    
    if (!product) {
      return {
        title: "Produkt nie znaleziony",
        description: "Nie znaleziono produktu.",
        robots: { index: false, follow: false },
      }
    }

    return generateProductMetadata(product, locale)
  } catch (error) {
    console.error("Error generating product metadata:", error)
    return {
      title: "Produkt",
      description: "Strona produktu",
    }
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params
  
  // ✅ OPTIMIZATION: Get region first (cached by React cache())
  const region = await getRegion(locale)
  if (!region) {
    return <div>Region not found</div>
  }
  
  // ✅ OPTIMIZATION: React cache() ensures this returns the same data as generateMetadata
  // without making a duplicate API call (deduplicates by function args)
  const product = await getCachedProduct(handle, region.id)

  if (!product) {
    return (
      <main className="container">
        <div className="py-20 text-center">
          <h1 className="text-2xl font-bold">Produkt nie znaleziony</h1>
          <p className="mt-4 text-gray-600">Nie znaleziono produktu o podanym adresie.</p>
        </div>
      </main>
    )
  }

  // ✅ OPTIMIZATION: Get first image URL for LCP preload
  const firstImageUrl = product.images?.[0]?.url
  
  // ✅ FIX: Build proper Next.js image optimization URL for preload
  // IMPORTANT: Width values MUST match next.config.ts deviceSizes: [640, 828, 1200, 1920]
  // Using non-configured sizes (like 750, 1080) causes 400 Bad Request errors!
  const getNextImageUrl = (url: string, width: number, quality: number) => 
    `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`

  return (
    <>
      {/* ✅ FIX: Ensure page always opens at top, not random scroll position */}
      <ScrollToTop />
      
      {/* ✅ CRITICAL: Preload LCP image for faster perceived load
          - href must be the Next.js optimized URL (not raw S3 URL)
          - Width values MUST be from next.config.ts deviceSizes: [640, 828, 1200, 1920]
          - Quality must match what Image component uses (85 for desktop, 80 for mobile)
      */}
      {firstImageUrl && (
        <link
          rel="preload"
          as="image"
          href={getNextImageUrl(firstImageUrl, 828, 85)}
          // @ts-ignore - Next.js supports imageSrcSet
          imageSrcSet={`${getNextImageUrl(firstImageUrl, 640, 80)} 640w, ${getNextImageUrl(firstImageUrl, 828, 85)} 828w, ${getNextImageUrl(firstImageUrl, 1200, 85)} 1200w`}
          // @ts-ignore - Next.js supports imageSizes
          imageSizes="(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
          fetchPriority="high"
        />
      )}
      
      <main className="container">
        <ProductDetailsPage handle={handle} locale={locale} product={product} region={region} />
      </main>
    </>
  )
}