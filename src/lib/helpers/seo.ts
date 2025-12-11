import { HttpTypes } from "@medusajs/types"
import { Metadata } from "next"

// ============================================
// TYPES
// ============================================

interface JsonLdBase {
  "@context": string
  "@type": string
}

// ============================================
// HELPERS
// ============================================

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://artovnia.com'
}

const generateDescription = (
  text: string | undefined,
  fallback: string,
  maxLength: number = 155
): string => {
  if (!text) return fallback

  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0 
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`
}

const getProductAvailability = (product: HttpTypes.StoreProduct): string => {
  const totalInventory = product.variants?.reduce((sum, variant) => {
    return sum + (variant.inventory_quantity || 0)
  }, 0) || 0

  if (totalInventory === 0) return "https://schema.org/OutOfStock"
  if (totalInventory < 5) return "https://schema.org/LimitedAvailability"
  return "https://schema.org/InStock"
}

// ============================================
// METADATA GENERATORS
// ============================================

export const generateProductMetadata = (
  product: HttpTypes.StoreProduct,
  locale: string = 'pl'
): Metadata => {
  if (!product?.handle || !product?.title) {
    throw new Error('Product must have handle and title')
  }

  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/products/${product.handle}`

  const description = generateDescription(
    product?.description,
    `${product?.title} - Unikalne dzieło sztuki dostępne na ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    155
  )

  // ✅ Build rich SEO title: "Product | Category - Seller" (max 60 chars)
  const buildSeoTitle = (): string => {
    const productTitle = product.title || ''
    const productWithExtras = product as any
    const categoryName = productWithExtras.categories?.[0]?.name || ''
    const sellerName = productWithExtras.seller?.name || ''
    
    // Strategy: Prioritize product name, add category if space allows
    // Template adds "| Artovnia" at the end via layout.tsx
    
    if (categoryName && sellerName) {
      // Full format: "Product | Category - Seller"
      const fullTitle = `${productTitle} | ${categoryName} - ${sellerName}`
      if (fullTitle.length <= 50) return fullTitle // Leave 10 chars for " | Artovnia"
    }
    
    if (categoryName) {
      // Medium format: "Product | Category"
      const mediumTitle = `${productTitle} | ${categoryName}`
      if (mediumTitle.length <= 50) return mediumTitle
    }
    
    // Fallback: Just product name (template adds | Artovnia)
    return productTitle
  }

  return {
    title: buildSeoTitle(),
    description,
    keywords: [
      product?.title,
      'sztuka',
      'rękodzieło',
      'marketplace',
      'polski artysta',
      ...(product?.tags?.map(t => t.value) || [])
    ].slice(0, 10).join(', '),
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: productUrl,
      languages: {
        'pl': productUrl,
        'en': `${baseUrl}/en/products/${product?.handle}`,
        'x-default': productUrl,
      },
    },
    openGraph: {
      title: product?.title,
      description,
      url: productUrl,
      siteName: 'Artovnia',
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

export const generateCategoryMetadata = (
  category: HttpTypes.StoreProductCategory,
  locale: string = 'pl'
): Metadata => {
  const baseUrl = getBaseUrl()
  const categoryUrl = `${baseUrl}/categories/${category.handle}`

  const description = generateDescription(
    category.description,
    `Przeglądaj ${category.name} - unikalne dzieła sztuki i rękodzieła od polskich artystów na ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    155
  )

  // ✅ FIX: Proper image handling for categories
  const getCategoryImage = (): string => {
    if (category.metadata?.image) {
      return category.metadata.image as string
    }
    return `${baseUrl}/images/categories/${category.handle}.png`
  }

  const categoryImage = getCategoryImage()

  return {
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    title: category.name,
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
        'pl': categoryUrl,
        'en': `${baseUrl}/en/categories/${category.handle}`,
        'x-default': categoryUrl,
      },
    },
    openGraph: {
      title: category.name,
      description,
      url: categoryUrl,
      siteName: 'Artovnia',
      images: [
        {
          url: categoryImage,
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
      title: category.name,
      description,
      images: [categoryImage],
    },
  }
}

// ============================================
// STRUCTURED DATA (JSON-LD) GENERATORS
// ============================================

/**
 * Generate Product JSON-LD structured data for SEO
 * 
 * GOOGLE REQUIREMENT: Product schema MUST include at least ONE of:
 * - offers (price information)
 * - review (individual reviews)
 * - aggregateRating (average rating from reviews)
 * 
 * This function ensures compliance by:
 * 1. Always including "offers" if price is available
 * 2. Adding "aggregateRating" if reviews exist
 * 3. Adding "review" array if reviews exist
 * 
 * @param product - Product data from Medusa
 * @param price - Product price in cents (will be converted to decimal)
 * @param currency - Currency code (default: PLN)
 * @param reviews - Array of product reviews with rating, comment, customer_name, created_at
 * @returns JSON-LD structured data object
 */
export const generateProductJsonLd = (
  product: HttpTypes.StoreProduct,
  price?: number,
  currency: string = 'PLN',
  reviews?: Array<{ rating: number; comment?: string; customer_name?: string; created_at?: string }>
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

  // Calculate aggregate rating from reviews
  const aggregateRating = reviews && reviews.length > 0 ? {
    "@type": "AggregateRating",
    "ratingValue": (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    "reviewCount": reviews.length,
    "bestRating": "5",
    "worstRating": "1"
  } : undefined

  // Format individual reviews for schema
  const reviewsSchema = reviews && reviews.length > 0 ? reviews.slice(0, 5).map(review => ({
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5",
      "worstRating": "1"
    },
    ...(review.comment && { "reviewBody": review.comment }),
    ...(review.customer_name && {
      "author": {
        "@type": "Person",
        "name": review.customer_name
      }
    }),
    ...(review.created_at && { "datePublished": review.created_at })
  })) : undefined

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
    ...(price && price > 0 && {
      "offers": {
        "@type": "Offer",
        "price": (price / 100).toFixed(2),
        "priceCurrency": currency,
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        "availability": getProductAvailability(product),
        "url": `${baseUrl}/products/${product.handle}`,
        "seller": {
          "@type": "Organization",
          "name": (product as any).seller?.name || "Artovnia"
        }
      }
    }),
    // ✅ FIX: Add aggregateRating to satisfy Google's requirement
    ...(aggregateRating && { "aggregateRating": aggregateRating }),
    // ✅ FIX: Add reviews to satisfy Google's requirement
    ...(reviewsSchema && reviewsSchema.length > 0 && { "review": reviewsSchema }),
  }
}

export const generateOrganizationJsonLd = (): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

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

export const generateWebsiteJsonLd = (): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

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
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }
}

export const generateBreadcrumbJsonLd = (
  items: Array<{ label: string; path: string }>
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

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

export const generateCollectionPageJsonLd = (
  name: string,
  description: string,
  url: string
): JsonLdBase & Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url
  }
}

export const generateItemListJsonLd = (
  products: HttpTypes.StoreProduct[],
  listName: string = "Products"
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

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