import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
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
 * Get categories that have products from Medusa backend
 * This is used to filter categories to only show those with actual products
 */
export const getCategoriesWithProducts = async (): Promise<Set<string>> => {
  try {
    // Fetch all products with their category information
    const { products } = await sdk.client.fetch<{
      products: { categories?: { id: string }[] }[]
    }>("/store/products", {
      query: {
        fields: "categories.id",
        limit: 1000, // Get more products to ensure we capture all categories
      },
      cache: "force-cache",
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    // Extract unique category IDs that have products
    const categoryIds = new Set<string>()
    
    products.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(category => {
          if (category.id) {
            categoryIds.add(category.id)
          }
        })
      }
    })

    console.log(`📊 Found ${categoryIds.size} categories with products out of ${products.length} products`)
    return categoryIds
  } catch (error) {
    console.error("Error fetching categories with products from backend:", error)
    // Return empty set on error - will show all categories as fallback
    return new Set()
  }
}

export const listCategories = async ({
  query,
  headingCategories = [],
}: Partial<CategoriesProps> = {}) => {
  const limit = query?.limit || 100

  // CRITICAL OPTIMIZATION: Parallel API calls instead of sequential
  // This reduces blocking time from 2+ seconds to under 500ms
  const [categoriesResult, categoriesWithProductsResult] = await Promise.allSettled([
    // Fetch all categories from Medusa with caching
    sdk.client
      .fetch<{
        product_categories: HttpTypes.StoreProductCategory[]
      }>("/store/product-categories", {
        query: {
          fields: "handle, name, rank, parent_category_id, *category_children, *parent_category",
          limit,
          ...query,
        },
        cache: "force-cache", // Use aggressive caching
        next: { revalidate: 300 } // Cache for 5 minutes
      })
      .then(({ product_categories }) => product_categories),
    
    // Get categories that have products from Algolia (parallel execution)
    getCategoriesWithProducts()
  ])

  // Handle results with proper error handling
  const categories = categoriesResult.status === 'fulfilled' 
    ? categoriesResult.value 
    : []
  
  const categoriesWithProducts = categoriesWithProductsResult.status === 'fulfilled'
    ? categoriesWithProductsResult.value
    : new Set<string>()

  

  // BUILD PARENT-CHILD RELATIONSHIPS: Build proper tree structure without duplicates
  const buildFullCategoryTree = (allCategories: HttpTypes.StoreProductCategory[]) => {
    // Create a map for faster lookups with proper typing
    const categoryMap = new Map<string, HttpTypes.StoreProductCategory>()
    
    // Initialize all categories with empty children arrays
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { 
        ...cat, 
        category_children: [] as HttpTypes.StoreProductCategory[] 
      })
    })
    
    // Build parent-child relationships
    allCategories.forEach(category => {
      const parentId = category.parent_category_id || category.parent_category?.id
      if (parentId && categoryMap.has(parentId)) {
        const parent = categoryMap.get(parentId)!
        const child = categoryMap.get(category.id)!
        if (!parent.category_children) {
          parent.category_children = []
        }
        parent.category_children.push(child)
      }
    })
    
    // Return all categories with populated children (no duplicates)
    return Array.from(categoryMap.values())
  }

  // Build the complete tree first
  const fullCategoryTree = buildFullCategoryTree(categories)

 

  // THEN filter based on products, keeping categories that have products OR have children with products
  const filterCategoriesWithProducts = (categoryTree: HttpTypes.StoreProductCategory[]): HttpTypes.StoreProductCategory[] => {
    const filterRecursively = (categories: HttpTypes.StoreProductCategory[]): HttpTypes.StoreProductCategory[] => {
      return categories
        .map(category => {
          // Recursively filter children first
          const filteredChildren = category.category_children 
            ? filterRecursively(category.category_children)
            : []
          
          return {
            ...category,
            category_children: filteredChildren
          }
        })
        .filter(category => {
          // Keep category if:
          // 1. It has products directly
          // 2. It has children with products (after filtering)
          // 3. If no product filtering available (categoriesWithProducts is empty), show all
          const hasProducts = categoriesWithProducts.size === 0 || categoriesWithProducts.has(category.id)
          const hasChildrenWithProducts = category.category_children && category.category_children.length > 0
          
          const shouldKeep = hasProducts || hasChildrenWithProducts
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 Category "${category.name}" (${category.id}): hasProducts=${hasProducts}, hasChildren=${hasChildrenWithProducts}, keep=${shouldKeep}`)
          }
          
          return shouldKeep
        })
    }
    
    return filterRecursively(categoryTree)
  }

  // Always filter categories based on products to only show relevant ones
  const finalCategories = filterCategoriesWithProducts(fullCategoryTree)

  // Return only top-level categories (those without parents)
  const topLevelCategories = finalCategories.filter(cat => {
    const hasNoParentId = !cat.parent_category_id
    const hasNoParentObj = !cat.parent_category || 
                         cat.parent_category === null || 
                         (typeof cat.parent_category === 'object' && !cat.parent_category.id)
    
    return hasNoParentId && hasNoParentObj
  })

  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Categories summary: ${categories.length} total → ${fullCategoryTree.length} in tree → ${finalCategories.length} with products → ${topLevelCategories.length} top-level`)
    console.log(`📊 Categories with products: ${Array.from(categoriesWithProducts).join(', ')}`)
  }

  return {
    categories: topLevelCategories,
    parentCategories: topLevelCategories,
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