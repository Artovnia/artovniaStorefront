"use client"

import { Button } from "../../../components/atoms"
import { HttpTypes } from "@medusajs/types"
import { ProductVariants } from "../../../components/molecules"
import useGetAllSearchParams from "../../../hooks/useGetAllSearchParams"
import { getProductPrice } from "../../../lib/helpers/get-product-price"
import { useState, useEffect } from "react"
import { addToCart } from "../../../lib/data/cart"
import { Chat } from "../../../components/organisms/Chat/Chat"
import { SellerProps } from "../../../types/seller"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { Wishlist } from "../../../types/wishlist"
import { useVendorAvailability } from "../../organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { InformationCircleSolid } from "@medusajs/icons"
import { useVariantSelection } from "../../context/VariantSelectionContext"

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
  wishlist?: Wishlist[]
}) => {
  // Get vendor availability status if the product has a seller
  const { isAvailable, availability, holidayMode, openHolidayModal } = useVendorAvailability();
  const [isAdding, setIsAdding] = useState(false)
  const { allSearchParams } = useGetAllSearchParams()
  const { selectedVariantId, setSelectedVariantId, updateUrlWithVariant } = useVariantSelection()

  // set default variant options
  const selectedVariantOptions = {
    ...optionsAsKeymap(product?.variants?.[0].options ?? null),
    ...allSearchParams,
  }

  // Find the current variant ID based on selected options
  const currentVariantId =
    product.variants?.find((variant) =>
      variant.options?.every((option: any) =>
        selectedVariantOptions[option.option?.title.toLowerCase() || ""]?.includes(
          option.value
        )
      )
    )?.id || ""
    
  // Update the context when variant changes based on options
  useEffect(() => {
    if (currentVariantId && currentVariantId !== selectedVariantId) {
      setSelectedVariantId(currentVariantId)
      updateUrlWithVariant(currentVariantId)
    }
  }, [currentVariantId, selectedVariantId, setSelectedVariantId, updateUrlWithVariant])
  
  // Initialize with first variant if none selected
  useEffect(() => {
    if (!selectedVariantId && product.variants && product.variants.length > 0) {
      const firstVariantId = product.variants[0].id
      setSelectedVariantId(firstVariantId)
      updateUrlWithVariant(firstVariantId)
    }
  }, [product.variants, selectedVariantId, setSelectedVariantId, updateUrlWithVariant])

  // get variant price
  const { variantPrice } = getProductPrice({
    product,
    variantId: selectedVariantId,
  })

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariantId) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariantId,
      quantity: 1,
      countryCode: locale,
    })

    setIsAdding(false)
  }
  
  // Open holiday modal if the vendor is on holiday
  const handleHolidayModeInfo = () => {
    openHolidayModal()
  }

  // Debug variant and stock information
  const selectedVariantObject = product.variants?.find(({ id }) => id === selectedVariantId);
  console.log('DEBUG - Selected Variant:', {
    variantId: selectedVariantId,
    selectedVariant: selectedVariantObject,
    allVariants: product.variants?.map(v => ({
      id: v.id,
      title: v.title,
      inventory_quantity: v.inventory_quantity,
    })),
  });

  const variantStock = selectedVariantObject?.inventory_quantity || 0
  console.log('DEBUG - Variant Stock:', variantStock);

  const variantHasPrice = selectedVariantObject?.calculated_price ? true : false
  
  // Combine stock availability with vendor availability
  const canAddToCart = variantStock > 0 && variantHasPrice && isAvailable

  return (
    <div className="border rounded-sm p-5">
      <div className="flex justify-between">
        <div>
          <h2 className="label-md text-secondary">
            {/* {product?.brand || "No brand"} */}
          </h2>
          <h1 className="heading-lg text-primary">{product.title}</h1>
          <div className="mt-2 flex gap-2 items-center">
            <span className="heading-md text-primary">
              {variantPrice?.calculated_price}
            </span>
            {variantPrice?.calculated_price_number !==
              variantPrice?.original_price_number && (
              <span className="label-md text-secondary line-through">
                {variantPrice?.original_price}
              </span>
            )}
          </div>
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
          className="w-full uppercase mb-1 py-3 flex justify-center"
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
      {/* Seller message */}

      {user && product.seller && (
        <Chat
          user={user}
          seller={product.seller}
          buttonClassNames="w-full uppercase"
          product={product}
        />
      )}
    </div>
  )
}
