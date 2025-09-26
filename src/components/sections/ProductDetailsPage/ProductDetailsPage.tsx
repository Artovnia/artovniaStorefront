import { ProductGallery } from "../../../components/organisms"
import { ProductDetails } from "../../../components/organisms"
import { ProductReviews } from "@/components/organisms/ProductReviews/ProductReviews"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { listProducts, batchFetchProductsByHandles } from "../../../lib/data/products"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "../../../lib/data/vendor-availability"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"
import { unifiedCache } from "@/lib/utils/unified-cache"
import ProductErrorBoundary from "@/components/molecules/ProductErrorBoundary/ProductErrorBoundary"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"
import { buildProductBreadcrumbs } from "@/lib/utils/breadcrumbs"
import Head from "next/head"
import { retrieveCustomer, isAuthenticated } from "@/lib/data/customer"
import { getProductReviews } from "@/lib/data/reviews"

export const ProductDetailsPage = async ({
  handle,
  locale,
}: {
  handle: string
  locale: string
}) => {
 
  // Use unified cache for product data
  const productCacheKey = `product:details:${handle}:${locale}`;
  
  const prod = await unifiedCache.get(
    productCacheKey,
    async () => {
      const { response } = await listProducts({
        countryCode: locale,
        queryParams: { handle },
      })
      return response.products[0]
    }
  )

  if (!prod) return null
  
  // Fetch seller's products with optimized batch processing
  let sellerProducts: any[] = []
  if (prod.seller?.id) {
    try {
      const sellerProductsCacheKey = `seller:products:${prod.seller.id}:${locale}`
      
      sellerProducts = await unifiedCache.get(sellerProductsCacheKey, async () => {
        // Check if seller products are available in the API response
        if (prod.seller?.products && prod.seller.products.length > 0) {
          
          // Extract handles for batch fetching (limit to 8 for performance)
          const handles = prod.seller.products
            .slice(0, 8)
            .map((sellerProduct: any) => sellerProduct.handle)
            .filter(Boolean)
          
          if (handles.length === 0) return []
          
          // Use batch fetch instead of individual API calls
          console.log(`Batch fetching ${handles.length} seller products for ${prod.seller.name}`)
          const fetchedProducts = await batchFetchProductsByHandles({
            handles,
            countryCode: locale,
            limit: 8
          })
          
          console.log(`Successfully fetched ${fetchedProducts.length} seller products`)
          return fetchedProducts
        } else {
          return []
        }
      })
    } catch (error) {
      console.error('Error fetching seller products:', error)
      sellerProducts = []
    }
  }
  
  // Fetch customer, auth status, and reviews data using unified cache
  const [user, authenticated, reviewsData] = await Promise.allSettled([
    unifiedCache.get(`customer:${prod.id}`, retrieveCustomer),
    unifiedCache.get(`auth:${prod.id}`, isAuthenticated),
    unifiedCache.get(`reviews:${prod.id}`, () => getProductReviews(prod.id)),
  ])

  // Extract results with fallbacks
  const customer = user.status === 'fulfilled' ? user.value : null
  const isUserAuthenticated = authenticated.status === 'fulfilled' ? authenticated.value : false
  const reviews = reviewsData.status === 'fulfilled' ? reviewsData.value?.reviews || [] : []

  // Optimized vendor data fetching with unified cache and timeout protection
  const vendorId = prod.seller?.id
  
  let availability: any = undefined
  let holidayMode: any = undefined
  let suspension: any = undefined
  
  if (vendorId) {
    try {
      // Use unified cache for vendor data with shorter TTL due to dynamic nature
      const vendorDataPromises = [
        unifiedCache.get(`vendor:availability:${vendorId}`, async () => {
          return Promise.race([
            getVendorAvailability(vendorId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
          ])
        }),
        unifiedCache.get(`vendor:holiday:${vendorId}`, async () => {
          return Promise.race([
            getVendorHolidayMode(vendorId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
          ])
        }),
        unifiedCache.get(`vendor:suspension:${vendorId}`, async () => {
          return Promise.race([
            getVendorSuspension(vendorId),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
          ])
        })
      ]
      
      const [availabilityResult, holidayModeResult, suspensionResult] = await Promise.allSettled(vendorDataPromises)
      
      availability = availabilityResult.status === 'fulfilled' ? availabilityResult.value : undefined
      holidayMode = holidayModeResult.status === 'fulfilled' ? holidayModeResult.value : undefined
      suspension = suspensionResult.status === 'fulfilled' ? suspensionResult.value : undefined
      
      if (process.env.NODE_ENV === 'development') {
        if (availabilityResult.status === 'rejected' && !availabilityResult.reason?.message?.includes('Timeout')) {
          console.warn('Vendor availability fetch failed:', availabilityResult.reason)
        }
        if (holidayModeResult.status === 'rejected' && !holidayModeResult.reason?.message?.includes('Timeout')) {
          console.warn('Holiday mode fetch failed:', holidayModeResult.reason)
        }
        if (suspensionResult.status === 'rejected' && !suspensionResult.reason?.message?.includes('Timeout')) {
          console.warn('Suspension fetch failed:', suspensionResult.reason)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Unexpected error in vendor data fetching: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  // Generate breadcrumbs using unified cache
  const breadcrumbs = await unifiedCache.get(
    `breadcrumbs:product:${handle}:${locale}`, 
    () => buildProductBreadcrumbs(prod, locale)
  )

  return (
    <>
      {/* CRITICAL: Preload main product image */}
      <Head>
        {prod.images?.[0] && (
          <link
            rel="preload"
            as="image"
            href={decodeURIComponent(prod.images[0].url)}
            type="image/webp"
            fetchPriority="high"
          />
        )}
      </Head>
      
      <ProductErrorBoundary>
        {/* Breadcrumbs */}
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-6 mb-4 text-xl">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        <PromotionDataProvider countryCode="PL">
          <BatchPriceProvider currencyCode="PLN" days={30}>
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
              <div className="hidden md:flex md:flex-row lg:gap-12 max-w-[1920px] mx-auto">
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
              
              <div className="my-24 text-black max-w-[1920px] mx-auto">
                {/* Custom heading with mixed styling */}
                <div className="mb-6 text-center">
                  <h2 className="heading-lg font-bold tracking-tight text-black">
                    <span className="font-instrument-serif">Więcej od </span>
                    <span className="font-instrument-serif italic">{prod.seller?.name}</span>
                  </h2>
                </div>
                
                {/* HomeProductSection with properly fetched seller products */}
                <HomeProductSection
                  heading="" 
                  headingSpacing="mb-0" 
                  theme="dark"
                  products={sellerProducts}
                  isSellerSection={true}
                />
              </div>
              
              {/* Product Reviews moved from ProductDetails */}
              <div className="max-w-[1920px] mx-auto">
                <ProductReviews
                  productId={prod.id}
                  isAuthenticated={isUserAuthenticated}
                  customer={customer}
                  prefetchedReviews={reviews}
                />
              </div>
            </VendorAvailabilityProvider>
          </BatchPriceProvider>
        </PromotionDataProvider>
      </ProductErrorBoundary>
    </>
  )
}