import {
  ProductDetailsFooter,
  ProductDetailsHeader,
  ProductDetailsMeasurements,
  ProductDetailsSellerReviews,
  ProductPageDetails,
} from "@/components/cells"
import { ProductDetailsShippingWrapper } from "@/components/cells/ProductDetailsShipping/ProductDetailsShippingWrapper"
import { getProductMeasurements } from "@/lib/data/measurements"
// ✅ REMOVED: retrieveCustomer, isAuthenticated, getUserWishlists - now passed from parent
import { unifiedCache } from "@/lib/utils/unified-cache"
import { SellerProps } from "@/types/seller"
import { SerializableWishlist } from "@/types/wishlist"
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
  user,
  wishlist: wishlistProp,
}: {
  product: HttpTypes.StoreProduct & { 
    seller: SellerProps
  }
  locale: string
  region?: HttpTypes.StoreRegion | null
  initialVariantAttributes?: { attribute_values: any[] }
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}) => {
  // Pre-calculate variant and locale data
  const selectedVariantId = Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id 
    ? product.variants[0].id 
    : undefined
  
  const supportedLocales = ['en', 'pl']
  const currentLocale = supportedLocales.includes(locale) ? locale : 'en'
  
  // ✅ OPTIMIZED: Use user and wishlist from props (passed from ProductDetailsPage)
  // This ensures fresh data on router.refresh() instead of stale cached data
  const customer = user || null
  const wishlist = wishlistProp || []

  // Try to load measurements quickly, but don't block page render
  let initialMeasurements: SingleProductMeasurement[] | undefined = undefined
  try {
    // Set a very short timeout for initial measurements load
    const measurementsPromise = unifiedCache.get(
      `measurements:${product.id}:${selectedVariantId || 'no-variant'}:${currentLocale}`,
      () => getProductMeasurements(product.id, selectedVariantId, currentLocale)
    )
    
    // Race against a reasonable timeout with proper cleanup
    let timeoutId: NodeJS.Timeout
    const timeoutPromise = new Promise<null>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Initial measurements timeout')), 3000) // 3 seconds max
    })

    const measurementsResult = await Promise.race([
      measurementsPromise,
      timeoutPromise
    ]).finally(() => {
      // Always clear timeout to prevent memory leaks
      if (timeoutId) clearTimeout(timeoutId)
    })
    
    // Validate the result is the correct type
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
          user={customer}
          wishlist={wishlist}
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
      {/* ✅ OPTIMIZED: ProductDetailsShippingWrapper uses CartContext for region, with server region as fallback */}
      <ProductDetailsShippingWrapper product={product} locale={locale} region={region} />
      <ProductDetailsFooter
        tags={product?.tags || []}
        posted={product?.created_at || null}
        product={product}
      />
      
    </div>
  )
}