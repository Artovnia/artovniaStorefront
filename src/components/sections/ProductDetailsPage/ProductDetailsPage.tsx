import { ProductGallery } from "../../../components/organisms"
import { ProductDetails } from "../../../components/organisms"
import { ProductReviews } from "@/components/organisms/ProductReviews/ProductReviews"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { listProducts, batchFetchProductsByHandles } from "../../../lib/data/products"
import { getVendorCompleteStatus } from "../../../lib/data/vendor-availability"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"
import ProductErrorBoundary from "@/components/molecules/ProductErrorBoundary/ProductErrorBoundary"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"
import { buildProductBreadcrumbs } from "@/lib/utils/breadcrumbs"
import { retrieveCustomer, isAuthenticated } from "@/lib/data/customer"
import { getProductReviews, checkProductReviewEligibility } from "@/lib/data/reviews"
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/helpers/seo"
import { getUserWishlists } from "@/lib/data/wishlist"

export const ProductDetailsPage = async ({
  handle,
  locale,
  product: productProp,
}: {
  handle: string
  locale: string
  product?: any // Optional: if passed from page.tsx, skip fetch
}) => {
  // ✅ OPTIMIZATION: Use passed product or fetch if not provided
  let prod = productProp
  
  if (!prod) {
    const { response } = await listProducts({
      countryCode: locale,
      queryParams: { handle },
    })
    prod = response.products[0]
  }

  if (!prod) return null

  // ✅ OPTIMIZATION: Step 2 - Parallel fetch EVERYTHING else (saves ~300-450ms)
  const [
    sellerProductsResult,
    userResult,
    reviewsResult,
    vendorStatusResult,
    breadcrumbsResult,
    eligibilityResult
  ] = await Promise.allSettled([
    // Seller products
    prod.seller?.id && prod.seller.products && prod.seller.products.length > 0
      ? batchFetchProductsByHandles({
          handles: (prod.seller.products as any[])
            .slice(0, 8)
            .map((p: any) => p.handle)
            .filter(Boolean),
          countryCode: locale,
          limit: 8
        })
      : Promise.resolve([]),
    
    // User data (customer + wishlist)
    retrieveCustomer()
      .then(async (user) => {
        if (user) {
          const wishlistData = await getUserWishlists()
          const authenticated = await isAuthenticated()
          return { user, wishlist: wishlistData.wishlists || [], authenticated }
        }
        return { user: null, wishlist: [], authenticated: false }
      })
      .catch(() => ({ user: null, wishlist: [], authenticated: false })),
    
    // Reviews
    getProductReviews(prod.id).catch(() => ({ reviews: [] })),
    
    // ✅ OPTIMIZED: Batched vendor status (3 requests → 1 request)
    prod.seller?.id
      ? Promise.race([
          getVendorCompleteStatus(prod.seller.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
        ]).catch(() => ({ availability: undefined, holiday: undefined, suspension: undefined }))
      : Promise.resolve({ availability: undefined, holiday: undefined, suspension: undefined }),
    
    // Breadcrumbs
    buildProductBreadcrumbs(prod, locale),
    
    // Review eligibility (check if user has purchased this product)
    checkProductReviewEligibility(prod.id).catch(() => ({ isEligible: false, hasPurchased: false }))
  ])

  // Extract results with fallbacks
  const sellerProducts = sellerProductsResult.status === 'fulfilled' 
    ? sellerProductsResult.value 
    : []
  
  const { user: customer, wishlist, authenticated: isUserAuthenticated } = userResult.status === 'fulfilled' 
    ? userResult.value 
    : { user: null, wishlist: [], authenticated: false }
  
  const reviews = reviewsResult.status === 'fulfilled' 
    ? reviewsResult.value?.reviews || [] 
    : []
  
  // ✅ Extract batched vendor status
  const vendorStatus = vendorStatusResult.status === 'fulfilled' 
    ? (vendorStatusResult.value as any)
    : { availability: undefined, holiday: undefined, suspension: undefined }
  
  const availability = vendorStatus?.availability
  const holidayMode = vendorStatus?.holiday
  const suspension = vendorStatus?.suspension
  
  const breadcrumbs = breadcrumbsResult.status === 'fulfilled'
    ? breadcrumbsResult.value
    : []
  
  const eligibility = eligibilityResult.status === 'fulfilled'
    ? eligibilityResult.value
    : { isEligible: false, hasPurchased: false }

  // Generate structured data for SEO
  const productPrice = (prod as any).calculated_price?.calculated_amount
  const productJsonLd = generateProductJsonLd(prod, productPrice, 'PLN')
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs)

  return (
    <>
      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      <ProductErrorBoundary>
        {/* Breadcrumbs */}
        <div className="max-w-[1920px] mx-auto px-4 lg:px-12 py-6 mb-4 text-xl">
          <Breadcrumbs items={breadcrumbs} />
        </div>
        
        <PromotionDataProvider countryCode={locale}>
          <BatchPriceProvider currencyCode="PLN" days={30}>
            <VendorAvailabilityProvider
              vendorId={prod.seller?.id}
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
              <div className="hidden md:flex md:flex-row md:gap-6 lg:gap-12 max-w-[1920px] mx-auto md:px-4 lg:px-0">
                {/* Left: Sticky Product Gallery */}
                <div className="md:w-1/2 md:max-w-[calc(50%-12px)] lg:max-w-none md:px-0 md:sticky md:top-20 md:self-start">
                  <ProductGallery images={prod?.images || []} />
                </div>
                
                {/* Right: Scrollable Product Details */}
                <div className="md:w-1/2 md:max-w-[calc(50%-12px)] lg:max-w-none md:px-0">
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
                  products={sellerProducts as any}
                  isSellerSection={true}
                  user={customer}
                  wishlist={wishlist}
                />
              </div>
              
              {/* Product Reviews moved from ProductDetails */}
              <div className="max-w-[1920px] mx-auto">
                <ProductReviews
                  productId={prod.id}
                  isAuthenticated={isUserAuthenticated}
                  customer={customer}
                  prefetchedReviews={reviews}
                  isEligible={eligibility.isEligible}
                  hasPurchased={eligibility.hasPurchased}
                />
              </div>
            </VendorAvailabilityProvider>
          </BatchPriceProvider>
        </PromotionDataProvider>
      </ProductErrorBoundary>
    </>
  )
}