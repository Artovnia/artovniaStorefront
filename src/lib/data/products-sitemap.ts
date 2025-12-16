"use server"

import { sdk } from "../config"
import { HttpTypes } from "@medusajs/types"

/**
 * Lightweight product fetching for sitemap generation
 * Does NOT require region/pricing - only fetches handles and metadata
 * This allows sitemap to work even when backend is offline during build
 */
export const listProductsForSitemap = async ({
  limit = 1000,
}: {
  limit?: number
} = {}): Promise<{
  products: Array<{
    handle: string
    created_at: string | null
    seller?: { handle: string } | null
  }>
  count: number
}> => {
  try {
    console.log('🗺️ Sitemap: Fetching products without region requirement')
    
    // Fetch products WITHOUT region_id to avoid region dependency
    const response = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>(`/store/products`, {
      method: "GET",
      query: {
        limit,
        fields: "id,handle,created_at,metadata", // Minimal fields for sitemap
      },
      next: {
        tags: ["products"],
        revalidate: 3600, // Cache for 1 hour
      },
    })

    console.log(`✅ Sitemap: Fetched ${response.products.length} products`)

    return {
      products: response.products.map(p => ({
        handle: p.handle || '',
        created_at: p.created_at || null,
        seller: (p as any).seller ? {
          handle: (p as any).seller.handle || ''
        } : null
      })),
      count: response.count || response.products.length
    }
  } catch (error) {
    console.error('❌ Sitemap: Error fetching products:', error)
    // Return empty array instead of throwing - sitemap should still work with static pages
    return {
      products: [],
      count: 0
    }
  }
}
