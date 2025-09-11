"use client"
import Image from "next/image"

import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@/i18n/routing"
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getPromotionalPrice } from "@/lib/helpers/get-promotional-price"
import { usePromotionData } from "@/components/context/PromotionDataProvider"
import { BaseHit, Hit } from "instantsearch.js"
import { useHoverPrefetch } from "@/hooks/useHoverPrefetch"
import clsx from "clsx"
import { WishlistButton } from "@/components/cells/WishlistButton/WishlistButton"
import { BatchLowestPriceDisplay } from "@/components/cells/LowestPriceDisplay/BatchLowestPriceDisplay"
import { SerializableWishlist } from "@/types/wishlist"
import { useRouter } from "next/navigation"

export const ProductCard = ({
  product,
  sellerPage = false,
  themeMode = 'default',
  user = null,
  wishlist = [],
  onWishlistChange,
}: {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>
  sellerPage?: boolean
  themeMode?: 'default' | 'light' | 'dark'
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  onWishlistChange?: () => void
}) => {
  const { prefetchOnHover } = useHoverPrefetch()
  const router = useRouter()
  const { getProductWithPromotions } = usePromotionData()
  const productUrl = `/products/${product.handle}`
  
  // Try to get promotional product data from context first
  const promotionalProduct = getProductWithPromotions(product.id)
  const productToUse = promotionalProduct || product

  // Calculate promotional pricing using helper function
  const promotionalPricing = getPromotionalPrice({
    product: productToUse as any,
    regionId: productToUse.variants?.[0]?.calculated_price?.region_id
  })


  // Calculate promotional pricing using helper function
  // const promotionalPricing = getPromotionalPrice({
  //   product: product as any,
  //   regionId: undefined
  // })
  
  // Check if product has any discount (promotion or price-list)
  const hasAnyDiscount = promotionalPricing.discountPercentage > 0 || 
    product.variants?.some((variant: any) => 
      variant.calculated_price && 
      variant.calculated_price.calculated_amount !== variant.calculated_price.original_amount &&
      variant.calculated_price.calculated_amount < variant.calculated_price.original_amount
    )
  
  // Fallback prefetch method that works even if hook fails
  const handleMouseEnter = () => {
    try {
      router.prefetch(`/products/${product.handle}`)
    } catch (error) {
      console.error('❌ Fallback prefetch failed for:', productUrl, error)
    }
  }
  
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const { cheapestPrice: sellerCheapestPrice } = getSellerProductPrice({
    product,
  })

  return (
    <div
      className={clsx(
        "relative group flex flex-col h-full w-[252px]", // CARD SIZE ADJUSTMENT: Reduced from w-[280px] to w-[252px] (10% smaller). Change this value to adjust card width.
        {
          "p-2": sellerPage,
          "p-1": !sellerPage
        }
      )}
      {...prefetchOnHover(productUrl)}
      onMouseEnter={handleMouseEnter}
    >
      {/* CARD SIZE ADJUSTMENT: Product card dimensions reduced by 10% for better carousel spacing */}
      {/* Original size: h-[350px] w-[280px] | New size: h-[315px] w-[252px] */}
      {/* TO ADJUST CARD SIZE: Modify both width values above and height/width values below */}
      <div className="relative bg-primary h-[315px] w-[252px] flex-shrink-0">
        <div className="absolute right-3 top-3 z-10 cursor-pointer">
          <WishlistButton 
            productId={product.id} 
            user={user} 
            wishlist={wishlist}
            onWishlistChange={onWishlistChange} 
          />
        </div>
        {/* Promotion Badge - Triangle Corner */}
        {hasAnyDiscount && (
          <div className="absolute top-0 left-0 z-10">
            <div className="relative">
              <div 
                className="w-[50px] h-[50px]"
                style={{
                  background: 'linear-gradient(135deg, #3B3634 0%, #6B3A3A 50%, #8B4A4A 100%)',
                  clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                }}
              ></div>
              <span className="absolute top-2 left-2 text-[#F4F0EB] text-xs font-bold transform ">
                %
              </span>
            </div>
          </div>
        )}
        <Link href={productUrl} prefetch={true}>
          <div className="overflow-hidden w-full h-full flex justify-center items-center">
            {product.thumbnail ? (
              <Image
                src={decodeURIComponent(product.thumbnail)}
                alt={product.title}
                width={320}
                height={320}
                className="object-cover w-full object-center h-full lg:group-hover:scale-105 transition-all duration-300"
                priority
              />
            ) : (
              <Image
                src="/images/placeholder.svg"
                alt="Product placeholder"
                width={100}
                height={100}
                className="flex margin-auto w-[100px] h-auto"
              />
            )}
          </div>
        </Link>
        <Link href={productUrl} prefetch={true}>
          <Button className="absolute bg-[#3B3634] opacity-90    text-white h-auto lg:h-[48px] lg:group-hover:block hidden w-full uppercase bottom-0 z-10 overflow-hidden">
            Zobacz więcej
          </Button>
        </Link>
      </div>
      <Link href={`/products/${product.handle}`}>
        <div className="flex justify-between flex-grow mt-2">
          <div className="w-full font-instrument-sans">
            <h3 className={`text-md font-instrument-sans truncate mb-1 leading-tight font-bold ${themeMode === 'light' ? 'text-white' : ''}`}>
              {product.title}
            </h3>
            
            {/* Seller name below title */}
            {product.seller && (
              <p className={`font-instrument-sans text-sm mb-1  ${themeMode === 'light' ? 'text-white/80' : 'text-black'}`}>
                {product.seller.name}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              {hasAnyDiscount ? (
                <>
                  {/* Always use promotional pricing data when any discount is detected */}
                  {promotionalPricing.discountPercentage > 0 ? (
                    <>
                      <p className={`font-instrument-sans font-semibold text-md text-[#3B3634] ${themeMode === 'light' ? 'text-white' : ''}`}>
                        {promotionalPricing.promotionalPrice}
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        {promotionalPricing.originalPrice}
                      </p>
                      {/* Only show percentage badge for actual promotions, not price-list discounts */}
                      {(product as any).has_promotions && (product as any).promotions?.length > 0 && (
                        <span className="relative bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-2xl border border-red-400/20 overflow-hidden group">
                           <span className="relative z-10 tracking-wide">-{promotionalPricing.discountPercentage}%</span>
                           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-300/50 to-transparent"></div>
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Fallback: Show price list discount pricing */}
                      <p className={`font-instrument-sans font-semibold text-md text-[#3B3634] ${themeMode === 'light' ? 'text-white' : ''}`}>
                        {(sellerCheapestPrice?.calculated_price || cheapestPrice?.calculated_price)?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                      </p>
                      {sellerCheapestPrice?.calculated_price
                        ? sellerCheapestPrice?.calculated_price !==
                            sellerCheapestPrice?.original_price && (
                            <p className="text-xs text-gray-500 line-through">
                              {sellerCheapestPrice?.original_price?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                            </p>
                          )
                        : cheapestPrice?.calculated_price !==
                            cheapestPrice?.original_price && (
                            <p className="text-xs text-gray-500 line-through">
                              {cheapestPrice?.original_price?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                            </p>
                          )}
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Regular price display when no discounts */}
                  <p className={`font-instrument-sans font-semibold text-md ${themeMode === 'light' ? 'text-white' : ''}`}>
                    {(sellerCheapestPrice?.calculated_price || cheapestPrice?.calculated_price)?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                  </p>
                </>
              )}
            </div>
            
            {/* Lowest Price Display - only show if there are active promotions or price list discounts */}
            {product.variants && product.variants.length > 0 && hasAnyDiscount && (
              <div className="mt-2">
                <BatchLowestPriceDisplay
                  variantId={product.variants[0].id}
                  currencyCode="PLN"
                  className="text-xs"
                  themeMode={themeMode}
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}