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

  return (
    <main className="container">
      <ProductDetailsPage handle={handle} locale={locale} product={product} region={region} />
    </main>
  )
}