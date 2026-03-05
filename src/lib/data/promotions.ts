"use server"

/**
 * Promotions Filter Data Module
 * 
 * This module provides server-side functions for fetching promotion metadata
 * specifically for the promotions filter bar. It is separate from:
 * 
 * - PromotionDataProvider: Uses listProductsWithPromotions() for homepage/product cards
 * - product-promotions.ts: Handles individual product promotion checks
 * 
 * Cache keys use 'promotions:filter:' prefix to avoid conflicts with main
 * promotional data caching (which uses 'promotions:PL', etc.)
 */

import { unifiedCache, CACHE_TTL } from "@/lib/utils/unified-cache"
import { SellerProps } from "@/types/seller"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function publicPromotionFetch<T>(path: string, query: Record<string, string | number>) {
  const url = new URL(`${BACKEND_URL}${path}`)
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-publishable-api-key": PUB_KEY,
    },
    next: { revalidate: CACHE_TTL.PROMOTIONS, tags: ["products", "promotions"] },
  })

  if (!response.ok) {
    throw new Error(`publicPromotionFetch ${path} -> ${response.status}`)
  }

  return response.json() as Promise<T>
}

export interface PromotionMetadata {
  id: string
  code: string
  type: string
  is_automatic: boolean
  campaign_id?: string
  campaign?: {
    id: string
    name: string
    campaign_identifier: string
    description?: string
  }
  application_method?: {
    type: string
    value: number
    target_type: string
    allocation: string
  }
}

export interface PromotionFilters {
  promotionNames: string[]
  sellerNames: { id: string; name: string }[]
  campaignNames: string[]
  categoryNames: Array<{
    id: string
    name: string
    handle?: string
    parent_category_id?: string | null
    parent_category?: any
    mpath?: string
    category_children?: any[]
  }>
}

/**
 * Fetch all active promotions with metadata
 */
export const getActivePromotions = async (): Promise<PromotionMetadata[]> => {
  const cacheKey = 'promotions:filter:active:metadata'
  
  return unifiedCache.get(cacheKey, async () => {
    try {
      const response = await publicPromotionFetch<{
        promotions: PromotionMetadata[]
      }>("/store/promotions", {
        fields: "*application_method,*campaign",
      })

      return response.promotions || []
    } catch (error) {
      console.error('Error fetching active promotions:', error)
      return []
    }
  }, CACHE_TTL.PROMOTIONS) // 60 seconds cache
}

/**
 * Get unique filter options from products with promotions
 */
export const getPromotionFilterOptions = async (): Promise<PromotionFilters> => {
  const cacheKey = 'promotions:filter:options:metadata'
  
  return unifiedCache.get(cacheKey, async () => {
    try {
      // Fetch products with promotions to extract metadata
      // Using a specific endpoint call separate from PromotionDataProvider
      const response = await publicPromotionFetch<{
        products: Array<{
          id: string
          seller?: SellerProps
          promotions?: PromotionMetadata[]
          categories?: Array<{
            id: string
            name: string
            handle?: string
            parent_category_id?: string | null
            parent_category?: any
            mpath?: string
            category_children?: any[]
          }>
        }>
      }>("/store/products/promotions", {
        limit: 50,
        offset: 0,
        fields: "id,*seller,*promotions,*promotions.campaign,*categories",
      })

      const products = response.products || []
    
      
      // Fetch ALL categories to build complete hierarchy
      const allCategoriesResponse = await publicPromotionFetch<
        { product_categories: Array<{
          id: string
          name: string
          handle?: string
          parent_category_id?: string | null
          mpath?: string
          rank?: number
        }> }
      >("/store/product-categories", {
        fields: "id, handle, name, rank, parent_category_id, mpath",
        limit: 1000,
      })
      
      const allCategories = allCategoriesResponse?.product_categories || []
      
      // Extract unique promotion names
      const promotionNamesSet = new Set<string>()
      const sellersMap = new Map<string, string>()
      const campaignNamesSet = new Set<string>()
      const productCategoryIds = new Set<string>()
      
      products.forEach(product => {
        // Add seller if available
        if (product.seller?.id && product.seller?.name) {
          sellersMap.set(product.seller.id, product.seller.name)
        }
        
        // Collect category IDs from products
        if ((product as any).categories) {
          (product as any).categories.forEach((cat: any) => {
            if (cat.id) {
              productCategoryIds.add(cat.id)
            }
          })
        }
        
        // Add promotion codes and campaign names
        product.promotions?.forEach(promo => {
          if (promo.code) {
            promotionNamesSet.add(promo.code)
          }
          if (promo.campaign?.name) {
            campaignNamesSet.add(promo.campaign.name)
          }
        })
      })
      

      
      // Helper function to recursively collect all ancestor IDs
      const collectAncestorIds = (categoryId: string, allCats: any[]): Set<string> => {
        const ancestorIds = new Set<string>()
        const cat = allCats.find(c => c.id === categoryId)
        if (cat) {
          ancestorIds.add(cat.id)
          if (cat.parent_category_id) {
            const parentAncestors = collectAncestorIds(cat.parent_category_id, allCats)
            parentAncestors.forEach(id => ancestorIds.add(id))
          }
        }
        return ancestorIds
      }
      
      // Collect all category IDs that should be shown (product categories + their ancestors)
      const relevantCategoryIds = new Set<string>()
      productCategoryIds.forEach(catId => {
        const ancestors = collectAncestorIds(catId, allCategories)
        ancestors.forEach(id => relevantCategoryIds.add(id))
      })
      
  
      
      // Filter to only relevant categories and build tree
      const relevantCategories = allCategories.filter(cat => relevantCategoryIds.has(cat.id))
      
      // Build tree structure
      const categoryMap = new Map(relevantCategories.map(cat => [cat.id, {
        ...cat,
        category_children: [] as any[]
      }]))
      
      // Link children to parents
      relevantCategories.forEach(cat => {
        if (cat.parent_category_id && categoryMap.has(cat.parent_category_id)) {
          const parent = categoryMap.get(cat.parent_category_id)!
          const child = categoryMap.get(cat.id)!
          if (!parent.category_children.some((c: any) => c.id === child.id)) {
            parent.category_children.push(child)
          }
        }
      })
      
      const finalCategories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      
      // Helper function to get all descendant IDs for a category
      const getAllDescendantIds = (categoryId: string): string[] => {
        const category = categoryMap.get(categoryId)
        if (!category) return [categoryId]
        
        const descendants = [categoryId]
        if (category.category_children && category.category_children.length > 0) {
          category.category_children.forEach((child: any) => {
            descendants.push(...getAllDescendantIds(child.id))
          })
        }
        return descendants
      }
      
      // Export helper for use in filtering
      ;(finalCategories as any).getAllDescendantIds = getAllDescendantIds
      
    
      
      return {
        promotionNames: Array.from(promotionNamesSet).sort(),
        sellerNames: Array.from(sellersMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        campaignNames: Array.from(campaignNamesSet).sort(),
        categoryNames: finalCategories
      }
    } catch (error) {
      console.error('Error fetching promotion filter options:', error)
      return {
        promotionNames: [],
        sellerNames: [],
        campaignNames: [],
        categoryNames: []
      }
    }
  }, CACHE_TTL.PROMOTIONS) // 60 seconds cache
}

/**
 * Get sellers that have products with active promotions
 */
export const getSellersWithPromotions = async (): Promise<{ id: string; name: string }[]> => {
  const cacheKey = 'promotions:filter:sellers:list'
  
  return unifiedCache.get(cacheKey, async () => {
    try {
      const response = await publicPromotionFetch<{
        products: Array<{
          seller?: SellerProps
        }>
      }>("/store/products/promotions", {
        limit: 50,
        offset: 0,
        fields: "id,seller_id,*seller",
      })

      const sellersMap = new Map<string, string>()
      
      response.products?.forEach(product => {
        if (product.seller?.id && product.seller?.name) {
          sellersMap.set(product.seller.id, product.seller.name)
        }
      })
      
      return Array.from(sellersMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error fetching sellers with promotions:', error)
      return []
    }
  }, CACHE_TTL.PROMOTIONS) // 60 seconds cache
}
