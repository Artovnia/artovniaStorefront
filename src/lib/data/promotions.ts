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

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { unifiedCache, CACHE_TTL } from "@/lib/utils/unified-cache"
import { SellerProps } from "@/types/seller"

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
}

/**
 * Fetch all active promotions with metadata
 */
export const getActivePromotions = async (): Promise<PromotionMetadata[]> => {
  const cacheKey = 'promotions:filter:active:metadata'
  
  return unifiedCache.get(cacheKey, async () => {
    try {
      const headers = await getAuthHeaders()
      
      const response = await sdk.client.fetch<{
        promotions: PromotionMetadata[]
      }>('/store/promotions', {
        method: 'GET',
        query: {
          fields: '*application_method,*campaign'
        },
        headers,
        cache: 'no-cache'
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
      const headers = await getAuthHeaders()
      
      // Fetch products with promotions to extract metadata
      // Using a specific endpoint call separate from PromotionDataProvider
      const response = await sdk.client.fetch<{
        products: Array<{
          id: string
          seller?: SellerProps
          promotions?: PromotionMetadata[]
        }>
      }>('/store/products/promotions', {
        method: 'GET',
        query: {
          limit: 50, // Reduced limit to minimize data overlap
          offset: 0,
          fields: 'id,*seller,*promotions,*promotions.campaign' // More specific fields
        },
        headers,
        cache: 'no-cache'
      })

      const products = response.products || []
      
      // Extract unique promotion names
      const promotionNamesSet = new Set<string>()
      const sellersMap = new Map<string, string>()
      const campaignNamesSet = new Set<string>()
      
      products.forEach(product => {
        // Add seller if available
        if (product.seller?.id && product.seller?.name) {
          sellersMap.set(product.seller.id, product.seller.name)
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
      
      return {
        promotionNames: Array.from(promotionNamesSet).sort(),
        sellerNames: Array.from(sellersMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        campaignNames: Array.from(campaignNamesSet).sort()
      }
    } catch (error) {
      console.error('Error fetching promotion filter options:', error)
      return {
        promotionNames: [],
        sellerNames: [],
        campaignNames: []
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
      const headers = await getAuthHeaders()
      
      const response = await sdk.client.fetch<{
        products: Array<{
          seller?: SellerProps
        }>
      }>('/store/products/promotions', {
        method: 'GET',
        query: {
          limit: 50,
          offset: 0,
          fields: 'id,seller_id,*seller' // Only fetch seller data
        },
        headers,
        cache: 'no-cache'
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
