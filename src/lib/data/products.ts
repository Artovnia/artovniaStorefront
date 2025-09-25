"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"

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

  // CRITICAL FIX: Disable deduplication temporarily to fix carousel issues
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{
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
        // CRITICAL FIX: Always include fresh inventory data for accurate stock levels
        fields: "*variants.calculated_price,*seller,*seller.products,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*metadata,*categories,*categories.parent_category,*collection",
        ...queryParams,
      },
      headers,
      cache: "no-cache", // CRITICAL FIX: Always fresh for inventory data
    })
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null
      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
    .catch((error) => {
      console.warn('Products fetch failed, returning empty result:', error)
      return {
        response: { products: [], count: 0 },
        nextPage: null,
        queryParams,
      }
    })
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
  const {
    response: { products, count },
    nextPage
  } = await listProducts({
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
}: {
  page?: number
  limit?: number
  countryCode?: string
}): Promise<{
  response: {
    products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
    count: number
  }
  nextPage: number | null
}> => {
  
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
        query: {
          limit: 50, // Get more to have enough after filtering
          offset: 0,
          region_id: region?.id,
        },
        headers,
        cache: "no-cache"
      })
      
      promotionProducts = promotionResponse.products || []
      
      // CRITICAL DEBUG: Log what we actually received
      console.log('🔍 [FRONTEND-DEBUG] Backend response:', {
        products_count: promotionResponse.products?.length || 0,
        total_count: promotionResponse.count || 0,
        promotions_found: promotionResponse.promotions_found || 0,
        applicable_product_ids: promotionResponse.applicable_product_ids || 0
      })
      
      console.log('🔍 [FRONTEND-DEBUG] Received products:', 
        promotionResponse.products?.map(p => ({ 
          id: p.id, 
          title: p.title, 
          seller: (p.seller as any)?.company_name || 'No seller',
          has_promotions: p.has_promotions 
        })) || []
      )
      
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

    // Debug logging
    console.log('🔍 Debug - Promotion products found:', promotionProducts.length)
    console.log('🔍 Debug - Price-list products found:', priceListProducts.length)
    
    // Step 4: Combine and paginate
    const allDiscountedProducts = [
      ...promotionProducts.map(p => ({ ...p, discount_type: 'promotion' })),
      ...priceListProducts.map(p => ({ ...p, discount_type: 'price_list', has_promotions: true }))
    ]

    console.log('🔍 Debug - Total discounted products:', allDiscountedProducts.length)

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = allDiscountedProducts.slice(startIndex, endIndex)

    const nextPage = endIndex < allDiscountedProducts.length ? page + 1 : null

    console.log('🔍 Debug - Paginated products for page', page, ':', paginatedProducts.length)

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
}