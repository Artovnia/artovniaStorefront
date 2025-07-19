import { ProductDetailsPage } from "@/components/sections"
import { listProducts } from "@/lib/data/products"
import { generateProductMetadata } from "@/lib/helpers/seo"
import type { Metadata } from "next"
import { listRegions } from "@/lib/data/regions"

// Set revalidation period for incremental static regeneration
export const revalidate = 3600 // Revalidate every hour

// Import the base StoreProduct type and extend it
import type { StoreProduct } from "@medusajs/types"

// Type for product with handle - extending the base StoreProduct type
type ProductWithHandle = StoreProduct & { 
  handle: string;
  seller?: any;
}

/**
 * Generate static paths for all products at build time
 * This significantly improves performance by pre-rendering pages
 */
export async function generateStaticParams() {
  try {
    // Get all supported locales
    const regions = await listRegions()
    if (!regions) return []
    
    const locales = regions.map(region => region.countries?.map(c => c.iso_2)).flat().filter(Boolean)
    
    // For each locale, get products
    const productsByLocale = await Promise.all(
      locales.map(async (locale) => {
        const { response } = await listProducts({
          countryCode: locale,
          queryParams: { limit: 100, fields: "handle" },
        })

        return {
          locale,
          products: response.products,
        }
      })
    )

    // Create params for each product in each locale
    return productsByLocale
      .flatMap(({ locale, products }) =>
        products
          .filter((product) => 
            product && 'handle' in product && typeof (product as any).handle === 'string'
          )
          .map(product => ({
            locale,
            handle: (product as any).handle,
          }))
      )
      .filter(param => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${error instanceof Error ? error.message : "Unknown error"}`
    )
    return []
  }
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
      }
    }

    return generateProductMetadata(product)
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

  return (
    <main className="container">
      <ProductDetailsPage handle={handle} locale={locale} />
    </main>
  )
}