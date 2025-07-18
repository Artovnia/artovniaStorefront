import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Suspense } from "react"

import { Breadcrumbs } from "@/components/atoms"
import { AlgoliaProductsListing, ProductListing } from "@/components/sections"

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

async function AllCategories({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const breadcrumbsItems = [
    {
      path: "/",
      label: "Wszystkie produkty",
    },
  ]

  return (
    <main className="container">
      <div className="hidden md:block mb-2">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      <h1 className="heading-xl uppercase">Wszystkie produkty</h1>

      <Suspense fallback={<ProductListingSkeleton />}>
        {!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
          <ProductListing showSidebar />
        ) : (
          <AlgoliaProductsListing locale={locale} />
        )}
      </Suspense>
    </main>
  )
}

export default AllCategories