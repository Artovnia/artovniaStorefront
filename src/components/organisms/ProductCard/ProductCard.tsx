"use client"
import Image from "next/image"
import { useEffect, useState, useMemo, memo } from "react"

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

const ProductCardComponent = ({
  product,
  sellerPage = false,
  themeMode = 'default',
  user = null,
  wishlist = [],
  onWishlistChange,
  index = 999,
}: {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>
  sellerPage?: boolean
  themeMode?: 'default' | 'light' | 'dark'
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  onWishlistChange?: () => void
  index?: number  // ✅ NEW: For priority loading first 4 products
}) => {
  const { prefetchOnHover } = useHoverPrefetch()
  const router = useRouter()
  const { getProductWithPromotions, isLoading } = usePromotionData()
  const [isMounted, setIsMounted] = useState(false)
  const productUrl = `/products/${product.handle}`
  
  
  // Ensure component is mounted on client-side to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Try to get promotional product data from context first
  const promotionalProduct = getProductWithPromotions(product.id)
  const productToUse = promotionalProduct || product

  // Calculate promotional pricing using helper function for the first variant
  const promotionalPricing = useMemo(() => {
    const firstVariant = productToUse.variants?.[0]
    return getPromotionalPrice({
      product: productToUse as any,
      regionId: firstVariant?.calculated_price?.region_id,
      variantId: firstVariant?.id // Use specific variant ID for accurate pricing
    })
  }, [productToUse]) // Recalculate when product data changes

  // Check if product has any discount (promotion or price-list)
  // Only show after mounting and when promotional data has loaded to prevent hydration mismatch
  const hasAnyDiscount = isMounted && !isLoading && (
    promotionalPricing.discountPercentage > 0 || 
    product.variants?.some((variant: any) => 
      variant.calculated_price && 
      variant.calculated_price.calculated_amount !== variant.calculated_price.original_amount &&
      variant.calculated_price.calculated_amount < variant.calculated_price.original_amount
    )
  )
  
  // Fallback prefetch method that works even if hook fails
  const handleMouseEnter = () => {
    try {
      router.prefetch(`/products/${product.handle}`)
    } catch (error) {
      console.error('❌ Fallback prefetch failed for:', productUrl, error)
    }
  }
  
  // ✅ SAFETY CHECK: Ensure product has required fields before price calculation
  const { cheapestPrice } = product?.id ? getProductPrice({
    product,
  }) : { cheapestPrice: null }

  const { cheapestPrice: sellerCheapestPrice } = product?.id ? getSellerProductPrice({
    product,
  }) : { cheapestPrice: null }

  // ✅ SAFETY CHECK: Don't render card if product is invalid
  if (!product?.id || !product?.title) {
    return null
  }

  return (
    <div
      className={clsx(
        "relative group flex flex-col h-full",
        "w-[160px] sm:w-[252px]", // RESPONSIVE: 160px on mobile (fits 2-col grid), 252px on desktop (600px+)
        {
          "p-2": sellerPage,
          "p-0": !sellerPage
        }
      )}
      {...prefetchOnHover(productUrl)}
      onMouseEnter={handleMouseEnter}
    >
      {/* RESPONSIVE CARD SIZE: Mobile optimized for 2-column grid */}
      {/* Mobile (<640px): h-[200px] w-[160px] | Desktop (640px+): h-[315px] w-[252px] */}
      <div className="relative bg-primary h-[200px] w-[160px] sm:h-[315px] sm:w-[252px] flex-shrink-0">
        <div className="absolute right-2 top-2 z-10 cursor-pointer">
          <WishlistButton 
            productId={product.id} 
            user={user} 
            wishlist={wishlist}
            onWishlistChange={onWishlistChange} 
          />
        </div>
        {/* Promotion Badge - Consistent styling to prevent hydration mismatch */}
        {hasAnyDiscount && (
  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1" suppressHydrationWarning>
    <div className="bg-[#F4F0EB]/90 text-[#3B3634] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border border-[#3B3634]">
      PROMOCJA
    </div>
  </div>
)}
        <Link href={productUrl} prefetch={true} aria-label={`Zobacz produkt: ${product.title}`}>
          <div className="overflow-hidden w-full h-full flex justify-center items-center">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={320}
                height={320}
                quality={75}  // Reduced from 80 for better performance
                className="object-cover w-full object-center h-full lg:group-hover:scale-105 transition-all duration-300"
                priority={index < 4}  // ✅ Only first 4 products get priority
                loading={index < 4 ? "eager" : "lazy"}  // ✅ Lazy load rest
                sizes="(max-width: 640px) 160px, 352px"  // ✅ Responsive sizes
                placeholder="blur"  // ✅ Smooth loading with blur effect
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                unoptimized={false}
              />
            ) : (
              <Image
                src="/images/placeholder.svg"
                alt="Product placeholder"
                width={100}
                height={100}
                quality={65}  // ✅ Lower quality for placeholder is fine
                className="flex margin-auto w-[100px] h-auto"
              />
            )}
          </div>
        </Link>
        <Link href={productUrl} prefetch={true} aria-label={`Zobacz więcej o produkcie: ${product.title}`}>
          <Button className="absolute bg-[#3B3634] opacity-90    text-white h-auto lg:h-[48px] lg:group-hover:block hidden w-full uppercase bottom-0 z-10 overflow-hidden">
            Zobacz więcej
          </Button>
        </Link>
      </div>
      <Link href={`/products/${product.handle}`} aria-label={`Szczegóły produktu: ${product.title}`}>
        <div className="flex justify-between flex-grow mt-2">
          <div className="w-full font-instrument-sans">
            <h3 className={`text-md font-instrument-sans truncate mb-1 leading-tight font-bold ${themeMode === 'light' ? 'text-white' : ''}`}>
              {product.title}
            </h3>
            
            {/* Seller name below title - Enhanced for Algolia compatibility */}
            {(() => {
              // ✅ Multiple fallback patterns for seller name detection
              const sellerName = 
                product.seller?.name ||           // Standard Medusa structure
                product.seller?.company_name ||   // Alternative company name field
                (product as any).seller_name ||   // Direct seller_name field (Algolia)
                (product as any).seller?.name ||  // Nested seller.name (Algolia)
                (product as any)['seller.name']   // Flattened seller.name (Algolia)
              
              
              return sellerName ? (
                <p className={`font-instrument-sans text-sm mb-1  ${themeMode === 'light' ? 'text-white/80' : 'text-black'}`}>
                  {sellerName}
                </p>
              ) : null
            })()}
            
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
                        <span className="relative bg-primary text-[#3B3634] text-xs font-bold px-3 py-1 rounded-lg shadow-2xl border border-[#3B3634]/90 overflow-hidden group">
                           <span className="relative z-10 tracking-wide">-{promotionalPricing.discountPercentage}%</span>
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

// ✅ OPTIMIZED: Memoize ProductCard to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders when props haven't meaningfully changed
  
  // Check if this specific product is in the wishlist
  const prevInWishlist = prevProps.wishlist?.some(w => 
    w.products?.some(p => p.id === prevProps.product.id)
  ) || false
  
  const nextInWishlist = nextProps.wishlist?.some(w => 
    w.products?.some(p => p.id === nextProps.product.id)
  ) || false
  
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.user?.id === nextProps.user?.id &&
    prevInWishlist === nextInWishlist && // ✅ Check if THIS product's wishlist status changed
    prevProps.sellerPage === nextProps.sellerPage &&
    prevProps.themeMode === nextProps.themeMode
  )
})