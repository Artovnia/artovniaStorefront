// src/app/[locale]/(main)/categories/[category]/page.tsx

import { Metadata } from "next"
import { getCategoryByHandle, listCategoriesWithProducts, getAllDescendantCategoryIds, getCategoriesWithProductsFromDatabase } from "@/lib/data/categories"
import { isServerSideBot } from "@/lib/utils/server-bot-detection"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { listProductsWithPromotions, listProducts } from "@/lib/data/products"
import { 
  generateCategoryMetadata, 
  generateBreadcrumbJsonLd, 
  generateCategoryJsonLd,
  generateItemListJsonLd,
  getProductImage 
} from "@/lib/helpers/seo"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { SmartProductsListing } from "@/components/sections/ProductListing/SmartProductsListing"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { JsonLd } from "@/components/JsonLd"

type Props = {
  params: Promise<{ category: string; locale: string }>
}

// Helper to get first product image from category
async function getCategoryPreviewImage(
  categoryId: string,
  locale: string
): Promise<string | undefined> {
  try {
    const { response } = await listProducts({
      countryCode: locale,
      category_id: categoryId, // ✅ Top-level param, not in queryParams
      queryParams: {
        limit: 1,
      },
    })
    const firstProduct = response.products[0]
    if (firstProduct) {
      return getProductImage(firstProduct)
    }
  } catch {
    // Ignore errors, return undefined
  }
  return undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: handle, locale } = await params

  const cat = await getCategoryByHandle([handle])
  
  if (!cat) {
    return {
      title: `Kategoria nie znaleziona`,
      description: `Kategoria nie znaleziona - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      robots: "noindex",
    }
  }

  // ✅ SEO FIX: Check if category has products - noindex empty categories
  // This prevents empty category pages from being indexed by Google
  const categoriesWithProducts = await getCategoriesWithProductsFromDatabase()
  const hasProducts = categoriesWithProducts.has(cat.id)
  
  if (!hasProducts) {
    // Category exists but has no products - noindex to prevent thin content
    return {
      title: `${cat.name} - Artovnia`,
      description: `Przeglądaj produkty z kategorii ${cat.name} na Artovnia.`,
      robots: {
        index: false,
        follow: true, // Still follow links to other pages
        googleBot: {
          index: false,
          follow: true,
        },
      },
    }
  }

  // Get a product image to use as category image
  const productImage = await getCategoryPreviewImage(cat.id, locale)

  return generateCategoryMetadata(cat, locale, productImage)
}

async function Category({ params }: Props) {
  const { category: handle, locale } = await params
  const decodedHandle = decodeURIComponent(handle)
  
  // Parallel fetches
  const [botResult, categoriesResult, categoryResult] = await Promise.allSettled([
    isServerSideBot(),
    listCategoriesWithProducts(),
    getCategoryByHandle([handle])
  ])

  const serverSideIsBot = botResult.status === 'fulfilled' ? botResult.value : false
  const allCategoriesWithTree = categoriesResult.status === 'fulfilled' 
    ? categoriesResult.value?.categories || []
    : []
  
  let category: HttpTypes.StoreProductCategory | null = categoryResult.status === 'fulfilled' 
    ? categoryResult.value 
    : null
  
  // Fallback matching logic...
  if (!category) {
    const exactMatch = allCategoriesWithTree.find(
      (cat) => cat.handle?.toLowerCase() === decodedHandle.toLowerCase()
    )
    if (exactMatch) category = exactMatch
  }

  if (!category) {
    return notFound()
  }

  // Fetch remaining data in parallel
  const [categoryIdsResult, userResult, promotionalDataResult, previewProductResult] = 
    await Promise.allSettled([
      getAllDescendantCategoryIds(category.id),
      retrieveCustomer()
        .then(async (user) => {
          if (user) {
            const wishlistData = await getUserWishlists()
            return { user, wishlist: wishlistData.wishlists || [] }
          }
          return { user: null, wishlist: [] }
        })
        .catch(() => ({ user: null, wishlist: [] })),
      listProductsWithPromotions({
        page: 1,
        limit: 50,
        countryCode: 'PL'
      }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null })),
      // Fetch first few products for SEO (ItemList schema)
       listProducts({
      countryCode: locale,
      category_id: category.id, // ✅ Top-level, string not array
      queryParams: {
        limit: 10,
      },
    }).catch(() => ({ response: { products: [], count: 0 } })),
  ])

  const categoryIds = categoryIdsResult.status === 'fulfilled' 
    ? categoryIdsResult.value 
    : [category.id]
  
  const { user, wishlist } = userResult.status === 'fulfilled' 
    ? userResult.value 
    : { user: null, wishlist: [] }
  
  const promotionalData = promotionalDataResult.status === 'fulfilled'
    ? promotionalDataResult.value
    : { response: { products: [], count: 0 }, nextPage: null }

  const previewProducts = previewProductResult.status === 'fulfilled'
    ? previewProductResult.value.response.products
    : []

  const productCount = previewProductResult.status === 'fulfilled'
    ? previewProductResult.value.response.count
    : undefined

  const promotionalProductsMap = new Map(
    promotionalData.response.products.map(p => [p.id, p])
  )

  // Build breadcrumb path
  const breadcrumbs: Array<{ name: string; handle: string; id: string }> = []
  let currentCategory: HttpTypes.StoreProductCategory | null = category
  
  while (currentCategory) {
    breadcrumbs.unshift({
      name: currentCategory.name,
      handle: currentCategory.handle,
      id: currentCategory.id
    })
    
    if (currentCategory?.parent_category_id && allCategoriesWithTree) {
      const parentCategory = allCategoriesWithTree.find(
        cat => cat.id === currentCategory!.parent_category_id
      )
      currentCategory = parentCategory || null
    } else {
      currentCategory = null
    }
  }

  // Get first product image for category schema
  const sampleProductImage = previewProducts[0] 
    ? getProductImage(previewProducts[0]) 
    : undefined

  // Generate enhanced JSON-LD structured data
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { label: "Strona główna", path: "/" },
    { label: "Kategorie", path: "/categories" },
    ...breadcrumbs.map(b => ({ label: b.name, path: `/categories/${b.handle}` }))
  ])
  
  // Use the new enhanced category JSON-LD
  const categoryJsonLd = generateCategoryJsonLd(
    category,
    productCount,
    sampleProductImage
  )

  // Add ItemList for first products (helps with indexing)
  const itemListJsonLd = previewProducts.length > 0
    ? generateItemListJsonLd(previewProducts, `Produkty w kategorii ${category.name}`)
    : null

  return (
    <>
      {/* Enhanced Structured Data for SEO */}
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={categoryJsonLd} />
      {itemListJsonLd && <JsonLd data={itemListJsonLd} />}
      
      <PromotionDataProvider 
        countryCode="PL" 
        limit={50}
        initialData={promotionalProductsMap}
      >
        <BatchPriceProvider currencyCode="PLN">
          <main className="container">
            {/* Category header with description for SEO - Hidden on mobile to prevent duplication with MobileCategoryBreadcrumbs */}
            <header className="mb-8 hidden ">
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-ui-fg-subtle">{category.description}</p>
              )}
              {productCount !== undefined && productCount > 0 && (
                <p className="text-sm text-ui-fg-muted mt-2">
                  {productCount} {productCount === 1 ? 'produkt' : 'produktów'}
                </p>
              )}
            </header>

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