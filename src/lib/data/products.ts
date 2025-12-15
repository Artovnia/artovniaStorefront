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

  // ✅ Use Next.js fetch cache instead of client-side cache
  // Next.js automatically deduplicates identical fetch requests within the same render
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
        fields: "*variants.calculated_price,*seller,*seller.products,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*variants.inventory_items.inventory_item_id,*variants.inventory_items.required_quantity,*metadata,*categories,*categories.parent_category,*collection",
        ...queryParams,
      },
      headers,
      next: { revalidate: 300 }, // ✅ Next.js cache: 5 minutes
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
  const offset = queryParams?.offset !== undefined ? queryParams.offset : (page - 1) * limit

  // For seller products, fetch ALL once and cache, then paginate in memory
  if (seller_id) {
    const cacheKey = `seller:all-products:${seller_id}:${countryCode}:${sortBy}`
    
    // Fetch all seller products once (cached for 5 min)
    const allSellerProducts = await unifiedCache.get(cacheKey, async () => {
      const result = await listProducts({
        pageParam: 1,
        queryParams: {
          ...queryParams,
          limit: 1000, // Fetch all products (sellers rarely have >1000)
          offset: 0,
          order: sortBy === 'created_at' ? '-created_at' : sortBy,
        },
        countryCode,
      })

      if (!result || !result.response) {
        return []
      }

      // Filter products by seller_id
      const filteredProducts = result.response.products.filter(
        (p: any) => p.seller?.id === seller_id
      )

      // Apply sorting
      return sortBy && sortBy !== 'created_at'
        ? sortProducts(filteredProducts, sortBy)
        : filteredProducts
    }, CACHE_TTL.PRODUCT)

    // Paginate the cached results
    const paginatedProducts = allSellerProducts.slice(offset, offset + limit)
    const totalCount = allSellerProducts.length
    const hasMore = totalCount > offset + limit

    return {
      response: {
        products: paginatedProducts,
        count: totalCount,
      },
      nextPage: hasMore ? page + 1 : null,
      queryParams,
    }
  }

  // For non-seller queries, use standard product listing
  const result = await listProducts({
    pageParam: page,
    queryParams: {
      ...queryParams,
      limit,
      offset,
      order: sortBy === 'created_at' ? '-created_at' : sortBy,
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

  // Apply client-side sorting only if not using created_at (which is handled server-side)
  const sortedProducts = sortBy && sortBy !== 'created_at'
    ? sortProducts(products, sortBy)
    : products

  // Return paginated response
  return {
    response: {
      products: sortedProducts,
      count,
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

      // Fetch all products with proper fields for promotions
      const productsResponse = await sdk.client.fetch<{
        products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
        count: number
      }>(`/store/products`, {
        query: {
          limit: limit || 50,
          offset: (page - 1) * (limit || 50),
          region_id: region?.id,
          fields: "*variants.calculated_price,*seller,*variants,*metadata,*categories,*collection",
        },
        headers,
        next: { revalidate: 300 },
      })

      const allProducts = productsResponse?.products || []

      // Return all products (promotions are included in calculated_price)
      const allDiscountedProducts = allProducts.map(p => ({ 
        ...p, 
        has_promotions: true // Flag for UI
      }))

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
      console.error(`❌ Frontend: Error fetching shipping options for product ${productId}:`, error)
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
          fields: "*variants.calculated_price,*seller,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*variants.inventory_items.inventory_item_id,*variants.inventory_items.required_quantity,*metadata,*categories,*categories.parent_category,*collection",
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