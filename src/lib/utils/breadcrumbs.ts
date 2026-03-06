import { HttpTypes } from "@medusajs/types"
import { getCategoryHierarchy } from "@/lib/data/categories"

export interface BreadcrumbItem {
  label: string
  path: string
  isHome?: boolean
}

type CategoryLike = {
  name?: string
  handle?: string
  parent_category_id?: string | null
  parent_category?: CategoryLike | null
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
  const localBreadcrumbs = buildProductBreadcrumbsLocal(product, locale)
  const primaryCategory = product.categories?.[0] as CategoryLike | undefined

  // Fast path: no category or local parent chain is complete.
  if (!primaryCategory?.handle || isLocalCategoryChainComplete(primaryCategory)) {
    return localBreadcrumbs
  }

  // Slow-path fallback: local chain is incomplete (missing some ancestor parent relation).
  try {
    const hierarchy = await getCategoryHierarchy({
      id: (primaryCategory as any).id,
      handle: primaryCategory.handle,
    })

    if (!hierarchy.length) {
      return localBreadcrumbs
    }

    return [
      { label: 'Strona główna', path: '/', isHome: true },
      ...hierarchy.map((category) => ({
        label: category.name,
        path: `/categories/${category.handle}`,
      })),
    ]
  } catch (error) {
    console.error('Error building category hierarchy for breadcrumbs:', error)
    return localBreadcrumbs
  }
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
    { label: 'Strona główna', path: '/', isHome: true }
  ]

  const primaryCategory = product.categories?.[0]
  if (!primaryCategory) return breadcrumbs

  // Walk the parent_category chain from the fetched data (no network call)
  const chain = extractCategoryChain(primaryCategory as CategoryLike)

  chain.forEach(cat => {
    breadcrumbs.push({ label: cat.name, path: `/categories/${cat.handle}` })
  })

  return breadcrumbs
}

function extractCategoryChain(
  category: CategoryLike | null | undefined
): Array<{ name: string; handle: string }> {
  const chain: Array<{ name: string; handle: string }> = []
  let current = category || null

  while (current) {
    if (current.name && current.handle) {
      chain.unshift({ name: current.name, handle: current.handle })
    }

    current = current.parent_category || null
  }

  return chain
}

function isLocalCategoryChainComplete(category: CategoryLike): boolean {
  let current: CategoryLike | null = category
  let guard = 0

  while (current && guard < 20) {
    if (current.parent_category_id && !current.parent_category) {
      return false
    }

    current = current.parent_category || null
    guard += 1
  }

  return true
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
    path: '/',
    isHome: true
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
