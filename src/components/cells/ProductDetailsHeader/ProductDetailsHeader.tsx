"use client"

import { Button } from "../../../components/atoms"
import { HttpTypes } from "@medusajs/types"
import { ProductVariants } from "../../../components/molecules"
import useGetAllSearchParams from "../../../hooks/useGetAllSearchParams"
import { getProductPrice } from "../../../lib/helpers/get-product-price"
import { getPromotionalPrice } from "../../../lib/helpers/get-promotional-price"
import { useState, useEffect, useMemo } from "react"
import { addToCart } from "../../../lib/data/cart"
import { useCart } from "../../../components/context/CartContext"
import { SellerProps } from "../../../types/seller"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { Wishlist, SerializableWishlist } from "../../../types/wishlist"
import { useVendorAvailability } from "../../organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { InformationCircleSolid } from "@medusajs/icons"
import { useVariantSelection } from "../../context/VariantSelectionContext"
import { OptimizedLowestPriceDisplay } from "../LowestPriceDisplay/OptimizedLowestPriceDisplay"
import { usePromotionData } from "../../context/PromotionDataProvider"

// Define extended types for product and variants
type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  seller?: SellerProps
  variants?: ExtendedProductVariant[]
  title: string
  id: string
}

type ExtendedProductVariant = HttpTypes.StoreProductVariant & {
  id: string
  title?: string
  inventory_quantity?: number
  calculated_price?: any
  options?: ExtendedProductOptionValue[]
}

type ExtendedProductOptionValue = HttpTypes.StoreProductOptionValue & {
  option?: {
    title: string
  }
  value: string
}

const optionsAsKeymap = (
  variantOptions: ExtendedProductOptionValue[] | undefined
) => {
  return variantOptions?.reduce(
    (
      acc: Record<string, string>,
      varopt: ExtendedProductOptionValue
    ) => {
      acc[varopt.option?.title.toLowerCase() || ""] = varopt.value

      return acc
    },
    {}
  )
}

export const ProductDetailsHeader = ({
  product,
  locale,
  user,
  wishlist,
}: {
  product: ExtendedStoreProduct
  locale: string
  user: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}) => {
  // Get vendor availability status if the product has a seller
  const { isAvailable, availability, holidayMode, openHolidayModal } = useVendorAvailability();
  const [isAdding, setIsAdding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { allSearchParams } = useGetAllSearchParams()
  const { selectedVariantId, setSelectedVariantId } = useVariantSelection() // Removed updateUrlWithVariant to prevent direct usage
  const { getProductWithPromotions, isLoading } = usePromotionData()

  // Ensure component is mounted on client-side to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // CRITICAL FIX: Calculate selectedVariantOptions based on current variant from context
  const selectedVariantOptions = useMemo(() => {
    // Find the currently selected variant
    const currentVariant = selectedVariantId 
      ? product.variants?.find(v => v.id === selectedVariantId)
      : product.variants?.[0]
    
    if (!currentVariant) return {}
    
    // Create options map from the current variant
    const variantOptions = optionsAsKeymap(currentVariant.options ?? undefined)
    
    // Merge with search params, but prioritize variant options
    return {
      ...allSearchParams,
      ...variantOptions,
    }
  }, [selectedVariantId, product.variants, allSearchParams])

  // CRITICAL FIX: Use selectedVariantId directly from context
  const currentVariantId = selectedVariantId || (product.variants?.[0]?.id || "")

  // Try to get promotional product data from context first
  const promotionalProduct = getProductWithPromotions(product.id)
  const productToUse = promotionalProduct || product

  // get variant price using current variant ID
  const { variantPrice } = getProductPrice({
    product,
    variantId: currentVariantId,
  })

  // Calculate promotional pricing using helper function for the specific variant
  const promotionalPricing = useMemo(() => {
    return getPromotionalPrice({
      product: productToUse as any,
      regionId: productToUse.variants?.find(v => v.id === currentVariantId)?.calculated_price?.region_id,
      variantId: currentVariantId // Pass the specific variant ID for accurate pricing
    })
  }, [productToUse, currentVariantId]) // Recalculate when variant changes

  // Check if product has any discount (promotion or price-list)
  // Only show after mounting and when promotional data has loaded to prevent hydration mismatch
  const hasAnyDiscount = isMounted && !isLoading && (
    promotionalPricing.discountPercentage > 0 || 
    (variantPrice?.calculated_price_number !== variantPrice?.original_price_number &&
     variantPrice?.calculated_price_number < variantPrice?.original_price_number)
  )

  const { addItem } = useCart()

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariantId) return null

    setIsAdding(true)

    try {
      // Use CartContext addItem method for immediate UI updates
      await addItem(selectedVariantId, 1)
      
      
    } catch (error) {
      console.error('❌ Failed to add item to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }
  
  // Open holiday modal if the vendor is on holiday
  const handleHolidayModeInfo = () => {
    openHolidayModal()
  }

  // Debug variant and stock information
  const selectedVariantObject = product.variants?.find(({ id }) => id === currentVariantId);
  
  const variantStock = selectedVariantObject?.inventory_quantity || 0

  const variantHasPrice = selectedVariantObject?.calculated_price ? true : false
  
  // Combine stock availability with vendor availability
  const canAddToCart = variantStock > 0 && variantHasPrice && isAvailable

  return (
    <div className=" p-5">
      <div className="flex justify-between">
        <div>
          <h2 className="label-md text-secondary">
            {/* {product?.brand || "No brand"} */}
          </h2>
          <h1 className="heading-lg text-primary font-instrument-serif">{product.title}</h1>
          <div className="mt-2 flex gap-2 items-center">
            {hasAnyDiscount ? (
              <>
                {/* Show promotional pricing when any discount is detected */}
                {promotionalPricing.discountPercentage > 0 ? (
                  <>
                    <span className="heading-md text-primary">
                      {promotionalPricing.promotionalPrice}
                    </span>
                    <span className="label-md text-secondary line-through">
                      {promotionalPricing.originalPrice}
                    </span>
                    {/* Show percentage badge for actual promotions */}
                    {(productToUse as any).has_promotions && (productToUse as any).promotions?.length > 0 && (
                      <span className="bg-primary text-[#3B3634] text-sm font-bold px-3 py-1 rounded-lg shadow-lg border border-[#3B3634]/90">
                        -{promotionalPricing.discountPercentage}%
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {/* Fallback: Show price list discount pricing */}
                    <span className="heading-md text-primary">
                      {variantPrice?.calculated_price}
                    </span>
                    {variantPrice?.calculated_price_number !==
                      variantPrice?.original_price_number && (
                      <span className="label-md text-secondary line-through">
                        {variantPrice?.original_price}
                      </span>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {/* Regular price display when no discounts */}
                <span className="heading-md text-primary">
                  {variantPrice?.calculated_price}
                </span>
              </>
            )}
          </div>
          
          {/* Lowest Price Display - show if there are price list discounts OR promotions */}
          {currentVariantId && (
            variantPrice?.calculated_price_number !== variantPrice?.original_price_number ||
            promotionalPricing?.hasPromotion
          ) && (
            <div className="mt-3">
              <OptimizedLowestPriceDisplay
                variantId={currentVariantId}
                currencyCode="PLN"
                className="text-sm"
              />
            </div>
          )}
        </div>
        <div>
          {/* Add to Wishlist */}
          <WishlistButton
            productId={product.id}
            wishlist={wishlist}
            user={user}
          />
        </div>
      </div>
      {/* Product Variants */}
      <ProductVariants product={product} selectedVariant={selectedVariantOptions} />
      {/* Add to Cart */}
      <div className="space-y-2">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || !canAddToCart}
          loading={isAdding}
          className="w-full uppercase mb-1 py-3 flex justify-center mt-6"
          size="large"
        >
          {!variantStock || !variantHasPrice
            ? "NIEDOSTĘPNE"
            : !isAvailable && availability?.onHoliday
            ? "SPRZEDAWCA NA WAKACJACH"
            : !isAvailable && availability?.suspended
            ? "SPRZEDAWCA ZAWIESZONY"
            : "DODAJ DO KOSZYKA"}
        </Button>
        
        {/* Show info button for holiday mode */}
        {!isAvailable && availability?.onHoliday && (
          <button 
            onClick={handleHolidayModeInfo}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            <InformationCircleSolid className="w-4 h-4 mr-1" />
            View holiday information
          </button>
        )}
      </div>
    </div>
  )
}
