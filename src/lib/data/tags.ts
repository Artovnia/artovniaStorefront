import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
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
export const listProductsByTag = cache(async (
  tagValue: string,
  options?: {
    limit?: number
    offset?: number
    countryCode?: string
  }
): Promise<{
  products: any[]
  count: number
}> => {
  const { limit = 24, offset = 0, countryCode = "pl" } = options || {}

  try {
    // Get region for pricing context
    const region = await getRegion(countryCode)
    
    // Build URL with query parameters
    const url = new URL(`${BACKEND_URL}/store/products-by-tag`)
    url.searchParams.set("tag", tagValue)
    url.searchParams.set("limit", limit.toString())
    url.searchParams.set("offset", offset.toString())
    
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

/**
 * Get popular tags with product counts
 * Used for footer links and tag cloud
 */
export const getPopularTags = cache(async (
  limit: number = 50
): Promise<Array<{ value: string; count: number; slug: string }>> => {
  try {
    // Fetch all products with tags
    const response = await sdk.store.product.list(
      {
        fields: "+tags",
        limit: 1000, // Adjust based on your product count
      },
      {
        next: {
          tags: ["products", "tags"],
        },
      }
    )

    // Count tag occurrences
    const tagCounts = new Map<string, number>()
    
    response.products.forEach((product: any) => {
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
        slug: value.toLowerCase().replace(/\s+/g, '-'),
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
  // Convert slug back to readable format
  // "kolczyki-handmade" -> "kolczyki handmade"
  return slug.replace(/-/g, ' ')
}

/**
 * Get related tags that frequently appear together
 * Used for "Related tags" section on tag pages
 */
export const getRelatedTags = cache(async (
  tagValue: string,
  limit: number = 10
): Promise<Array<{ value: string; count: number; slug: string }>> => {
  try {
    // Fetch products with this tag
    const { products } = await listProductsByTag(tagValue, { limit: 100 })

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
        slug: value.toLowerCase().replace(/\s+/g, '-'),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return relatedTags
  } catch (error) {
    console.error(`Error fetching related tags for "${tagValue}":`, error)
    return []
  }
})
