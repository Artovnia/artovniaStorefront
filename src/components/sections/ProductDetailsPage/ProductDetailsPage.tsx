import { ProductGallery } from "../../../components/organisms"
import { ProductDetails } from "../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { listProducts } from "../../../lib/data/products"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "../../../lib/data/vendor-availability"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"
import { getCachedProduct } from "../../../lib/utils/persistent-cache"
import ProductErrorBoundary from "@/components/molecules/ProductErrorBoundary/ProductErrorBoundary"
import { hydrationLogger } from "@/lib/utils/hydration-logger"

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
  // Log product page server-side rendering start
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL === '1') {
    console.log('🏗️ ProductDetailsPage SSR start:', {
      handle,
      timestamp: new Date().toISOString(),
      isProduction: process.env.NODE_ENV === 'production',
      isVercel: process.env.VERCEL === '1'
    })
  }

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
  
  // Optimized vendor data fetching with better error handling
  const vendorId = prod.seller?.id
  
  // Initialize vendor data with proper types
  let availability: any = undefined
  let holidayMode: any = undefined
  let suspension: any = undefined
  
  if (vendorId) {
    try {
      // Use Promise.allSettled for better error handling and partial success
      const [availabilityResult, holidayModeResult, suspensionResult] = await Promise.allSettled([
        getVendorAvailability(vendorId),
        getVendorHolidayMode(vendorId),
        getVendorSuspension(vendorId)
      ])
      
      // Extract successful results, ignore failures
      availability = availabilityResult.status === 'fulfilled' ? availabilityResult.value : undefined
      holidayMode = holidayModeResult.status === 'fulfilled' ? holidayModeResult.value : undefined
      suspension = suspensionResult.status === 'fulfilled' ? suspensionResult.value : undefined
      
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        if (availabilityResult.status === 'rejected') console.warn('Vendor availability fetch failed:', availabilityResult.reason)
        if (holidayModeResult.status === 'rejected') console.warn('Holiday mode fetch failed:', holidayModeResult.reason)
        if (suspensionResult.status === 'rejected') console.warn('Suspension fetch failed:', suspensionResult.reason)
      }
    } catch (error) {
      // Fallback error handling - should not reach here with Promise.allSettled
      if (process.env.NODE_ENV === 'development') {
        console.error(`Unexpected error in vendor data fetching: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  // Log successful server-side data fetching
  if (process.env.NODE_ENV === 'development' || process.env.VERCEL === '1') {
    console.log('✅ ProductDetailsPage SSR complete:', {
      handle,
      productId: prod?.id,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <ProductErrorBoundary>
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
    </ProductErrorBoundary>
  )
}