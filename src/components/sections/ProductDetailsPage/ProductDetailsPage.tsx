import { ProductGallery } from "../../../components/organisms"
import { ProductDetails } from "../../../components/organisms"
import { ProductReviews } from "@/components/organisms/ProductReviews/ProductReviews"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { listProducts, batchFetchProductsByHandles, listProductsWithPromotions } from "../../../lib/data/products"
import { getVendorCompleteStatus } from "../../../lib/data/vendor-availability"
import { HomeProductSection } from "../HomeProductSection/HomeProductSection"
import ProductErrorBoundary from "@/components/molecules/ProductErrorBoundary/ProductErrorBoundary"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"
import { buildProductBreadcrumbs } from "@/lib/utils/breadcrumbs"
import { retrieveCustomer, isAuthenticated } from "@/lib/data/customer"
import { getProductReviews, checkProductReviewEligibility } from "@/lib/data/reviews"
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/helpers/seo"
import { getUserWishlists } from "@/lib/data/wishlist"
import { Link } from "@/i18n/routing"
import { getBatchLowestPrices } from "@/lib/data/price-history"
import { HttpTypes } from "@medusajs/types"
import { Suspense } from "react"
import { unstable_noStore as noStore } from "next/cache"

export const ProductDetailsPage = async ({
  handle,
  locale,
  product,
  region,
}: {
  handle: string
  locale: string
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) => {
  // Product and region are always passed from page.tsx
  if (!product) {
    console.error('❌ ProductDetailsPage: No product provided')
    return null
  }

  // ✅ OPTIMIZATION: Get initial variant ID for prefetching
  const initialVariantId = product.variants?.[0]?.id

  // ✅ OPTIMIZATION: Step 2 - Parallel fetch EVERYTHING else (saves ~300-450ms)
  const [
    sellerProductsResult,
    userResult,
    reviewsResult,
    vendorStatusResult,
    breadcrumbsResult,
    eligibilityResult,
    promotionalProductsResult,
    variantAttributesResult,
  ] = await Promise.allSettled([
    // Seller products - fetch ALL 8 products by seller_id
    // Uses custom endpoint /store/seller/{id}/products (not standard /store/products)
    // PromotionDataProvider will enrich products that have promotions from promotionalProducts
    product.seller?.id && region
      ? (async () => {
          const { response } = await listProducts({
            seller_id: product.seller!.id,
            regionId: region.id,
            queryParams: { limit: 8 },
          })
          return response.products
        })()
      : Promise.resolve([]),

    // User data (customer + wishlist)
    // ✅ Force dynamic fetch for wishlist to prevent stale cached data
    (async () => {
      noStore() // Opt out of caching for wishlist data
      const user = await retrieveCustomer()
      if (user) {
        const wishlistData = await getUserWishlists()
        const authenticated = await isAuthenticated()
        return { user, wishlist: wishlistData.wishlists || [], authenticated }
      }
      return { user: null, wishlist: [], authenticated: false }
    })().catch(() => ({ user: null, wishlist: [], authenticated: false })),

    // Reviews
    getProductReviews(product.id).catch(() => ({ reviews: [] })),

    // ✅ OPTIMIZED: Batched vendor status (3 requests → 1 request)
    product.seller?.id
      ? Promise.race([
          getVendorCompleteStatus(product.seller.id),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 500)
          ),
        ]).catch(() => ({
          availability: undefined,
          holiday: undefined,
          suspension: undefined,
        }))
      : Promise.resolve({
          availability: undefined,
          holiday: undefined,
          suspension: undefined,
        }),

    // Breadcrumbs
    buildProductBreadcrumbs(product, locale),

    // Review eligibility (check if user has purchased this product)
    checkProductReviewEligibility(product.id).catch(() => ({
      isEligible: false,
      hasPurchased: false,
    })),

    // ✅ NEW: Pre-fetch promotional products on server
    listProductsWithPromotions({
      countryCode: locale,
      limit: 50
    }).then(r => r.response.products).catch(() => []),

    // ✅ OPTIMIZATION: Prefetch initial variant attributes on server
    // This eliminates 1-2 client-side POST requests on page load
    initialVariantId
      ? (async () => {
          const { getVariantAttributes } = await import("@/lib/data/variant-attributes")
          return getVariantAttributes(product.id, initialVariantId)
        })().catch(() => ({ attribute_values: [] }))
      : Promise.resolve({ attribute_values: [] }),
  ])

  // Extract results with fallbacks
  const sellerProducts =
    sellerProductsResult.status === "fulfilled"
      ? sellerProductsResult.value
      : []

  const {
    user: customer,
    wishlist,
    authenticated: isUserAuthenticated,
  } = userResult.status === "fulfilled"
    ? userResult.value
    : { user: null, wishlist: [], authenticated: false }

  const reviews =
    reviewsResult.status === "fulfilled"
      ? reviewsResult.value?.reviews || []
      : []

  // ✅ Extract batched vendor status
  const vendorStatus =
    vendorStatusResult.status === "fulfilled"
      ? (vendorStatusResult.value as any)
      : { availability: undefined, holiday: undefined, suspension: undefined }

  const availability = vendorStatus?.availability
  const holidayMode = vendorStatus?.holiday
  const suspension = vendorStatus?.suspension

  const breadcrumbs =
    breadcrumbsResult.status === "fulfilled" ? breadcrumbsResult.value : []

  const eligibility =
    eligibilityResult.status === "fulfilled"
      ? eligibilityResult.value
      : { isEligible: false, hasPurchased: false }
 
  const promotionalProducts =
    promotionalProductsResult.status === "fulfilled"
      ? promotionalProductsResult.value
      : []

  const initialVariantAttributes =
    variantAttributesResult.status === "fulfilled"
      ? variantAttributesResult.value
      : { attribute_values: [] }

  // ✅ NEW: Pre-fetch ALL variant prices on server (product + seller products)
  let initialPriceData = {}
  try {
    const allVariantIds = [
      ...(product.variants?.map((v: any) => v.id) || []),
      ...sellerProducts.flatMap((p: any) => p.variants?.map((v: any) => v.id) || [])
    ].filter(Boolean)

    // ✅ OPTIMIZATION: Deduplicate variant IDs to reduce batch request size
    const uniqueVariantIds = [...new Set(allVariantIds)]

    if (uniqueVariantIds.length > 0 && region) {
      initialPriceData = await getBatchLowestPrices(
        uniqueVariantIds,
        'PLN',
        region.id,
        30
      )
      
    } 
  } catch (error) {
    console.error('❌ [ProductDetailsPage] Failed to pre-fetch prices:', error)
  }

  // ✅ FIX: Get price from variant's calculated_price
  const getProductPrice = (): number | undefined => {
    // Try variant calculated price first
    const variant = product.variants?.[0]
    if (variant?.calculated_price?.calculated_amount) {
      return variant.calculated_price.calculated_amount
    }
    // Fallback to original_amount if calculated_amount is not available
    if (variant?.calculated_price?.original_amount) {
      return variant.calculated_price.original_amount
    }
    // Try product-level price (some setups have this)
    if ((product as any).calculated_price?.calculated_amount) {
      return (product as any).calculated_price.calculated_amount
    }
    return undefined
  }

  // Generate structured data for SEO
  const productPrice = getProductPrice()
  const productJsonLd = generateProductJsonLd(product, productPrice, "PLN", reviews)
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
        <div className="max-w-[1920px] mx-auto  py-2 lg:py-6 mb-4 text-xl">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* ✅ OPTIMIZED: Seller products first, then promotional products (promotional override seller) */}
        <PromotionDataProvider 
          countryCode={locale} 
          limit={50}
          initialData={[...sellerProducts, ...promotionalProducts]}
        >
          <BatchPriceProvider 
            currencyCode="PLN"
            regionId={region?.id}
            days={30}
            initialPriceData={initialPriceData}
          >
            <VendorAvailabilityProvider
              vendorId={product.seller?.id}
              vendorName={product.seller?.name}
              availability={availability}
              holidayMode={holidayMode}
              suspension={suspension}
              showModalOnLoad={!!availability?.onHoliday}
            >
              {/* Mobile Layout: Stacked vertically */}
              <div className="flex flex-col md:hidden">
                <div className="w-full ">
                  <ProductGallery
                    images={product?.images || []}
                    title={product?.title || ""}
                  />
                </div>
                <div className="w-full mt-4">
                  {product.seller ? (
                    <ProductDetails
                      product={{ ...product, seller: product.seller }}
                      locale={locale}
                      region={region}
                      initialVariantAttributes={initialVariantAttributes}
                      user={customer}
                      wishlist={wishlist}
                    />
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
                  <ProductGallery
                    images={product?.images || []}
                    title={product?.title || ""}
                  />
                </div>

                {/* Right: Scrollable Product Details */}
                <div className="md:w-1/2 md:max-w-[calc(50%-12px)] lg:max-w-none md:px-0">
                  {product.seller ? (
                    <ProductDetails
                      product={{ ...product, seller: product.seller }}
                      locale={locale}
                      region={region}
                      initialVariantAttributes={initialVariantAttributes}
                      user={customer}
                      wishlist={wishlist}
                    />
                  ) : (
                    <div className="p-4 bg-red-50 text-red-800 rounded">
                      Seller information is missing for this product.
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ OPTIMIZATION: Defer below-fold content to prioritize gallery images */}
              <Suspense fallback={<div className="my-24 h-96 bg-gray-50 animate-pulse" />}>
                <div className="my-24 xl:mt-40 text-black max-w-[1920px] mx-auto">
                {/* Custom heading with mixed styling and button */}
  <div className="mb-6 px-4 sm:px-6 lg:px-8">
    {/* Desktop Layout: Grid with centered heading and right-aligned button */}
    <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <div></div>
      <h2 className="heading-lg font-bold tracking-tight text-black text-center">
        <span className="font-instrument-serif">Więcej od </span>
        <span className="font-instrument-serif italic">
          {product.seller?.name}
        </span>
      </h2>
      <div className="flex justify-end">
        {product.seller?.handle && (
          <Link 
            href={`/sellers/${product.seller.handle}`}
            className="group relative text-[#3B3634] font-instrument-sans font-medium px-4 py-2 overflow-hidden transition-all duration-300 hover:text-white"
          >
            <span className="absolute inset-0 bg-[#3B3634] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
            <span className="relative flex items-center gap-2">
              Zobacz wszystkie
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        )}
      </div>
    </div>

    {/* Mobile Layout: Elegant artist signature approach */}
    <div className="lg:hidden space-y-4">
      <h2 className="heading-lg font-bold tracking-tight text-black text-center">
        <span className="font-instrument-serif">Więcej od </span>
        <span className="font-instrument-serif italic">
          {product.seller?.name}
        </span>
      </h2>
      
      {product.seller?.handle && (
        <div className="flex justify-center">
          <Link 
            href={`/sellers/${product.seller.handle}`}
            className="group inline-flex items-center gap-3 font-instrument-serif italic text-[17px] text-[#3B3634] border-b-[1.5px] border-[#3B3634] pb-0.5 active:opacity-60 transition-all duration-200"
          >
            <span className="relative">
              Odkryj kolekcję
              <span className="absolute -bottom-[1.5px] left-0 w-0 h-[1.5px] bg-[#3B3634] group-active:w-full transition-all duration-300"></span>
            </span>
            <svg 
              className="w-4 h-4 transition-transform duration-200 group-active:translate-x-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
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
                    noMobileMargin={true}
                  />
                </div>
              </Suspense>

              {/* ✅ OPTIMIZATION: Defer reviews to prioritize gallery images */}
              <Suspense fallback={<div className="max-w-[1920px] mx-auto h-96 bg-gray-50 animate-pulse" />}>
                <div className="max-w-[1920px] mx-auto">
                  <ProductReviews
                    productId={product.id}
                    isAuthenticated={isUserAuthenticated}
                    customer={customer}
                    prefetchedReviews={reviews}
                    isEligible={eligibility.isEligible}
                    hasPurchased={eligibility.hasPurchased}
                  />
                </div>
              </Suspense>
            </VendorAvailabilityProvider>
          </BatchPriceProvider>
        </PromotionDataProvider>
      </ProductErrorBoundary>
    </>
  )
}