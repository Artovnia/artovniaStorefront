import {
  ProductDetailsFooter,
  ProductDetailsHeader,
  ProductDetailsMeasurements,
  ProductDetailsSellerReviews,
  ProductPageDetails,
} from "@/components/cells"
import { ProductDetailsShippingWrapper } from "@/components/cells/ProductDetailsShipping/ProductDetailsShippingWrapper"
import { DeliveryTimeframe } from "@/lib/data/delivery-timeframe"
// ✅ REMOVED: retrieveCustomer, isAuthenticated, getUserWishlists - now fetched client-side via ProductUserDataProvider
import { SellerProps } from "@/types/seller"
import { SingleProductMeasurement } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import "@/types/medusa"
import { ProductAdditionalAttributes } from "@/components/cells/ProductAdditionalAttributes/ProductAdditionalAttributes"
import { ProductDetailsClient } from "@/components/organisms/ProductDetails/ProductDetailsClient"
import { MeasurementsErrorBoundary } from "./MeasurementsErrorBoundary"
import { Suspense } from "react"

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
  initialDeliveryTimeframe,
  initialMeasurements,
}: {
  product: HttpTypes.StoreProduct & { 
    seller: SellerProps
  }
  locale: string
  region?: HttpTypes.StoreRegion | null
  initialVariantAttributes?: { attribute_values: any[] }
  initialShippingOptions?: any[]
  initialDeliveryTimeframe?: DeliveryTimeframe | null
  initialMeasurements?: SingleProductMeasurement[]
}) => {
  // Pre-calculate variant and locale data
  const selectedVariantId = Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id 
    ? product.variants[0].id 
    : undefined
  
  const supportedLocales = ['en', 'pl']
  const currentLocale = supportedLocales.includes(locale) ? locale : 'en'

  const deliveryTimeframe: DeliveryTimeframe | null = initialDeliveryTimeframe ?? null

  const safeInitialMeasurements: SingleProductMeasurement[] | undefined =
    initialMeasurements && isValidMeasurementsArray(initialMeasurements)
      ? initialMeasurements
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
          initialMeasurements={safeInitialMeasurements}
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
      <Suspense fallback={null}>
        <ProductDetailsFooter
          product={product}
          regionId={region?.id}
        />
      </Suspense>
      
    </div>
  )
}