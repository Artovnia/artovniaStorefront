// src/app/[locale]/(main)/products/[handle]/page.tsx

import { ProductDetailsPage } from "@/components/sections"
import { listProductsForDetail } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import { generateProductMetadata } from "@/lib/helpers/seo"
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

  return (
    <>
      {/* ✅ CRITICAL: Preload LCP image for 200-400ms faster perceived load */}
      {firstImageUrl && (
        <link
          rel="preload"
          as="image"
          href={firstImageUrl}
          // @ts-ignore - Next.js supports imageSrcSet
          imageSrcSet={`/_next/image?url=${encodeURIComponent(firstImageUrl)}&w=640&q=80 640w, /_next/image?url=${encodeURIComponent(firstImageUrl)}&w=750&q=80 750w, /_next/image?url=${encodeURIComponent(firstImageUrl)}&w=828&q=80 828w, /_next/image?url=${encodeURIComponent(firstImageUrl)}&w=1080&q=85 1080w`}
          // @ts-ignore - Next.js supports imageSizes
          imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 50vw"
          fetchPriority="high"
        />
      )}
      
      <main className="container">
        <ProductDetailsPage handle={handle} locale={locale} product={product} region={region} />
      </main>
    </>
  )
}