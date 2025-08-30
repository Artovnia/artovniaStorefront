"use server"

import { sdk } from "../config"
import { sortProducts } from "@/lib/helpers/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@/types/product"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { SellerProps } from "@/types/seller"
import { ProductGPSRData } from "@/types/gpsr"

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

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cacheKey = `products-${region.id}-${category_id || 'all'}-${collection_id || 'all'}`

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
        fields: "*variants.calculated_price,*seller,*seller.products,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*metadata,*categories,*categories.parent_category,*collection",
        ...queryParams,
      },
      headers,
      next: {
        revalidate: 300, // 5 minutes - balance between performance and data freshness
        tags: ['products', cacheKey, queryParams?.handle ? `product-${queryParams.handle}` : ''],
      },
      cache: "force-cache" // Keep caching improvement
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
 * Fetch products that have active promotions using custom backend API
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
    const offset = (page - 1) * limit

    // Call our custom backend API
    const response = await sdk.client.fetch<{
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
        limit,
        offset,
        region_id: region?.id,
      },
      headers,
      cache: "no-cache"
    })

    const hasNextPage = response.count > offset + limit

    return {
      response: {
        products: response.products,
        count: response.count,
      },
      nextPage: hasNextPage ? page + 1 : null,
    }
  } catch (error) {
    console.error('listProductsWithPromotions: Error calling backend API:', error)
    return {
      response: { products: [], count: 0 },
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
      ...(await getCacheOptions("fulfillment")),
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