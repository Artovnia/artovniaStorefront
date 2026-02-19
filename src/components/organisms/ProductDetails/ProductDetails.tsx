import {
  ProductDetailsFooter,
  ProductDetailsHeader,
  ProductDetailsMeasurements,
  ProductDetailsSellerReviews,
  ProductPageDetails,
} from "@/components/cells"
import { ProductDetailsShippingWrapper } from "@/components/cells/ProductDetailsShipping/ProductDetailsShippingWrapper"
import { getProductMeasurements } from "@/lib/data/measurements"
import { getProductDeliveryTimeframe, DeliveryTimeframe } from "@/lib/data/delivery-timeframe"
// ✅ REMOVED: retrieveCustomer, isAuthenticated, getUserWishlists - now fetched client-side via ProductUserDataProvider
import { SellerProps } from "@/types/seller"
import { SingleProductMeasurement } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import "@/types/medusa"
import { ProductAdditionalAttributes } from "@/components/cells/ProductAdditionalAttributes/ProductAdditionalAttributes"
import { ProductDetailsClient } from "@/components/organisms/ProductDetails/ProductDetailsClient"
import { MeasurementsErrorBoundary } from "./MeasurementsErrorBoundary"

// Helper function to validate measurements data
function isValidMeasurementsArray(data: any): data is SingleProductMeasurement[] {
  return Array.isArray(data) && data.every((item: any) => 
    item && 
    typeof item === 'object' && 
    typeof item.label === 'string'
  )
}

export const ProductDetails = async ({
  product,
  locale,
  region,
  initialVariantAttributes,
  initialShippingOptions,
}: {
  product: HttpTypes.StoreProduct & { 
    seller: SellerProps
  }
  locale: string
  region?: HttpTypes.StoreRegion | null
  initialVariantAttributes?: { attribute_values: any[] }
  initialShippingOptions?: any[]
}) => {
  // Pre-calculate variant and locale data
  const selectedVariantId = Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id 
    ? product.variants[0].id 
    : undefined
  
  const supportedLocales = ['en', 'pl']
  const currentLocale = supportedLocales.includes(locale) ? locale : 'en'

  // Fetch optional data in parallel so one slow request doesn't create a waterfall.
  const [deliveryTimeframeResult, measurementsResult] = await Promise.allSettled([
    getProductDeliveryTimeframe(product.id),
    getProductMeasurements(product.id, selectedVariantId, currentLocale),
  ])

  const deliveryTimeframe: DeliveryTimeframe | null =
    deliveryTimeframeResult.status === "fulfilled"
      ? deliveryTimeframeResult.value
      : null

  const initialMeasurements: SingleProductMeasurement[] | undefined =
    measurementsResult.status === "fulfilled" &&
    isValidMeasurementsArray(measurementsResult.value)
      ? measurementsResult.value
      : undefined

  return (
    <div>
      <ProductDetailsClient initialVariantId={selectedVariantId}>
        <ProductDetailsHeader
          product={product as any}
          locale={locale}
          deliveryTimeframe={deliveryTimeframe}
        />
        <ProductAdditionalAttributes
          product={product}
          initialAttributes={initialVariantAttributes?.attribute_values}
        />
        <ProductPageDetails details={product?.description || ""} />
        <ProductDetailsSellerReviews seller={product.seller} />
        <MeasurementsErrorBoundary locale={locale}>
        <ProductDetailsMeasurements 
          productId={product.id}
          locale={currentLocale}
          initialMeasurements={initialMeasurements}
          variants={product.variants?.map(v => ({
            id: v.id,
            title: v.title || undefined
          })) || []}
        />
        </MeasurementsErrorBoundary>
      </ProductDetailsClient>
      {/* Shipping options pre-fetched server-side (revalidate:300) — no client-side fetch needed */}
      <ProductDetailsShippingWrapper
        product={product}
        locale={locale}
        region={region}
        initialShippingOptions={initialShippingOptions}
      />
      <ProductDetailsFooter
        tags={product?.tags || []}
        posted={product?.created_at || null}
        product={product}
      />
      
    </div>
  )
}