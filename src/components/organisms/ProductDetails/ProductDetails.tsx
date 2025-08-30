import {
  ProductDetailsFooter,
  ProductDetailsHeader,
  ProductDetailsMeasurements,
  ProductDetailsSeller,
  ProductDetailsSellerReviews,
  ProductDetailsShipping,
  ProductPageDetails,
} from "@/components/cells"
import { getProductMeasurements } from "@/lib/data/measurements"
import { retrieveCustomer, isAuthenticated } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { getRegion } from "@/lib/data/regions"
import { globalDeduplicator, measurementDeduplicator } from "@/lib/utils/performance"
import { SellerProps } from "@/types/seller"
import { Wishlist, SerializableWishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import "@/types/medusa" // Import extended types
import { ProductGPSR } from "@/components/molecules/ProductGPSR/ProductGPSR"
import { ProductAdditionalAttributes } from "@/components/cells/ProductAdditionalAttributes/ProductAdditionalAttributes"
import { VariantSelectionProvider } from "@/components/context/VariantSelectionContext"
// Import a client component wrapper for the provider
import { ProductDetailsClient } from "@/components/organisms/ProductDetails/ProductDetailsClient"

export const ProductDetails = async ({
  product,
  locale,
}: {
  product: HttpTypes.StoreProduct & { 
    seller: SellerProps
  }
  locale: string
}) => {
  // Pre-calculate variant and locale data to avoid duplication
  const selectedVariantId = Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id 
    ? product.variants[0].id 
    : undefined
  
  const supportedLocales = ['en', 'pl']
  const currentLocale = supportedLocales.includes(locale) ? locale : 'en'
  
  // Optimized parallel data fetching with better cache keys
  const [user, authenticated, measurements, region] = await Promise.allSettled([
    globalDeduplicator.dedupe(`customer-${product.id}`, retrieveCustomer),
    globalDeduplicator.dedupe(`auth-${product.id}`, isAuthenticated),
    measurementDeduplicator.dedupe(
      `measurements-${product.id}-${selectedVariantId || 'default'}-${currentLocale}`,
      () => getProductMeasurements(product.id, selectedVariantId, currentLocale)
    ),
    globalDeduplicator.dedupe(`region-pl`, () => getRegion("pl"))
  ])

  // Extract results with fallbacks
  const customer = user.status === 'fulfilled' ? user.value : null
  const isUserAuthenticated = authenticated.status === 'fulfilled' ? authenticated.value : false
  const productMeasurements = measurements.status === 'fulfilled' ? measurements.value : null
  const regionData = region.status === 'fulfilled' ? region.value : null

  let wishlist: SerializableWishlist[] = []
  if (customer) {
    try {
      // Use deduplication for wishlist fetching
      const response = await globalDeduplicator.dedupe(
        `wishlists-${customer.id}`,
        () => getUserWishlists()
      )
      wishlist = response.wishlists
    } catch (error) {
      console.error('Error fetching wishlists:', error)
    }
  }
  
  // Variables already calculated above - no need to redeclare
  


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
        />
        <ProductPageDetails details={product?.description || ""} />
        <ProductDetailsMeasurements 
          productId={product.id}
          locale={currentLocale}
          initialMeasurements={productMeasurements || undefined}
          variants={product.variants?.map(v => ({
            id: v.id,
            title: v.title || undefined // Convert null to undefined
          })) || []}
        />
      </ProductDetailsClient>
      <ProductGPSR product={product} />
      <ProductDetailsShipping product={product} region={regionData} />
      <ProductDetailsFooter
        tags={product?.tags || []}
        posted={product?.created_at || null}
      />
      <ProductDetailsSellerReviews seller={product.seller} />
    </div>
  )
}