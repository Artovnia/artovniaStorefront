"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"
import { unifiedCache, CACHE_TTL } from "@/lib/utils/unified-cache"
import { fetchWithRetry } from "@/lib/utils/fetch-with-timeout"

// Type for allowed sort keys in server-side product listing
type SortOptions = "created_at" | "created_at_desc" | "created_at_asc" | "title" | "price" | "price_asc" | "price_desc" | "updated_at"

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
      case "price_asc":
        // Sort by lowest variant price (ascending)
        const aPrice = Math.min(...(a.variants?.map(v => v.calculated_price?.calculated_amount || 0) || [0]))
        const bPrice = Math.min(...(b.variants?.map(v => v.calculated_price?.calculated_amount || 0) || [0]))
        return aPrice - bPrice
      case "price_desc":
        // Sort by lowest variant price (descending)
        const aPriceDesc = Math.min(...(a.variants?.map(v => v.calculated_price?.calculated_amount || 0) || [0]))
        const bPriceDesc = Math.min(...(b.variants?.map(v => v.calculated_price?.calculated_amount || 0) || [0]))
        return bPriceDesc - aPriceDesc
      case "updated_at":
        // Use updated_at if available, fallback to created_at
        const aUpdated = (a as any).updated_at || a.created_at || new Date().toISOString()
        const bUpdated = (b as any).updated_at || b.created_at || new Date().toISOString()
        return new Date(bUpdated).getTime() - new Date(aUpdated).getTime()
      case "created_at_asc":
        // Oldest first
        const aCreatedAsc = a.created_at || new Date().toISOString()
        const bCreatedAsc = b.created_at || new Date().toISOString()
        return new Date(aCreatedAsc).getTime() - new Date(bCreatedAsc).getTime()
      case "created_at":
      case "created_at_desc":
      default:
        // Newest first (default)
        const aCreated = a.created_at || new Date().toISOString()
        const bCreated = b.created_at || new Date().toISOString()
        return new Date(bCreated).getTime() - new Date(aCreated).getTime()
    }
  })
}

/**
 * LEAN product listing for homepage/listing pages
 * Minimal fields to stay under Vercel's 2MB cache limit
 * Use this for: Homepage sections, category listings, search results
 */
export const listProductsLean = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  category_id,
  collection_id,
  seller_id,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams &
    HttpTypes.StoreProductParams & {
      handle?: string
    }
  category_id?: string
  collection_id?: string
  seller_id?: string
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
    console.error('❌ listProductsLean: No countryCode or regionId provided')
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
    if (isBuildTime) {
      console.warn('⚠️ listProductsLean: No region found during build (backend offline?), returning empty products', { countryCode, regionId })
    } else {
      console.error('❌ listProductsLean: No region found, returning empty products', { countryCode, regionId })
    }
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // ✅ OPTIMIZED: Minimal fields for homepage - stays under 2MB cache limit
    const queryObject: any = {
      category_id,
      collection_id,
      limit,
      offset,
      region_id: region?.id,
      // ✅ LEAN FIELDS: Only essential data for display
      fields: "id,title,handle,thumbnail,description,created_at,status," +
              "variants.id,variants.title,variants.calculated_price," +
              "seller.id,seller.handle,seller.store_name,seller.name," + // ✅ Added seller.name for ProductCard
              "categories.id,categories.name,categories.handle," +
              "collection.id,collection.handle,collection.title," +
              "metadata.featured,metadata.seller_id,metadata.shipping_profile_name," + // ✅ Added for Google Merchant weight
              "shipping_profile.name", // ✅ Added for Google Merchant weight calculation
      ...queryParams,
    }
    
    if (seller_id) {
      queryObject.seller_id = seller_id
    }
    
    const { products, count } = await fetchWithRetry(
      () => sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
        count: number
      }>(`/store/products`, {
        method: "GET",
        query: queryObject,
        headers,
        next: { revalidate: 300, tags: ['products'] },
      }),
      {
        timeout: process.env.NODE_ENV === 'development' ? 30000 : 15000,
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retrying listProductsLean (attempt ${attempt}):`, error.message)
        }
      }
    )

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
    console.error('❌ listProductsLean: Fetch failed', {
      error: error instanceof Error ? error.message : error,
      countryCode,
      regionId: region?.id,
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    }
  }
}

/**
 * FULL product listing for detail pages
 * Includes all fields including seller products, inventory, etc.
 * Use this for: Product detail pages, seller pages where full data is needed
 */
export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  category_id,
  collection_id,
  seller_id,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams &
    HttpTypes.StoreProductParams & {
      handle?: string
    }
  category_id?: string
  collection_id?: string
  seller_id?: string
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
    console.error('❌ listProducts: No countryCode or regionId provided')
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
    // ✅ During build time, backend might be offline - log warning but don't fail
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
    if (isBuildTime) {
      console.warn('⚠️ listProducts: No region found during build (backend offline?), returning empty products', { countryCode, regionId })
    } else {
      console.error('❌ listProducts: No region found, returning empty products', { countryCode, regionId })
    }
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    // ✅ OPTIMIZED: For seller filtering, use custom endpoint that returns full product data
    if (seller_id) {
    

      const { products, count } = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
        count: number
      }>(`/store/seller/${seller_id}/products`, {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          ...queryParams,
        },
        headers,
        next: { revalidate: 300 },
      })

   

      const nextPage = count > offset + limit ? pageParam + 1 : null
      return {
        response: { products, count },
        nextPage,
        queryParams,
      }
    }
    
    // ✅ Standard product fetching (no seller filter)
    // ⚠️ PERFORMANCE FIX: Removed *seller.products - ProductDetailsPage fetches seller products separately
    // ✅ Keep inventory fields - needed for ProductDetailsHeader "Add to Cart" button logic
    const queryObject: any = {
      category_id,
      collection_id,
      limit,
      offset,
      region_id: region?.id,
      fields: "*variants.calculated_price,*seller,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*variants.metadata,*metadata,*categories,*collection,*shipping_profile,*shipping_profile.name",
      ...queryParams,
    }
    
    const { products, count } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>(`/store/products`, {
      method: "GET",
      query: queryObject,
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
    console.error('❌ listProducts: Fetch failed', {
      error: error instanceof Error ? error.message : error,
      countryCode,
      regionId: region?.id,
      stack: error instanceof Error ? error.stack : undefined
    })
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

  // ✅ PERFORMANCE FIX: For seller products, fetch ONLY the requested page
  // Direct API call without client-side caching for instant page switches
  if (seller_id) {
    try {
      const region = await getRegion(countryCode)
      if (!region) {
        return {
          response: { products: [], count: 0 },
          nextPage: null,
          queryParams,
        }
      }

      const headers = { ...(await getAuthHeaders()) }
      
      // Build query parameters for seller products endpoint
      const query: any = {
        limit,
        offset,
        region_id: region.id,
        sortBy: sortBy || 'created_at_desc',
      }
      
      if (category_id) {
        query.category_id = category_id
      }

      // ✅ OPTIMIZED: Direct fetch with shorter cache for faster updates
      const { products, count } = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
        count: number
      }>(`/store/seller/${seller_id}/products`, {
        method: "GET",
        query,
        headers,
        next: { 
          revalidate: 60, // ✅ Reduced from 300s to 60s for faster page switches
          tags: ['seller-products', `seller-${seller_id}`] 
        },
      })

      const nextPage = count > offset + limit ? page + 1 : null
      return {
        response: { products, count },
        nextPage,
        queryParams,
      }
    } catch (error) {
      console.error('❌ listProductsWithSort: Seller products fetch failed', error)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
        queryParams,
      }
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
 * Fetch products that have active promotions
 * Uses custom backend endpoint /store/products/promotions that returns products with promotion data
 */
export const listProductsWithPromotions = async ({
  page = 1,
  limit = 12,
  countryCode = "PL",
  sortBy,
  promotion,
  seller,
  campaign,
  category,
}: {
  page?: number
  limit?: number
  countryCode?: string
  sortBy?: string
  promotion?: string
  seller?: string
  campaign?: string
  category?: string
}): Promise<{
  response: {
    products: (HttpTypes.StoreProduct & { seller?: SellerProps, promotions?: any[], has_promotions?: boolean })[]
    count: number
  }
  nextPage: number | null
}> => {
  const cacheKey = `products:promotions:${countryCode}:${page}:${limit}:${sortBy}:${promotion}:${seller}:${campaign}:${category}`
  
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

      // Build query parameters for custom promotions endpoint
      const queryParams: any = {
        limit: limit || 50,
        offset: (page - 1) * (limit || 50),
        region_id: region?.id,
      }

      if (sortBy) {
        queryParams.sortBy = sortBy
      }
      if (promotion) {
        queryParams.promotion = promotion
      }
      if (seller) {
        queryParams.seller = seller
      }
      if (campaign) {
        queryParams.campaign = campaign
      }
      if (category) {
        queryParams.category = category
      }

      // Use custom backend endpoint that returns products WITH promotions
      const productsResponse = await sdk.client.fetch<{
        products: (HttpTypes.StoreProduct & { seller?: SellerProps, promotions?: any[], has_promotions?: boolean })[]
        count: number
        promotions_found?: number
        applicable_product_ids?: number
      }>(`/store/products/promotions`, {
        query: queryParams,
        headers,
        next: { revalidate: 300 },
      })

      const products = productsResponse?.products || []
      const count = productsResponse?.count || 0

      // Calculate next page
      const nextPage = count > (page * limit) ? page + 1 : null

      return {
        response: {
          products,
          count,
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
  }, CACHE_TTL.PROMOTIONS) // Use shorter TTL for promotional data
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
 * Uses Next.js cache with lean fields for optimal performance
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
  
  try {
    const region = await getRegion(countryCode)
    if (!region) return []

    const headers = {
      ...(await getAuthHeaders()),
    }

    // ✅ OPTIMIZED: Use Next.js cache with lean fields and timeout/retry
    const { products } = await fetchWithRetry(
      () => sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
        count: number
      }>(`/store/products`, {
        method: "GET",
        query: {
          limit,
          region_id: region.id,
          handle: handles, // Pass multiple handles
          // ✅ LEAN FIELDS: Only essential data for seller product display
          fields: "id,title,handle,thumbnail,description,created_at,status," +
                  "variants.id,variants.title,variants.calculated_price," +
                  "seller.id,seller.handle,seller.store_name," +
                  "categories.id,categories.name,categories.handle," +
                  "metadata.featured",
        },
        headers,
        next: { revalidate: 600, tags: ['products', 'seller-products'] }, // ✅ 10-minute cache
      }),
      {
        timeout: 15000,
        maxRetries: 3,
        onRetry: (attempt, error) => {
          console.warn(`🔄 Retrying batchFetchProductsByHandles (attempt ${attempt}):`, error.message)
        }
      }
    )

    // Ensure products are returned in the same order as requested handles
    const orderedProducts = handles.map(handle => 
      products.find(p => p.handle === handle)
    ).filter(Boolean) as (HttpTypes.StoreProduct & { seller?: SellerProps })[]

    return orderedProducts
  } catch (error) {
    console.error('Batch fetch products failed:', error)
    return []
  }
}