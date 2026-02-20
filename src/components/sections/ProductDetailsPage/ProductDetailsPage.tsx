import { ProductGallery } from "../../../components/organisms"
import { ProductDetails } from "../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"
import { PromotionDataProvider } from "@/components/context/PromotionDataProvider"
import { ProductUserDataProvider } from "@/components/context/ProductUserDataProvider"
import { listProductsLean, getProductPromotions, listSuggestedProducts, getProductShippingOptions } from "../../../lib/data/products"
import { getVendorCompleteStatus } from "../../../lib/data/vendor-availability"
import ProductErrorBoundary from "@/components/molecules/ProductErrorBoundary/ProductErrorBoundary"
import { Breadcrumbs } from "@/components/atoms/Breadcrumbs/Breadcrumbs"
import { buildProductBreadcrumbsLocal } from "@/lib/utils/breadcrumbs"
import { generateProductJsonLd, generateBreadcrumbJsonLd } from "@/lib/helpers/seo"
import { Link } from "@/i18n/routing"
import { getBatchLowestPrices } from "@/lib/data/price-history"
import { HttpTypes } from "@medusajs/types"
import { Suspense } from "react"

import { ProductPageUserContent } from "./ProductPageUserContent"

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

  // ✅ OPTIMIZATION: Get product's own variant IDs BEFORE Promise.allSettled
  // This allows us to fetch prices in parallel instead of sequentially
  const productVariantIds = product.variants?.map((v: any) => v.id).filter(Boolean) || []

  // ✅ OPTIMIZATION: Parallel fetch EVERYTHING (including prices) - NO WATERFALL
  // Removed noStore() to enable ISR caching - user data now fetched client-side
  const [
    sellerProductsResult,
    vendorStatusResult,
    breadcrumbsResult,
    promotionalProductsResult,
    shippingOptionsResult,
    variantAttributesResult,
    categoryProductsResult,
    productPricesResult,
  ] = await Promise.allSettled([
    // Seller products — lean fields only (cards don't need full product payload)
    product.seller?.id && region
      ? listProductsLean({
          seller_id: product.seller!.id,
          regionId: region.id,
          queryParams: { limit: 8 },
        }).then(r => r.response.products).catch(() => [])
      : Promise.resolve([]),

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

    // Breadcrumbs — built locally from product.categories (no network call)
    Promise.resolve(buildProductBreadcrumbsLocal(product, locale)),

    // Current product promotions — targeted fetch via /store/products/{id}/promotions
    // Only fetches promotions for this specific product (not all 50 promotional products globally)
    // PromotionDataProvider will fetch promotions for card products (seller/suggested) client-side
    getProductPromotions(product.id).catch(() => []),

    // Shipping options — server-side fetch with revalidate:300 (no client-side fetch needed)
    product.id && region?.id
      ? getProductShippingOptions(product.id, region.id).catch(() => [])
      : Promise.resolve([]),

    // ✅ OPTIMIZATION: Prefetch initial variant attributes on server
    initialVariantId
      ? (async () => {
          const { getVariantAttributes } = await import("@/lib/data/variant-attributes")
          return getVariantAttributes(product.id, initialVariantId)
        })().catch(() => ({ attribute_values: [] }))
      : Promise.resolve({ attribute_values: [] }),

    // ✅ Suggested products: "Może Ci się spodobać" section
    region
      ? listSuggestedProducts({ product, regionId: region.id, limit: 8 })
          .catch(() => ({ products: [], categoryName: '', categoryHandle: '' }))
      : Promise.resolve({ products: [], categoryName: '', categoryHandle: '' }),

    // ✅ OPTIMIZATION: Fetch product's own prices IN PARALLEL (not after Promise.allSettled)
    productVariantIds.length > 0 && region
      ? getBatchLowestPrices(productVariantIds, 'PLN', region.id, 30)
      : Promise.resolve({}),
  ])

  // Extract results with fallbacks
  const sellerProducts =
    sellerProductsResult.status === "fulfilled"
      ? sellerProductsResult.value
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
 
  // Current product's own promotions — merge into product object for PromotionDataProvider
  const currentProductPromotions =
    promotionalProductsResult.status === "fulfilled"
      ? (promotionalProductsResult.value as any[])
      : []
  const currentProductWithPromotions = currentProductPromotions.length > 0
    ? { ...product, promotions: currentProductPromotions, has_promotions: true }
    : product

  const initialShippingOptions =
    shippingOptionsResult.status === "fulfilled"
      ? (shippingOptionsResult.value as any[])
      : []

  const initialVariantAttributes =
    variantAttributesResult.status === "fulfilled"
      ? (variantAttributesResult.value as { attribute_values: any[] })
      : { attribute_values: [] }

  const suggestedProductsData =
    categoryProductsResult.status === "fulfilled"
      ? categoryProductsResult.value as { products: any[]; categoryName: string; categoryHandle: string }
      : { products: [], categoryName: '', categoryHandle: '' }

  const suggestedProducts = suggestedProductsData.products

  const productPrices = productPricesResult.status === "fulfilled"
    ? productPricesResult.value as Record<string, any>
    : {}

  // Keep SSR critical path focused on the viewed product.
  // Seller/suggested section prices are below-fold and loaded by BatchPriceProvider on the client.
  const initialPriceData: Record<string, any> = { ...productPrices }

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
  const productJsonLd = generateProductJsonLd(product, productPrice, "PLN", [])
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
                      images={product?.images || []}
                      title={product?.title || ""}
                    />
                  </div>

                  {/* Details: below gallery on mobile, scrollable right half on desktop */}
                  <div className="w-full mt-4 md:mt-0 md:w-1/2 md:max-w-[calc(50%-12px)] lg:max-w-none md:px-0">
                    {product.seller ? (
                      <ProductDetails
                        product={{ ...product, seller: product.seller }}
                        locale={locale}
                        region={region}
                        initialVariantAttributes={initialVariantAttributes}
                        initialShippingOptions={initialShippingOptions}
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
                  <div className="my-12 xl:mt-40 text-black max-w-[1920px] mx-auto" aria-label={`Więcej produktów od ${product.seller?.name || 'sprzedawcy'}`}>
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
                              aria-label={`Zobacz wszystkie produkty od ${product.seller.name}`}
                            >
                              <span className="absolute inset-0 bg-[#3B3634] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" aria-hidden="true"></span>
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
                                aria-hidden="true"
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

                    {/* ✅ User-specific content rendered via client component */}
                    <ProductPageUserContent
                      productId={product.id}
                      sellerProducts={sellerProducts as any}
                      suggestedProducts={suggestedProducts as any}
                      suggestedCategoryName={suggestedProductsData.categoryName}
                      suggestedCategoryHandle={suggestedProductsData.categoryHandle}
                      sellerName={product.seller?.name}
                      sellerHandle={product.seller?.handle}
                    />
                  </div>
                </Suspense>
              </VendorAvailabilityProvider>
            </ProductUserDataProvider>
          </BatchPriceProvider>
        </PromotionDataProvider>
      </ProductErrorBoundary>
    </>
  )
}