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

// ✅ IMPROVED: Extract price from product (checks MORE locations)
const extractProductPrice = (
  product: HttpTypes.StoreProduct
): number | undefined => {
  const variant = product.variants?.[0]

  // Try variant calculated price
  if (variant?.calculated_price?.calculated_amount) {
    return variant.calculated_price.calculated_amount
  }

  // Try variant original price from calculated_price
  if (variant?.calculated_price?.original_amount) {
    return variant.calculated_price.original_amount
  }

  // Try variant prices array (common in Medusa)
  if (variant?.prices?.[0]?.amount) {
    return variant.prices[0].amount
  }

  // Try variant original_price directly
  if ((variant as any)?.original_price) {
    return (variant as any).original_price
  }

  // Try product-level calculated price
  if ((product as any).calculated_price?.calculated_amount) {
    return (product as any).calculated_price.calculated_amount
  }

  // Try product-level prices array
  if ((product as any).prices?.[0]?.amount) {
    return (product as any).prices[0].amount
  }

  return undefined
}

// ✅ Helper to ensure valid image URL
const ensureValidImageUrl = (
  imageUrl: string | undefined | null,
  fallback?: string
): string => {
  const baseUrl = getBaseUrl()
  const defaultFallback = `${baseUrl}/images/placeholder.webp`

  if (!imageUrl) return fallback || defaultFallback

  // Already absolute URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl
  }

  // Relative URL - make absolute
  return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
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
          url: ensureValidImageUrl(
            product?.thumbnail,
            `${baseUrl}/images/placeholder.webp`
          ),
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
      images: [
        ensureValidImageUrl(product?.thumbnail, `${baseUrl}/placeholder.webp`),
      ],
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
      return ensureValidImageUrl(category.metadata.image as string)
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
    photo?: string      // ✅ Changed from logo
    logo_url?: string   // ✅ Changed from banner
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

  // ✅ Updated: Use photo (banner) first, then logo_url
  const sellerImage = ensureValidImageUrl(
    seller.photo || seller.logo_url,
    `${baseUrl}/ArtovniaOgImage.png`
  )

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

  const productTags = product.tags?.map((t) => t.value).filter(Boolean) || []
  const category = (product as any).categories?.[0]?.name
  const sellerName = (product as any).seller?.name || "Artovnia"

  // ✅ FIX: Build offers object - ONLY include price if we have a valid one
  const offers: Record<string, any> = {
    "@type": "Offer",
    url: `${baseUrl}/products/${product.handle}`,
    priceCurrency: currency,
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

  // ✅ FIX: Only add price if we have a valid one (> 0)
  if (effectivePrice && effectivePrice > 0) {
    offers.price = (effectivePrice / 100).toFixed(2)
  }

  // ✅ FIX: Ensure valid image URLs
  const images =
    product.images?.map((img) => ensureValidImageUrl(img.url)) || []
  if (images.length === 0 && product.thumbnail) {
    images.push(ensureValidImageUrl(product.thumbnail))
  }
  if (images.length === 0) {
    images.push(`${baseUrl}/images/placeholder.webp`)
  }

  // Log warning if no price and no reviews (may fail Google validation)
  const hasValidOffer = effectivePrice && effectivePrice > 0
  const hasReviews = reviewsSchema && reviewsSchema.length > 0
  const hasAggregateRating = !!aggregateRating

  if (!hasValidOffer && !hasReviews && !hasAggregateRating) {
    console.warn(
      `[SEO] Product "${product.handle}" has no price and no reviews - may fail Google validation`
    )
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || product.title,
    image: images,
    sku: product.variants?.[0]?.sku || product.id,
    mpn: product.variants?.[0]?.sku || product.id,
    brand: {
      "@type": "Brand",
      name: sellerName,
    },
    ...(category && { category }),
    ...(productTags.length > 0 && { keywords: productTags.join(", ") }),
    offers,
    ...(aggregateRating && { aggregateRating }),
    ...(hasReviews && { review: reviewsSchema }),
  }
}

/**
 * ✅ NEW: Generate Seller/Artist ProfilePage JSON-LD
 *
 * GOOGLE REQUIREMENT for ProfilePage:
 * - MUST include "mainEntity" field
 * - DO NOT use "mainEntityOfPage" (deprecated/unrecognized)
 * - Image URLs MUST be valid absolute URLs
 */
export const generateSellerJsonLd = (
  seller: {
    id?: string
    name: string
    handle: string
    description?: string
    photo?: string      // ✅ Changed from banner
    logo_url?: string   // ✅ Changed from logo
    created_at?: string
  },
  reviews?: Array<{
    rating: number
    comment?: string
    customer_name?: string
    created_at?: string
  }>
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()
  const sellerUrl = `${baseUrl}/sellers/${seller.handle}`

  // ✅ Updated: Use logo_url first (profile pic), then photo (banner)
  const sellerImage = ensureValidImageUrl(
    seller.logo_url || seller.photo,
    `${baseUrl}/images/default-seller.png`
  )

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

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": `${sellerUrl}#artist`,
      name: seller.name,
      url: sellerUrl,
      image: sellerImage,
      ...(seller.description && { description: seller.description }),
      ...(aggregateRating && { aggregateRating }),
      sameAs: [sellerUrl],
    },
    name: `${seller.name} - Artysta na Artovnia`,
    description:
      seller.description ||
      `Odkryj unikalne dzieła sztuki i rękodzieła od ${seller.name} na Artovnia.`,
    url: sellerUrl,
    ...(seller.created_at && { dateCreated: seller.created_at }),
    dateModified: new Date().toISOString(),
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
    sameAs: ["https://facebook.com/artovnia", "https://instagram.com/artovnia"],
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