"use client"

import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { ProductVariants } from "@/components/molecules"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import { useState, useEffect, useMemo } from "react"
import { addToCart } from "@/lib/data/cart"
import { useCart } from "@/components/context/CartContext"
import { SellerProps } from "@/types/seller"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getPromotionalPrice } from "@/lib/helpers/get-promotional-price"
import { WishlistButton } from "@/components/cells/WishlistButton/WishlistButton"
import { Wishlist, SerializableWishlist } from "@/types/wishlist"
import { useVendorAvailability } from "@/components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { InformationCircleSolid } from "@medusajs/icons"
import { useVariantSelection } from "@/components/context/VariantSelectionContext"
import { BatchLowestPriceDisplay } from "@/components/cells/LowestPriceDisplay/BatchLowestPriceDisplay"
import { usePromotionData } from "@/components/context/PromotionDataProvider"
import { ProductShareButton } from "@/components/cells/ProductShareButton/ProductShareButton"
import { PromotionBadge } from "@/components/cells/PromotionBadge/PromotionBadge"

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
  manage_inventory?: boolean
  allow_backorder?: boolean
  calculated_price?: any
  options?: ExtendedProductOptionValue[]
  inventory_items?: Array<{
    inventory_item_id: string
    required_quantity: number
    inventory?: {
      id: string
      sku?: string
      title?: string
      // Inventory levels are nested deeper
      inventory_levels?: Array<{
        id: string
        stocked_quantity: number
        reserved_quantity: number
        location_id: string
      }>
    }
  }>
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
  
  // Calculate available stock
  // Medusa should populate inventory_quantity automatically
  const calculateAvailableStock = () => {
    // First try inventory_quantity (Medusa's computed field)
    if (selectedVariantObject?.inventory_quantity !== undefined && 
        selectedVariantObject.inventory_quantity !== null && 
        selectedVariantObject.inventory_quantity > 0) {
      return selectedVariantObject.inventory_quantity;
    }
    
    // Fallback: Check metadata for stock_quantity (from our backend workflow)
    // This happens when inventory levels haven't been created yet but metadata has the stock info
    if (selectedVariantObject?.metadata && typeof selectedVariantObject.metadata === 'object') {
      const metadata = selectedVariantObject.metadata as any;
      if (metadata.stock_quantity !== undefined) {
        const stockQty = typeof metadata.stock_quantity === 'string' 
          ? parseInt(metadata.stock_quantity, 10) 
          : metadata.stock_quantity;
        if (!isNaN(stockQty) && stockQty > 0) {
    
          return stockQty;
        }
      }
    }
    
    // Default to 0 if no inventory data
    return 0;
  };
  
  const variantStock = calculateAvailableStock();
  const managesInventory = selectedVariantObject?.manage_inventory ?? true // Default to true for backward compatibility
  const allowBackorder = selectedVariantObject?.allow_backorder ?? false
  


  const variantHasPrice = selectedVariantObject?.calculated_price ? true : false
  
  // Combine stock availability with vendor availability
  // If manage_inventory is false (digital products), always allow adding to cart (if price exists)
  // If manage_inventory is true (physical products), check stock or allow_backorder
  const hasStock = !managesInventory || variantStock > 0 || allowBackorder
  const canAddToCart = hasStock && variantHasPrice && isAvailable

  return (
    <div className="pl-5 pr-5 pb-5">
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
                    {/* Show promotion badge for actual promotions */}
                    {(productToUse as any).has_promotions && (productToUse as any).promotions?.length > 0 && (
                      <PromotionBadge 
                        discountPercentage={promotionalPricing.discountPercentage}
                        variant="simple"
                      />
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
          
          {/* Lowest Price Display - only show when product has discount/promotion */}
          {hasAnyDiscount && currentVariantId && (
            <div className="mt-1">
              <BatchLowestPriceDisplay
                variantId={currentVariantId}
                currencyCode="PLN"
                className="text-sm"
                fallbackPrice={variantPrice?.original_price_number}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
         
          {/* Add to Wishlist */}
          <WishlistButton
            productId={product.id}
            wishlist={wishlist}
            user={user}
          />

           {/* Share Button */}
          <ProductShareButton
            productTitle={product.title}
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
          {!variantHasPrice
            ? "NIEDOSTĘPNE"
            : !isAvailable && availability?.onHoliday
            ? "SPRZEDAWCA NA WAKACJACH"
            : !isAvailable && availability?.suspended
            ? "SPRZEDAWCA ZAWIESZONY"
            : managesInventory && variantStock <= 0 && !allowBackorder
            ? "BRAK W MAGAZYNIE"
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

