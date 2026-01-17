// src/lib/helpers/seo.ts

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
  return process.env.NEXT_PUBLIC_BASE_URL || "https://artovnia.com"
}

const generateDescription = (
  text: string | undefined,
  fallback: string,
  maxLength: number = 155
): string => {
  if (!text) return fallback

  if (text.length <= maxLength) return text

  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(" ")

  return lastSpace > 0
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`
}

const getProductAvailability = (product: HttpTypes.StoreProduct): string => {
  const totalInventory =
    product.variants?.reduce((sum, variant) => {
      return sum + (variant.inventory_quantity || 0)
    }, 0) || 0

  if (totalInventory === 0) return "https://schema.org/OutOfStock"
  if (totalInventory < 5) return "https://schema.org/LimitedAvailability"
  return "https://schema.org/InStock"
}

// ✅ Helper to extract price from product (checks multiple locations)
const extractProductPrice = (product: HttpTypes.StoreProduct): number | undefined => {
  // Try variant calculated price
  const variant = product.variants?.[0]
  if (variant?.calculated_price?.calculated_amount) {
    return variant.calculated_price.calculated_amount
  }
  // Fallback to original price
  if (variant?.calculated_price?.original_amount) {
    return variant.calculated_price.original_amount
  }
  // Try product-level price
  if ((product as any).calculated_price?.calculated_amount) {
    return (product as any).calculated_price.calculated_amount
  }
  return undefined
}

// ============================================
// METADATA GENERATORS
// ============================================

export const generateProductMetadata = (
  product: HttpTypes.StoreProduct,
  locale: string = "pl"
): Metadata => {
  if (!product?.handle || !product?.title) {
    throw new Error("Product must have handle and title")
  }

  const baseUrl = getBaseUrl()
  const productUrl = `${baseUrl}/products/${product.handle}`

  const description = generateDescription(
    product?.description,
    `${product?.title} - Unikalne dzieło sztuki dostępne na ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    155
  )

  const buildSeoTitle = (): string => {
    const productTitle = product.title || ""
    const productWithExtras = product as any
    const categoryName = productWithExtras.categories?.[0]?.name || ""
    const sellerName = productWithExtras.seller?.name || ""

    if (categoryName && sellerName) {
      const fullTitle = `${productTitle} | ${categoryName} - ${sellerName}`
      if (fullTitle.length <= 50) return fullTitle
    }

    if (categoryName) {
      const mediumTitle = `${productTitle} | ${categoryName}`
      if (mediumTitle.length <= 50) return mediumTitle
    }

    return productTitle
  }

  return {
    title: buildSeoTitle(),
    description,
    keywords: [
      product?.title,
      "sztuka",
      "rękodzieło",
      "marketplace",
      "polski artysta",
      ...(product?.tags?.map((t) => t.value) || []),
    ]
      .slice(0, 10)
      .join(", "),
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: productUrl,
      languages: {
        pl: productUrl,
        "x-default": productUrl,
      },
    },
    openGraph: {
      title: product?.title,
      description,
      url: productUrl,
      siteName: "Artovnia",
      images: [
        {
          url: product?.thumbnail?.startsWith("http")
            ? product.thumbnail
            : `${baseUrl}${product?.thumbnail || "/images/placeholder.webp"}`,
          width: 1200,
          height: 630,
          alt: product?.title,
        },
      ],
      type: "website",
      locale: locale === "pl" ? "pl_PL" : "en_US",
    },
    other:
      product?.tags && product.tags.length > 0
        ? {
            "article:tag": product.tags.map((t) => t.value),
          }
        : undefined,
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
  locale: string = "pl"
): Metadata => {
  const baseUrl = getBaseUrl()
  const categoryUrl = `${baseUrl}/categories/${category.handle}`

  const description = generateDescription(
    category.description,
    `Przeglądaj ${category.name} - unikalne dzieła sztuki i rękodzieła od polskich artystów na ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    155
  )

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
      "kategoria",
      "sztuka",
      "rękodzieło",
      "marketplace",
    ].join(", "),
    alternates: {
      canonical: categoryUrl,
      languages: {
        pl: categoryUrl,
        "x-default": categoryUrl,
      },
    },
    openGraph: {
      title: category.name,
      description,
      url: categoryUrl,
      siteName: "Artovnia",
      images: [
        {
          url: categoryImage,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      type: "website",
      locale: locale === "pl" ? "pl_PL" : "en_US",
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

export const generateSellerMetadata = (
  seller: {
    name: string
    handle: string
    description?: string
    logo?: string
    banner?: string
  },
  locale: string = "pl"
): Metadata => {
  const baseUrl = getBaseUrl()
  const sellerUrl = `${baseUrl}/sellers/${seller.handle}`

  const description = generateDescription(
    seller.description,
    `Odkryj unikalne dzieła sztuki i rękodzieła od ${seller.name}. Zobacz kolekcję produktów i poznaj artystę na Artovnia.`,
    155
  )

  const getSellerImage = (): string => {
    if (seller.banner) {
      return seller.banner.startsWith("http")
        ? seller.banner
        : `${baseUrl}${seller.banner}`
    }
    if (seller.logo) {
      return seller.logo.startsWith("http")
        ? seller.logo
        : `${baseUrl}${seller.logo}`
    }
    return `${baseUrl}/ArtovniaOgImage.png`
  }

  const sellerImage = getSellerImage()

  return {
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    title: `${seller.name} - Artysta`,
    description,
    keywords: [
      seller.name,
      "artysta",
      "sprzedawca",
      "sztuka",
      "rękodzieło",
      "marketplace",
      "polski artysta",
    ].join(", "),
    alternates: {
      canonical: sellerUrl,
      languages: {
        pl: sellerUrl,
        "x-default": sellerUrl,
      },
    },
    openGraph: {
      title: `${seller.name} - Artysta na Artovnia`,
      description,
      url: sellerUrl,
      siteName: "Artovnia",
      images: [
        {
          url: sellerImage,
          width: 1200,
          height: 630,
          alt: `${seller.name} - Profil artysty`,
        },
      ],
      type: "profile",
      locale: locale === "pl" ? "pl_PL" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@artovnia",
      creator: "@artovnia",
      title: `${seller.name} - Artysta`,
      description,
      images: [sellerImage],
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
 */
export const generateProductJsonLd = (
  product: HttpTypes.StoreProduct,
  price?: number,
  currency: string = "PLN",
  reviews?: Array<{
    rating: number
    comment?: string
    customer_name?: string
    created_at?: string
  }>
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

  // ✅ FIX: Extract price from product if not provided
  const effectivePrice = price ?? extractProductPrice(product)

  // Calculate aggregate rating from reviews
  const aggregateRating =
    reviews && reviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1),
          reviewCount: reviews.length,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined

  // Format individual reviews for schema
  const reviewsSchema =
    reviews && reviews.length > 0
      ? reviews.slice(0, 5).map((review) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: "5",
            worstRating: "1",
          },
          ...(review.comment && { reviewBody: review.comment }),
          ...(review.customer_name && {
            author: {
              "@type": "Person",
              name: review.customer_name,
            },
          }),
          ...(review.created_at && { datePublished: review.created_at }),
        }))
      : undefined

  const productTags =
    product.tags?.map((t) => t.value).filter(Boolean) || []
  const category = (product as any).categories?.[0]?.name
  const sellerName = (product as any).seller?.name || "Artovnia"

  // ✅ FIX: ALWAYS include offers - Google requires at least one of offers/review/aggregateRating
  // Even if price is 0 or undefined, include the offer with availability
  const offers = {
    "@type": "Offer",
    url: `${baseUrl}/products/${product.handle}`,
    priceCurrency: currency,
    // If no price available, use "0" - Google will still accept the schema
    price: effectivePrice ? (effectivePrice / 100).toFixed(2) : "0.00",
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    availability: getProductAvailability(product),
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: sellerName,
    },
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: product.images?.map((img) => img.url) || [
      product.thumbnail || `${baseUrl}/placeholder.webp`,
    ],
    sku: product.variants?.[0]?.sku || product.id,
    mpn: product.variants?.[0]?.sku || product.id,
    brand: {
      "@type": "Brand",
      name: sellerName,
    },
    ...(category && { category: category }),
    ...(productTags.length > 0 && { keywords: productTags.join(", ") }),
    // ✅ FIX: Always include offers
    offers: offers,
    // Add aggregateRating if reviews exist
    ...(aggregateRating && { aggregateRating: aggregateRating }),
    // Add reviews if they exist
    ...(reviewsSchema && reviewsSchema.length > 0 && { review: reviewsSchema }),
  }
}

export const generateOrganizationJsonLd = (): JsonLdBase &
  Record<string, any> => {
  const baseUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Artovnia",
    url: baseUrl,
    logo: `${baseUrl}/Logo.png`,
    description:
      "Marketplace sztuki i rękodzieła artystycznego - łączymy artystów z miłośnikami sztuki",
    sameAs: [
      "https://facebook.com/artovnia",
      "https://instagram.com/artovnia",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "kontakt@artovnia.com",
      availableLanguage: ["Polish", "English"],
    },
  }
}

export const generateWebsiteJsonLd = (): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Artovnia",
    description: "Marketplace sztuki i rękodzieła artystycznego",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

export const generateBreadcrumbJsonLd = (
  items: Array<{ label: string; path: string }>
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.path}`,
    })),
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
    name: name,
    description: description,
    url: url,
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
    name: listName,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/products/${product.handle}`,
    })),
  }
}