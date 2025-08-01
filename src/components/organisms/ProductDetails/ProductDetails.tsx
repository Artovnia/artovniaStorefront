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
import { getProductReviews } from "@/lib/data/reviews"
import { SellerProps } from "@/types/seller"
import { Wishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import "@/types/medusa" // Import extended types
import { ProductReviews } from "@/components/organisms/ProductReviews/ProductReviews"
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
  // Fetch all data in parallel to prevent layout shifts
  const [user, authenticated, reviewsData, measurements] = await Promise.allSettled([
    retrieveCustomer(),
    isAuthenticated(),
    getProductReviews(product.id),
    (async () => {
      // Determine if we're viewing a specific variant
      let selectedVariantId: string | undefined
      if (Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id) {
        selectedVariantId = product.variants[0].id
      }
      
      // Determine locale for measurements (default to 'en' if not supported)
      const supportedLocales = ['en', 'pl']
      const currentLocale = supportedLocales.includes(locale) ? locale : 'en'
      
      // Fetch physical measurements from the product and all variants (prioritizing selected variant)
      return await getProductMeasurements(product.id, selectedVariantId, currentLocale)
    })()
  ])

  // Extract results with fallbacks
  const customer = user.status === 'fulfilled' ? user.value : null
  const isUserAuthenticated = authenticated.status === 'fulfilled' ? authenticated.value : false
  const reviews = reviewsData.status === 'fulfilled' ? reviewsData.value?.reviews || [] : []
  const productMeasurements = measurements.status === 'fulfilled' ? measurements.value : null

  let wishlist: Wishlist[] = []
  if (customer) {
    try {
      const response = await getUserWishlists()
      wishlist = response.wishlists
    } catch (error) {
      console.error('Error fetching wishlists:', error)
    }
  }
  
  // Determine selected variant ID for measurements
  let selectedVariantId: string | undefined
  if (Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id) {
    selectedVariantId = product.variants[0].id
  }
  
  // Determine locale for measurements (default to 'en' if not supported)
  const supportedLocales = ['en', 'pl']
  const currentLocale = supportedLocales.includes(locale) ? locale : 'en'
  


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
      <ProductDetailsShipping />
      <ProductDetailsFooter
        tags={product?.tags || []}
        posted={product?.created_at || null}
      />
      <ProductDetailsSellerReviews seller={product.seller} />
      <ProductReviews
        productId={product.id}
        isAuthenticated={isUserAuthenticated}
        customer={customer}
        prefetchedReviews={reviews}
      />
    </div>
  )
}