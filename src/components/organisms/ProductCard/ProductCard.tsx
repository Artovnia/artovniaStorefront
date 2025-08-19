"use client"
import Image from "next/image"

import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@/i18n/routing"
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getPromotionalPrice } from "@/lib/helpers/get-promotional-price"
import { BaseHit, Hit } from "instantsearch.js"
import clsx from "clsx"
import { WishlistButton } from "@/components/cells/WishlistButton/WishlistButton"
import { useHoverPrefetch } from "@/hooks/useHoverPrefetch"
import { useRouter } from "next/navigation"
import { SerializableWishlist } from "@/types/wishlist"

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
  const productUrl = `/products/${product.handle}`
  // Use seller name from the product object directly instead of trying to fetch it
  // The seller should already be included in the product data
  
  // Use provided props without additional internal state management
  // This avoids unnecessary duplicate API calls
  
  // No need for useEffect or internal state when props are now always provided from parent
  // This prevents the infinite API call loop
  
  // Fallback prefetch method that works even if hook fails
  const handleMouseEnter = () => {
    try {
      router.prefetch(productUrl)
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

  // Check if this product has promotions and calculate promotional price
  const promotionalPricing = getPromotionalPrice({
    product: product as any,
    regionId: undefined // Will use default region
  })

  // Use actual promotional pricing data
  const finalPromotionalPricing = promotionalPricing


  

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
              {finalPromotionalPricing.hasPromotion ? (
                <>
                  <p className={`font-instrument-sans font-semibold text-md text-red-600 ${themeMode === 'light' ? 'text-red-400' : ''}`}>
                    {finalPromotionalPricing.promotionalPrice}
                  </p>
                  <p className="text-xs text-gray-500 line-through">
                    {finalPromotionalPricing.originalPrice}
                  </p>
                  <span className="relative bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-2xl border border-red-400/20 overflow-hidden group">
                     <span className="relative z-10 tracking-wide">-{finalPromotionalPricing.discountPercentage}%</span>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                     <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-300/50 to-transparent"></div>
                  </span>
                </>
              ) : (
                <>
                  <p className={`font-instrument-sans font-semibold text-md ${themeMode === 'light' ? 'text-white' : ''}`}>
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
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}