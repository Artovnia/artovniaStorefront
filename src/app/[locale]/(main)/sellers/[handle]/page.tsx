// src/app/[locale]/(main)/sellers/[handle]/page.tsx

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

export const revalidate = 300

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

    const [seller, user, reviewsResult] = await Promise.all([
      getSellerByHandle(handle),
      retrieveCustomer().catch(() => null),
      getSellerReviews(handle).catch(() => ({ reviews: [] })),
    ])

    const reviews = reviewsResult?.reviews || []

    if (!seller) {
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

    // ✅ OPTIMIZATION: Fetch products, availability, wishlists, and categories in parallel
    const [availabilityResult, holidayModeResult, suspensionResult, productsResult, wishlistsResult, categoriesResult] =
      await Promise.allSettled([
        getVendorAvailability(seller.id),
        getVendorHolidayMode(seller.id),
        getVendorSuspension(seller.id),
        // ✅ Pre-fetch first page of products on server to avoid skeleton
        listProductsWithSort({
          seller_id: seller.id,
          countryCode: "pl",
          sortBy: "created_at_desc",
          queryParams: { limit: PRODUCT_LIMIT, offset: 0 },
        }),
        // ✅ Pre-fetch wishlists if user is logged in
        user ? getUserWishlists().catch(() => ({ wishlists: [] })) : Promise.resolve({ wishlists: [] }),
        // ✅ Fetch categories used by this seller's products
        (async () => {
          try {
            // First get all product IDs for this seller
            const sellerProductsResponse = await sdk.client.fetch<{
              products: Array<{ id: string; categories?: Array<{ id: string; name: string; handle: string }> }>
            }>(`/store/seller/${seller.id}/products`, {
              method: 'GET',
              query: { limit: 1000, fields: 'id,categories.id,categories.name,categories.handle' },
            })
            
            // Extract unique categories from all products
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

    // Extract products data from settled promise
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

    const sellerWithReviews = {
      ...seller,
      reviews: reviews || [],
    }

    const availability =
      availabilityResult.status === "fulfilled"
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
      holidayModeResult.status === "fulfilled"
        ? holidayModeResult.value
        : undefined

    const suspension =
      suspensionResult.status === "fulfilled"
        ? suspensionResult.value
        : undefined

    // ✅ NEW: Generate JSON-LD for seller page
    const sellerJsonLd = generateSellerJsonLd(
      {
        id: seller.id,
        name: seller.name,
        handle: seller.handle,
        description: seller.description,
        photo: seller.photo,         // ✅ Changed from banner
        logo_url: seller.logo_url,   // ✅ Changed from logo
        created_at: seller.created_at,
      },
      reviews
    )

    // Breadcrumb items
    const breadcrumbItems = [
      { label: "Strona główna", path: "/" },
      { label: "Sprzedawcy", path: "/sellers" },
      { label: seller.name, path: `/sellers/${seller.handle}` },
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
            vendorId={seller.id}
            vendorName={seller.name}
            availability={availability}
            holidayMode={holidayMode}
            suspension={suspension}
            showModalOnLoad={!!availability?.onHoliday}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mt-8 ">
              <aside className="lg:sticky lg:top-40 lg:self-start">
                <SellerSidebar
                  seller={sellerWithReviews as SellerProps}
                  user={user}
                />
              </aside>

              <div className="w-full mx-auto">
                <SellerTabs
                  tab={tab}
                  seller_id={seller.id}
                  seller_handle={seller.handle}
                  seller_name={seller.name}
                  user={user}
                  locale={locale}
                  initialProducts={initialProducts}
                  initialTotalCount={initialTotalCount}
                  initialWishlists={initialWishlists}
                  categories={categories}
                  reviews={reviews}
                />
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