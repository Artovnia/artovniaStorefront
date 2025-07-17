import { SellerTabs } from "../../../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { SellerPageHeader } from "../../../../../components/sections"
import { retrieveCustomer } from "../../../../../lib/data/customer"
import { getSellerByHandle } from "../../../../../lib/data/seller"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "../../../../../lib/data/vendor-availability"

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  try {
    const { handle, locale } = await params
    
    // Validate handle before proceeding
    if (!handle || handle === 'undefined') {
      console.error(`Invalid seller handle: ${handle} for seller page`);
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">Nieprawidłowy identyfikator sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
          </div>
        </main>
      )
    }
    
    console.log(`Fetching seller with handle: ${handle} for main seller page`);
    const seller = await getSellerByHandle(handle)
    const user = await retrieveCustomer()

    const tab = "products"

    if (!seller) {
      console.error(`Seller not found for handle: ${handle}`);
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">Nie mogliśmy znaleźć sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
          </div>
        </main>
      )
    }
  
  // Get vendor availability data with better error handling
  let availability = undefined
  let holidayMode = undefined
  let suspension = undefined
  
  try {
    // Use individual try/catch blocks for each API call
    try {
      availability = await getVendorAvailability(seller.id)
    } catch (availabilityError) {
      console.error(`Vendor availability error: ${availabilityError instanceof Error ? availabilityError.message : 'Unknown error'}`)
      // Provide fallback data
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
      // Holiday mode is optional, ok to be undefined
    }
    
    try {
      suspension = await getVendorSuspension(seller.id)
    } catch (suspensionError) {
      console.error(`Suspension error: ${suspensionError instanceof Error ? suspensionError.message : 'Unknown error'}`)
      // Suspension is optional, ok to be undefined
    }
  } catch (error) {
    console.error(`General error in vendor availability section: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return (
    <main className="container">
      <VendorAvailabilityProvider
        vendorId={seller.id}
        vendorName={seller.name}
        availability={availability}
        holidayMode={holidayMode}
        suspension={suspension}
        showModalOnLoad={!!availability?.onHoliday}
      >
        <SellerPageHeader seller={seller} user={user} />
        <SellerTabs
          tab={tab}
          seller_id={seller.id}
          seller_handle={seller.handle}
          seller_name={seller.name}
          locale={locale}
        />
      </VendorAvailabilityProvider>
    </main>
  )
  } catch (error) {
    console.error(`Error in SellerPage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return (
      <main className="container">
        <div className="border rounded-sm p-4 my-8">
          <h1 className="heading-lg mb-4">Wystąpił błąd</h1>
          <p className="text-secondary">Przepraszamy, wystąpił problem podczas ładowania strony sprzedawcy. Spróbuj ponownie później.</p>
        </div>
      </main>
    );
  }
}