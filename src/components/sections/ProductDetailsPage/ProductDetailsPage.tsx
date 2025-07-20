import { ProductDetails, ProductGallery } from "../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { listProducts } from "../../../lib/data/products"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "../../../lib/data/vendor-availability"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!prod) return null
  
  // Get vendor availability status if seller exists
  const vendorId = prod.seller?.id
  
  // Fetch vendor availability data in parallel if seller exists
  let availability = undefined
  let holidayMode = undefined
  let suspension = undefined
  
  if (vendorId) {
    try {
      const [availabilityData, holidayModeData, suspensionData] = await Promise.all([
        getVendorAvailability(vendorId),
        getVendorHolidayMode(vendorId).catch(() => undefined),
        getVendorSuspension(vendorId).catch(() => undefined)
      ])
      
      availability = availabilityData
      holidayMode = holidayModeData
      suspension = suspensionData
    } catch (error) {
      console.error(`Failed to fetch vendor availability: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <VendorAvailabilityProvider
      vendorId={vendorId}
      vendorName={prod.seller?.name}
      availability={availability}
      holidayMode={holidayMode}
      suspension={suspension}
      showModalOnLoad={!!availability?.onHoliday}
    >
      <div className="flex flex-col md:flex-row lg:gap-12">
        <div className="md:w-1/2 md:px-2">
          <ProductGallery images={prod?.images || []} />
        </div>
        <div className="md:w-1/2 md:px-2">
          {prod.seller ? (
            <ProductDetails product={{...prod, seller: prod.seller}} locale={locale} />
          ) : (
            <div className="p-4 bg-red-50 text-red-800 rounded">
              Seller information is missing for this product.
            </div>
          )}
        </div>
      </div>
      <div className="my-8">
        <HomeProductSection
          heading="Więcej od tego sprzedawcy"
          products={prod.seller?.products}
        />
      </div>
    </VendorAvailabilityProvider>
  )
}
