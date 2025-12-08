import { SellerTabs, SellerSidebar } from "@/components/organisms"
import { VendorAvailabilityProvider } from "@/components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { retrieveCustomer } from "@/lib/data/customer"
import { getSellerByHandle } from "@/lib/data/seller"
import { getSellerReviews } from "@/lib/data/reviews"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "@/lib/data/vendor-availability"
import { SellerProps } from "@/types/seller"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"

export default async function SellerReviewsPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  const seller = await getSellerByHandle(handle)
  const user = await retrieveCustomer()
  
  // Fetch seller reviews
  const { reviews = [] } = await getSellerReviews(handle)
  
  // Merge reviews data with seller object
  const sellerWithReviews = seller ? {
    ...seller,
    reviews: reviews || []
  } : null

  const tab = "recenzje"

  if (!seller) {
    return (
      <main className="container">
        <div className="border rounded-sm p-4 my-8">
          <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
          <p className="text-secondary">Nie mogliśmy znaleźć sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
        </div>
      </main>
    )
  }

  // Get vendor availability data with error handling
  let availability = undefined
  let holidayMode = undefined
  let suspension = undefined
  
  try {
    try {
      availability = await getVendorAvailability(seller.id)
    } catch (availabilityError) {
      console.error(`Vendor availability error: ${availabilityError instanceof Error ? availabilityError.message : 'Unknown error'}`)
      availability = {
        available: true,
        suspended: false,
        onHoliday: false,
        message: null,
        status: 'active' as 'active' | 'holiday' | 'suspended',
        suspension_expires_at: null
      }
    }
    
    try {
      holidayMode = await getVendorHolidayMode(seller.id)
    } catch (holidayError) {
      console.error(`Holiday mode error: ${holidayError instanceof Error ? holidayError.message : 'Unknown error'}`)
    }
    
    try {
      suspension = await getVendorSuspension(seller.id)
    } catch (suspensionError) {
      console.error(`Suspension error: ${suspensionError instanceof Error ? suspensionError.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error(`General error in vendor availability section: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return (
    <PromotionDataProvider countryCode="PL">
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
            {/* Two-column layout: Sidebar (30%) | Content (70%) */}
            <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mt-8">
              {/* Left Sidebar - Sticky on desktop with proper top spacing */}
              <aside className="lg:sticky lg:top-40 lg:self-start">
                <SellerSidebar seller={sellerWithReviews as SellerProps} user={user} />
              </aside>
              
              {/* Right Content - Tabs and Products */}
              <div className="w-full">
                <SellerTabs
                  tab={tab}
                  seller_id={seller.id}
                  seller_handle={seller.handle}
                  seller_name={seller.name}
                  user={user}
                  locale={locale}
                />
              </div>
            </div>
          </VendorAvailabilityProvider>
        </main>
      </BatchPriceProvider>
    </PromotionDataProvider>
  )
}