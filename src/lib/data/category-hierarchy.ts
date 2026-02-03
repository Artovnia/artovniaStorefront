import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"

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
 * 2. Fetches those categories with mpath
 * 3. Parses mpath to get all ancestor category IDs
 * 4. Fetches all ancestor categories
 * 5. Builds complete category trees with full paths
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
    // Step 2: Fetch the product categories with mpath
    const { product_categories: productCategories } = await sdk.client.fetch<{
      product_categories: CategoryWithMpath[]
    }>("/store/product-categories", {
      query: {
        fields: "id, handle, name, rank, parent_category_id, mpath",
        id: Array.from(productCategoryIds),
      },
      cache: "force-cache",
      next: { revalidate: 3600 }
    })

    if (!productCategories || productCategories.length === 0) {
      return []
    }

    // Step 3: Parse mpath to get all ancestor category IDs
    const allCategoryIds = new Set<string>()
    
    productCategories.forEach(cat => {
      if (cat.mpath) {
        // mpath format: "pcat_root.pcat_parent.pcat_current"
        const pathIds = cat.mpath.split('.').filter(Boolean)
        pathIds.forEach(id => allCategoryIds.add(id))
      } else {
        // If no mpath, just add the category itself
        allCategoryIds.add(cat.id)
      }
    })

    // Step 4: Fetch ALL categories (including ancestors)
    const { product_categories: allCategories } = await sdk.client.fetch<{
      product_categories: CategoryWithMpath[]
    }>("/store/product-categories", {
      query: {
        fields: "id, handle, name, rank, parent_category_id, mpath",
        id: Array.from(allCategoryIds),
      },
      cache: "force-cache",
      next: { revalidate: 3600 }
    })

    if (!allCategories || allCategories.length === 0) {
      return []
    }

    // Step 5: Build category tree
    return buildCategoryTreeWithChildren(allCategories)
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
