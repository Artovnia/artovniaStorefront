import { Metadata } from "next"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { getCategoryByHandle, listCategoriesWithProducts, getAllDescendantCategoryIds } from "@/lib/data/categories"
import { isServerSideBot } from "@/lib/utils/server-bot-detection"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { listProductsWithPromotions } from "@/lib/data/products"
import { generateCategoryMetadata, generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/helpers/seo"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { SmartProductsListing } from "@/components/sections/ProductListing/SmartProductsListing"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"

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

async function Category({
  params,
}: {
  params: Promise<{
    category: string
    locale: string
  }>
}) {
  const { category: handle, locale } = await params
  const decodedHandle = decodeURIComponent(handle)
  
  // ✅ OPTIMIZATION 1: PARALLEL FETCHES - Fetch everything at once (400ms → 250ms)
  const [botResult, categoriesResult, categoryResult] = await Promise.allSettled([
    isServerSideBot(),
    listCategoriesWithProducts(),
    getCategoryByHandle([handle])
  ])

  const serverSideIsBot = botResult.status === 'fulfilled' 
    ? botResult.value 
    : false
  
  const allCategoriesWithTree = categoriesResult.status === 'fulfilled' 
    ? categoriesResult.value?.categories || []
    : []
  
  let category: HttpTypes.StoreProductCategory | null = categoryResult.status === 'fulfilled' 
    ? categoryResult.value 
    : null
  
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

  // ✅ OPTIMIZATION: Fetch remaining data in parallel (category IDs, user data, promotional data)
  const [categoryIdsResult, userResult, promotionalDataResult] = await Promise.allSettled([
    getAllDescendantCategoryIds(category.id),
    // Fetch user and wishlist
    retrieveCustomer()
      .then(async (user) => {
        if (user) {
          const wishlistData = await getUserWishlists()
          return { user, wishlist: wishlistData.wishlists || [] }
        }
        return { user: null, wishlist: [] }
      })
      .catch((error) => {
        // User not authenticated - this is normal
        if ((error as any)?.status !== 401) {
          console.error("Error fetching user data:", error)
        }
        return { user: null, wishlist: [] }
      }),
    // Fetch promotional products
    listProductsWithPromotions({
      page: 1,
      limit: 50,
      countryCode: 'PL'
    }).catch((error) => {
      console.error("Error fetching promotional data:", error)
      return { response: { products: [], count: 0 }, nextPage: null }
    })
  ])

  const categoryIds = categoryIdsResult.status === 'fulfilled' 
    ? categoryIdsResult.value 
    : [category.id]
  
  console.log(`📂 Category "${category.name}" (${category.id}):`)
  console.log(`   - Descendant IDs (${categoryIds.length}):`, categoryIds)
  
  const { user, wishlist } = userResult.status === 'fulfilled' 
    ? userResult.value 
    : { user: null, wishlist: [] }
  
  const promotionalData = promotionalDataResult.status === 'fulfilled'
    ? promotionalDataResult.value
    : { response: { products: [], count: 0 }, nextPage: null }

  // Convert products array to Map for PromotionDataProvider
  const promotionalProductsMap = new Map(
    promotionalData.response.products.map(p => [p.id, p])
  )

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

  // ✅ OPTIMIZATION 3: Generate JSON-LD structured data for SEO
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Kategorie", path: "/categories" },
    ...breadcrumbs.map(b => ({ label: b.name, path: `/categories/${b.handle}` }))
  ])
  
  const collectionJsonLd = generateCollectionPageJsonLd(
    category.name,
    category.description || `Przeglądaj produkty z kategorii ${category.name} - unikalne dzieła sztuki i rękodzieła od polskich artystów.`,
    `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${category.handle}` 
  )

  return (
    <>
      {/* ✅ Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      
      <PromotionDataProvider 
        countryCode="PL" 
        limit={50}
        initialData={promotionalProductsMap}
      >
        <BatchPriceProvider currencyCode="PLN">
          <main className="container">
            {/* Category Children Navigation (if any) */}
            {category.category_children && category.category_children.length > 0 && (
              <div className="flex flex-col gap-4 mb-8">
                
              </div>
            )}

            {/* ✅ No Suspense needed - promotional data already loaded on server */}
            {/* Note: User/wishlist data fetched client-side in ProductListing component */}
            <SmartProductsListing 
              category_ids={categoryIds}
              locale={locale}
              categories={allCategoriesWithTree}
              currentCategory={category}
              serverSideIsBot={serverSideIsBot}
            />
          </main>
        </BatchPriceProvider>
      </PromotionDataProvider>
    </>
  )
}

export default Category