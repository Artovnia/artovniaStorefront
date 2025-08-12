import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import { getCategoryByHandle, listCategories } from "@/lib/data/categories"
import { getRegion } from "@/lib/data/regions"
import { AlgoliaProductsListing } from "@/components/sections/ProductListing/AlgoliaProductsListing"

type Props = {
  params: { category: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categoryHandle } = params

  try {
    const category = await getCategoryByHandle([categoryHandle])

    if (!category) {
      return {
        title: "Category not found",
        description: "The requested category could not be found.",
      }
    }

    return {
      title: `${category.name} | Artovnia`,
      description: `Browse ${category.name} products at Artovnia`,
    }
  } catch (error) {
    return {
      title: "Category | Artovnia",
      description: "Browse our product categories",
    }
  }
}

// Helper function to get all descendant category IDs recursively
function getAllDescendantCategoryIds(category: HttpTypes.StoreProductCategory): string[] {
  const categoryIds = [category.id]
  
  if (category.category_children && category.category_children.length > 0) {
    for (const child of category.category_children) {
      categoryIds.push(...getAllDescendantCategoryIds(child))
    }
  }
  
  return categoryIds
}

export default async function CategoryPage({ params }: Props) {
  const { category: categoryHandle, locale } = params

  try {
    // Get the specific category
    const category = await getCategoryByHandle([categoryHandle])
    
    if (!category) {
      console.error(`🏷️ Category page: Category not found for handle: ${categoryHandle}`)
      notFound()
    }

    // Get all categories to build the full tree for breadcrumbs and navigation
    const { categories: allCategories } = await listCategories()
    
    // Find the category with full tree structure
    const categoryWithTree = allCategories?.find(cat => cat.handle === categoryHandle)
    
    if (!categoryWithTree) {
      console.error(`🏷️ Category page: Category with tree not found for handle: ${categoryHandle}`)
      // Fallback to the basic category if tree version not found
    }

    const finalCategory = categoryWithTree || category

    // Get all descendant category IDs for product aggregation
    const categoryIds = getAllDescendantCategoryIds(finalCategory)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏷️ Category page: Category "${finalCategory.name}" (${finalCategory.id})`)
      console.log(`🏷️ Category page: Has ${finalCategory.category_children?.length || 0} direct children`)
      console.log(`🏷️ Category page: Aggregating products from ${categoryIds.length} total categories:`, categoryIds)
    }

    // Get region for any region-specific logic
    const region = await getRegion("us")

    // Build breadcrumb path
    const breadcrumbs = []
    let currentCategory: HttpTypes.StoreProductCategory | null = finalCategory
    
    // Build breadcrumbs by traversing up the parent chain
    while (currentCategory) {
      breadcrumbs.unshift({
        name: currentCategory.name,
        handle: currentCategory.handle,
        id: currentCategory.id
      })
      
      // Find parent category if exists
      if (currentCategory?.parent_category_id && allCategories) {
        const parentCategory = allCategories.find(cat => cat.id === currentCategory!.parent_category_id)
        currentCategory = parentCategory || null
      } else {
        currentCategory = null
      }
    }

    return (
      <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
        <div className="flex flex-col gap-8 w-full">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center space-x-2 text-sm text-ui-fg-muted">
              <a href="/" className="hover:text-ui-fg-base">
                Strona główna
              </a>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center space-x-2">
                  <span>/</span>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-ui-fg-base font-medium">{crumb.name}</span>
                  ) : (
                    <a 
                      href={`/categories/${crumb.handle}`}
                      className="hover:text-ui-fg-base"
                    >
                      {crumb.name}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Category Header */}
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl-regular">{finalCategory.name}</h1>
            {finalCategory.description && (
              <p className="text-base-regular text-ui-fg-subtle">
                {finalCategory.description}
              </p>
            )}
          </div>

          {/* Category Children Navigation (if any) */}
          {finalCategory.category_children && finalCategory.category_children.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Podkategorie</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {finalCategory.category_children.map((child) => (
                  <a
                    key={child.id}
                    href={`/categories/${child.handle}`}
                    className="flex flex-col gap-2 p-4 border border-ui-border-base rounded-lg hover:shadow-elevation-card-rest transition-shadow"
                  >
                    <h3 className="text-base font-medium">{child.name}</h3>
                    {child.description && (
                      <p className="text-sm text-ui-fg-subtle line-clamp-2">
                        {child.description}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Products Listing */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-medium">Produkty</h2>
            <AlgoliaProductsListing
              category_ids={categoryIds}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("🏷️ Category page: Error loading category:", error)
    notFound()
  }
}