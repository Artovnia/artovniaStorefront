import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import { liteClient as algoliasearch } from "algoliasearch/lite"

interface CategoriesProps {
  query?: Record<string, any>
  headingCategories?: string[]
}

/**
 * Get categories that have products from Algolia index
 * This is required by PayU - only categories with products should be shown
 */
const getCategoriesWithProducts = async (): Promise<Set<string>> => {
  try {
    const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID || ""
    const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
    const ALGOLIA_INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX || "products"

    if (!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY) {
      return new Set<string>()
    }

    const searchClient = algoliasearch(ALGOLIA_ID, ALGOLIA_SEARCH_KEY)

    // Search with empty query to get all products, but only fetch facets
    const response = await searchClient.search({
      requests: [{
        indexName: ALGOLIA_INDEX_NAME,
        params: 'query=&hitsPerPage=0&attributesToRetrieve=&facets=categories.id,categories.name&maxValuesPerFacet=1000'
      }]
    })

    const categoriesWithProducts = new Set<string>()
    
    // Extract category IDs from facets - handle both possible response formats
    const firstResult = response.results[0] as any
    if (firstResult && firstResult.facets && firstResult.facets['categories.id']) {
      Object.keys(firstResult.facets['categories.id']).forEach(categoryId => {
        if (firstResult.facets['categories.id'][categoryId] > 0) {
          categoriesWithProducts.add(categoryId)
        }
      })
    }

    return categoriesWithProducts
  } catch (error) {
    console.error('[Categories] Error fetching categories from Algolia:', error)
    // Fallback: return empty set to show all categories if Algolia fails
    return new Set<string>()
  }
}

export const listCategories = async ({
  query,
  headingCategories = [],
}: Partial<CategoriesProps> = {}) => {
  const limit = query?.limit || 100

  // Fetch all categories from Medusa
  const categories = await sdk.client
    .fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        fields: "handle, name, rank, *category_children",
        limit,
        ...query,
      },
      cache: "no-cache",
    })
    .then(({ product_categories }) => product_categories)

  // Get categories that have products from Algolia (PayU requirement)
  const categoriesWithProducts = await getCategoriesWithProducts()
  
  // Filter categories to only include those with products (if Algolia data is available)
  const filteredCategories = categoriesWithProducts.size > 0 
    ? categories.filter(category => categoriesWithProducts.has(category.id))
    : categories // Fallback to all categories if Algolia data unavailable

  // Also filter subcategories to only show those with products
  const categoriesWithFilteredChildren = filteredCategories.map(category => {
    if (category.category_children && category.category_children.length > 0) {
      const filteredChildren = category.category_children.filter(child => 
        categoriesWithProducts.size === 0 || categoriesWithProducts.has(child.id)
      )
      return {
        ...category,
        category_children: filteredChildren
      }
    }
    return category
  })

  const parentCategories = categoriesWithFilteredChildren.filter(({ name }) =>
    headingCategories.includes(name.toLowerCase())
  )

  // Get all child category IDs to filter them out from main categories
  const allChildCategoryIds = new Set<string>()
  categoriesWithFilteredChildren.forEach(category => {
    if (category.category_children && category.category_children.length > 0) {
      category.category_children.forEach(child => {
        allChildCategoryIds.add(child.id)
      })
    }
  })

  // Filter out categories that are children of other categories and not in headingCategories
  const childrenCategories = categoriesWithFilteredChildren.filter(
    ({ name, id }) => 
      !headingCategories.includes(name.toLowerCase()) && 
      !allChildCategoryIds.has(id)
  )

  return {
    categories: childrenCategories,
    parentCategories: parentCategories,
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  try {
    const decodedHandle = categoryHandle.map(segment => decodeURIComponent(segment)).join("/")

    const response = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children",
          handle: decodedHandle,
        },
        cache: "no-cache",
      }
    )
    
    if (response?.product_categories?.length > 0) {
      return response.product_categories[0]
    }
    
    try {
      const allCategoriesResponse = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "*category_children",
            limit: 100,
          },
          cache: "no-cache",
        }
      )
      
      if (allCategoriesResponse?.product_categories?.length > 0) {
        const searchTerm = decodedHandle.toLowerCase()
        const matchingCategory = allCategoriesResponse.product_categories.find(
          cat => cat.handle?.toLowerCase() === searchTerm || cat.name?.toLowerCase() === searchTerm
        )
        
        if (matchingCategory) {
          return matchingCategory
        }
      }
    } catch (fallbackError) {
      // Silently handle fallback errors
    }
    
    return null
  } catch (error) {
    return null
  }
}