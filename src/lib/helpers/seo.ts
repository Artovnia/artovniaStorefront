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

interface ShippingConfig {
  shippingCost?: number // In PLN (not cents)
  freeShippingThreshold?: number
  handlingDays?: { min: number; max: number }
  transitDays?: { min: number; max: number }
  countries?: string[]
}

interface ReturnPolicyConfig {
  returnDays?: number
  freeReturn?: boolean
  returnMethod?: "ByMail" | "InStore" | "AtKiosk"
}

// ============================================
// CONSTANTS - Platform-wide defaults
// ============================================

const DEFAULT_SHIPPING: ShippingConfig = {
  shippingCost: 15, // 15 PLN default
  freeShippingThreshold: 200,
  handlingDays: { min: 1, max: 3 },
  transitDays: { min: 2, max: 7 },
  countries: ["PL"],
}

// Platform-wide return policy (not per-seller)
const PLATFORM_RETURN_POLICY: ReturnPolicyConfig = {
  returnDays: 14, // EU consumer rights
  freeReturn: false, // Customer pays return shipping
  returnMethod: "ByMail",
}

// ============================================
// HELPERS
// ============================================

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://artovnia.com"
}

const getSiteName = (): string => {
  return process.env.NEXT_PUBLIC_SITE_NAME || "Artovnia"
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

/**
 * Get product availability for Google Merchant
 * Handles both managed inventory and made-to-order products
 * Always returns a valid schema.org availability URL
 */
const getProductAvailability = (product: HttpTypes.StoreProduct): string => {
  // Safety check: ensure we have variants
  if (!product.variants || product.variants.length === 0) {
    // No variants means we can't determine availability - default to InStock
    return "https://schema.org/InStock"
  }
  
  // Check if any variant has manage_inventory = false (made to order / unlimited)
  const hasUnmanagedInventory = product.variants.some((variant: any) => 
    variant.manage_inventory === false
  )
  
  // If inventory is not managed, product is always in stock (made to order)
  if (hasUnmanagedInventory) {
    return "https://schema.org/InStock"
  }
  
  // For managed inventory, check actual quantities
  // Use allow_backorder as a fallback indicator
  const hasBackorderAllowed = product.variants.some((variant: any) => 
    variant.allow_backorder === true
  )
  
  if (hasBackorderAllowed) {
    // If backorder is allowed, product is available even without stock
    return "https://schema.org/InStock"
  }
  
  // Calculate total inventory across all variants
  const totalInventory = product.variants.reduce((sum, variant) => {
    const qty = variant.inventory_quantity || 0
    return sum + qty
  }, 0)

  // Return appropriate availability based on stock levels
  if (totalInventory === 0) return "https://schema.org/OutOfStock"
  if (totalInventory < 5) return "https://schema.org/LimitedAvailability"
  return "https://schema.org/InStock"
}

/**
 * Shipping profile to weight mapping (in grams)
 * Based on your marketplace's shipping profile capacity system
 * These are reasonable weight estimates for Google Merchant Center
 */
const SHIPPING_PROFILE_WEIGHTS: Record<string, number> = {
  // Letters and postal items (lightest)
  'regular_letter': 50,
  'registered_letter': 50,
  'priority_letter': 50,
  'tracked_letter': 50,
  
  // Mini parcels (small items)
  'mini_parcel': 500,
  'mała_paczka': 500,
  
  // Small parcels (standard small items)
  'small_parcel': 1000,
  'small_package': 1000,
  
  // Medium parcels (standard items)
  'medium_parcel': 2000,
  'medium_package': 2000,
  'standard_parcel': 2000,
  
  // Large parcels (larger items)
  'large_parcel': 5000,
  'large_package': 5000,
  
  // Extra large items
  'extra_large_parcel': 10000,
  'xl_parcel': 10000,
  
  // Special categories
  'euro_pallet': 25000,
  'machinery_vehicles': 50000,
  'furniture': 15000,
  'oversized': 20000,
}

/**
 * Extract clean profile name from seller-prefixed format
 * Handles format: "sel_01K4680TQ646K0V2ST2N3BXWZ3:Mała paczka" → "mała_paczka"
 */
const extractShippingProfileName = (profileName: string): string => {
  // Remove seller prefix if present
  let cleanName = profileName
  if (profileName.includes(':')) {
    cleanName = profileName.split(':')[1].trim()
  }
  
  // Normalize to lowercase and replace spaces with underscores
  return cleanName.toLowerCase().replace(/\s+/g, '_')
}

/**
 * Get weight from shipping profile name
 * Returns weight in grams or undefined if profile not recognized
 */
const getWeightFromShippingProfile = (profileName: string | undefined): number | undefined => {
  if (!profileName) return undefined
  
  const cleanName = extractShippingProfileName(profileName)
  
  // Direct match
  if (SHIPPING_PROFILE_WEIGHTS[cleanName]) {
    return SHIPPING_PROFILE_WEIGHTS[cleanName]
  }
  
  // Partial match for common patterns
  for (const [key, weight] of Object.entries(SHIPPING_PROFILE_WEIGHTS)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return weight
    }
  }
  
  return undefined
}

/**
 * Get product weight for Google Merchant shipping calculations
 * Returns weight in grams or undefined if no actual data exists.
 * Priority:
 * 1. Variant weight (if set)
 * 2. Product weight (if set)
 * 3. Conservative category-based estimates (higher end to avoid misleading customers)
 * 
 * Note: Google recommends using highest possible shipping cost if exact weight unknown.
 * Conservative estimates ensure shipping costs aren't underestimated.
 */
const getProductWeight = (product: HttpTypes.StoreProduct): number | undefined => {
  // Priority 1: Try to get weight from first variant
  const variant = product.variants?.[0] as any
  if (variant?.weight && variant.weight > 0) {
    return variant.weight // Assume weight is stored in grams
  }
  
  // Priority 2: Try product-level weight
  if ((product as any).weight && (product as any).weight > 0) {
    return (product as any).weight
  }
  
  // Priority 3: Try to get weight from shipping profile
  const productMetadata = (product as any).metadata
  if (productMetadata?.shipping_profile_name) {
    const profileWeight = getWeightFromShippingProfile(productMetadata.shipping_profile_name)
    if (profileWeight) {
      return profileWeight
    }
  }
  
  // Check variant metadata for shipping profile
  if (variant?.metadata?.shipping_profile_name) {
    const profileWeight = getWeightFromShippingProfile(variant.metadata.shipping_profile_name)
    if (profileWeight) {
      return profileWeight
    }
  }
  
  // Priority 4: Conservative category-based estimates
  // These are HIGHER than typical to avoid underestimating shipping costs
  const categories = (product as any).categories || []
  const categoryNames = categories.map((cat: any) => cat.name?.toLowerCase() || '')
  
  if (categoryNames.some((name: string) => name.includes('biżuteria') || name.includes('jewelry'))) {
    return 200 // Conservative for jewelry (actual often 50-150g)
  }
  if (categoryNames.some((name: string) => name.includes('obraz') || name.includes('painting'))) {
    return 2000 // Conservative for paintings (actual varies 500-3000g)
  }
  if (categoryNames.some((name: string) => name.includes('mebel') || name.includes('furniture'))) {
    return 20000 // Conservative for furniture (actual varies widely)
  }
  if (categoryNames.some((name: string) => name.includes('ceramika') || name.includes('ceramic'))) {
    return 1500 // Conservative for ceramics (actual 500-2000g)
  }
  if (categoryNames.some((name: string) => name.includes('tekstylia') || name.includes('textile'))) {
    return 500 // Conservative for textiles (actual 200-800g)
  }
  
  // Final fallback: 1kg (conservative for most handmade/art products)
  // This ensures shipping costs aren't underestimated
  return 1000
}

/**
 * Get actual product dimensions from variant data
 * Returns dimensions only if they exist in variant data
 * Google Merchant: Dimensions are OPTIONAL for flat-rate shipping
 * Only include if you have actual measurements to avoid errors
 */
const getActualDimensions = (product: HttpTypes.StoreProduct): { width?: number; height?: number; length?: number } | undefined => {
  const variant = product.variants?.[0] as any
  
  // Only return dimensions if at least one dimension exists
  const width = variant?.width && variant.width > 0 ? variant.width : undefined
  const height = variant?.height && variant.height > 0 ? variant.height : undefined
  const length = variant?.length && variant.length > 0 ? variant.length : undefined
  
  // If no dimensions exist, return undefined (dimensions are optional)
  if (!width && !height && !length) {
    return undefined
  }
  
  return { width, height, length }
}

/**
 * Extract price from product - checks multiple locations
 * NOTE: Prices are stored as full values (e.g., 99.99), NOT cents
 */
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

  // Try variant prices array
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

/**
 * Get the best quality image from product
 * Priority: images[0] > thumbnail > placeholder
 */
const getProductImage = (
  product: HttpTypes.StoreProduct,
  fallback?: string
): string => {
  const baseUrl = getBaseUrl()
  const defaultFallback = `${baseUrl}/images/placeholder.webp`

  // Priority 1: First image from images array (highest quality)
  if (product.images?.[0]?.url) {
    return ensureValidImageUrl(product.images[0].url)
  }

  // Priority 2: Thumbnail
  if (product.thumbnail) {
    return ensureValidImageUrl(product.thumbnail)
  }

  return fallback || defaultFallback
}

/**
 * Get all product images as absolute URLs
 */
const getProductImages = (product: HttpTypes.StoreProduct): string[] => {
  const baseUrl = getBaseUrl()
  const images: string[] = []

  // Add all images from images array
  if (product.images?.length) {
    product.images.forEach((img) => {
      if (img.url) {
        images.push(ensureValidImageUrl(img.url))
      }
    })
  }

  // Add thumbnail if not already included
  if (product.thumbnail) {
    const thumbnailUrl = ensureValidImageUrl(product.thumbnail)
    if (!images.includes(thumbnailUrl)) {
      images.push(thumbnailUrl)
    }
  }

  // Fallback to placeholder
  if (images.length === 0) {
    images.push(`${baseUrl}/images/placeholder.webp`)
  }

  return images
}

/**
 * Ensure valid absolute image URL
 */
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

/**
 * Convert a raw image URL to an OG-safe proxy URL that serves JPEG.
 * 
 * WHY: All product images on S3 are stored as WebP (converted by the backend's
 * S3 file service). Facebook Messenger's link preview renderer does NOT reliably
 * support WebP — it silently drops the image. The /api/og-image route fetches
 * the WebP from S3 and converts it to JPEG on-the-fly, cached by Vercel CDN.
 * 
 * Only proxies external URLs (S3). Local/relative URLs are returned as-is
 * since they may already be JPEG/PNG (e.g. placeholder images).
 */
const getOgImageUrl = (imageUrl: string): string => {
  const baseUrl = getBaseUrl()

  // Only proxy external URLs (S3 images that are WebP)
  // Local images (e.g. /images/placeholder.webp) don't need proxying
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return `${baseUrl}/api/og-image?url=${encodeURIComponent(imageUrl)}`
  }

  // Local/relative URLs — return absolute URL as-is
  return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
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
  const siteName = getSiteName()
  const productUrl = `${baseUrl}/products/${product.handle}`

  const description = generateDescription(
    product?.description,
    `${product?.title} - Unikalne dzieło sztuki dostępne na ${siteName}`,
    155
  )

  const buildSeoTitle = (): string => {
    const productTitle = product.title || ""
    const productWithExtras = product as any
    const categoryName = productWithExtras.categories?.[0]?.name || ""
    const sellerName = productWithExtras.seller?.name || ""

    if (categoryName && sellerName) {
      const fullTitle = `${productTitle} | ${categoryName} - ${sellerName}`
      if (fullTitle.length <= 60) return fullTitle
    }

    if (categoryName) {
      const mediumTitle = `${productTitle} | ${categoryName}`
      if (mediumTitle.length <= 60) return mediumTitle
    }

    return productTitle
  }

  // Get raw S3 image URL (WebP)
  const rawImage = getProductImage(product)
  // Convert to OG-safe JPEG proxy URL for Facebook/Messenger compatibility
  // The /api/og-image route converts WebP→JPEG on-the-fly (cached by Vercel CDN)
  const ogImage = getOgImageUrl(rawImage)

  // Extract price and availability for Facebook product meta tags
  const productPrice = extractProductPrice(product)
  const availabilityUrl = getProductAvailability(product)
  // Map schema.org availability URL to Facebook's simpler format
  const fbAvailability = availabilityUrl.includes("OutOfStock")
    ? "out of stock"
    : availabilityUrl.includes("LimitedAvailability")
      ? "available for order"
      : "in stock"

  // Build other meta tags: article:tag + Facebook product tags
  // Facebook product:* tags enable richer link previews with price badges
  const otherMeta: Record<string, string | string[]> = {}
  if (product?.tags && product.tags.length > 0) {
    otherMeta["article:tag"] = product.tags.map((t) => t.value)
  }
  if (productPrice && productPrice > 0) {
    otherMeta["product:price:amount"] = productPrice.toFixed(2)
    otherMeta["product:price:currency"] = "PLN"
  }
  otherMeta["product:availability"] = fbAvailability

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
      .filter(Boolean)
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
      siteName,
      images: [
        {
          url: ogImage,
          // The /api/og-image proxy converts WebP→JPEG for Messenger compatibility
          // Declaring type helps Messenger identify the format (the actual fix)
          type: "image/jpeg",
          // NOTE: width/height intentionally omitted — product images are various
          // aspect ratios (square, portrait, landscape). The proxy uses fit:'inside'
          // which preserves aspect ratio, so actual output dimensions vary.
          // Declaring mismatched dimensions can cause crawlers to reject the image.
          alt: product?.title,
        },
      ],
      type: "website",
      locale: locale === "pl" ? "pl_PL" : "en_US",
    },
    // fb:app_id is injected as <meta property> in root layout.tsx
    // (Next.js other field generates <meta name> which Facebook ignores)
    other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined,
    twitter: {
      card: "summary_large_image",
      site: "@artovnia",
      creator: "@artovnia",
      title: product?.title,
      description,
      images: [ogImage],
    },
  }
}

export const generateCategoryMetadata = (
  category: HttpTypes.StoreProductCategory,
  locale: string = "pl",
  productImage?: string // Optional: first product image from category
): Metadata => {
  const baseUrl = getBaseUrl()
  const siteName = getSiteName()
  const categoryUrl = `${baseUrl}/categories/${category.handle}`

  const description = generateDescription(
    category.description,
    `Przeglądaj ${category.name} - unikalne dzieła sztuki i rękodzieła od polskich artystów na ${siteName}`,
    155
  )

  // Image priority: metadata.image > productImage > default category image
  const getCategoryImage = (): string => {
    if (category.metadata?.image) {
      return ensureValidImageUrl(category.metadata.image as string)
    }
    if (productImage) {
      return ensureValidImageUrl(productImage)
    }
    return `${baseUrl}/images/categories/${category.handle}.png`
  }

  const categoryImage = getCategoryImage()
  // Convert to OG-safe JPEG proxy URL for Messenger compatibility
  const ogCategoryImage = getOgImageUrl(categoryImage)

  // Build SEO title with parent category if available
  const buildCategoryTitle = (): string => {
    const parentName = (category as any).parent_category?.name
    if (parentName) {
      return `${category.name} | ${parentName} - ${siteName}`
    }
    return `${category.name} - Kategoria | ${siteName}`
  }

  return {
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    title: buildCategoryTitle(),
    description,
    keywords: [
      category.name,
      "kategoria",
      "sztuka",
      "rękodzieło",
      "marketplace",
      "polski artysta",
      ...(category.metadata?.keywords as string[] || []),
    ]
      .filter(Boolean)
      .join(", "),
    alternates: {
      canonical: categoryUrl,
      languages: {
        pl: categoryUrl,
        "x-default": categoryUrl,
      },
    },
    openGraph: {
      title: `${category.name} - ${siteName}`,
      description,
      url: categoryUrl,
      siteName,
      images: [
        {
          url: ogCategoryImage,
          type: "image/jpeg",
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
      images: [ogCategoryImage],
    },
  }
}

export const generateSellerMetadata = (
  seller: {
    name: string
    handle: string
    description?: string
    photo?: string
    logo_url?: string
  },
  locale: string = "pl"
): Metadata => {
  const baseUrl = getBaseUrl()
  const siteName = getSiteName()
  const sellerUrl = `${baseUrl}/sellers/${seller.handle}`

  const description = generateDescription(
    seller.description,
    `Odkryj unikalne dzieła sztuki i rękodzieła od ${seller.name}. Zobacz kolekcję produktów i poznaj artystę na ${siteName}.`,
    155
  )

  // Use photo (banner) first, then logo_url
  const sellerImage = ensureValidImageUrl(
    seller.photo || seller.logo_url,
    `${baseUrl}/ArtovniaOgImage.png`
  )
  // Convert to OG-safe JPEG proxy URL for Messenger compatibility
  const ogSellerImage = getOgImageUrl(sellerImage)

  return {
    robots: "index, follow",
    metadataBase: new URL(baseUrl),
    title: `${seller.name} - Artysta | ${siteName}`,
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
      title: `${seller.name} - Artysta na ${siteName}`,
      description,
      url: sellerUrl,
      siteName,
      images: [
        {
          url: ogSellerImage,
          type: "image/jpeg",
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
      images: [ogSellerImage],
    },
  }
}

// ============================================
// STRUCTURED DATA (JSON-LD) GENERATORS
// ============================================

/**
 * Generate shipping details schema
 */
const generateShippingDetailsSchema = (
  config: ShippingConfig = DEFAULT_SHIPPING,
  currency: string = "PLN"
): Record<string, any> => {
  const countries = config.countries || DEFAULT_SHIPPING.countries!

  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: (config.shippingCost ?? DEFAULT_SHIPPING.shippingCost!).toFixed(2),
      currency: currency,
    },
    shippingDestination: countries.map((country) => ({
      "@type": "DefinedRegion",
      addressCountry: country,
    })),
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: config.handlingDays?.min ?? DEFAULT_SHIPPING.handlingDays!.min,
        maxValue: config.handlingDays?.max ?? DEFAULT_SHIPPING.handlingDays!.max,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: config.transitDays?.min ?? DEFAULT_SHIPPING.transitDays!.min,
        maxValue: config.transitDays?.max ?? DEFAULT_SHIPPING.transitDays!.max,
        unitCode: "DAY",
      },
    },
  }
}

/**
 * Generate platform-wide return policy schema
 */
const generateReturnPolicySchema = (
  config: ReturnPolicyConfig = PLATFORM_RETURN_POLICY
): Record<string, any> => {
  const returnMethod = config.returnMethod || PLATFORM_RETURN_POLICY.returnMethod
  const returnDays = config.returnDays ?? PLATFORM_RETURN_POLICY.returnDays
  const freeReturn = config.freeReturn ?? PLATFORM_RETURN_POLICY.freeReturn

  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "PL",
    returnPolicyCategory:
      "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: returnDays,
    returnMethod: `https://schema.org/Return${returnMethod}`,
    returnFees: freeReturn
      ? "https://schema.org/FreeReturn"
      : "https://schema.org/ReturnShippingFees",
  }
}

/**
 * Generate Product JSON-LD structured data for SEO
 *
 * GOOGLE REQUIREMENTS:
 * - Product schema MUST include offers
 * - shippingDetails and hasMerchantReturnPolicy are recommended
 * - review/aggregateRating are optional but recommended
 *
 * NOTE: Prices are stored as full values (e.g., 99.99), NOT cents
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
  }>,
  shippingConfig?: ShippingConfig
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

  // Extract price from product if not provided
  const effectivePrice = price ?? extractProductPrice(product)

  // Calculate aggregate rating from reviews (only if reviews exist)
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

  // Format individual reviews for schema (only if reviews exist)
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
  const seller = (product as any).seller
  const sellerName = seller?.name || "Artovnia"

  // Get product weight for Google Merchant (optional, only if exists)
  const productWeight = getProductWeight(product)
  
  // Get actual product dimensions (optional, only if variant has them)
  const productDimensions = getActualDimensions(product)
  
  // Get availability status
  const availabilityStatus = getProductAvailability(product)
  
  // Get vendor-specific shipping cost (default to 15 PLN if not set)
  // This can be pulled from seller metadata or shipping profile
  const vendorShippingCost = seller?.metadata?.default_shipping_cost || 
                            seller?.default_shipping_cost || 
                            15 // Platform default
  
  // Build offers object with vendor-specific shipping and return policy
  const offers: Record<string, any> = {
    "@type": "Offer",
    url: `${baseUrl}/products/${product.handle}`,
    priceCurrency: currency,
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    availability: availabilityStatus,
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: sellerName,
    },
    // Add vendor-specific shipping details
    // This overrides the flat rate set in Google Merchant Console
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: vendorShippingCost.toFixed(2),
        currency: currency,
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "PL",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: shippingConfig?.handlingDays?.min ?? DEFAULT_SHIPPING.handlingDays!.min,
          maxValue: shippingConfig?.handlingDays?.max ?? DEFAULT_SHIPPING.handlingDays!.max,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: shippingConfig?.transitDays?.min ?? DEFAULT_SHIPPING.transitDays!.min,
          maxValue: shippingConfig?.transitDays?.max ?? DEFAULT_SHIPPING.transitDays!.max,
          unitCode: "DAY",
        },
      },
    },
    // Add platform-wide return policy
    hasMerchantReturnPolicy: generateReturnPolicySchema(),
  }

  // Add price if available (prices are NOT in cents)
  // IMPORTANT: Google Merchant requires price for products, but we still set availability
  if (effectivePrice && effectivePrice > 0) {
    offers.price = effectivePrice.toFixed(2)
  } else {
    // If no price, set a placeholder to prevent Google Merchant errors
    // This shouldn't happen in production, but prevents validation errors
    offers.price = "0.00"
  }

  // Get all product images (highest quality first)
  const images = getProductImages(product)

  // Log warning if no price (may affect Google rich results)
  if (!effectivePrice || effectivePrice <= 0) {
    console.warn(
      `[SEO] Product "${product.handle}" has no valid price - using placeholder price 0.00 for Google Merchant`
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
    // Only include weight if it exists (optional for flat-rate shipping)
    ...(productWeight && {
      weight: {
        "@type": "QuantitativeValue",
        value: productWeight,
        unitCode: "GRM", // Grams
      },
    }),
    // Only include dimensions if they exist (optional for flat-rate shipping)
    ...(productDimensions?.width && {
      width: {
        "@type": "QuantitativeValue",
        value: productDimensions.width,
        unitCode: "CMT", // Centimeters
      },
    }),
    ...(productDimensions?.height && {
      height: {
        "@type": "QuantitativeValue",
        value: productDimensions.height,
        unitCode: "CMT",
      },
    }),
    ...(productDimensions?.length && {
      depth: {
        "@type": "QuantitativeValue",
        value: productDimensions.length,
        unitCode: "CMT",
      },
    }),
    brand: {
      "@type": "Brand",
      name: sellerName,
    },
    ...(category && { category }),
    ...(productTags.length > 0 && { keywords: productTags.join(", ") }),
    offers,
    // Only include rating fields if reviews exist
    ...(aggregateRating && { aggregateRating }),
    ...(reviewsSchema && reviewsSchema.length > 0 && { review: reviewsSchema }),
  }
}

/**
 * Generate Seller/Artist ProfilePage JSON-LD
 */
export const generateSellerJsonLd = (
  seller: {
    id?: string
    name: string
    handle: string
    description?: string
    photo?: string
    logo_url?: string
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

  // Use logo_url first (profile pic), then photo (banner)
  const sellerImage = ensureValidImageUrl(
    seller.logo_url || seller.photo,
    `${baseUrl}/images/default-seller.png`
  )

  // Only include aggregate rating if reviews exist
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

/**
 * Generate Category/Collection JSON-LD with enhanced SEO
 */
export const generateCategoryJsonLd = (
  category: HttpTypes.StoreProductCategory,
  productCount?: number,
  sampleProductImage?: string
): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()
  const categoryUrl = `${baseUrl}/categories/${category.handle}`

  const image = sampleProductImage
    ? ensureValidImageUrl(sampleProductImage)
    : category.metadata?.image
      ? ensureValidImageUrl(category.metadata.image as string)
      : `${baseUrl}/images/categories/${category.handle}.png`

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description:
      category.description ||
      `Przeglądaj produkty z kategorii ${category.name} - unikalne dzieła sztuki i rękodzieła od polskich artystów.`,
    url: categoryUrl,
    image: image,
    ...(productCount !== undefined && {
      numberOfItems: productCount,
    }),
    isPartOf: {
      "@type": "WebSite",
      name: "Artovnia",
      url: baseUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Strona główna",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Kategorie",
          item: `${baseUrl}/categories`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: categoryUrl,
        },
      ],
    },
  }
}

export const generateOrganizationJsonLd = (): JsonLdBase &
  Record<string, any> => {
  const baseUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Artovnia",
    alternateName: "Artovnia Marketplace Rękodzieła",
    url: baseUrl,
    logo: `${baseUrl}/Logo.png`,
    description:
      "Rękodzieło i sztuka handmade od polskich artystów. Biżuteria handmade, obrazy, ceramika, rzeźby, meble i dekoracje. Polski marketplace łączący artystów z miłośnikami sztuki.",
    sameAs: ["https://facebook.com/artovnia", "https://instagram.com/artovnia"],
    // Keywords for rich snippets
    keywords: "rękodzieło, handmade, sztuka, biżuteria handmade, obrazy, ceramika, rzeźby, meble ręcznie robione, polscy artyści",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "kontakt@artovnia.com",
      availableLanguage: ["Polish", "English"],
    },
    // Additional SEO signals
    areaServed: {
      "@type": "Country",
      name: "Poland",
    },
    knowsAbout: [
      // Primary categories
      "Rękodzieło",
      "Sztuka handmade",
      "Handmade",
      // Biżuteria
      "Biżuteria handmade",
      "Naszyjniki",
      "Kolczyki",
      "Bransoletki",
      "Pierścionki",
      "Broszki",
      "Biżuteria personalizowana",
      // Ubrania i moda
      "Ubrania handmade",
      "Sukienki",
      "Swetry ręcznie robione",
      "Torebki handmade",
      "Plecaki",
      // Dom i dekoracje
      "Dekoracje do domu",
      "Obrazy",
      "Ceramika artystyczna",
      "Ceramika dekoracyjna",
      "Świece",
      "Wazony",
      "Rzeźby",
      "Makramy",
      "Poduszki dekoracyjne",
      "Lampy",
      // Meble
      "Meble ręcznie robione",
      "Meble drewniane",
      "Krzesła",
      "Stoły",
      // Dzieci
      "Zabawki handmade",
      "Ubranka dla dzieci",
      "Maskotki",
      "Dekoracje do pokoju dziecięcego",
      // Prezenty
      "Prezenty handmade",
      "Kartki okolicznościowe",
      "Dekoracje ślubne",
      // Vintage
      "Vintage",
      "Antyki",
      "Biżuteria vintage",
      // Zwierzęta
      "Akcesoria dla zwierząt",
      "Smycze handmade",
      "Legowiska",
    ],
  }
}

export const generateWebsiteJsonLd = (): JsonLdBase & Record<string, any> => {
  const baseUrl = getBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Artovnia",
    alternateName: "Artovnia - Rękodzieło i Sztuka Handmade",
    description: "Rękodzieło, biżuteria handmade, obrazy, ceramika, rzeźby i meble od polskich artystów. Polski marketplace sztuki i rękodzieła.",
    url: baseUrl,
    inLanguage: "pl-PL",
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
  url: string,
  image?: string,
  itemCount?: number
): JsonLdBase & Record<string, any> => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: name,
    description: description,
    url: url,
    ...(image && { image: ensureValidImageUrl(image) }),
    ...(itemCount !== undefined && { numberOfItems: itemCount }),
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
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/products/${product.handle}`,
      name: product.title,
      image: getProductImage(product),
    })),
  }
}

// ============================================
// UTILITY EXPORTS
// ============================================

export {
  getBaseUrl,
  getSiteName,
  ensureValidImageUrl,
  getProductImage,
  getProductImages,
  extractProductPrice,
  generateDescription,
  getProductWeight,
  getProductAvailability,
}