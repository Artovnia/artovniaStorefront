import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Suspense, lazy } from "react"
import { listCategoriesWithProducts } from "@/lib/data/categories"
import { HttpTypes } from "@medusajs/types"

// CRITICAL FIX: Ultra-aggressive code splitting to reduce 4.2 MB bundle
// Split heavy Algolia components into completely separate chunks
const AlgoliaProductsListing = lazy(() => 
  import("@/components/sections/ProductListing/AlgoliaProductsListing")
    .then(module => ({ default: module.AlgoliaProductsListing }))
)

const ProductListing = lazy(() => 
  import("@/components/sections/ProductListing/ProductListing")
    .then(module => ({ default: module.ProductListing }))
)

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

async function AllCategories({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Fetch only categories with products (same as Header/Navbar for consistency)
  let allCategoriesWithTree: HttpTypes.StoreProductCategory[] = []
  
  try {
    // Use listCategoriesWithProducts to show only populated categories in sidebar
    const categoriesData = await listCategoriesWithProducts()
    
    if (categoriesData && categoriesData.categories) {
      allCategoriesWithTree = categoriesData.categories
    }
  } catch (error) {
    console.error("Error retrieving categories with listCategories:", error)
    allCategoriesWithTree = []
  }

  const breadcrumbsItems = [
    {
      path: "/",
      label: "Wszystkie produkty",
    },
  ]

  return (
    <main className="mx-auto max-w-[1920px] pt-24 pb-24">
   

      <Suspense 
        fallback={
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <ProductListingSkeleton />
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Loading components...</span>
              </div>
            </div>
          </div>
        }
      >
        {!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
          <ProductListing showSidebar />
        ) : (
          <AlgoliaProductsListing 
            locale={locale}
            categories={allCategoriesWithTree}
          />
        )}
      </Suspense>
    </main>
  )
}

export default AllCategories