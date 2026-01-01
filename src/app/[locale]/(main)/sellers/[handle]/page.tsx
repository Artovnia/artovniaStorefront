import { SellerTabs, SellerSidebar } from "../../../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { retrieveCustomer } from "../../../../../lib/data/customer"
import { getSellerByHandle } from "../../../../../lib/data/seller"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "../../../../../lib/data/vendor-availability"
import { getSellerReviews } from "../../../../../lib/data/reviews"
import { SellerProps } from "../../../../../types/seller"
import { PromotionDataProvider } from "../../../../../components/context/PromotionDataProvider"
import { BatchPriceProvider } from "../../../../../components/context/BatchPriceProvider"
import { generateSellerMetadata } from "../../../../../lib/helpers/seo"
import type { Metadata } from "next"
import { listProductsWithSort } from "../../../../../lib/data/products"
import { getUserWishlists } from "../../../../../lib/data/wishlist"
import { PRODUCT_LIMIT } from "../../../../../const"

// ✅ PERFORMANCE: Simplified metadata - avoid duplicate seller fetch
// The page component will fetch seller data, so we use basic metadata here
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle } = await params

  return {
    title: `Sprzedawca - ${handle}`,
    description: "Profil sprzedawcy na Artovnia - unikalne produkty od polskich artystów",
    robots: {
      index: true,
      follow: true,
    },
  }
}

// ✅ PERFORMANCE: Cache with revalidation for better performance
// Loading skeleton will still show during client-side navigation
export const revalidate = 300 // Revalidate every 5 minutes

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  try {
    const { handle, locale } = await params
    
    if (!handle || handle === 'undefined') {
      console.error(`Invalid seller handle: ${handle} for seller page`)
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">Nieprawidłowy identyfikator sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
          </div>
        </main>
      )
    }
    
    // ✅ PERFORMANCE: Fetch only critical data, make others optional
    const [seller, user, reviewsResult] = await Promise.all([
      getSellerByHandle(handle),
      retrieveCustomer().catch(() => null), // Non-blocking
      getSellerReviews(handle).catch(() => ({ reviews: [] })), // Non-blocking
    ])
    
    const reviews = reviewsResult?.reviews || []
    
    if (!seller) {
      console.error(`Seller not found for handle: ${handle}`)
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">Nie znaleziono sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
          </div>
        </main>
      )
    }

    // ✅ PERFORMANCE: Availability checks are non-critical, use allSettled for resilience
    const [availabilityResult, holidayModeResult, suspensionResult] = await Promise.allSettled([
      getVendorAvailability(seller.id),
      getVendorHolidayMode(seller.id),
      getVendorSuspension(seller.id)
    ])

    // ✅ Products and wishlists are now fetched client-side for better performance
    // This allows the page to render immediately with a loading skeleton for products
    const initialProducts = undefined
    const initialTotalCount = undefined
    const initialWishlists = undefined
    
    const sellerWithReviews = {
      ...seller,
      reviews: reviews || []
    }
    
    const tab = "produkty"
  
    // ✅ Extract vendor availability data from parallel fetch results
    const availability = availabilityResult.status === 'fulfilled'
      ? availabilityResult.value
      : {
          available: true,
          suspended: false,
          onHoliday: false,
          message: null,
          status: 'active' as 'active' | 'holiday' | 'suspended',
          suspension_expires_at: null
        }
    
    const holidayMode = holidayModeResult.status === 'fulfilled'
      ? holidayModeResult.value
      : undefined
    
    const suspension = suspensionResult.status === 'fulfilled'
      ? suspensionResult.value
      : undefined

    return (
      <PromotionDataProvider countryCode="PL" productIds={[]} limit={0}>
        <BatchPriceProvider currencyCode="PLN">
          <main className="container">
            <VendorAvailabilityProvider
              vendorId={seller.id}
              vendorName={seller.name}
              availability={availability}
              holidayMode={holidayMode}
              suspension={suspension}
              showModalOnLoad={!!availability?.onHoliday}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mt-8">
                <aside className="lg:sticky lg:top-40 lg:self-start">
                  <SellerSidebar seller={sellerWithReviews as SellerProps} user={user} />
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
                  />
                </div>
              </div>
            </VendorAvailabilityProvider>
          </main>
        </BatchPriceProvider>
      </PromotionDataProvider>
    )
  } catch (error) {
    console.error(`Error in SellerPage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return (
      <main className="container">
        <div className="border rounded-sm p-4 my-8">
          <h1 className="heading-lg mb-4">Wystąpił błąd</h1>
          <p className="text-secondary">Przepraszamy, wystąpił problem podczas ładowania strony sprzedawcy. Spróbuj ponownie później.</p>
        </div>
      </main>
    )
  }
}