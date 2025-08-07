"use server"

import { sdk } from "../config"
import { sortProducts } from "@/lib/helpers/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@/types/product"
import { getAuthHeaders } from "./cookies"
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
        fields: "*variants.calculated_price,*seller,*variants,*variants.inventory_quantity,*variants.manage_inventory,*variants.allow_backorder,*metadata,*categories,*categories.parent_category,*collection",
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
    },
    category_id,
    collection_id,
    countryCode,
  })

  // Filter by seller if needed (consider moving this to server-side query)
  const filteredProducts = seller_id
    ? products.filter((product) => product.seller?.id === seller_id)
    : products

  // Only sort client-side if server-side sorting isn't available
  const finalProducts = sortBy && sortBy !== 'created_at' 
    ? sortProducts(filteredProducts, sortBy)
    : filteredProducts

  return {
    response: {
      products: finalProducts,
      count: seller_id ? filteredProducts.length : count,
    },
    nextPage,
    queryParams,
  }
}