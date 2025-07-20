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
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SellerProps } from "@/types/seller"
import { Wishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import "@/types/medusa" // Import extended types
import { ProductReviews } from "@/components/organisms/ProductReviews/ProductReviews"
import { ServerProductReviews } from "../ProductReviews/ServerProductReviews"
import { Suspense } from "react"
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
  const user = await retrieveCustomer()

  let wishlist: Wishlist[] = []
  if (user) {
    const response = await getUserWishlists()
    wishlist = response.wishlists
  }
  
  // Determine if we're viewing a specific variant
  // If there's a selected variant in the URL or first variant, use that
  let selectedVariantId: string | undefined
  if (Array.isArray(product.variants) && product.variants.length > 0 && product.variants[0]?.id) {
    selectedVariantId = product.variants[0].id
  }
  
  // Determine locale for measurements (default to 'en' if not supported)
  const supportedLocales = ['en', 'pl']
  const currentLocale = supportedLocales.includes(locale) ? locale : 'en'
  
  // Fetch physical measurements from the product and all variants (prioritizing selected variant)
  const measurements = await getProductMeasurements(product.id, selectedVariantId, currentLocale)
  


  return (
    <div>
      <ProductDetailsClient initialVariantId={selectedVariantId}>
        <ProductDetailsHeader
          product={product as any}
          locale={locale}
          user={user}
          wishlist={wishlist}
        />
        <ProductAdditionalAttributes
          product={product}
        />
        <ProductPageDetails details={product?.description || ""} />
        <ProductDetailsMeasurements 
          productId={product.id}
          locale={currentLocale}
          initialMeasurements={measurements}
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
      <Suspense fallback={
        <div className="w-full py-8">
          <div className="border-t border-ui-border-base pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-ui-fg-base">Recenzje produktu</h2>
            </div>
            <div className="w-full py-12">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-border-interactive"></div>
              </div>
            </div>
          </div>
        </div>
      }>
        <ServerProductReviews productId={product.id} />
      </Suspense>
    </div>
  )
}
