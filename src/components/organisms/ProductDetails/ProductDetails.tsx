import {
  ProductDetailsFooter,
  ProductDetailsHeader,
  ProductDetailsMeasurements,
  ProductDetailsSellerReviews,
  ProductDetailsShipping,
  ProductPageDetails,
} from "@/components/cells"
import { getProductMeasurements } from "@/lib/data/measurements"
import { retrieveCustomer, isAuthenticated } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { retrieveCart } from "@/lib/data/cart"
import { unifiedCache } from "@/lib/utils/unified-cache"
import { SellerProps } from "@/types/seller"
import { Wishlist, SerializableWishlist } from "@/types/wishlist"
import { SingleProductMeasurement } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import "@/types/medusa"
import { ProductGPSR } from "@/components/molecules/ProductGPSR/ProductGPSR"
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
}: {
  product: HttpTypes.StoreProduct & { 
    seller: SellerProps
  }
  locale: string
}) => {
  // Pre-calculate variant and locale data
  const selectedVariantId = Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id 
    ? product.variants[0].id 
    : undefined
  
  const supportedLocales = ['en', 'pl']
  const currentLocale = supportedLocales.includes(locale) ? locale : 'en'
  
  // Get region from cart (respects user's selection in CountrySelector)
  const [cart, user, authenticated] = await Promise.allSettled([
    retrieveCart(), // Get cart with user-selected region
    retrieveCustomer(), // Direct call - no cache for user data
    isAuthenticated(),  // Direct call - no cache for auth data
  ])

  // Extract results
  const cartData = cart.status === 'fulfilled' ? cart.value : null
  let regionData: HttpTypes.StoreRegion | null = cartData?.region || null
  
  // If no region from cart, fetch default region (Poland)
  if (!regionData) {
    const { getRegion } = await import('@/lib/data/regions')
    const fetchedRegion = await getRegion(locale).catch(() => null)
    regionData = fetchedRegion || null
  }
  
 
  const customer = user.status === 'fulfilled' ? user.value : null
  const isUserAuthenticated = authenticated.status === 'fulfilled' ? authenticated.value : false

  // Load wishlist if user is authenticated - use safe cache key
  let wishlist: SerializableWishlist[] = []
  if (customer) {
    try {
      const response = await unifiedCache.get(
        `wishlists:user:${customer.id}:data`, // More specific, still user-specific but clearer
        () => getUserWishlists()
      )
      wishlist = response.wishlists
    } catch (error) {
      console.error('Error fetching wishlists:', error)
    }
  }

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
        />
        <ProductPageDetails details={product?.description || ""} />
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
      <ProductGPSR product={product} />
      <ProductDetailsShipping product={product} region={regionData as HttpTypes.StoreRegion} />
      <ProductDetailsFooter
        tags={product?.tags || []}
        posted={product?.created_at || null}
      />
      <ProductDetailsSellerReviews seller={product.seller} />
    </div>
  )
}