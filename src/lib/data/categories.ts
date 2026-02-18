import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
// unstable_cache breaks when called from client components (Header.tsx)
// Using React cache() for request deduplication instead

interface CategoriesProps {
  query?: {
    limit?: number
    offset?: number
  }
  headingCategories?: string[]
}

// Extended type to include mpath (returned by API but not in base types)
interface CategoryWithMpath extends HttpTypes.StoreProductCategory {
  mpath?: string
}

/**
 * ✅ OPTIMIZED: Get categories that have products using dedicated backend endpoint
 * Uses React cache() for request deduplication + Next.js fetch cache for persistence
 * 
 * Backend endpoint: GET /store/product-categories/categories-with-products
 * Returns: { category_ids: string[], count: number }
 * 
 * This is much more efficient than fetching 1000 products just to extract category IDs.
 */
const getCategoriesWithProductsFromDatabaseImpl = async (): Promise<Set<string>> => {
  try {
    // ✅ OPTIMIZED: Use dedicated backend endpoint instead of fetching 1000 products
    const response = await sdk.client.fetch<{
      category_ids: string[]
      count: number
    }>("/store/product-categories/categories-with-products", {
      next: { 
        revalidate: 86400, // 24h Next.js cache
        tags: ['categories', 'products']
      },
    })

    const categoryIds = response?.category_ids || []
    return new Set(categoryIds)
  } catch (error) {
    console.error("Error fetching categories with products:", error)
    return new Set()
  }
}

// ✅ cache() deduplicates requests within same render, fetch cache persists across requests
export const getCategoriesWithProductsFromDatabase = cache(getCategoriesWithProductsFromDatabaseImpl)

/**
 * SIMPLIFIED: Get all categories and build a clean hierarchy tree
 * Uses React cache() for request deduplication + Next.js fetch cache for persistence
 */
const listCategoriesImpl = async (): Promise<{
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}> => {
  try {
    const response = await sdk.client.fetch<
      HttpTypes.StoreProductCategoryListResponse
    >("/store/product-categories", {
      query: {
        fields: "id, handle, name, rank, parent_category_id, mpath",
        limit: 1000,
      },
      next: { 
        revalidate: 3600, // 1h Next.js cache
        tags: ['categories']
      },
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
    return await getEssentialCategories()
  }
}

// ✅ cache() deduplicates requests within same render, fetch cache persists across requests
export const listCategories = cache(listCategoriesImpl)

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
 * OPTIMIZED: Get categories with products - storefront-only optimization
 * 
 * Strategy:
 * 1. Fetch parent categories with descendants tree (single request)
 * 2. Check which categories have products
 * 3. Filter to only show categories with products
 */
export const listCategoriesWithProducts = async (): Promise<{
  parentCategories: HttpTypes.StoreProductCategory[]
  categories: HttpTypes.StoreProductCategory[]
}> => {
  try {
    // Step 1: Fetch ONLY parent categories with full descendants tree
    const parentResponse = await sdk.client.fetch<
      HttpTypes.StoreProductCategoryListResponse
    >("/store/product-categories", {
      query: {
        fields: "+category_children.id,+category_children.name,+category_children.handle,+category_children.rank,+category_children.category_children.id,+category_children.category_children.name,+category_children.category_children.handle,+category_children.category_children.rank",
        parent_category_id: "null", // Only root categories
        include_descendants_tree: true,
        limit: 50,
      },
      next: { revalidate: 3600 },
    })

    const parentCategories = parentResponse?.product_categories || []

    if (parentCategories.length === 0) {
      return await getEssentialCategories()
    }

    // Step 2: Collect all category IDs from tree
    const allCategoryIds = collectAllCategoryIds(parentCategories)

    // Step 3: Check which categories have products (cached)
    const categoriesWithProducts = await getCategoriesWithProductsFromDatabase()

    if (categoriesWithProducts.size === 0) {
      return await getEssentialCategories()
    }

    // Step 4: Filter parent categories AND their children recursively
    // Only keep categories that have products or descendants with products
    const filteredParents = parentCategories
      .map(cat => filterCategoryTree(cat, categoriesWithProducts))
      .filter(cat => cat !== null) as HttpTypes.StoreProductCategory[]

    // Step 5: Flatten for categories array (for backward compatibility)
    const allCategories = flattenCategories(filteredParents)

    return {
      parentCategories: filteredParents,
      categories: allCategories,
    }
  } catch (error) {
    console.error("Error in listCategoriesWithProducts:", error)
    return await getEssentialCategories()
  }
}

/**
 * Helper: Collect all category IDs from tree
 */
function collectAllCategoryIds(
  categories: HttpTypes.StoreProductCategory[]
): string[] {
  const ids: string[] = []
  const traverse = (cats: HttpTypes.StoreProductCategory[]) => {
    for (const cat of cats) {
      ids.push(cat.id)
      if (cat.category_children?.length) {
        traverse(cat.category_children)
      }
    }
  }
  traverse(categories)
  return ids
}

/**
 * Helper: Filter category tree recursively, keeping only categories with products
 * Returns null if category and all descendants have no products
 */
function filterCategoryTree(
  category: HttpTypes.StoreProductCategory,
  categoriesWithProducts: Set<string>
): HttpTypes.StoreProductCategory | null {
  // Recursively filter children first
  const filteredChildren = category.category_children
    ?.map(child => filterCategoryTree(child, categoriesWithProducts))
    .filter(child => child !== null) as HttpTypes.StoreProductCategory[] | undefined

  // Keep category if it has products OR has children with products
  const hasProducts = categoriesWithProducts.has(category.id)
  const hasChildrenWithProducts = filteredChildren && filteredChildren.length > 0

  if (hasProducts || hasChildrenWithProducts) {
    return {
      ...category,
      category_children: filteredChildren || []
    }
  }

  return null
}

/**
 * Helper: Check if category tree has products (legacy - kept for reference)
 */
function hasChildWithProducts(
  category: HttpTypes.StoreProductCategory,
  categoriesWithProducts: Set<string>
): boolean {
  // Check if this category has products
  if (categoriesWithProducts.has(category.id)) {
    return true
  }

  // Check children recursively
  if (category.category_children?.length) {
    for (const child of category.category_children) {
      if (hasChildWithProducts(child, categoriesWithProducts)) {
        return true
      }
    }
  }

  return false
}

/**
 * Helper: Flatten tree to array
 */
function flattenCategories(
  categories: HttpTypes.StoreProductCategory[]
): HttpTypes.StoreProductCategory[] {
  const result: HttpTypes.StoreProductCategory[] = []
  const traverse = (cats: HttpTypes.StoreProductCategory[]) => {
    for (const cat of cats) {
      result.push(cat)
      if (cat.category_children?.length) {
        traverse(cat.category_children)
      }
    }
  }
  traverse(categories)
  return result
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
 * 
 * OPTIMIZED: Instead of fetching all 1000 categories, we:
 * 1. Fetch only the target category with mpath
 * 2. Parse mpath to get parent category IDs
 * 3. Fetch only those specific parent categories
 * 
 * This reduces the query from 1000 categories to ~3-5 categories
 */
export const getCategoryHierarchy = async (categoryHandle: string): Promise<HttpTypes.StoreProductCategory[]> => {
  try {
    // Step 1: Fetch only the target category with mpath field
    const { product_categories: targetCategories } = await sdk.client.fetch<{
      product_categories: CategoryWithMpath[]
    }>("/store/product-categories", {
      query: {
        fields: "id, handle, name, rank, parent_category_id, mpath",
        handle: categoryHandle,
      },
      cache: "force-cache",
      next: { revalidate: 3600 }
    })

    const targetCategory = targetCategories?.[0]
    if (!targetCategory) {
      console.warn(`Target category with handle "${categoryHandle}" not found`)
      return []
    }

    // Step 2: Parse mpath to get parent category IDs
    // mpath format: "pcat_root.pcat_parent.pcat_current"
    const mpath = targetCategory.mpath || ''
    const categoryIds = mpath.split('.').filter(Boolean)
    
    // If no parent categories (root category), return just the target
    if (categoryIds.length <= 1) {
      return [targetCategory]
    }

    // Step 3: Fetch only the parent categories (exclude the target category itself)
    const parentIds = categoryIds.slice(0, -1) // Remove last ID (target category)
    
    if (parentIds.length === 0) {
      return [targetCategory]
    }

    const { product_categories: parentCategories } = await sdk.client.fetch<{
      product_categories: CategoryWithMpath[]
    }>("/store/product-categories", {
      query: {
        fields: "id, handle, name, rank, parent_category_id, mpath",
        id: parentIds,
      },
      cache: "force-cache",
      next: { revalidate: 3600 }
    })

    // Step 4: Build hierarchy in correct order (root to leaf)
    const hierarchy: CategoryWithMpath[] = []
    
    // Add parents in order based on mpath
    categoryIds.slice(0, -1).forEach((id: string) => {
      const parent = parentCategories.find(cat => cat.id === id)
      if (parent) {
        hierarchy.push(parent)
      }
    })
    
    // Add target category at the end
    hierarchy.push(targetCategory)

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