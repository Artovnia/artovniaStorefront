// src/app/[locale]/(main)/products/[handle]/page.tsx

import { ProductDetailsPage } from "@/components/sections"
import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import type { Metadata } from "next"
import { cache } from 'react'

export const revalidate = 300

const getCachedProduct = cache(async (handle: string, locale: string) => {
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  return response.products[0]
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  try {
    const product = await getCachedProduct(handle, locale)
    
    if (!product) {
      return {
        title: "Produkt nie znaleziony",
        description: "Nie znaleziono produktu.",
        robots: { index: false, follow: false },
      }
    }

    // Use seo.ts - it now handles everything correctly
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
  const product = await getCachedProduct(handle, locale)

  return (
    <main className="container">
      <ProductDetailsPage handle={handle} locale={locale} product={product} />
    </main>
  )
}