import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Suspense } from "react"
import { listCategoriesWithProducts } from "@/lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import { isServerSideBot } from "@/lib/utils/server-bot-detection"
import { SmartProductsListing } from "@/components/sections/ProductListing/SmartProductsListing"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"

async function AllCategories({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Server-side bot detection to prevent Algolia queries for bots
  const serverSideIsBot = await isServerSideBot()

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
    <PromotionDataProvider countryCode="PL" limit={50}>
      <BatchPriceProvider currencyCode="PLN">
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
            <SmartProductsListing 
              locale={locale}
              categories={allCategoriesWithTree}
              serverSideIsBot={serverSideIsBot}
            />
          </Suspense>
        </main>
      </BatchPriceProvider>
    </PromotionDataProvider>
  )
}

export default AllCategories