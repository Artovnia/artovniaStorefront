import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { getCategoryByHandle } from "@/lib/data/categories"
import { Suspense } from "react"

import type { Metadata } from "next"
import { generateCategoryMetadata } from "@/lib/helpers/seo"
import { Breadcrumbs } from "@/components/atoms"
import { AlgoliaProductsListing, ProductListing } from "@/components/sections"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { sdk } from "@/lib/config"
import { HttpTypes } from "@medusajs/types"

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

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
  console.log(`Trying to find category. Raw handle: ${handle}, decoded: ${decodedHandle}`)
  
  // Define a function to directly fetch categories
  const fetchAllCategories = async (): Promise<HttpTypes.StoreProductCategory[]> => {
    try {
      const response = await sdk.client.fetch<{product_categories: HttpTypes.StoreProductCategory[]}>
        (`/store/product-categories`, {
          query: {
            limit: 100,
          },
          cache: "no-cache",
        });
      
      console.log(`Found ${response.product_categories.length} categories in total`)
      return response.product_categories;
    } catch (error) {
      console.error('Error fetching all categories:', error)
      return []
    }
  }
  
  // Try to fetch the specific category first
  let category: HttpTypes.StoreProductCategory | null = await getCategoryByHandle([handle])
  
  // If not found, try the direct approach
  if (!category) {
    console.log('Category not found with normal approach, trying direct search...')
    const allCategories = await fetchAllCategories()
    
    // Try exact match on handle
    const exactHandleMatch = allCategories.find((cat: HttpTypes.StoreProductCategory) => 
      cat.handle?.toLowerCase() === decodedHandle.toLowerCase()
    )
    if (exactHandleMatch) {
      category = exactHandleMatch
    }
    
    // If not found, try matching on name
    if (!category) {
      const nameMatch = allCategories.find((cat: HttpTypes.StoreProductCategory) => 
        cat.name?.toLowerCase() === decodedHandle.toLowerCase()
      )
      if (nameMatch) {
        category = nameMatch
      }
    }
    
    // If still not found, try partial matching
    if (!category) {
      const partialMatch = allCategories.find((cat: HttpTypes.StoreProductCategory) => 
        cat.handle?.toLowerCase().includes(decodedHandle.toLowerCase()) ||
        cat.name?.toLowerCase().includes(decodedHandle.toLowerCase())
      )
      if (partialMatch) {
        category = partialMatch
      }
    }
    
    if (category) {
      console.log(`Found category by direct search: ${category.name} (${category.handle})`)
    }
  }

  // If category still doesn't exist, show a custom not found page
  if (!category) {
    console.error(`Category not found after all attempts: ${handle} / ${decodedHandle}`)
    console.log('Available handles:', (await fetchAllCategories())
      .map((c: HttpTypes.StoreProductCategory) => `${c.name} (${c.handle})`)
      .join(', ')
    )
    return notFound()
  }

  const breadcrumbsItems = [
    {
      path: category.handle,
      label: category.name,
    },
  ]

  return (
    <main className="container">
      <div className="hidden md:block mb-2">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      <h1 className="heading-xl uppercase">{category.name}</h1>

      <Suspense fallback={<ProductListingSkeleton />}>
        {!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
          <ProductListing category_id={category.id} showSidebar />
        ) : (
          <AlgoliaProductsListing category_id={category.id} locale={locale} />
        )}
      </Suspense>
    </main>
  )
}

export default Category