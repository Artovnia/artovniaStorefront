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
    // Fetch ALL categories from Medusa - increase limit to ensure we get everything
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        fields: "handle, name, rank, parent_category_id, mpath, *category_children, *parent_category",
        limit: query?.limit || 1000, // CRITICAL: Increased from 100 to 1000 to get all categories
        ...query,
      }
    })

    console.log(`🏠 listCategories: Fetched ${product_categories?.length || 0} categories from Medusa`)
    
    // DEBUG: Log first few categories and check if "Obrazy" is included
    if (product_categories && product_categories.length > 0) {
      console.log(`🏠 listCategories: First 5 categories:`, product_categories.slice(0, 5).map(cat => `"${cat.name}" (${cat.id})`))
      
      // Specifically check for "Obrazy" category
      const obrazyCategory = product_categories.find(cat => cat.id === 'pcat_01K19H5PKKZ6YPV7FTTPM9FGMA' || cat.handle === 'obrazy')
      if (obrazyCategory) {
        console.log(`🏠 listCategories: ✅ Found "Obrazy" category: "${obrazyCategory.name}" (${obrazyCategory.id}) handle: ${obrazyCategory.handle}`)
      } else {
        console.log(`🏠 listCategories: ❌ "Obrazy" category NOT FOUND in Medusa categories!`)
        console.log(`🏠 listCategories: Looking for ID: pcat_01K19H5PKKZ6YPV7FTTPM9FGMA or handle: obrazy`)
        console.log(`🏠 listCategories: Available category IDs:`, product_categories.slice(0, 10).map(cat => cat.id))
      }
    }

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
    // ENHANCED: More robust category filtering that preserves complete trees
    let filteredCategories: HttpTypes.StoreProductCategory[]
    
    if (categoriesWithProducts.size === 0) {
      console.log(`🏠 listCategories: No categories with products found in Algolia - showing ALL categories as fallback`)
      filteredCategories = product_categories
    } else {
      console.log(`🏠 listCategories: Filtering categories based on Algolia data`)
      
      // ENHANCED: Build complete category trees - include all ancestors and descendants
      const categoriesToInclude = new Set<string>()
      
      // Step 1: Add all categories that have products
      product_categories.forEach(category => {
        if (categoriesWithProducts.has(category.id)) {
          categoriesToInclude.add(category.id)
          console.log(`🏠 listCategories: ✅ Including category "${category.name}" (${category.id}) - has products`)
        }
      })
      
      // Step 2: Add all ancestors (parents) of categories with products
      product_categories.forEach(category => {
        if (categoriesWithProducts.has(category.id)) {
          // Use mpath for complete hierarchy if available
          const mpath = (category as any).mpath
          if (mpath && typeof mpath === 'string') {
            const pathIds = mpath.split('.').filter(id => id && id.trim() !== '')
            pathIds.forEach(pathId => {
              if (pathId && pathId !== category.id) {
                const parentCategory = product_categories.find(cat => cat.id === pathId)
                if (parentCategory) {
                  categoriesToInclude.add(pathId)
                  console.log(`🏠 listCategories: ✅ Including parent "${parentCategory.name}" (${pathId}) - ancestor of product category`)
                }
              }
            })
          } else {
            // Fallback: traverse parent_category_id chain
            let currentCategory = category
            const visitedIds = new Set<string>()
            
            while (currentCategory?.parent_category_id && !visitedIds.has(currentCategory.parent_category_id)) {
              visitedIds.add(currentCategory.parent_category_id)
              const parentId = currentCategory.parent_category_id
              const parentCategory = product_categories.find(cat => cat.id === parentId)
              
              if (parentCategory) {
                categoriesToInclude.add(parentId)
                console.log(`🏠 listCategories: ✅ Including parent "${parentCategory.name}" (${parentId}) - ancestor chain`)
                currentCategory = parentCategory
              } else {
                break
              }
            }
          }
        }
      })
      
      // Step 3: Add all descendants (children) of included categories to preserve tree structure
      const addDescendants = (categoryId: string) => {
        product_categories.forEach(category => {
          if (category.parent_category_id === categoryId && !categoriesToInclude.has(category.id)) {
            categoriesToInclude.add(category.id)
            console.log(`🏠 listCategories: ✅ Including child "${category.name}" (${category.id}) - descendant of included category`)
            // Recursively add children of this child
            addDescendants(category.id)
          }
        })
      }
      
      // Apply descendant inclusion for all currently included categories
      const currentlyIncluded = Array.from(categoriesToInclude)
      currentlyIncluded.forEach(categoryId => {
        addDescendants(categoryId)
      })
      
      // Filter to only include categories in the inclusion set
      filteredCategories = product_categories.filter(category => {
        const shouldInclude = categoriesToInclude.has(category.id)
        if (!shouldInclude && process.env.NODE_ENV === 'development') {
          console.log(`🏠 listCategories: ❌ Excluding "${category.name}" (${category.id}) - not in product tree`)
        }
        return shouldInclude
      })
      
      console.log(`🏠 listCategories: After enhanced filtering: ${filteredCategories.length} categories (from ${product_categories.length} total)`)
    }

    // The UI expects children to be nested in category_children arrays
    console.log(`🏠 listCategories: Reconstructing hierarchical tree from ${filteredCategories.length} flat categories`)
    
    // Create a map for quick lookup with proper typing
    const categoryMap = new Map(filteredCategories.map(cat => [cat.id, { 
      ...cat, 
      category_children: [] as HttpTypes.StoreProductCategory[] 
    }]))
    
    // Build the tree structure
    const hierarchicalCategories: HttpTypes.StoreProductCategory[] = []
    
    filteredCategories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (!category.parent_category_id) {
        // This is a root category
        hierarchicalCategories.push(categoryWithChildren)
        console.log(`🏠 listCategories: Added root category "${category.name}" (${category.id})`)
      } else {
        // This is a child category - add it to its parent's children array
        const parent = categoryMap.get(category.parent_category_id)
        if (parent) {
          parent.category_children = parent.category_children || []
          parent.category_children.push(categoryWithChildren)
          console.log(`🏠 listCategories: Added child category "${category.name}" (${category.id}) to parent "${parent.name}" (${parent.id})`)
        } else {
          // Parent not in filtered list - this shouldn't happen with mpath logic, but add as root as fallback
          hierarchicalCategories.push(categoryWithChildren)
          console.log(`🏠 listCategories: ⚠️ Parent not found for "${category.name}" (${category.id}), adding as root`)
        }
      }
    })

    // Sort categories by rank for consistent display
    const sortByRank = (categories: HttpTypes.StoreProductCategory[]) => {
      return categories.sort((a, b) => (a.rank || 0) - (b.rank || 0))
    }
    
    // Recursively sort all levels
    const sortCategoriesRecursively = (categories: HttpTypes.StoreProductCategory[]) => {
      const sorted = sortByRank(categories)
      sorted.forEach(category => {
        if (category.category_children && category.category_children.length > 0) {
          category.category_children = sortCategoriesRecursively(category.category_children)
        }
      })
      return sorted
    }
    
    const sortedHierarchicalCategories = sortCategoriesRecursively(hierarchicalCategories)
    
    console.log(`🏠 listCategories: Final hierarchical result - ${sortedHierarchicalCategories.length} root categories`)
    sortedHierarchicalCategories.forEach(cat => {
      const childCount = cat.category_children?.length || 0
      console.log(`🏠 listCategories: Root: "${cat.name}" (${cat.id}) with ${childCount} children`)
      if (childCount > 0) {
        cat.category_children?.forEach(child => {
          const grandChildCount = child.category_children?.length || 0
          console.log(`🏠 listCategories:   Child: "${child.name}" (${child.id}) with ${grandChildCount} grandchildren`)
          if (grandChildCount > 0) {
            child.category_children?.forEach(grandChild => {
              console.log(`🏠 listCategories:     GrandChild: "${grandChild.name}" (${grandChild.id})`)
            })
          }
        })
      }
    })

    return {
      categories: sortedHierarchicalCategories, // Now returns hierarchical structure
      parentCategories: sortedHierarchicalCategories, // Same as categories since they're already top-level
      count: filteredCategories.length // Total count of all categories (flat)
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