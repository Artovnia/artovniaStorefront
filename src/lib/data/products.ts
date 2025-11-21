"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"
import { unifiedCache, CACHE_TTL } from "@/lib/utils/unified-cache"

// Type for allowed sort keys in server-side product listing
type SortOptions = "created_at" | "title" | "price" | "updated_at"

/**
 * Performs client-side ordering of product arrays when server sorting isn't applied.
 * Invoked in listProductsWithSort for non-created_at sorts.
 * Receives filtered products and a SortOptions key.
 * Returns a newly ordered product list.
 */
const sortProducts = (products: HttpTypes.StoreProduct[], sortBy: SortOptions): HttpTypes.StoreProduct[] => {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title)
      case "price":
        // Sort by lowest variant price
        const aPrice = Math.min(...(a.variants?.map(v => v.calculated_price?.calculated_amount || 0) || [0]))
        const bPrice = Math.min(...(b.variants?.map(v => v.calculated_price?.calculated_amount || 0) || [0]))
        return aPrice - bPrice
      case "updated_at":
        // Use updated_at if available, fallback to created_at
        const aUpdated = (a as any).updated_at || a.created_at || new Date().toISOString()
        const bUpdated = (b as any).updated_at || b.created_at || new Date().toISOString()
        return new Date(bUpdated).getTime() - new Date(aUpdated).getTime()
      case "created_at":
      default:
        const aCreated = a.created_at || new Date().toISOString()
        const bCreated = b.created_at || new Date().toISOString()
        return new Date(bCreated).getTime() - new Date(aCreated).getTime()
    }
  })
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  category_id,
  collection_id,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams &
    HttpTypes.StoreProductParams & {
      handle?: string
    }
  category_id?: string
  collection_id?: string
  countryCode?: string
  regionId?: string
}): Promise<{
  response: {
    products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
    count: number
  }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit

  // Create cache key for this specific request
  const cacheKey = `products:list:${countryCode || regionId}:${category_id || 'all'}:${collection_id || 'all'}:${pageParam}:${limit}:${JSON.stringify(queryParams || {})}`

  return unifiedCache.get(cacheKey, async () => {
    let region: HttpTypes.StoreRegion | undefined | null

    if (countryCode) {
      region = await getRegion(countryCode)
    } else {
      region = await retrieveRegion(regionId!)
    }

    if (!region) {
      return {
        response: { products: [], count: 0 },
        nextPage: null,
      }
    }

    const headers = {
      ...(await getAuthHeaders()),
    }

    try {
      const { products, count } = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
        count: number
      }>(`/store/products`, {
        method: "GET",
        query: {
          category_id,
          collection_id,
          limit,
          offset,
          region_id: region?.id,
          fields: "*variants.calculated_price,*seller,*seller.products,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*metadata,*categories,*categories.parent_category,*collection",
          ...queryParams,
        },
        headers,
        cache: "no-cache",
      })

      const nextPage = count > offset + limit ? pageParam + 1 : null
      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    } catch (error) {
      console.warn('Products fetch failed, returning empty result:', error)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
        queryParams,
      }
    }
  }, CACHE_TTL.PRODUCT)
}

/**
 * Optimized product listing with server-side sorting and filtering
 * Avoids over-fetching by implementing proper pagination and caching
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
  category_id,
  seller_id,
  collection_id,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
  category_id?: string
  seller_id?: string
  collection_id?: string
}): Promise<{
  response: {
    products: HttpTypes.StoreProduct[]
    count: number
  }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  // Use direct pagination instead of over-fetching
  const result = await listProducts({
    pageParam: page,
    queryParams: {
      ...queryParams,
      limit,
      // Add server-side sorting if supported by Medusa
      order: sortBy === 'created_at' ? '-created_at' : sortBy,
      // Remove seller_id from server query as it's not supported
      // ...(seller_id && { seller_id })
    },
    category_id,
    collection_id,
    countryCode,
  })

  // ✅ SAFETY CHECK: Handle undefined result from cache
  if (!result || !result.response) {
    console.warn('listProducts returned undefined or invalid result, returning empty data')
    return {
      response: {
        products: [],
        count: 0,
      },
      nextPage: null,
      queryParams,
    }
  }

  const {
    response: { products, count },
    nextPage
  } = result

  // Filter by seller_id client-side since server doesn't support it
  const filteredProducts = seller_id 
    ? products.filter(product => product.seller?.id === seller_id)
    : products

  // Only sort client-side if server-side sorting isn't available
  const finalProducts = sortBy && sortBy !== 'created_at' 
    ? sortProducts(filteredProducts, sortBy)
    : filteredProducts

  return {
    response: {
      products: finalProducts,
      count: filteredProducts.length, // Use filtered count since we're filtering client-side
    },
    nextPage,
    queryParams,
  }
}

/**
 * Fetch products that have active promotions or price-list discounts
 * Uses hybrid approach: backend for promotions + frontend filtering for price-list discounts
 */
export const listProductsWithPromotions = async ({
  page = 1,
  limit = 12,
  countryCode = "PL",
  sortBy,
  promotion,
  seller,
  campaign,
}: {
  page?: number
  limit?: number
  countryCode?: string
  sortBy?: string
  promotion?: string
  seller?: string
  campaign?: string
}): Promise<{
  response: {
    products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
    count: number
  }
  nextPage: number | null
}> => {
  const cacheKey = `products:promotions:${countryCode}:${page}:${limit}:${sortBy}:${promotion}:${seller}:${campaign}`
  
  return unifiedCache.get(cacheKey, async () => {
    try {
      // Get region for price calculation
      let region = await getRegion(countryCode.toLowerCase())
      if (!region) {
        region = await getRegion(countryCode.toUpperCase())
      }
      if (!region) {
        region = await getRegion("pl")
      }

      const headers = { ...(await getAuthHeaders()) }

      // Step 1: Get products with promotion module discounts
      let promotionProducts: any[] = []
      try {
        const queryParams: any = {
          limit: 50, // Get more to have enough after filtering
          offset: 0,
          region_id: region?.id,
        }
        
        // Add filter parameters
        if (sortBy) queryParams.sortBy = sortBy
        if (promotion) queryParams.promotion = promotion
        if (seller) queryParams.seller = seller
        if (campaign) queryParams.campaign = campaign
        
        const promotionResponse = await sdk.client.fetch<{
          products: (HttpTypes.StoreProduct & { 
            promotions?: any[]
            has_promotions?: boolean
            seller?: SellerProps 
          })[]
          count: number
          promotions_found?: number
          applicable_product_ids?: number
        }>(`/store/products/promotions`, {
          method: "GET",
          query: queryParams,
          headers,
          cache: "no-cache"
        })
        
        promotionProducts = promotionResponse.products || []
        
      } catch (error) {
        console.warn('Failed to fetch promotion products, continuing with price-list only:', error)
      }

      // Step 2: Get products with price-list discounts using dedicated API
      let priceListProducts: any[] = []
      try {
        const priceListResponse = await sdk.client.fetch<{
          products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
          count: number
          price_lists_found?: number
          discounted_variants_found?: number
          total_products_with_discounts?: number
        }>(`/store/products/price-list-discounts`, {
          method: "GET",
          query: {
            limit: 100,
            offset: 0,
            region_id: region?.id,
          },
          headers,
          cache: "no-cache"
        })
        
        // Filter out products already in promotion products
        priceListProducts = priceListResponse.products.filter((product: any) => 
          !promotionProducts.some(p => p.id === product.id)
        )
      } catch (error) {
        console.warn('Failed to fetch price-list products:', error)
      }

      // Step 4: Combine and paginate
      const allDiscountedProducts = [
        ...promotionProducts.map(p => ({ ...p, discount_type: 'promotion' })),
        ...priceListProducts.map(p => ({ ...p, discount_type: 'price_list', has_promotions: true }))
      ]

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedProducts = allDiscountedProducts.slice(startIndex, endIndex)

      const nextPage = endIndex < allDiscountedProducts.length ? page + 1 : null

      return {
        response: {
          products: paginatedProducts,
          count: allDiscountedProducts.length,
        },
        nextPage,
      }
    } catch (error) {
      console.error('Error in listProductsWithPromotions:', error)
      
      // Fallback: return empty results
      return {
        response: {
          products: [],
          count: 0,
        },
        nextPage: null,
      }
    }
  }, CACHE_TTL.PRODUCT) // Use shorter TTL for promotional data
}

/**
 * Retrieves shipping options for a specific product
 * @param productId - The ID of the product
 * @param regionId - The ID of the region
 * @param headers - Optional headers
 * @param next - Optional Next.js cache options
 * @returns Promise with shipping options
 */
export const getProductShippingOptions = async (
  productId: string,
  regionId: string,
  headers: { [key: string]: string } = {},
  next?: any
) => {
  const cacheKey = `shipping:options:${productId}:${regionId}`
  
  return unifiedCache.get(cacheKey, async () => {
    try {
      const authHeaders = {
        ...(await getAuthHeaders()),
        ...headers
      }

      const cacheOptions = {
        cache: "no-cache", // Always fresh for shipping options
        ...next
      }

      const response = await sdk.client.fetch<{
        shipping_options: any[]
      }>(`/store/product-shipping-options`, {
        method: "GET",
        headers: authHeaders,
        next: cacheOptions,
        query: {
          product_id: productId,
          region_id: regionId
        }
      })

      return response.shipping_options || []
    } catch (error) {
      console.error(`getProductShippingOptions: Error fetching shipping options for product ${productId}:`, error)
      return []
    }
  }, CACHE_TTL.PRODUCT)
}

/**
 * Batch fetch products by handles - optimized for seller product fetching
 * Reduces multiple individual API calls to a single batch request
 */
export const batchFetchProductsByHandles = async ({
  handles,
  countryCode,
  limit = 50
}: {
  handles: string[]
  countryCode: string
  limit?: number
}): Promise<(HttpTypes.StoreProduct & { seller?: SellerProps })[]> => {
  if (!handles.length) return []
  
  const cacheKey = `products:batch:${countryCode}:${handles.sort().join(',')}`
  
  return unifiedCache.get(cacheKey, async () => {
    try {
      const region = await getRegion(countryCode)
      if (!region) return []

      const headers = {
        ...(await getAuthHeaders()),
      }

      // Use a single API call to fetch multiple products by handles
      const { products } = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
        count: number
      }>(`/store/products`, {
        method: "GET",
        query: {
          limit,
          region_id: region.id,
          handle: handles, // Pass multiple handles
          fields: "*variants.calculated_price,*seller,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*metadata,*categories,*categories.parent_category,*collection",
        },
        headers,
        cache: "no-cache",
      })

      // Ensure products are returned in the same order as requested handles
      const orderedProducts = handles.map(handle => 
        products.find(p => p.handle === handle)
      ).filter(Boolean) as (HttpTypes.StoreProduct & { seller?: SellerProps })[]

      return orderedProducts
    } catch (error) {
      console.error('Batch fetch products failed:', error)
      return []
    }
  }, CACHE_TTL.PRODUCT)
}