// src/app/[locale]/(main)/sellers/[handle]/page.tsx

import { Suspense } from "react"
import { SellerTabs, SellerSidebar } from "../../../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { retrieveCustomer } from "../../../../../lib/data/customer"
import { getSellerByHandle } from "../../../../../lib/data/seller"
import {
  getVendorAvailability,
  getVendorHolidayMode,
  getVendorSuspension,
} from "../../../../../lib/data/vendor-availability"
import { getSellerReviews } from "../../../../../lib/data/reviews"
import { getSellerPage } from "../../../../../lib/data/vendor-page"
import { SellerProps } from "../../../../../types/seller"
import { BatchPriceProvider } from "../../../../../components/context/BatchPriceProvider"
import {
  generateSellerMetadata,
  generateSellerJsonLd,
} from "../../../../../lib/helpers/seo"
import type { Metadata } from "next"
import { listProductsWithSort } from "../../../../../lib/data/products"
import { getUserWishlists } from "../../../../../lib/data/wishlist"
import { PRODUCT_LIMIT } from "../../../../../const"
import { Breadcrumbs } from "../../../../../components/atoms/Breadcrumbs/Breadcrumbs"
import { sdk } from "../../../../../lib/config"
import { getRegion } from "../../../../../lib/data/regions"
import { HttpTypes } from "@medusajs/types"

export const revalidate = 300

// ✅ NEW: Async component for seller tabs with product data
async function SellerTabsWithData({
  tab,
  seller_id,
  seller_handle,
  seller_name,
  user,
  locale,
  reviews,
  vendorPage,
}: {
  tab: string
  seller_id: string
  seller_handle: string
  seller_name: string
  user: HttpTypes.StoreCustomer | null
  locale: string
  reviews: any[]
  vendorPage: any
}) {
  // ✅ Fetch products, wishlists, and categories in parallel
  const [productsResult, wishlistsResult, categoriesResult] = await Promise.allSettled([
    listProductsWithSort({
      seller_id,
      countryCode: "pl",
      sortBy: "created_at_desc",
      queryParams: { limit: PRODUCT_LIMIT, offset: 0 },
    }),
    user ? getUserWishlists().catch(() => ({ wishlists: [] })) : Promise.resolve({ wishlists: [] }),
    (async () => {
      try {
        const region = await getRegion("pl")
        if (!region) return { product_categories: [] }

        const sellerProductsResponse = await sdk.client.fetch<{
          products: Array<{ 
            id: string
            categories?: Array<{ id: string; name: string; handle: string }> 
          }>
          count: number
        }>(`/store/seller/${seller_id}/products`, {
          method: 'GET',
          query: { 
            limit: 1000,
            offset: 0,
            region_id: region.id,
          },
        })
        
        const categoriesMap = new Map<string, { id: string; name: string; handle: string }>()
        sellerProductsResponse.products?.forEach(product => {
          product.categories?.forEach(cat => {
            if (!categoriesMap.has(cat.id)) {
              categoriesMap.set(cat.id, cat)
            }
          })
        })
        
        return { product_categories: Array.from(categoriesMap.values()) }
      } catch (error) {
        console.error('Error fetching seller categories:', error)
        return { product_categories: [] }
      }
    })(),
  ])

  const initialProducts = productsResult.status === "fulfilled" 
    ? productsResult.value?.response?.products 
    : undefined
  const initialTotalCount = productsResult.status === "fulfilled" 
    ? productsResult.value?.response?.count 
    : undefined
  const initialWishlists = wishlistsResult.status === "fulfilled"
    ? wishlistsResult.value?.wishlists
    : undefined
  const categories = categoriesResult.status === "fulfilled"
    ? categoriesResult.value?.product_categories
    : undefined

  return (
    <SellerTabs
      tab={tab}
      seller_id={seller_id}
      seller_handle={seller_handle}
      seller_name={seller_name}
      user={user}
      locale={locale}
      initialProducts={initialProducts}
      initialTotalCount={initialTotalCount}
      initialWishlists={initialWishlists}
      categories={categories}
      reviews={reviews}
      vendorPage={vendorPage}
    />
  )
}

// ✅ NEW: Skeleton for seller tabs while data loads
function SellerTabsFallback() {
  return (
    <div className="w-full">
      {/* Tabs Skeleton */}
      <div className="border-b mb-6">
        <div className="flex gap-6 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>
      </div>
      
      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ✅ IMPROVED: Fetch seller for proper metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  try {
    const seller = await getSellerByHandle(handle)

    if (!seller) {
      return {
        title: "Sprzedawca nie znaleziony",
        description: "Nie znaleziono sprzedawcy.",
        robots: { index: false, follow: false },
      }
    }

    return generateSellerMetadata(
      {
        name: seller.name,
        handle: seller.handle,
        description: seller.description,
        photo: seller.photo,         // ✅ Changed from banner
        logo_url: seller.logo_url,   // ✅ Changed from logo
      },
      locale
    )
  } catch {
    return {
      title: `Sprzedawca - ${handle}`,
      description:
        "Profil sprzedawcy na Artovnia - unikalne produkty od polskich artystów",
      robots: { index: true, follow: true },
    }
  }
}

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  try {
    const { handle, locale } = await params
    const resolvedSearchParams = await searchParams
    const tab = (resolvedSearchParams.tab as string) || "produkty"

    if (!handle || handle === "undefined") {
      console.error(`Invalid seller handle: ${handle} for seller page`)
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">
              Nieprawidłowy identyfikator sprzedawcy. Sprawdź adres URL i
              spróbuj ponownie.
            </p>
          </div>
        </main>
      )
    }

    // ✅ OPTIMIZED: Fetch only essential data for sidebar/tabs rendering
    const [seller, user, reviewsResult, availabilityResult, holidayModeResult, suspensionResult, vendorPageResult] =
      await Promise.allSettled([
        getSellerByHandle(handle),
        retrieveCustomer().catch(() => null),
        getSellerReviews(handle).catch(() => ({ reviews: [] })),
        getSellerByHandle(handle).then(s => s ? getVendorAvailability(s.id) : null),
        getSellerByHandle(handle).then(s => s ? getVendorHolidayMode(s.id) : null),
        getSellerByHandle(handle).then(s => s ? getVendorSuspension(s.id) : null),
        getSellerPage(handle),
      ])

    const sellerData = seller.status === "fulfilled" ? seller.value : null
    const userData = user.status === "fulfilled" ? user.value : null
    const reviews = reviewsResult.status === "fulfilled" ? reviewsResult.value?.reviews || [] : []
    const vendorPage = vendorPageResult.status === "fulfilled" ? vendorPageResult.value?.page : null

    if (!sellerData) {
      console.error(`Seller not found for handle: ${handle}`)
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">
              Nie znaleziono sprzedawcy. Sprawdź adres URL i spróbuj ponownie.
            </p>
          </div>
        </main>
      )
    }

    const sellerWithReviews = {
      ...sellerData,
      reviews: reviews || [],
    }

    const availability =
      availabilityResult.status === "fulfilled" && availabilityResult.value
        ? availabilityResult.value
        : {
            available: true,
            suspended: false,
            onHoliday: false,
            message: null,
            status: "active" as "active" | "holiday" | "suspended",
            suspension_expires_at: null,
          }

    const holidayMode =
      holidayModeResult.status === "fulfilled" && holidayModeResult.value
        ? holidayModeResult.value
        : undefined

    const suspension =
      suspensionResult.status === "fulfilled" && suspensionResult.value
        ? suspensionResult.value
        : undefined

    // ✅ Generate JSON-LD for seller page
    const sellerJsonLd = generateSellerJsonLd(
      {
        id: sellerData.id,
        name: sellerData.name,
        handle: sellerData.handle,
        description: sellerData.description,
        photo: sellerData.photo,
        logo_url: sellerData.logo_url,
        created_at: sellerData.created_at,
      },
      reviews
    )

    // Breadcrumb items
    const breadcrumbItems = [
      { label: "Strona główna", path: "/" },
      { label: "Sprzedawcy", path: "/sellers" },
      { label: sellerData.name, path: `/sellers/${sellerData.handle}` },
    ]

    return (
      <BatchPriceProvider currencyCode="PLN">
        {/* ✅ NEW: Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sellerJsonLd) }}
        />

        <main className="container">
          {/* Breadcrumbs */}
          <div className="mt-6 mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          
          <VendorAvailabilityProvider
            vendorId={sellerData.id}
            vendorName={sellerData.name}
            availability={availability}
            holidayMode={holidayMode}
            suspension={suspension}
            showModalOnLoad={!!availability?.onHoliday}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mt-8 ">
              {/* ✅ Sidebar renders immediately - no async dependencies */}
              <aside className="lg:sticky lg:top-40 lg:self-start">
                <SellerSidebar
                  seller={sellerWithReviews as SellerProps}
                  user={userData}
                />
              </aside>

              {/* ✅ PERFORMANCE: Tabs stream in with product data */}
              <div className="w-full mx-auto">
                <Suspense fallback={<SellerTabsFallback />}>
                  <SellerTabsWithData
                    tab={tab}
                    seller_id={sellerData.id}
                    seller_handle={sellerData.handle}
                    seller_name={sellerData.name}
                    user={userData}
                    locale={locale}
                    reviews={reviews}
                    vendorPage={vendorPage}
                  />
                </Suspense>
              </div>
            </div>
          </VendorAvailabilityProvider>
        </main>
      </BatchPriceProvider>
    )
  } catch (error) {
    console.error(
      `Error in SellerPage: ${error instanceof Error ? error.message : "Unknown error"}`
    )
    return (
      <main className="container">
        <div className="border rounded-sm p-4 my-8">
          <h1 className="heading-lg mb-4">Wystąpił błąd</h1>
          <p className="text-secondary">
            Przepraszamy, wystąpił problem podczas ładowania strony sprzedawcy.
            Spróbuj ponownie później.
          </p>
        </div>
      </main>
    )
  }
}