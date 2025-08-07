import { HttpTypes } from "@medusajs/types"

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
export function buildProductBreadcrumbs(
  product: ProductWithCategories,
  locale: string = 'pl'
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with Home
  breadcrumbs.push({
    label: 'Strona główna',
    path: '/'
  })

  // Get the primary category (first category if multiple exist)
  const primaryCategory = product.categories?.[0]
  
  if (primaryCategory) {
    // Build category hierarchy by traversing parent categories
    const categoryHierarchy = buildCategoryHierarchy(primaryCategory)
    
    // Add each category level to breadcrumbs
    categoryHierarchy.forEach(category => {
      breadcrumbs.push({
        label: category.name,
        path: `/categories/${category.handle}`
      })
    })
  } else if (product.collection) {
    // If no categories but has collection, use collection as fallback
    breadcrumbs.push({
      label: product.collection.title,
      path: `/collections/${product.collection.handle}`
    })
  }

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
