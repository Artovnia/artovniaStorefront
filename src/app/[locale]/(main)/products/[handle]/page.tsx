import { ProductDetailsPage } from "@/components/sections"
import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import type { Metadata } from "next"
import { listRegions } from "@/lib/data/regions"
import { cache } from 'react'

// ✅ OPTIMIZATION: Enable ISR caching (5 minutes)
// User-specific data (wishlist, customer) is fetched separately and NOT cached
export const revalidate = 300 // 5 minutes

// Import the base StoreProduct type and extend it
import type { StoreProduct } from "@medusajs/types"

// Type for product with handle - extending the base StoreProduct type
type ProductWithHandle = StoreProduct & { 
  handle: string;
  seller?: any;
}

// ✅ OPTIMIZATION: React cache() deduplicates product fetch within single request
// This prevents fetching the same product twice (metadata + page render)
// NOTE: This is per-request caching only, NOT cross-request or cross-user
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
    // ✅ OPTIMIZATION: Use cached product fetch (deduplicates with page render)
    const product = await getCachedProduct(handle, locale)
    
    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    const baseMetadata = generateProductMetadata(product, locale)
    
    // ✅ Enhanced metadata with canonical URLs and Open Graph
    return {
      ...baseMetadata,
      alternates: {
        canonical: locale === 'pl' 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.handle}`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/products/${product.handle}`,
        languages: {
          'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.handle}`,
          'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/products/${product.handle}`,
          'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.handle}`,
        },
      },
      openGraph: {
        ...baseMetadata.openGraph,
        images: product.images?.[0] ? [
          {
            url: product.images[0].url.startsWith('http') 
              ? product.images[0].url 
              : `${process.env.NEXT_PUBLIC_BASE_URL}${product.images[0].url}`,
            width: 1200,
            height: 630,
            alt: product.title,
            type: 'image/webp'
          }
        ] : [
          {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/images/placeholder.webp`,
            width: 1200,
            height: 630,
            alt: product.title,
          }
        ],
      },
    }
  } catch (error) {
    console.error("Error generating product metadata:", error)
    return {
      title: "Product",
      description: "Product page",
    }
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  // ✅ OPTIMIZATION: Use cached product fetch (deduplicates with generateMetadata)
  // This ensures product is fetched only ONCE per request, not twice
  const product = await getCachedProduct(handle, locale)

  return (
    <main className="container">
      <ProductDetailsPage handle={handle} locale={locale} product={product} />
    </main>
  )
}