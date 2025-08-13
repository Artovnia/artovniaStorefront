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

/**
 * SIMPLIFIED: Get all categories and build a clean hierarchy tree
 * No complex Algolia filtering - just fetch all categories and build the tree
 * Let the UI components decide what to show based on their needs
 */
export const listCategories = async (): Promise<{
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}> => {
  try {
    console.log(`🏠 listCategories: Fetching all categories from database`)
    
    // Fetch all categories from Medusa backend - simple and clean
    const response = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "id, handle, name, rank, parent_category_id, mpath",
          limit: 1000,
        },
        cache: "force-cache",
        next: { revalidate: 300 }
      }
    )
    
    const allCategories = response?.product_categories || []
    console.log(`🏠 listCategories: Fetched ${allCategories.length} categories from database`)
    
    // Build a clean hierarchical tree - no complex filtering
    const hierarchicalCategories = buildCategoryTree(allCategories)
    
    // Get top-level categories (those without parents)
    const parentCategories = hierarchicalCategories.filter(cat => !cat.parent_category_id)
    
    console.log(`🏠 listCategories: Built tree with ${parentCategories.length} top-level categories`)
    
    return {
      parentCategories,
      categories: hierarchicalCategories
    }
  } catch (error) {
    console.error('Error in listCategories:', error)
    return {
      parentCategories: [],
      categories: []
    }
  }
}

/**
 * Build a clean category tree from flat category array
 * Simple and reliable - no deduplication complexity
 */
function buildCategoryTree(flatCategories: HttpTypes.StoreProductCategory[]): HttpTypes.StoreProductCategory[] {
  // Create a map for quick lookup
  const categoryMap = new Map<string, HttpTypes.StoreProductCategory>()
  
  // Initialize all categories with empty children arrays
  flatCategories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      category_children: [] as HttpTypes.StoreProductCategory[]
    })
  })
  
  const rootCategories: HttpTypes.StoreProductCategory[] = []
  
  // Build the tree by linking children to parents
  flatCategories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!
    
    if (!category.parent_category_id) {
      // Root category
      rootCategories.push(categoryWithChildren)
    } else {
      // Child category - add to parent's children
      const parent = categoryMap.get(category.parent_category_id)
      if (parent) {
        parent.category_children.push(categoryWithChildren)
      } else {
        // Parent not found - treat as root
        rootCategories.push(categoryWithChildren)
        console.warn(`Parent not found for category "${category.name}" (${category.id}), treating as root`)
      }
    }
  })
  
  // Sort categories by rank at all levels
  const sortCategoriesRecursively = (categories: HttpTypes.StoreProductCategory[]) => {
    const sorted = categories.sort((a, b) => (a.rank || 0) - (b.rank || 0))
    sorted.forEach(category => {
      if (category.category_children?.length > 0) {
        category.category_children = sortCategoriesRecursively(category.category_children)
      }
    })
    return sorted
  }
  
  const sortedRootCategories = sortCategoriesRecursively(rootCategories)
  
  // Return flattened array of all categories with proper hierarchy
  const flattenTree = (categories: HttpTypes.StoreProductCategory[]): HttpTypes.StoreProductCategory[] => {
    const result: HttpTypes.StoreProductCategory[] = []
    categories.forEach(category => {
      result.push(category)
      if (category.category_children?.length > 0) {
        result.push(...flattenTree(category.category_children))
      }
    })
    return result
  }
  
  return flattenTree(sortedRootCategories)
}

/**
 * Get categories that have products (for UI components that want to filter)
 * This is optional - components can use this to show only populated categories
 */
export const listCategoriesWithProducts = async (): Promise<{
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}> => {
  try {
    console.log(`🏠 listCategoriesWithProducts: Getting categories with products`)
    
    // Get all categories first
    const allCategoriesResult = await listCategories()
    
    // Get categories that have products from Algolia
    const categoriesWithProducts = await getCategoriesWithProducts()
    
    if (categoriesWithProducts.size === 0) {
      console.log(`🏠 listCategoriesWithProducts: No product data from Algolia, returning all categories`)
      return allCategoriesResult
    }
    
    // Filter to only include categories with products and their complete parent chains
    const categoriesToInclude = new Set<string>()
    
    // Include categories with products
    categoriesWithProducts.forEach(categoryId => {
      categoriesToInclude.add(categoryId)
    })
    
    // Include complete parent chains for categories with products
    allCategoriesResult.categories.forEach(category => {
      if (categoriesWithProducts.has(category.id)) {
        // Walk up the parent chain using getCategoryHierarchy logic
        let currentCategory: HttpTypes.StoreProductCategory | undefined = category
        while (currentCategory?.parent_category_id) {
          categoriesToInclude.add(currentCategory.parent_category_id)
          currentCategory = allCategoriesResult.categories.find(cat => cat.id === currentCategory!.parent_category_id)
        }
      }
    })
    
    // Filter categories
    const filteredCategories = allCategoriesResult.categories.filter(cat => 
      categoriesToInclude.has(cat.id)
    )
    
    // Rebuild tree with filtered categories
    const filteredTree = buildCategoryTree(filteredCategories)
    const filteredParents = filteredTree.filter(cat => !cat.parent_category_id)
    
    console.log(`🏠 listCategoriesWithProducts: Filtered to ${filteredCategories.length} categories with products`)
    
    return {
      parentCategories: filteredParents,
      categories: filteredTree
    }
  } catch (error) {
    console.error('Error in listCategoriesWithProducts:', error)
    // Fallback to all categories
    return await listCategories()
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
        fields: "id, handle, name, rank, parent_category_id, mpath, *parent_category",
        limit: 1000, // CRITICAL: Match the limit from listCategories
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
 * Now enhanced to work with mpath-based category structure
 */
export const getAllDescendantCategoryIds = async (categoryId: string): Promise<string[]> => {
  try {
    // Fetch all categories to find descendants using mpath
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        fields: "id, handle, name, mpath, parent_category_id",
        limit: 1000,
      },
      cache: "force-cache",
      next: { revalidate: 300 }
    })

    if (!product_categories) {
      return [categoryId]
    }

    // Find the target category
    const targetCategory = product_categories.find(cat => cat.id === categoryId)
    if (!targetCategory) {
      return [categoryId]
    }

    const descendantIds = [categoryId]
    
    // Find all categories that have this category in their mpath (are descendants)
    product_categories.forEach(category => {
      const mpath = (category as any).mpath
      if (mpath && typeof mpath === 'string' && category.id !== categoryId) {
        // Check if this category's mpath contains the target category ID
        if (mpath.includes(categoryId)) {
          descendantIds.push(category.id)
        }
      }
    })
    
    console.log(`📊 Found ${descendantIds.length} descendant categories for ${targetCategory.name} (${categoryId})`)
    return descendantIds
  } catch (error) {
    console.error(`Error fetching descendant categories for ${categoryId}:`, error)
    return [categoryId]
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  // Decode handle outside try-catch to ensure it's accessible in error handling
  const decodedHandle = categoryHandle.map(segment => decodeURIComponent(segment)).join("/")
  
  try {
    // First try to find by exact handle
    const response = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "handle, name, rank, parent_category_id, mpath, *category_children, *parent_category",
          handle: decodedHandle,
        },
        cache: "force-cache",
        next: { revalidate: 300 }
      }
    )
    
    if (response?.product_categories?.length > 0) {
      return response.product_categories[0]
    }
    
    // Fallback: search through all categories
    try {
      const allCategoriesResponse = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "handle, name, rank, parent_category_id, mpath, *category_children, *parent_category",
            limit: 1000, // CRITICAL: Match other functions - increased from 100
          },
          cache: "force-cache",
          next: { revalidate: 300 }
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
      console.warn(`Fallback category search failed for handle: ${decodedHandle}`, fallbackError)
    }
    
    console.warn(`Category not found for handle: ${decodedHandle}`)
    return null
  } catch (error) {
    console.error(`Error fetching category by handle: ${decodedHandle}`, error)
    return null
  }
}