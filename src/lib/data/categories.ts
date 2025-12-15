import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
// Temporarily disabled to fix infinite requests
// import { unifiedCache } from "@/lib/utils/unified-cache"

interface CategoriesProps {
  query?: {
    limit?: number
    offset?: number
  }
  headingCategories?: string[]
}

/**
 * Get categories that have products from Medusa database
 * This is used to filter categories to only show those with actual products
 */
export const getCategoriesWithProductsFromDatabase = async (): Promise<Set<string>> => {
  try {
    const categoriesResponse = await sdk.client.fetch<{
      product_categories: Array<{ id: string }>
    }>("/store/product-categories", {
      query: { fields: "id", limit: 500 },
      cache: "force-cache",
      next: { revalidate: 3600 }
    })

    const allCategories = categoriesResponse?.product_categories || []
    const categoriesWithProducts = new Set<string>()

    // Batch into groups of 10 categories at a time
    const batchSize = 10
    for (let i = 0; i < allCategories.length; i += batchSize) {
      const batch = allCategories.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (category) => {
          const response = await sdk.client.fetch<{
            products: Array<{ id: string }>
          }>("/store/products", {
            query: {
              category_id: [category.id],
              fields: "id",
              limit: 1,
            },
            cache: "force-cache",
            next: { revalidate: 3600 }
          })

          if (response?.products?.length > 0) {
            categoriesWithProducts.add(category.id)
          }
        })
      )
    }

    return categoriesWithProducts
  } catch (error) {
    console.error("Error:", error)
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
  return await (async () => {
    try {
      const response = await sdk.client.fetch<
        HttpTypes.StoreProductCategoryListResponse
      >(`/store/product-categories`, {
        query: {
          fields: "id, handle, name, rank, parent_category_id, mpath",
          limit: 1000,
        },
        cache: "force-cache",
        next: { 
          revalidate: 3600, // ✅ Changed from 300
          tags: ['all-categories']
        }
      })
    
      const allCategories = response?.product_categories || []
      const hierarchicalCategories = buildCategoryTree(allCategories)
      const parentCategories = hierarchicalCategories.filter(
        cat => !cat.parent_category_id
      )
      
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
  })()
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
 * OPTIMIZED: Get categories that have products (for UI components that want to filter)
 * This fetches all categories once and filters efficiently to reduce server load
 */
export const listCategoriesWithProducts = async (): Promise<{
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}> => {
  try {
    const categoriesWithProducts = 
      await getCategoriesWithProductsFromDatabase()
    
    if (categoriesWithProducts.size === 0) {
      const essentialCategories = await getEssentialCategories()
      return essentialCategories
    }
    
    const response = await sdk.client.fetch<
      HttpTypes.StoreProductCategoryListResponse
    >("/store/product-categories", {
      query: {
        fields: "id, handle, name, rank, parent_category_id, mpath",
        limit: 1000,
      },
      cache: "force-cache",
      next: { 
        revalidate: 3600, // ✅ Changed from 300 to match
        tags: ['all-categories']
      }
    })
    
    const allCategories = response?.product_categories || []
    
    // Filter categories with products OR their ancestors
    const filteredCategories = allCategories.filter(category => {
      return hasProductsInCategoryTree(
        category, 
        allCategories, 
        categoriesWithProducts
      )
    })
    
    const filteredTree = buildCategoryTree(filteredCategories)
    const filteredParents = filteredTree.filter(
      cat => !cat.parent_category_id
    )
    
    return {
      parentCategories: filteredParents,
      categories: filteredTree
    }
  } catch (error) {
    console.error('Error in listCategoriesWithProducts:', error)
    return await getEssentialCategories()
  }
}

/**
 * Check if a category or any of its descendants have products
 */
function hasProductsInCategoryTree(
  category: HttpTypes.StoreProductCategory, 
  allCategories: HttpTypes.StoreProductCategory[], 
  categoriesWithProducts: Set<string>
): boolean {
  // Check if this category has products
  if (categoriesWithProducts.has(category.id)) {
    return true
  }
  
  // Check all descendants recursively
  const descendants = allCategories.filter(cat => cat.parent_category_id === category.id)
  for (const descendant of descendants) {
    if (hasProductsInCategoryTree(descendant, allCategories, categoriesWithProducts)) {
      return true
    }
  }
  
  return false
}

/**
 * Get essential top-level categories as fallback
 */
async function getEssentialCategories(): Promise<{
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}> {
  try {
    const response = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "id, handle, name, rank, parent_category_id",
          limit: 50, // Only fetch top-level categories
        },
        cache: "force-cache",
        next: { revalidate: 300 }
      }
    )
    
    const allCategories = response?.product_categories || []
    const essentialNames = ['Ona', 'On', 'Dom', 'Dziecko', 'Zwierzęta', 'Akcesoria']
    const essentialCategories = allCategories.filter(cat => 
      essentialNames.includes(cat.name || '') && !cat.parent_category_id
    )
    
    return {
      parentCategories: essentialCategories,
      categories: essentialCategories
    }
  } catch (error) {
    console.error('Error fetching essential categories:', error)
    return { parentCategories: [], categories: [] }
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
    
    return descendantIds
  } catch (error) {
    console.error(`Error fetching descendant categories for ${categoryId}:`, error)
    return [categoryId]
  }
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  // Decode handle outside try-catch to ensure it's accessible in error handling
  const decodedHandle = categoryHandle.map(segment => decodeURIComponent(segment)).join("/")
  
  // Temporarily disabled caching to fix infinite requests
  // return unifiedCache.get(`category:metadata:${decodedHandle}`, async () => {
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