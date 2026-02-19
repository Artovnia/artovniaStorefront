import { HttpTypes } from "@medusajs/types"
import { getCategoryHierarchy } from "@/lib/data/categories"

export interface BreadcrumbItem {
  label: string
  path: string
}

// Extended product type that includes categories and collection
type ProductWithCategories = HttpTypes.StoreProduct & {
  categories?: HttpTypes.StoreProductCategory[]
  collection?: HttpTypes.StoreCollection
}

/**
 * Build breadcrumbs for a product based on its categories and collections
 * Returns array of breadcrumb items: [Home, Main Category, Subcategory, Sub-subcategory]
 */
export async function buildProductBreadcrumbs(
  product: ProductWithCategories,
  locale: string = 'pl'
): Promise<BreadcrumbItem[]> {
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with Home
  breadcrumbs.push({
    label: 'Strona główna',
    path: '/'
  })

  // Get the primary category (first category if multiple exist)
  const primaryCategory = product.categories?.[0]
  
  if (primaryCategory?.handle) {
    try {
      // Use the new getCategoryHierarchy function to get full hierarchy from backend
      const categoryHierarchy = await getCategoryHierarchy(primaryCategory.handle)
      
      // Add each category level to breadcrumbs
      categoryHierarchy.forEach(category => {
        breadcrumbs.push({
          label: category.name,
          path: `/categories/${category.handle}`
        })
      })
    } catch (error) {
      console.error('Error building category hierarchy for breadcrumbs:', error)
      // Fallback to just the primary category
      breadcrumbs.push({
        label: primaryCategory.name,
        path: `/categories/${primaryCategory.handle}`
      })
    }
  } 
  // No more collection fallback - we always want to use categories
  // If we don't have categories, we'll just show Home

  return breadcrumbs
}

/**
 * Build breadcrumbs locally from already-fetched product.categories data.
 * No network call — uses parent_category chain fetched by listProductsForDetail.
 * This replaces buildProductBreadcrumbs for the product detail page SSR path.
 */
export function buildProductBreadcrumbsLocal(
  product: ProductWithCategories,
  locale: string = 'pl'
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Strona główna', path: '/' }
  ]

  const primaryCategory = product.categories?.[0]
  if (!primaryCategory) return breadcrumbs

  // Walk the parent_category chain from the fetched data (no network call)
  const chain: Array<{ name: string; handle: string }> = []
  let current: any = primaryCategory
  while (current) {
    if (current.name && current.handle) {
      chain.unshift({ name: current.name, handle: current.handle })
    }
    current = current.parent_category || null
  }

  chain.forEach(cat => {
    breadcrumbs.push({ label: cat.name, path: `/categories/${cat.handle}` })
  })

  return breadcrumbs
}

/**
 * Build category hierarchy from a category, including all parent categories
 * Returns categories in order from root to leaf
 */
function buildCategoryHierarchy(category: HttpTypes.StoreProductCategory): HttpTypes.StoreProductCategory[] {
  const hierarchy: HttpTypes.StoreProductCategory[] = []
  
  // If category has parent_category, recursively build hierarchy
  if (category.parent_category) {
    const parentHierarchy = buildCategoryHierarchy(category.parent_category)
    hierarchy.push(...parentHierarchy)
  }
  
  // Add current category
  hierarchy.push(category)
  
  return hierarchy
}

/**
 * Alternative breadcrumb builder using collection as primary navigation
 * Useful when collections are the main navigation structure
 */
export function buildCollectionBreadcrumbs(
  product: ProductWithCategories,
  locale: string = 'pl'
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with Home
  breadcrumbs.push({
    label: 'Strona główna',
    path: '/'
  })

  // Use collection as primary navigation
  if (product.collection) {
    breadcrumbs.push({
      label: product.collection.title,
      path: `/collections/${product.collection.handle}`
    })

    // Add category as subcategory if available
    const primaryCategory = product.categories?.[0]
    if (primaryCategory) {
      breadcrumbs.push({
        label: primaryCategory.name,
        path: `/categories/${primaryCategory.handle}`
      })
    }
  } else if (product.categories?.[0]) {
    // Fallback to category-based breadcrumbs
    const categoryHierarchy = buildCategoryHierarchy(product.categories[0])
    categoryHierarchy.forEach(category => {
      breadcrumbs.push({
        label: category.name,
        path: `/categories/${category.handle}`
      })
    })
  }

  return breadcrumbs
}
