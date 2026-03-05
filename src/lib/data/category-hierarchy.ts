import { HttpTypes } from "@medusajs/types"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function fetchAllCategories(): Promise<CategoryWithMpath[]> {
  const url = new URL(`${BACKEND_URL}/store/product-categories`)
  url.searchParams.set("fields", "id, handle, name, rank, parent_category_id, mpath")
  url.searchParams.set("limit", "1000")

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-publishable-api-key": PUB_KEY,
    },
    next: { revalidate: 3600, tags: ["product-categories", "products", "promotions"] },
  })

  if (!response.ok) {
    throw new Error(`fetchAllCategories -> ${response.status}`)
  }

  const data = (await response.json()) as { product_categories?: CategoryWithMpath[] }
  return data.product_categories || []
}

interface CategoryWithMpath {
  id: string
  name: string
  handle?: string
  rank?: number
  parent_category_id?: string | null
  mpath?: string
  category_children?: CategoryWithMpath[]
}

/**
 * Extract categories from products and build full hierarchy trees
 * 
 * This function:
 * 1. Extracts category IDs from products
 * 2. Fetches category catalog once (cacheable public endpoint)
 * 3. Resolves ancestor chains in-memory via parent_category_id
 * 4. Builds complete category trees with full paths
 * 
 * Example: If product has "Subcategory C" (mpath: "root.parent.subcategory"),
 * it will return the full tree: Root → Parent → Subcategory C
 */
export async function extractCategoriesWithHierarchy(
  products: HttpTypes.StoreProduct[]
): Promise<CategoryWithMpath[]> {
  // Step 1: Extract unique category IDs from products
  const productCategoryIds = new Set<string>()
  
  products.forEach(product => {
    const productWithCategories = product as any
    productWithCategories.categories?.forEach((cat: any) => {
      if (cat?.id) {
        productCategoryIds.add(cat.id)
      }
    })
  })

  if (productCategoryIds.size === 0) {
    return []
  }

  try {
    // Step 2: Fetch category catalog once
    const allCategories = await fetchAllCategories()
    if (!allCategories.length) {
      return []
    }

    const categoryById = new Map<string, CategoryWithMpath>()
    allCategories.forEach((category) => {
      categoryById.set(category.id, category)
    })

    // Step 3: Walk parent chain for each category used by current products
    const relevantCategoryIds = new Set<string>()
    for (const categoryId of productCategoryIds) {
      let currentId: string | null | undefined = categoryId

      while (currentId) {
        if (relevantCategoryIds.has(currentId)) {
          break
        }

        relevantCategoryIds.add(currentId)
        const current = categoryById.get(currentId)
        currentId = current?.parent_category_id
      }
    }

    const relevantCategories = allCategories.filter((category) => relevantCategoryIds.has(category.id))
    if (!relevantCategories.length) {
      return []
    }

    // Step 4: Build category tree
    return buildCategoryTreeWithChildren(relevantCategories)
  } catch (error) {
    console.error('Error extracting categories with hierarchy:', error)
    return []
  }
}

/**
 * Build category tree from flat array with parent_category_id
 */
function buildCategoryTreeWithChildren(flatCategories: CategoryWithMpath[]): CategoryWithMpath[] {
  const categoryMap = new Map<string, CategoryWithMpath>()
  
  // Initialize all categories with empty children arrays
  flatCategories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      category_children: []
    })
  })
  
  const rootCategories: CategoryWithMpath[] = []
  
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
        if (!parent.category_children) {
          parent.category_children = []
        }
        parent.category_children.push(categoryWithChildren)
      } else {
        // Parent not found - treat as root
        rootCategories.push(categoryWithChildren)
      }
    }
  })
  
  // Sort categories by rank at all levels
  const sortByRank = (categories: CategoryWithMpath[]): CategoryWithMpath[] => {
    const sorted = categories.sort((a, b) => (a.rank || 0) - (b.rank || 0))
    sorted.forEach(cat => {
      if (cat.category_children && cat.category_children.length > 0) {
        cat.category_children = sortByRank(cat.category_children)
      }
    })
    return sorted
  }
  
  return sortByRank(rootCategories)
}
