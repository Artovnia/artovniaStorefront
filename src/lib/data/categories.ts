import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import { client as algoliaClient } from "@/lib/client"
// Note: Removed persistent-cache import as it may not exist
// Using simple caching approach instead

interface CategoriesProps {
  query?: {
    limit?: number
    offset?: number
  }
  headingCategories?: string[]
}

/**
 * Get categories that have products from Algolia index
 * This is used to filter categories to only show those with actual products
 */
export const getCategoriesWithProducts = async (): Promise<Set<string>> => {
  try {
    const algoliaIndexName = process.env.NEXT_PUBLIC_ALGOLIA_PRODUCTS_INDEX || "products"
    
    console.log(`🔍 Algolia: Starting search on index "${algoliaIndexName}"`)
    console.log(`🔍 Algolia: Environment variables - ID: ${process.env.NEXT_PUBLIC_ALGOLIA_ID ? 'SET' : 'MISSING'}, Key: ${process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY ? 'SET' : 'MISSING'}`)
    
    // Search all products in Algolia to get category information
    // Use empty query to get all products, with high limit to capture all categories
    const searchResponse = await algoliaClient.search([
      {
        indexName: algoliaIndexName,
        params: {
          query: '',
          hitsPerPage: 1000, // Get many products to ensure we capture all categories
          attributesToRetrieve: ['categories'], // Only get category data for efficiency
          facets: ['categories.id'], // Get facet data for categories
        }
      }
    ])

    console.log(`🔍 Algolia: Search response received, results count: ${(searchResponse as any).results?.length || 0}`)

    // Extract unique category IDs that have products
    const categoryIds = new Set<string>()
    
    // Get the first (and only) search result - use any to avoid TypeScript issues
    const firstResult = (searchResponse as any).results[0]
    
    if (firstResult) {
      console.log(`🔍 Algolia: First result - hits: ${firstResult.hits?.length || 0}, facets available: ${firstResult.facets ? 'YES' : 'NO'}`)
      
      // Method 1: Extract from individual product hits
      if (firstResult.hits && Array.isArray(firstResult.hits)) {
        console.log(`🔍 Algolia: Processing ${firstResult.hits.length} product hits`)
        firstResult.hits.forEach((product: any, index: number) => {
          if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach((category: any) => {
              if (category.id) {
                categoryIds.add(category.id)
                if (index < 3) { // Log first few for debugging
                  console.log(`🔍 Algolia: Product ${index} has category "${category.name}" (${category.id})`)
                }
              }
            })
          } else if (index < 3) {
            console.log(`🔍 Algolia: Product ${index} has no categories or invalid format:`, product.categories)
          }
        })
      }
      
      // Method 2: Also extract from facets if available (more comprehensive)
      if (firstResult.facets && firstResult.facets['categories.id']) {
        const facetKeys = Object.keys(firstResult.facets['categories.id'])
        console.log(`🔍 Algolia: Processing ${facetKeys.length} category facets`)
        facetKeys.forEach(categoryId => {
          if (categoryId && categoryId !== 'undefined' && categoryId !== 'null') {
            categoryIds.add(categoryId)
          }
        })
      } else {
        console.log(`🔍 Algolia: No category facets found in response`)
      }

      console.log(`📊 Algolia: Found ${categoryIds.size} categories with products out of ${firstResult.hits?.length || 0} products`)
      console.log(`📊 Algolia: Categories with products:`, Array.from(categoryIds).slice(0, 10), categoryIds.size > 10 ? '...' : '')
    } else {
      console.log(`🔍 Algolia: No results found in search response`)
    }
    
    return categoryIds
  } catch (error) {
    console.error("🔍 Algolia: Error fetching categories with products:", error)
    console.error("🔍 Algolia: Error details:", error instanceof Error ? error.message : String(error))
    // Return empty set on error - will show all categories as fallback
    return new Set()
  }
}

export const listCategories = async ({
  query,
  headingCategories = [],
}: Partial<CategoriesProps> = {}) => {
  try {
    // Fetch all categories from Medusa
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        fields: "handle, name, rank, parent_category_id, *category_children, *parent_category",
        limit: query?.limit || 100,
        ...query,
      }
    })

    console.log(`🏠 listCategories: Fetched ${product_categories?.length || 0} categories from Medusa`)

    if (!product_categories || product_categories.length === 0) {
      console.log(`🏠 listCategories: No categories found in Medusa`)
      return {
        categories: [],
        parentCategories: [],
        count: 0
      }
    }

    // Get categories that have products from Algolia
    const categoriesWithProducts = await getCategoriesWithProducts()
    
    console.log(`🏠 listCategories: Algolia returned ${categoriesWithProducts.size} categories with products`)
    console.log(`🏠 listCategories: Categories with products:`, Array.from(categoriesWithProducts))

    // CRITICAL FIX: If Algolia returns no categories with products, show ALL categories as fallback
    // This prevents the case where Algolia works but finds no product-category relationships
    let filteredCategories: HttpTypes.StoreProductCategory[]
    
    if (categoriesWithProducts.size === 0) {
      console.log(`🏠 listCategories: No categories with products found in Algolia - showing ALL categories as fallback`)
      filteredCategories = product_categories
    } else {
      console.log(`🏠 listCategories: Filtering categories based on Algolia data`)
      filteredCategories = product_categories.filter(category => {
        const hasProducts = categoriesWithProducts.has(category.id)
        if (!hasProducts) {
          console.log(`🏠 listCategories: Filtering out category "${category.name}" (${category.id}) - no products`)
        }
        return hasProducts
      })
    }

    // Get parent categories (top-level categories)
    const parentCategories = filteredCategories.filter(category => !category.parent_category_id)

    console.log(`🏠 listCategories: Final result - ${filteredCategories.length} categories, ${parentCategories.length} parent categories`)

    return {
      categories: filteredCategories,
      parentCategories: parentCategories,
      count: filteredCategories.length
    }
  } catch (error) {
    console.error("🏠 listCategories: Error:", error)
    return {
      categories: [],
      parentCategories: [],
      count: 0
    }
  }
}

/**
 * Build full category hierarchy path from root to leaf
 * This is used for breadcrumbs to show the complete path
 * Uses parent_category_id to reconstruct the full hierarchy chain
 */
export const getCategoryHierarchy = async (categoryHandle: string): Promise<HttpTypes.StoreProductCategory[]> => {
  try {
    // Get all categories with parent relationships - include parent_category_id field
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        fields: "id, handle, name, rank, parent_category_id, *parent_category",
        limit: 100,
      },
      cache: "force-cache",
      next: { revalidate: 300 }
    })

    // Find the target category
    const targetCategory = product_categories.find(cat => cat.handle === categoryHandle)
    if (!targetCategory) {
      console.warn(`Target category with handle "${categoryHandle}" not found`)
      return []
    }

    // Build hierarchy path from leaf to root using parent_category_id
    const hierarchy: HttpTypes.StoreProductCategory[] = []
    let currentCategory: HttpTypes.StoreProductCategory | null = targetCategory

    // Prevent infinite loops with a visited set and max depth
    const visitedIds = new Set<string>()
    const maxDepth = 10 // Reasonable max depth for category hierarchy
    let depth = 0

    while (currentCategory && !visitedIds.has(currentCategory.id) && depth < maxDepth) {
      visitedIds.add(currentCategory.id)
      hierarchy.unshift(currentCategory) // Add to beginning to build root-to-leaf path
      depth++
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Building hierarchy: ${currentCategory.name} (${currentCategory.id}) at depth ${depth}`)
      }
      
      // Find parent category using parent_category_id field
      if (currentCategory.parent_category_id) {
        const parentId: string = currentCategory.parent_category_id
        currentCategory = product_categories.find(cat => cat.id === parentId) || null
        
        if (!currentCategory && process.env.NODE_ENV === 'development') {
          console.warn(`Parent category with ID "${parentId}" not found`)
        }
      } else {
        // No parent_category_id means this is a root category
        currentCategory = null
      }
    }

    if (depth >= maxDepth) {
      console.warn(`Category hierarchy depth exceeded maximum (${maxDepth}) for category: ${categoryHandle}`)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Built hierarchy for "${categoryHandle}": ${hierarchy.map(c => c.name).join(' → ')}`)
    }

    return hierarchy
  } catch (error) {
    console.error('Error building category hierarchy:', error)
    return []
  }
}

/**
 * Get all descendant category IDs for a given category (including the category itself)
 * This is used for parent category pages to show products from all child categories
 */
export const getAllDescendantCategoryIds = (category: HttpTypes.StoreProductCategory): string[] => {
  const ids = [category.id]
  
  if (category.category_children && category.category_children.length > 0) {
    category.category_children.forEach(child => {
      ids.push(...getAllDescendantCategoryIds(child))
    })
  }
  
  return ids
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