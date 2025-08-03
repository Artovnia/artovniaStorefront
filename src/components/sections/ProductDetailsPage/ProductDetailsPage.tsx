import { ProductDetails, ProductGallery } from "../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { listProducts } from "../../../lib/data/products"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "../../../lib/data/vendor-availability"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"
import { getCachedProduct } from "../../../lib/utils/persistent-cache"

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
  // Use persistent cache that survives server requests for variant selection
  // This prevents repeated API calls when switching variants
  const prod = await getCachedProduct(
    handle,
    locale,
    async () => {
      const { response } = await listProducts({
        countryCode: locale,
        queryParams: { handle },
      })
      return response.products[0]
    }
  )

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
      {/* Mobile Layout: Stacked vertically */}
      <div className="flex flex-col md:hidden">
        <div className="w-full">
          <ProductGallery images={prod?.images || []} />
        </div>
        <div className="w-full mt-4">
          {prod.seller ? (
            <ProductDetails product={{...prod, seller: prod.seller}} locale={locale} />
          ) : (
            <div className="p-4 bg-red-50 text-red-800 rounded">
              Seller information is missing for this product.
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout: Sticky gallery on left, scrollable details on right */}
      <div className="hidden md:flex md:flex-row lg:gap-12">
        {/* Left: Sticky Product Gallery */}
        <div className="md:w-1/2 md:px-2 md:sticky md:top-20 md:self-start">
          <ProductGallery images={prod?.images || []} />
        </div>
        
        {/* Right: Scrollable Product Details */}
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