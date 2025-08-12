import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { getCategoryByHandle, listCategories } from "@/lib/data/categories"
import { Suspense } from "react"

import type { Metadata } from "next"
import { generateCategoryMetadata } from "@/lib/helpers/seo"
import { Breadcrumbs } from "@/components/atoms"
import { AlgoliaProductsListing, ProductListing } from "@/components/sections"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"
import Link from "next/link"

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

type Props = {
  params: Promise<{ category: string; locale: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params

  const cat = await getCategoryByHandle([category])
  
  // If category doesn't exist, return default metadata
  if (!cat) {
    return {
      title: `Category not found`,
      description: `Category not found - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      robots: "noindex",
    }
  }

  return generateCategoryMetadata(cat)
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

async function Category({
  params,
}: {
  params: Promise<{
    category: string
    locale: string
  }>
}) {
  const { category: handle, locale } = await params
  
  // Decode the URL-encoded handle
  const decodedHandle = decodeURIComponent(handle)
  
  // Fetch all categories with full tree structure (same as Header/Navbar)
  let allCategoriesWithTree: HttpTypes.StoreProductCategory[] = []
  
  try {
    // Use the SAME listCategories function that Header/Navbar uses for full tree structure
    const categoriesData = await listCategories()
    
    if (categoriesData && categoriesData.parentCategories) {
      // Combine parent categories (with full tree) and child categories for complete dataset
      allCategoriesWithTree = [...categoriesData.parentCategories, ...categoriesData.categories]
    }
  } catch (error) {
    console.error("Error retrieving categories with listCategories:", error)
    allCategoriesWithTree = []
  }
  
  // Try to fetch the specific category first
  let category: HttpTypes.StoreProductCategory | null = await getCategoryByHandle([handle])
  
  // If not found, try the direct approach
  if (!category) {
    
    // Try exact match on handle
    const exactHandleMatch = allCategoriesWithTree.find((cat: HttpTypes.StoreProductCategory) => 
      cat.handle?.toLowerCase() === decodedHandle.toLowerCase()
    )
    if (exactHandleMatch) {
      category = exactHandleMatch
    }
    
    // If not found, try matching on name
    if (!category) {
      const nameMatch = allCategoriesWithTree.find((cat: HttpTypes.StoreProductCategory) => 
        cat.name?.toLowerCase() === decodedHandle.toLowerCase()
      )
      if (nameMatch) {
        category = nameMatch
      }
    }
    
    // If still not found, try partial matching
    if (!category) {
      const partialMatch = allCategoriesWithTree.find((cat: HttpTypes.StoreProductCategory) => 
        cat.handle?.toLowerCase().includes(decodedHandle.toLowerCase()) ||
        cat.name?.toLowerCase().includes(decodedHandle.toLowerCase())
      )
      if (partialMatch) {
        category = partialMatch
      }
    }
  }

  // If category still doesn't exist, show a custom not found page
  if (!category) {
    console.error(`Category not found after all attempts: ${handle} / ${decodedHandle}`)
    return notFound()
  }

  // Get all descendant category IDs for product aggregation
  const categoryIds = getAllDescendantCategoryIds(category)

  // Build breadcrumb path
  const breadcrumbs = []
  let currentCategory: HttpTypes.StoreProductCategory | null = category
  
  // Build breadcrumbs by traversing up the parent chain
  while (currentCategory) {
    breadcrumbs.unshift({
      name: currentCategory.name,
      handle: currentCategory.handle,
      id: currentCategory.id
    })
    
    // Find parent category if exists
    if (currentCategory?.parent_category_id && allCategoriesWithTree) {
      const parentCategory = allCategoriesWithTree.find(cat => cat.id === currentCategory!.parent_category_id)
      currentCategory = parentCategory || null
    } else {
      currentCategory = null
    }
  }

  return (
    <main className="container">
    



      {/* Category Children Navigation (if any) */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          
        </div>
      )}

      <Suspense fallback={<ProductListingSkeleton />}>
        {!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
          <ProductListing category_id={category.id} showSidebar />
        ) : (
          <AlgoliaProductsListing 
            category_ids={categoryIds}
            locale={locale}
            categories={allCategoriesWithTree}
            currentCategory={category}
          />
        )}
      </Suspense>
    </main>
  )
}

export default Category