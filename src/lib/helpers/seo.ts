import { HttpTypes } from "@medusajs/types"
import { Metadata } from "next"
import { headers } from "next/headers"

// Helper to get base URL from headers or environment
export const getBaseUrl = async (): Promise<string> => {
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  return process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
}

export const generateProductMetadata = async (
  product: HttpTypes.StoreProduct,
  locale: string = 'pl'
): Promise<Metadata> => {
  const baseUrl = await getBaseUrl()
  const productUrl = `${baseUrl}/products/${product?.handle}`
  
  // Enhanced description with product details
  const description = product?.description 
    ? `${product.description.substring(0, 155)}...` 
    : `${product?.title} - Unikalne dzieło sztuki dostępne na ${process.env.NEXT_PUBLIC_SITE_NAME}`

  return {
    title: `${product?.title} | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description,
    keywords: [
      product?.title,
      'sztuka',
      'rękodzieło',
      'marketplace',
      'polski artysta',
      ...(product?.tags?.map(t => t.value) || [])
    ].join(', '),
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: productUrl,
      languages: {
        'pl': `${baseUrl}/pl/products/${product?.handle}`,
        'en': `${baseUrl}/en/products/${product?.handle}`,
        'x-default': productUrl,
      },
    },

    openGraph: {
      title: product?.title,
      description,
      url: productUrl,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: [
        {
          url: product?.thumbnail || `${baseUrl}/placeholder.webp`,
          width: 1200,
          height: 630,
          alt: product?.title,
        },
      ],
      type: "website",
      locale: locale === 'pl' ? 'pl_PL' : 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      site: "@artovnia",
      creator: "@artovnia",
      title: product?.title,
      description,
      images: [product?.thumbnail || `${baseUrl}/placeholder.webp`],
    },
  }
}

export const generateCategoryMetadata = async (
  category: HttpTypes.StoreProductCategory,
  locale: string = 'pl'
) => {
  const baseUrl = await getBaseUrl()
  const categoryUrl = `${baseUrl}/categories/${category.handle}`
  
  const description = category.description 
    ? category.description 
    : `Przeglądaj ${category.name} - unikalne dzieła sztuki i rękodzieła od polskich artystów na ${process.env.NEXT_PUBLIC_SITE_NAME}`

  return {
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    title: `${category.name} - Kategoria | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description,
    keywords: [
      category.name,
      'kategoria',
      'sztuka',
      'rękodzieło',
      'marketplace',
    ].join(', '),
    alternates: {
      canonical: categoryUrl,
      languages: {
        'pl': `${baseUrl}/pl/categories/${category.handle}`,
        'en': `${baseUrl}/en/categories/${category.handle}`,
        'x-default': categoryUrl,
      },
    },

    openGraph: {
      title: `${category.name} - Kategoria`,
      description,
      url: categoryUrl,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: [
        {
          url: `${baseUrl}/images/categories/${category.handle}.png` || `${baseUrl}/placeholder.webp`,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      type: "website",
      locale: locale === 'pl' ? 'pl_PL' : 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      site: "@artovnia",
      creator: "@artovnia",
      title: `${category.name} - Kategoria`,
      description,
      images: [
        `${baseUrl}/images/categories/${category.handle}.png` || `${baseUrl}/placeholder.webp`,
      ],
    },
  }
}

// ============================================
// STRUCTURED DATA (JSON-LD) GENERATORS
// ============================================

/**
 * Generate Product JSON-LD structured data
 * Includes complete schema.org/Product markup with offers, brand, and availability
 */
export const generateProductJsonLd = async (
  product: HttpTypes.StoreProduct,
  price?: number,
  currency: string = 'PLN',
  locale: string = 'pl'
) => {
  const baseUrl = await getBaseUrl()
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || product.title,
    "image": product.thumbnail || `${baseUrl}/placeholder.webp`,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": (product as any).seller?.name || product.metadata?.brand || "Artovnia"
    },
    ...(price && {
      "offers": {
        "@type": "Offer",
        "price": (price / 100).toFixed(2), // Convert from cents
        "priceCurrency": currency,
        "availability": "https://schema.org/InStock", // Default to in stock for published products
        "url": `${baseUrl}/products/${product.handle}`,
        "seller": {
          "@type": "Organization",
          "name": (product as any).seller?.name || "Artovnia"
        }
      }
    }),
    ...(product.metadata?.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.metadata.rating,
        "reviewCount": product.metadata.reviewCount || 1
      }
    })
  }
}

/**
 * Generate Organization JSON-LD structured data
 * For homepage and main layout
 */
export const generateOrganizationJsonLd = async () => {
  const baseUrl = await getBaseUrl()
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Artovnia",
    "url": baseUrl,
    "logo": `${baseUrl}/Logo.png`,
    "description": "Marketplace sztuki i rękodzieła artystycznego - łączymy artystów z miłośnikami sztuki",
    "sameAs": [
      "https://facebook.com/artovnia",
      "https://instagram.com/artovnia",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "kontakt@artovnia.com",
      "availableLanguage": ["Polish", "English"]
    }
  }
}

/**
 * Generate WebSite JSON-LD structured data with search action
 * For homepage
 */
export const generateWebsiteJsonLd = async () => {
  const baseUrl = await getBaseUrl()
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Artovnia",
    "description": "Marketplace sztuki i rękodzieła artystycznego",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/categories?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
}

/**
 * Generate BreadcrumbList JSON-LD structured data
 */
export const generateBreadcrumbJsonLd = async (
  items: Array<{ label: string; path: string }>
) => {
  const baseUrl = await getBaseUrl()
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${baseUrl}${item.path}`
    }))
  }
}

/**
 * Generate CollectionPage JSON-LD for category/collection pages
 */
export const generateCollectionPageJsonLd = async (
  name: string,
  description: string,
  url: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url
  }
}

/**
 * Generate ItemList JSON-LD for product listings
 */
export const generateItemListJsonLd = async (
  products: HttpTypes.StoreProduct[],
  listName: string = "Products"
) => {
  const baseUrl = await getBaseUrl()
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/products/${product.handle}`
    }))
  }
}
