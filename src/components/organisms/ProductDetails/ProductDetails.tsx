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

  // Fetch delivery timeframe for the product
  let deliveryTimeframe: DeliveryTimeframe | null = null
  try {
    deliveryTimeframe = await getProductDeliveryTimeframe(product.id)
  } catch (error) {
    // Delivery timeframe is optional, don't block page render
  }

  // Try to load measurements quickly, but don't block page render
  let initialMeasurements: SingleProductMeasurement[] | undefined = undefined
  try {
    const measurementsResult = await getProductMeasurements(product.id, selectedVariantId, currentLocale)
    if (isValidMeasurementsArray(measurementsResult)) {
      initialMeasurements = measurementsResult
    }
  } catch (error) {
    // Measurements will be loaded client-side
  }

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