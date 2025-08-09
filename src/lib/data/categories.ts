import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import { liteClient as algoliasearch } from "algoliasearch/lite"
import { globalDeduplicator } from "@/lib/utils/performance"

interface CategoriesProps {
  query?: Record<string, any>
  headingCategories?: string[]
}

/**
 * Get categories that have products from Algolia index
 * This is required by PayU - only categories with products should be shown
 * OPTIMIZED: Uses request deduplication and caching
 */
const getCategoriesWithProducts = async (): Promise<Set<string>> => {
  return globalDeduplicator.dedupe(
    'categories-with-products',
    async () => {
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
    },
    { useCache: true } // Cache for 5 minutes
  )
}

export const listCategories = async ({
  query,
  headingCategories = [],
}: Partial<CategoriesProps> = {}) => {
  const limit = query?.limit || 100

  // CRITICAL OPTIMIZATION: Parallel API calls instead of sequential
  // This reduces blocking time from 2+ seconds to under 500ms
  const [categoriesResult, categoriesWithProductsResult] = await Promise.allSettled([
    // Fetch all categories from Medusa with aggressive caching
    globalDeduplicator.dedupe(
      `categories-medusa-${limit}-${JSON.stringify(query)}`,
      () => sdk.client
        .fetch<{
          product_categories: HttpTypes.StoreProductCategory[]
        }>("/store/product-categories", {
          query: {
            fields: "handle, name, rank, parent_category_id, *category_children, *parent_category",
            limit,
            ...query,
          },
          cache: "force-cache", // CHANGED: Use aggressive caching instead of no-cache
          next: { revalidate: 300 } // Cache for 5 minutes
        })
        .then(({ product_categories }) => product_categories),
      { useCache: true }
    ),
    
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

  // Log performance info in development
  if (process.env.NODE_ENV === 'development') {
    
    
    // Debug: Log all categories with their parent info
    
  }

  // BUILD PARENT-CHILD RELATIONSHIPS: First build the FULL recursive tree from ALL categories
  const buildFullCategoryTree = (allCategories: HttpTypes.StoreProductCategory[]) => {
    // Helper function to recursively build children
    const buildChildren = (parentId: string): HttpTypes.StoreProductCategory[] => {
      const children = allCategories.filter(category => 
        category.parent_category_id === parentId || category.parent_category?.id === parentId
      )
      
      return children.map(child => ({
        ...child,
        category_children: buildChildren(child.id) // Recursively build ALL children
      }))
    }

    // Build the complete tree for all categories
    return allCategories.map(category => ({
      ...category,
      category_children: buildChildren(category.id)
    }))
  }

  // Build the complete tree first
  const fullCategoryTree = buildFullCategoryTree(categories)

 

  // THEN filter based on products, keeping categories that have products OR have children with products
  const filterCategoriesWithProducts = (categoryTree: HttpTypes.StoreProductCategory[]): HttpTypes.StoreProductCategory[] => {
    return categoryTree
      .map(category => {
        // Recursively filter children first
        const filteredChildren = category.category_children 
          ? filterCategoriesWithProducts(category.category_children)
          : []
        
        return {
          ...category,
          category_children: filteredChildren
        }
      })
      .filter(category => {
        // Keep categories that either:
        // 1. Have products directly, OR
        // 2. Have children with products (after filtering), OR  
        // 3. No product filtering is active
        return categoriesWithProducts.size === 0 || 
               categoriesWithProducts.has(category.id) || 
               (category.category_children && category.category_children.length > 0)
      })
  }

  const categoriesWithFilteredChildren = categoriesWithProducts.size > 0 
    ? filterCategoriesWithProducts(fullCategoryTree)
    : fullCategoryTree

 

  // DYNAMIC PARENT DETECTION: Find actual top-level categories (no parent_category_id)
  // If headingCategories is provided, use it as a filter, otherwise show all top-level categories
  const topLevelCategories = categoriesWithFilteredChildren.filter(category => {
    // Check both parent_category_id field and parent_category object for robust detection
    const hasNoParentId = !category.parent_category_id || category.parent_category_id === null
    const hasNoParentObj = !category.parent_category || 
                          category.parent_category === null || 
                          category.parent_category === undefined ||
                          (typeof category.parent_category === 'object' && !category.parent_category.id)
    
    const isTopLevel = hasNoParentId && hasNoParentObj
    
    
    
    return isTopLevel
  })

  // FALLBACK: If no top-level categories found using parent_category, 
  // use categories that have children but aren't children themselves
  let fallbackParentCategories: HttpTypes.StoreProductCategory[] = []
  if (topLevelCategories.length === 0) {
    console.warn('⚠️ No top-level categories found using parent_category field. Using fallback detection.')
    
    // Build a set of all category IDs that are children
    const childCategoryIds = new Set<string>()
    categoriesWithFilteredChildren.forEach(category => {
      category.category_children?.forEach(child => {
        childCategoryIds.add(child.id)
      })
    })
    
    // Categories that have children but are not children themselves are likely parents
    fallbackParentCategories = categoriesWithFilteredChildren.filter(category => 
      category.category_children && 
      category.category_children.length > 0 && 
      !childCategoryIds.has(category.id)
    )
    
    
  }

  const finalTopLevelCategories = topLevelCategories.length > 0 ? topLevelCategories : fallbackParentCategories

  let parentCategories: HttpTypes.StoreProductCategory[]
  if (headingCategories.length > 0) {
    // Filter top-level categories by headingCategories if provided
    const headingCategoriesSet = new Set(headingCategories.map(name => name.toLowerCase()))
    parentCategories = finalTopLevelCategories.filter(({ name }) =>
      headingCategoriesSet.has(name.toLowerCase())
    )
  } else {
    // Show all top-level categories if no filter provided
    parentCategories = finalTopLevelCategories
  }

  // CHILD CATEGORIES: Categories that have a parent_category_id
  const childrenCategories = categoriesWithFilteredChildren.filter(category => {
    // Check both parent_category_id field and parent_category object for robust detection
    const hasParentId = category.parent_category_id && category.parent_category_id !== null
    const hasParentObj = category.parent_category && 
                        category.parent_category !== null && 
                        category.parent_category !== undefined &&
                        (typeof category.parent_category === 'object' && category.parent_category.id)
    
    const hasParent = hasParentId || hasParentObj
    
    
    
    return hasParent
  })

  

  return {
    categories: childrenCategories,
    parentCategories: parentCategories,
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

    

    // Prevent infinite loops with a visited set
    const visitedIds = new Set<string>()

    while (currentCategory && !visitedIds.has(currentCategory.id)) {
      visitedIds.add(currentCategory.id)
      hierarchy.unshift(currentCategory) // Add to beginning to build root-to-leaf path
      
      
      
      // Find parent category using parent_category_id field
      if (currentCategory.parent_category_id) {
        const parentId: string = currentCategory.parent_category_id
        currentCategory = product_categories.find(cat => cat.id === parentId) || null
        
        if (!currentCategory && process.env.NODE_ENV === 'development') {
          console.warn(`  ⚠️ Parent category with ID ${parentId} not found in fetched categories`)
        }
      } else {
        // No parent_category_id means this is a root category
        currentCategory = null
      }
    }

    

    return hierarchy
  } catch (error) {
    console.error('Error building category hierarchy:', error)
    return []
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