import { cache } from "react"
import { getRegion } from "./regions"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

/**
 * Fetch products by tag value using backend workflow
 * Server-side only - for SEO tag pages
 * 
 * This uses the optimized backend endpoint for database-level filtering
 * instead of fetching all products and filtering client-side.
 */
const listProductsByTagInternal = cache(async (
  tagValue: string,
  limit: number,
  offset: number,
  countryCode: string,
  fields: string
): Promise<{
  products: any[]
  count: number
}> => {
  try {
    // Get region for pricing context
    const region = await getRegion(countryCode)
    
    // Build URL with query parameters
    const url = new URL(`${BACKEND_URL}/store/products-by-tag`)
    url.searchParams.set("tag", tagValue)
    url.searchParams.set("limit", limit.toString())
    url.searchParams.set("offset", offset.toString())
    if (fields) {
      url.searchParams.set("fields", fields)
    }
    
    // Add region_id if available for pricing context
    if (region?.id) {
      url.searchParams.set("region_id", region.id)
    }

    // Fetch from backend endpoint
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY!,
      },
      next: {
        tags: ["products", `tag:${tagValue}`],
        revalidate: 300,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()

    return {
      products: data.products || [],
      count: data.count || 0,
    }
  } catch (error) {
    console.error(`Error fetching products by tag "${tagValue}":`, error)
    return {
      products: [],
      count: 0,
    }
  }
})

export const listProductsByTag = async (
  tagValue: string,
  options?: {
    limit?: number
    offset?: number
    countryCode?: string
    fields?: string
  }
) => {
  const {
    limit = 24,
    offset = 0,
    countryCode = "pl",
    fields = "",
  } = options || {}

  return listProductsByTagInternal(tagValue, limit, offset, countryCode, fields)
}

/**
 * Get popular tags with product counts
 * Used for footer links and tag cloud
 */
export const getPopularTags = cache(async (
  limit: number = 50
): Promise<Array<{ value: string; count: number; slug: string }>> => {
  try {
    const url = new URL(`${BACKEND_URL}/store/products`)
    url.searchParams.set("limit", "1000")
    url.searchParams.set("fields", "id,tags.value")

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY!,
      },
      next: {
        tags: ["products", "tags"],
        revalidate: 3600,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const products = data.products || []

    // Count tag occurrences
    const tagCounts = new Map<string, number>()
    
    products.forEach((product: any) => {
      product.tags?.forEach((tag: any) => {
        const count = tagCounts.get(tag.value) || 0
        tagCounts.set(tag.value, count + 1)
      })
    })

    // Convert to array and sort by count
    const sortedTags = Array.from(tagCounts.entries())
      .map(([value, count]) => ({
        value,
        count,
        // ✅ Use URL encoding to preserve exact tag value
        slug: encodeURIComponent(value.toLowerCase()),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return sortedTags
  } catch (error) {
    console.error("Error fetching popular tags:", error)
    return []
  }
})

/**
 * Get tag by slug
 * Converts slug back to tag value
 */
export const getTagBySlug = (slug: string): string => {
  // ✅ Decode URL-encoded slug to get exact original tag value
  try {
    return decodeURIComponent(slug)
  } catch (error) {
    // Fallback for old-style slugs (backward compatibility)
    console.warn(`Failed to decode tag slug "${slug}", using fallback conversion`)
    return slug.replace(/-/g, ' ')
  }
}

/**
 * Get related tags that frequently appear together
 * Used for "Related tags" section on tag pages
 */
export const getRelatedTags = cache(async (
  tagValue: string,
  limit: number = 10,
  countryCode: string = "pl"
): Promise<Array<{ value: string; count: number; slug: string }>> => {
  try {
    // Fetch products with this tag
    const { products } = await listProductsByTag(tagValue, {
      limit: 100,
      countryCode,
      fields: 'id,tags.value',
    })

    // Count co-occurring tags
    const tagCounts = new Map<string, number>()
    
    products.forEach((product: any) => {
      product.tags?.forEach((tag: any) => {
        // Skip the current tag
        if (tag.value.toLowerCase() === tagValue.toLowerCase()) return
        
        const count = tagCounts.get(tag.value) || 0
        tagCounts.set(tag.value, count + 1)
      })
    })

    // Convert to array and sort by count
    const relatedTags = Array.from(tagCounts.entries())
      .map(([value, count]) => ({
        value,
        count,
        // ✅ Use URL encoding to preserve exact tag value
        slug: encodeURIComponent(value.toLowerCase()),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return relatedTags
  } catch (error) {
    console.error(`Error fetching related tags for "${tagValue}":`, error)
    return []
  }
})
