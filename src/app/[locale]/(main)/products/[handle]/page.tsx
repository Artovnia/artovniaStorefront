import { ProductDetailsPage } from "@/components/sections"
import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import type { Metadata } from "next"
import { listRegions } from "@/lib/data/regions"

// Force dynamic rendering for this page to support no-store fetches
export const dynamic = 'force-dynamic'

// Import the base StoreProduct type and extend it
import type { StoreProduct } from "@medusajs/types"

// Type for product with handle - extending the base StoreProduct type
type ProductWithHandle = StoreProduct & { 
  handle: string;
  seller?: any;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  try {
    const { response } = await listProducts({
      countryCode: locale,
      queryParams: { handle },
    })

    const product = response.products[0]
    
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
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/products/${product.handle}`,
        languages: {
          'pl': `${process.env.NEXT_PUBLIC_BASE_URL}/pl/products/${product.handle}`,
          'en': `${process.env.NEXT_PUBLIC_BASE_URL}/en/products/${product.handle}`,
          'x-default': `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.handle}`,
        },
      },
      openGraph: {
        ...baseMetadata.openGraph,
        images: product.images?.[0] ? [
          {
            url: product.images[0].url,
            width: 1200,
            height: 630,
            alt: product.title,
            type: 'image/webp'
          }
        ] : [],
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

  // ✅ Fetch product ONCE and pass it down (avoid double fetch)
  const { response } = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  })
  const product = response.products[0]

  return (
    <main className="container">
      <ProductDetailsPage handle={handle} locale={locale} product={product} />
    </main>
  )
}