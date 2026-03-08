"use client"
/**
 * 🎨 FONT WEIGHT HIERARCHY GUIDE
 * ================================
 * This component uses Instrument Sans font with the following weights:
 * 
 * Available weights (from layout.tsx):
 * - 400 (font-normal) - Regular weight
 * - 600 (font-semibold) - Semi-bold weight
 * - 700 (font-bold) - Bold weight
 * 
 * VISUAL HIERARCHY (from least to most prominent):
 * ================================================
 * 
 * 1. 📊 LOWEST 30-DAY PRICE (BatchLowestPriceDisplay component)
 *    - Class: font-normal
 *    - Weight: 400
 *    - Purpose: Historical reference, least prominent
 *    - Example: "Najniższa cena z 30 dni: 79,99 zł"
 * 
 * 2. 👤 SELLER NAME (Line ~185)
 *    - Class: font-normal
 *    - Weight: 400
 *    - Purpose: Normal weight, subtle
 *    - Example: "ArtisanCrafts"
 * 
 * 3. 📝 PRODUCT TITLE (Line ~214)
 *    - Class: text-md font-semibold
 *    - Weight: 600
 *    - Purpose: Medium prominence, readable and noticeable
 *    - Example: "Handmade Ceramic Vase"
 * 
 * 4. 💰 CURRENT PRICE (Lines ~244, ~261, ~284) ⭐ MOST BOLD
 *    - Class: text-lg sm:text-xl font-bold
 *    - Weight: 700
 *    - Purpose: BOLDEST - The primary call-to-action element, larger than title
 *    - Applies to: Promotional price, discounted price, regular price
 *    - Example: "89,99 zł"
 * 
 * 5. 📉 ORIGINAL PRICE (Lines ~248, ~268-274)
 *    - Class: text-xs line-through
 *    - Weight: Inherited (400)
 *    - Purpose: De-emphasized, shows previous price
 *    - Example: "129,99 zł" (strikethrough)
 * 
 * TO ADJUST FONT WEIGHTS:
 * =======================
 * - Lowest 30-day Price: Edit BatchLowestPriceDisplay.tsx (font-normal)
 * - Seller Name: Change font-normal on line ~185
 * - Product Title: Change text-md font-semibold on line ~214
 * - Current Price: Change text-lg sm:text-xl font-bold on lines ~244, ~261, ~284
 * - Original Price: Change text-xs on lines ~248, ~268-274
 */

import Image from "next/image"
import { useEffect, useState, useMemo, memo, useRef } from "react"
import { LqipImage } from "@/components/cells/LqipImage/LqipImage"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@/i18n/routing"
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getPromotionalPrice } from "@/lib/helpers/get-promotional-price"
import { usePromotionData } from "@/components/context/PromotionDataProvider"
import { BaseHit, Hit } from "instantsearch.js"
import { useProductImagePrefetch } from "@/hooks/useProductImagePrefetch"
import clsx from "clsx"
import { WishlistButton } from "@/components/cells/WishlistButton/WishlistButton"
import { CompactLowestPriceDisplay } from "@/components/cells/LowestPriceDisplay/CompactLowestPriceDisplay"
import { SerializableWishlist } from "@/types/wishlist"
import { useRouter } from "next/navigation"
import { PromotionBadge } from "@/components/cells/PromotionBadge/PromotionBadge"

const ProductCardComponent = ({
  product,
  sellerPage = false,
  themeMode = 'default',
  user = null,
  wishlist = [],
  onWishlistChange,
  index = 999,
  isSellerSection = false,
}: {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>
  sellerPage?: boolean
  themeMode?: 'default' | 'light' | 'dark'
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  onWishlistChange?: () => void
  index?: number  // ✅ NEW: For priority loading first 4 products
  isSellerSection?: boolean  // ✅ NEW: Force lazy loading for seller section to prioritize main gallery
}) => {
  const { prefetchProductImage } = useProductImagePrefetch()
  const router = useRouter()
  const { getProductWithPromotions } = usePromotionData()
  const [isMounted, setIsMounted] = useState(false)
  const productUrl = `/products/${product.handle}`
  const cardRef = useRef<HTMLDivElement>(null)
  const touchRoutePrefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  
  // Ensure component is mounted on client-side to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Mobile: Prefetch detail image when card becomes visible in viewport.
  // On mobile there's no hover, so onTouchStart only gives ~50-100ms head start
  // before navigation — not enough for the image to load. IntersectionObserver
  // starts the prefetch when the user can SEE the card, giving seconds of head
  // start before they tap. The 300ms dwell threshold avoids prefetching cards
  // that quickly scroll past (bandwidth optimization).
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Only activate on touch devices — desktop uses hover prefetch instead
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (!isTouchDevice) return

    const imageUrl = product.thumbnail
    if (!imageUrl) return

    const card = cardRef.current
    if (!card) return

    let dwellTimer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Wait 300ms of continuous visibility before prefetching
          dwellTimer = setTimeout(() => {
            prefetchProductImage(imageUrl)
          }, 300)
        } else {
          if (dwellTimer) {
            clearTimeout(dwellTimer)
            dwellTimer = null
          }
        }
      },
      { threshold: 0.5 } // Card must be at least 50% visible
    )

    observer.observe(card)

    return () => {
      observer.disconnect()
      if (dwellTimer) clearTimeout(dwellTimer)
    }
  }, [product.thumbnail, product.images, prefetchProductImage])
  
  // ✅ OPTIMIZATION: Get promotional product data synchronously (no delay)
  const promotionalProduct = getProductWithPromotions(product.id)
  const productToUse = promotionalProduct || product

  const displayedVariant = useMemo(() => {
    const variants = productToUse.variants || product.variants || []
    if (!variants.length) {
      return undefined
    }

    return variants.reduce((best: any, current: any) => {
      const bestAmount =
        best?.calculated_price?.calculated_amount ??
        best?.prices?.[0]?.amount ??
        Number.POSITIVE_INFINITY
      const currentAmount =
        current?.calculated_price?.calculated_amount ??
        current?.prices?.[0]?.amount ??
        Number.POSITIVE_INFINITY

      return currentAmount < bestAmount ? current : best
    }, variants[0] as any)
  }, [productToUse, product.variants])

  // ✅ OPTIMIZATION: Calculate promotional pricing immediately
  const promotionalPricing = useMemo(() => {
    return getPromotionalPrice({
      product: productToUse as any,
      regionId: displayedVariant?.calculated_price?.region_id,
      variantId: displayedVariant?.id,
    })
  }, [productToUse, displayedVariant])

  const { cheapestPrice, variantPrice } = product?.id
    ? getProductPrice({
        product: productToUse as any,
        variantId: displayedVariant?.id,
      })
    : { cheapestPrice: null, variantPrice: null }

  const { cheapestPrice: sellerCheapestPrice, variantPrice: sellerVariantPrice } = product?.id
    ? getSellerProductPrice({
        product: productToUse as any,
        variantId: displayedVariant?.id,
      })
    : { cheapestPrice: null, variantPrice: null }

  const activePrice =
    sellerVariantPrice ||
    variantPrice ||
    sellerCheapestPrice ||
    cheapestPrice

  const hasPriceListDiscount =
    !!activePrice &&
    activePrice.calculated_price_number !== activePrice.original_price_number &&
    activePrice.calculated_price_number < activePrice.original_price_number

  // ✅ FIX: Show promotional prices immediately when mounted (no waiting for isLoading)
  // Use productToUse (enriched from context) for discount detection
  const hasAnyDiscount = isMounted && (
    promotionalPricing.discountPercentage > 0 ||
    hasPriceListDiscount
  )
  
  // ✅ OPTIMIZATION: Track if route prefetch already ran to avoid duplicate requests
  const hasRoutePrefetched = useRef(false)

  const prefetchRouteOnce = () => {
    if (hasRoutePrefetched.current) return
    hasRoutePrefetched.current = true

    try {
      router.prefetch(productUrl)
    } catch {
      // Route prefetch failed, non-critical
    }
  }

  const clearTouchRoutePrefetchTimer = () => {
    if (!touchRoutePrefetchTimerRef.current) return
    clearTimeout(touchRoutePrefetchTimerRef.current)
    touchRoutePrefetchTimerRef.current = null
  }
  
  // Prefetch detail-page image on hover/touch and route payload only on non-touch intent.
  // This avoids broad route prefetch fan-out during mobile browsing.
  const handlePrefetch = () => {
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)

    // Prefetch the detail-page-sized image so it's cached before navigation.
    const imageUrl = product.thumbnail
    prefetchProductImage(imageUrl)

    // Route prefetch only on desktop/focus intent and only once per card.
    if (isTouchDevice) return
    prefetchRouteOnce()
  }

  const handleTouchStart = () => {
    const imageUrl = product.thumbnail
    prefetchProductImage(imageUrl)

    if (hasRoutePrefetched.current) return
    clearTouchRoutePrefetchTimer()

    // Long-touch intent prefetch: avoids broad mobile fan-out on simple scrolling taps.
    touchRoutePrefetchTimerRef.current = setTimeout(() => {
      prefetchRouteOnce()
      touchRoutePrefetchTimerRef.current = null
    }, 180)
  }

  const handleTouchEnd = () => {
    clearTouchRoutePrefetchTimer()
  }

  useEffect(() => {
    return () => {
      clearTouchRoutePrefetchTimer()
    }
  }, [])
  
  // ✅ SAFETY CHECK: Don't render card if product is invalid
  if (!product?.id || !product?.title) {
    return null
  }

  return (
    <article
      className={clsx(
        "relative group flex flex-col h-full",
        "w-[160px] sm:w-[252px]", // RESPONSIVE: 160px on mobile (fits 2-col grid), 252px on desktop (600px+)
        {
          "p-2": sellerPage,
          "p-0": !sellerPage
        }
      )}
      ref={cardRef}
      onMouseEnter={handlePrefetch}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onFocus={handlePrefetch}
      aria-label={`${product.title}`}
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
        {/* Promotion Badge - Craft tag for artisanal marketplace feel */}
        {/* Check productToUse for has_promotions since it may be enriched from PromotionDataProvider */}
        {hasAnyDiscount && promotionalPricing.discountPercentage > 0 && (productToUse as any).has_promotions && (
          <PromotionBadge 
            discountPercentage={promotionalPricing.discountPercentage}
            variant="card"
          />
        )}
        <Link href={productUrl} prefetch={false} aria-label={`Zobacz produkt: ${product.title}`}>
          <div className="overflow-hidden w-full h-full flex justify-center items-center" style={{ backgroundColor: '#F4F0EB' }}>
            {product.thumbnail ? (
              <LqipImage
                src={product.thumbnail || "/images/placeholder.svg"}
                alt={product.title}
                width={320}
                height={320}
                quality={80}
                className="object-cover w-full object-center h-full lg:group-hover:scale-105 transition-all duration-300"
                priority={!isSellerSection && index < 4}
                loading={isSellerSection ? "lazy" : (index < 4 ? "eager" : "lazy")}
                fetchPriority={isSellerSection ? "low" : (index < 4 ? "auto" : "low")}
                sizes="(max-width: 640px) 160px, 352px"
              />
            ) : (
              <Image
                src="/images/placeholder.svg"
                alt=""
                width={100}
                height={100}
                quality={65}
                className="flex margin-auto w-[100px] h-auto"
                aria-hidden="true"
              />
            )}
          </div>
          {/* Hover overlay — inside the same Link to avoid nested interactive elements */}
         {/*  <span className="absolute bg-[#3B3634] opacity-90 text-white h-auto lg:h-[48px] lg:group-hover:flex hidden w-full uppercase bottom-0 z-10 overflow-hidden items-center justify-center font-medium text-sm" aria-hidden="true">
            Zobacz więcej
          </span> */}
        </Link>
      </div>
      <Link href={productUrl} prefetch={false} tabIndex={-1} aria-hidden="true">
        <div className="flex justify-between flex-grow mt-2">
          <div className="w-full font-instrument-sans">
            {/* 📝 PRODUCT TITLE: font-medium (weight: 500) - Medium prominence, less bold than current price */}
            <h3 className={`text-md font-instrument-sans truncate leading-tight font-medium ${themeMode === 'light' ? 'text-white' : ''}`}>
              {product.title}
            </h3>
            
            {/* 📝 SELLER NAME: font-normal (weight: 400) - Normal weight, same as title */}
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
                <p className={`font-instrument-sans text-sm mb-1  font-normal ${themeMode === 'light' ? 'text-white/80' : 'text-black'}`}>
                  {sellerName}
                </p>
              ) : null
            })()}
            
            <div className="flex items-center gap-2 leading-tight">
              {hasAnyDiscount ? (
                <>
                  {/* Always use promotional pricing data when any discount is detected */}
                  {promotionalPricing.discountPercentage > 0 ? (
                    <>
                      {/* 💰 PROMOTIONAL PRICE: font-bold (700) + larger size (text-lg sm:text-xl) */}
                      
                      {/*    👉 To tweak size, edit text-lg sm:text-xl below */}
                      <p className={`font-instrument-sans font-semibold text-md sm:text-md text-[#3B3634] leading-tight ${themeMode === 'light' ? 'text-white' : ''}`}>
                        {promotionalPricing.promotionalPrice}
                      </p>
                      {/* 📊 ORIGINAL PRICE: Strikethrough, smaller, gray - de-emphasized */}
                      <p className="text-xs text-gray-500 line-through leading-tight">
                        <span className="sr-only">Cena przed promocją: </span>
                        {promotionalPricing.originalPrice}
                      </p>
                    </>
                  ) : (
                    <>
                      {/* 💰 PRICE LIST DISCOUNT: font-bold (700) + larger size (text-lg sm:text-xl) */}
                      {/*    👉 To tweak size, edit text-lg sm:text-xl below */}
                      <p className={`font-instrument-sans font-semibold text-md sm:text-md text-[#3B3634] leading-tight ${themeMode === 'light' ? 'text-white' : ''}`}>
                        {activePrice?.calculated_price?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                      </p>
                      {/* 📊 ORIGINAL PRICE: Strikethrough, smaller, gray - de-emphasized */}
                      {activePrice?.calculated_price
                        ? activePrice?.calculated_price !==
                            activePrice?.original_price && (
                            <p className="text-xs text-gray-500 line-through leading-tight">
                              <span className="sr-only">Cena przed promocją: </span>
                              {activePrice?.original_price?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                            </p>
                          )
                        : null}
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* 💰 REGULAR PRICE: font-bold (700) + larger size (text-lg sm:text-xl) */}
                  {/*    👉 To tweak size, edit text-lg sm:text-xl below */}
                  <p className={`font-instrument-sans font-semibold text-md sm:text-md leading-tight ${themeMode === 'light' ? 'text-white' : ''}`}>
                    {activePrice?.calculated_price?.replace(/PLN\s+([\d,.]+)/, '$1 zł')}
                  </p>
                </>
              )}
            </div>
            
            {/* Lowest Price Display - compact version with info icon tooltip for ProductCard */}
            {/* Only render when this specific product has an actual discount/promotion. */}
            {displayedVariant?.id && hasAnyDiscount && (
              <div className="-mt-1 leading-tight">
                <CompactLowestPriceDisplay
                  variantId={displayedVariant.id}
                  currencyCode="PLN"
                  className="text-xs"
                  themeMode={themeMode}
                  fallbackPrice={
                    // Priority: Medusa calculated_price > Algolia prices array > Algolia min_price
                    displayedVariant?.calculated_price?.original_amount ||
                    displayedVariant?.calculated_price?.calculated_amount ||
                    displayedVariant?.prices?.[0]?.amount ||
                    (product as any).min_price
                  }
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
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