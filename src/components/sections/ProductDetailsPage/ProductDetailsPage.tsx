import { ProductGallery } from "../../../components/organisms"
import { ProductDetails } from "../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { ProductUserDataProvider } from "@/components/context/ProductUserDataProvider"
import {
  getProductPromotions,
} from "../../../lib/data/products"
import { getVendorCompleteStatus } from "../../../lib/data/vendor-availability"
import { getProductDeliveryTimeframe } from "@/lib/data/delivery-timeframe"
import { getProductMeasurements } from "@/lib/data/measurements"
import ProductErrorBoundary from "@/components/molecules/ProductErrorBoundary/ProductErrorBoundary"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"
import { buildProductBreadcrumbs } from "@/lib/utils/breadcrumbs"
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/helpers/seo"
import { getBatchLowestPrices } from "@/lib/data/price-history"
import { HttpTypes } from "@medusajs/types"
import { Suspense } from "react"

import { DeferredProductPageContent } from "./DeferredProductPageContent"

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

  // ✅ OPTIMIZATION: Get product's own variant IDs BEFORE Promise.allSettled
  // This allows us to fetch prices in parallel instead of sequentially
  const productVariantIds = product.variants?.map((v: any) => v.id).filter(Boolean) || []
  const selectedVariantId = Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id
    ? product.variants[0].id
    : undefined
  const currentLocale = "pl"
  const breadcrumbsPromise = buildProductBreadcrumbs(product, locale)

  // ✅ OPTIMIZATION: Keep only above-the-fold critical fetches in main PDP path.
  // Removed noStore() to enable ISR caching - user data now fetched client-side
  const [
    vendorStatusResult,
    promotionalProductsResult,
    productPricesResult,
    deliveryTimeframeResult,
    measurementsResult,
  ] = await Promise.allSettled([
    // Vendor status — no Promise.race wrapper (causes memory leaks/unhandled rejections)
    // getVendorCompleteStatus has its own AbortSignal.timeout(10000) internally
    product.seller?.id
      ? getVendorCompleteStatus(product.seller.id).catch(() => ({
          availability: undefined,
          holiday: undefined,
          suspension: undefined,
        }))
      : Promise.resolve({
          availability: undefined,
          holiday: undefined,
          suspension: undefined,
        }),

    // Current product promotions — targeted fetch via /store/products/{id}/promotions
    // Only fetches promotions for this specific product (not all 50 promotional products globally)
    // PromotionDataProvider will fetch promotions for card products (seller/suggested) client-side
    getProductPromotions(product.id).catch(() => []),

    // ✅ OPTIMIZATION: Fetch product's own prices IN PARALLEL (not after Promise.allSettled)
    productVariantIds.length > 0 && region
      ? getBatchLowestPrices(productVariantIds, 'PLN', region.id, 30)
      : Promise.resolve({}),

    getProductDeliveryTimeframe(product.id),

    getProductMeasurements(product.id, selectedVariantId, currentLocale),
  ])

  // ✅ Extract batched vendor status
  const vendorStatus =
    vendorStatusResult.status === "fulfilled"
      ? (vendorStatusResult.value as any)
      : { availability: undefined, holiday: undefined, suspension: undefined }

  const availability = vendorStatus?.availability
  const holidayMode = vendorStatus?.holiday
  const suspension = vendorStatus?.suspension

  const breadcrumbs = await breadcrumbsPromise
 
  // Current product's own promotions — merge into product object for PromotionDataProvider
  const currentProductPromotions =
    promotionalProductsResult.status === "fulfilled"
      ? (promotionalProductsResult.value as any[])
      : []
  const currentProductWithPromotions = currentProductPromotions.length > 0
    ? { ...product, promotions: currentProductPromotions, has_promotions: true }
    : product

  const initialVariantAttributes = undefined
  const sellerForDetails = product.seller as HttpTypes.StoreProduct["seller"]

  const productPrices = productPricesResult.status === "fulfilled"
    ? productPricesResult.value as Record<string, any>
    : {}

  // Keep SSR critical path focused on the viewed product.
  // Seller/suggested section prices are below-fold and loaded by BatchPriceProvider on the client.
  const initialPriceData: Record<string, any> = { ...productPrices }

  const deliveryTimeframe =
    deliveryTimeframeResult.status === "fulfilled"
      ? deliveryTimeframeResult.value
      : null

  const initialMeasurements =
    measurementsResult.status === "fulfilled" && Array.isArray(measurementsResult.value)
      ? measurementsResult.value
      : undefined

  const galleryImages = (() => {
    const thumbnailUrl = (product as any)?.thumbnail
    const baseImages = Array.isArray((product as any)?.images)
      ? (product as any).images.filter((image: any) => image?.url)
      : Array.isArray(product?.images)
        ? product.images.filter((image: any) => image?.url)
        : []

    if (!thumbnailUrl) {
      return baseImages
    }

    const dedupedImages = baseImages.filter((image: any) => image.url !== thumbnailUrl)

    return [{ id: `thumbnail-${product.id}`, url: thumbnailUrl }, ...dedupedImages]
  })()

  const prefetchedProductReviews: any[] = []

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
  const productJsonLd = generateProductJsonLd(
    product,
    productPrice,
    "PLN",
    prefetchedProductReviews
  )
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
        <div className="max-w-[1920px] mx-auto  py-2 lg:py-6  text-xl">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Promotion data for current product is server-fetched; card products fetched client-side */}
        {/* serverDataProvided=false allows client to fetch promotions for seller/suggested cards */}
        <PromotionDataProvider 
          countryCode={locale} 
          limit={50}
          initialData={[currentProductWithPromotions]}
          serverDataProvided={false}
        >
          <BatchPriceProvider 
            currencyCode="PLN"
            regionId={region?.id}
            days={30}
            initialPriceData={initialPriceData}
          >
            {/* ✅ OPTIMIZATION: User data fetched client-side to enable ISR caching */}
            <ProductUserDataProvider productId={product.id}>
              <VendorAvailabilityProvider
                vendorId={product.seller?.id}
                vendorName={product.seller?.name}
                availability={availability}
                holidayMode={holidayMode}
                suspension={suspension}
                showModalOnLoad={!!availability?.onHoliday}
              >
                {/* Single responsive layout: stacked on mobile, side-by-side on desktop */}
                <div className="flex flex-col md:flex-row md:gap-6 lg:gap-12 max-w-[1920px] mx-auto md:px-4 lg:px-0">
                  {/* Gallery: full-width stacked on mobile, sticky left half on desktop */}
                  <div className="w-full md:w-1/2 md:max-w-[calc(50%-12px)] lg:max-w-none md:px-0 md:sticky md:top-20 md:self-start">
                    <ProductGallery
                      images={galleryImages}
                      title={product?.title || ""}
                    />
                  </div>

                  {/* Details: below gallery on mobile, scrollable right half on desktop */}
                  <div className="w-full mt-4 md:mt-0 md:w-1/2 md:max-w-[calc(50%-12px)] lg:max-w-none md:px-0">
                    {sellerForDetails ? (
                      <ProductDetails
                        product={{ ...product, seller: sellerForDetails }}
                        locale={locale}
                        region={region}
                        initialVariantAttributes={initialVariantAttributes}
                        initialDeliveryTimeframe={deliveryTimeframe}
                        initialMeasurements={initialMeasurements}
                      />
                    ) : (
                      <div className="p-4 bg-red-50 text-red-800 rounded">
                        Seller information is missing for this product.
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ OPTIMIZATION: Defer below-fold content to prioritize gallery/details first paint */}
                <Suspense fallback={null}>
                  <DeferredProductPageContent
                    product={product}
                    region={region}
                    prefetchedReviews={prefetchedProductReviews}
                  />
                </Suspense>
              </VendorAvailabilityProvider>
            </ProductUserDataProvider>
          </BatchPriceProvider>
        </PromotionDataProvider>
      </ProductErrorBoundary>
    </>
  )
}