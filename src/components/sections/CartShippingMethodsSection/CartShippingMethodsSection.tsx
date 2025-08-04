"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { setShippingMethod } from "@/lib/data/cart"
import { calculatePriceForShippingOption } from "@/lib/data/fulfillment"
import { convertToLocale } from "@/lib/helpers/money"
import { isInpostShippingOption } from "@/lib/helpers/inpost-helpers"
// Using our wrapper components instead of direct imports to fix SVG attribute warnings
import { CheckCircleSolidWrapper, ChevronUpDownWrapper, LoaderWrapper } from "@/components/atoms/icons/IconWrappers"
import { HttpTypes } from "@medusajs/types"
import { clx, Heading, Text } from "@medusajs/ui"
import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/atoms"
import { Modal, SelectField } from "@/components/molecules"
import { CartShippingMethodRow } from "./CartShippingMethodRow"
import { Listbox, Transition } from "@headlessui/react"
import clsx from "clsx"
import { InpostShippingMethodWrapper } from "@/components/molecules/InpostShippingMethodWrapper/InpostShippingMethodWrapper"

// Extended cart item product type to include seller
type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  seller?: {
    id: string
    name: string
  }
}

// Extended cart item variant type to include product
type ExtendedStoreVariant = HttpTypes.StoreProductVariant & {
  product?: ExtendedStoreProduct
}

// Cart item type definition
type CartItem = {
  product?: ExtendedStoreProduct
  variant?: ExtendedStoreVariant
  // Include other cart item properties as needed
}

// Use HttpTypes.StoreCartShippingMethod directly as our main type
// Extended with custom properties when needed through type assertion

type ShippingProps = {
  cart: Omit<HttpTypes.StoreCart, "items"> & {
    items?: CartItem[]
  }
  availableShippingMethods:
    | (HttpTypes.StoreCartShippingMethod &
        { rules: any; seller_id: string; price_type: string; id: string; name: string; seller_name?: string })[]
    | null
}

const CartShippingMethodsSection: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [priceCalculationCache, setPriceCalculationCache] = useState<
    Record<string, { price: number; timestamp: number }>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [missingModal, setMissingModal] = useState(false)
  const [missingShippingSellers, setMissingShippingSellers] = useState<
    string[]
  >([])
  // Local state to track selected shipping methods for immediate UI feedback
  const [selectedShippingMethods, setSelectedShippingMethods] = useState<
    Record<string, string>
  >({})
  // State to track which shipping method is currently being set
  const [settingShippingMethod, setSettingShippingMethod] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) =>
      sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !==
      "true"
  )

  useEffect(() => {
    // Only run this logic if we have cart items and shipping methods data
    if (cart.items && _shippingMethods) {
      const set = new Set<string>()
      cart.items.forEach((item: any) => {
        if (item?.product?.seller?.id) {
          set.add(item.product.seller.id)
        }
      })

      const sellerMethods = _shippingMethods.map(({ seller_id }) => seller_id)

      const missingSellerIds = [...set].filter(
        (sellerId) => !sellerMethods.includes(sellerId)
      )
      
      // Compare arrays before setting state to avoid unnecessary re-renders
      const currentMissingSellers = missingShippingSellers
      const missingSellersChanged = 
        currentMissingSellers.length !== missingSellerIds.length ||
        missingSellerIds.some(id => !currentMissingSellers.includes(id))
      
      if (missingSellersChanged) {
        setMissingShippingSellers(missingSellerIds)
      }

      // Only set modal state if it needs to change
      if (missingSellerIds.length > 0 && !cart.shipping_methods?.length && !missingModal) {
        setMissingModal(true)
      }
    }
  }, [cart, _shippingMethods, missingShippingSellers, missingModal])

  useEffect(() => {
    // Skip effect if there are no shipping methods to process
    if (!_shippingMethods?.length) return;
    
    // Set loading state only if it's not already loading
    if (!isLoadingPrices) {
      setIsLoadingPrices(true);
    }
    
    // Get only calculated price methods
    const calculatedMethods = _shippingMethods.filter((sm) => sm.price_type === "calculated");
    if (!calculatedMethods.length) {
      setIsLoadingPrices(false);
      return;
    }
    
    // Create unique request ID to prevent race conditions
    const requestId = Date.now();
    const currentRequestId = requestId;
    
    // Cache key for this calculation
    const cacheKey = `${cart.id}-${calculatedMethods.map(m => m.id).sort().join('-')}`;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    // Check if we have cached results that are still valid
    const cachedResult = priceCalculationCache[cacheKey];
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
      console.log('Using cached shipping prices');
      setIsLoadingPrices(false);
      return;
    }
    
    const promises = calculatedMethods.map((sm) => 
      calculatePriceForShippingOption(sm.id, cart.id)
    );
    
    Promise.allSettled(promises).then((res) => {
      // If this is an outdated request, ignore the results
      if (currentRequestId !== requestId) return;
      
      const pricesMap: Record<string, number> = {}
      res
        .filter((r) => r.status === "fulfilled")
        .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

      // Only update if prices changed
      const pricesChanged = Object.keys(pricesMap).some(key => 
        pricesMap[key] !== calculatedPricesMap[key]
      ) || Object.keys(calculatedPricesMap).some(key => 
        !pricesMap[key] && calculatedPricesMap[key]
      );
      
      if (pricesChanged) {
        setCalculatedPricesMap(pricesMap);
        
        // Cache the results
        setPriceCalculationCache(prev => ({
          ...prev,
          [cacheKey]: {
            price: Object.values(pricesMap).reduce((sum, price) => sum + price, 0),
            timestamp: Date.now()
          }
        }));
      }
      
      setIsLoadingPrices(false);
    }).catch(() => {
      // Always turn off loading on error
      setIsLoadingPrices(false);
    });
  }, [availableShippingMethods, _shippingMethods, cart.id, calculatedPricesMap, isLoadingPrices, priceCalculationCache])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 100))
      router.replace(pathname + "?step=payment")
    } catch (err) {
      setError("Wystąpił błąd podczas przechodzenia do płatności")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Memoize shipping method handler to prevent unnecessary re-renders
  const handleSetShippingMethod = useCallback(
    async (shippingOptionId: string) => {
      if (!cart?.id) {
        console.error("No cart ID available")
        return
      }

      // Find the shipping method details from available methods
      const selectedMethod = _shippingMethods?.find(method => method.id === shippingOptionId)
      if (!selectedMethod) {
        console.error("Selected shipping method not found:", shippingOptionId)
        return
      }

      setError(null)
      setSettingShippingMethod(shippingOptionId)
      
      // Update local state immediately for UI feedback
      const sellerId = selectedMethod.seller_id || 'default'
      setSelectedShippingMethods(prev => ({
        ...prev,
        [sellerId]: shippingOptionId
      }))

      try {
        const response = await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: shippingOptionId,
        })

        if (response) {
          console.log("✅ Shipping method set successfully:", {
            shippingOptionId,
            cartId: cart.id,
            methodName: selectedMethod.name
          })

          // Aggressive cache invalidation to force fresh data
          try {
            const { invalidateCheckoutCache } = await import('../../../lib/utils/persistent-cache')
            invalidateCheckoutCache(cart.id)
            console.log("🗑️ Invalidated checkout cache for cart:", cart.id)
          } catch (cacheError) {
            console.warn("Cache invalidation failed:", cacheError)
          }

          // Force parent component refresh with a small delay to ensure cache is cleared
          setTimeout(() => {
            console.log("🔄 Forcing router refresh after cache invalidation...")
            router.refresh()
            
            // Additional fallback: trigger window event to force parent refresh
            window.dispatchEvent(new CustomEvent('cart-updated', { 
              detail: { cartId: cart.id, action: 'shipping-method-set' } 
            }))
          }, 100)
        }
      } catch (error: any) {
        console.error("❌ Error setting shipping method:", error)
        setError(error.message || "Failed to set shipping method")
        
        // Revert local state on error
        const sellerId = selectedMethod.seller_id || 'default'
        setSelectedShippingMethods(prev => {
          const updated = { ...prev }
          delete updated[sellerId]
          return updated
        })
      } finally {
        setSettingShippingMethod(null)
      }
    },
    [cart.id, router, _shippingMethods]
  )

  // Handler for shipping method removal
  const handleMethodRemoved = useCallback(async (methodId: string, sellerId?: string) => {
    console.log("🔄 Shipping method removed:", { methodId, sellerId })
    
    // Immediately update local state to hide the deleted method
    if (sellerId) {
      setSelectedShippingMethods(prev => {
        const updated = { ...prev }
        delete updated[sellerId]
        return updated
      })
    }
    
    // Clear any errors
    setError(null)
    
    // Force router refresh to get updated cart data from server
    // This ensures the cart prop is refreshed with the latest data
    router.refresh()
    
    // Additional fallback: if router.refresh() doesn't work due to caching issues,
    // force a hard reload after a short delay
    setTimeout(() => {
      console.log("🔄 Checking if cart state updated after deletion...")
      
      // Check if the deleted method is still in the cart
      const stillExists = cart.shipping_methods?.some(method => method.id === methodId)
      if (stillExists) {
        console.warn("⚠️ Cart state not updated, forcing hard refresh...")
        window.location.reload()
      } else {
        console.log("✅ Cart state successfully updated")
      }
    }, 500)
  }, [router, cart.shipping_methods])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Sync local state with cart prop changes
  useEffect(() => {
    console.log("🔄 Cart prop changed, syncing local state:", {
      cartShippingMethods: cart.shipping_methods?.length || 0,
      localSelectedMethods: Object.keys(selectedShippingMethods).length
    })
    
    // If cart has no shipping methods, clear local selected methods
    if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
      if (Object.keys(selectedShippingMethods).length > 0) {
        console.log("🧹 Clearing local selected methods - cart has no shipping methods")
        setSelectedShippingMethods({})
      }
    } else {
      // Sync cart shipping methods to local state for proper visual selection
      const newSelectedMethods: Record<string, string> = {}
      cart.shipping_methods.forEach((method: any) => {
        const sellerId = (method as any).seller_id || 
          (method as any).data?.seller_id || 
          'default'
        if (method.shipping_option_id) {
          newSelectedMethods[sellerId] = method.shipping_option_id
        }
      })
      
      // Only update if there are actual changes to prevent infinite loops
      const currentKeys = Object.keys(selectedShippingMethods).sort()
      const newKeys = Object.keys(newSelectedMethods).sort()
      const hasChanges = currentKeys.length !== newKeys.length || 
        currentKeys.some((key, index) => key !== newKeys[index]) ||
        Object.keys(newSelectedMethods).some(key => selectedShippingMethods[key] !== newSelectedMethods[key])
      
      if (hasChanges) {
        console.log("🔄 Syncing cart shipping methods to local state:", newSelectedMethods)
        setSelectedShippingMethods(newSelectedMethods)
      }
    }
  }, [cart.shipping_methods])

  const groupedBySellerId = _shippingMethods?.reduce((acc: any, method) => {
    const sellerId = method.seller_id!

    if (!acc[sellerId]) {
      acc[sellerId] = []
    }

    acc[sellerId]?.push(method)
    return acc
  }, {})

  // Memoize handleEdit to prevent unnecessary re-renders
  const handleEdit = useCallback(() => {
    router.replace(pathname + "?step=delivery")
  }, [router, pathname])

  const missingSellers = cart.items
    ?.filter((item) =>
      missingShippingSellers.includes(item.product?.seller?.id!)
    )
    .map((item) => item.product?.seller?.name)

  return (
    <div className="border p-4 rounded-sm bg-ui-bg-interactive">
      {/* {missingModal && (
        <Modal
          heading="Missing seller shipping option"
          onClose={() => router.push(`/${pathname.split("/")[1]}/cart`)}
        >
          <div className="p-4">
            <h2 className="heading-sm">
              Some of the sellers in your cart do not have shipping options.
            </h2>

            <p className="text-md mt-3">
              Please remove the{" "}
              <span className="font-bold">
                {missingSellers?.map(
                  (seller, index) =>
                    `${seller}${
                      index === missingSellers.length - 1 ? " " : ", "
                    }`
                )}
              </span>{" "}
              items or contact{" "}
              {missingSellers && missingSellers?.length > 1 ? "them" : "him"} to
              get the shipping options.
            </p>
          </div>
        </Modal>
      )} */}
      <div className="flex items-center justify-between">
        <Heading
          level="h2"
          className={clx("flex items-center gap-x-2 text-ui-fg-base")}
        >
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolidWrapper />
          )}
          Dostawa
        </Heading>
        {!isOpen && (
          <Text>
            <Button onClick={handleEdit} variant="tonal">
              Edytuj
            </Button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <>
          <div className="grid">
            <div data-testid="delivery-options-container">
              <div className="pb-8 md:pt-0 pt-2">
                {Object.keys(groupedBySellerId).map((key) => {
                  return (
                    <div key={key} className="mb-4">
                      <Heading level="h3" className="mb-2">
                        {groupedBySellerId[key][0].seller_name}
                      </Heading>
                      <Listbox
                        value={selectedShippingMethods[key] || ""}
                        onChange={(value) => {
                          console.log("📝 Listbox onChange triggered:", { sellerId: key, value })
                          handleSetShippingMethod(value)
                        }}
                        disabled={settingShippingMethod !== null}
                      >
                        <div className="relative">
                          <Listbox.Button
                            className={clsx(
                              "relative w-full flex justify-between items-center px-4 h-12 bg-component-secondary text-left  cursor-default focus:outline-none border rounded-lg focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-gray-300 focus-visible:ring-offset-2 focus-visible:border-gray-300 text-base-regular"
                            )}
                          >
                            {({ open }) => (
                              <>
                                <span className="block truncate">
                                  {(() => {
                                    const selectedMethodId = selectedShippingMethods[key]
                                    
                                    if (selectedMethodId) {
                                      const selectedMethod = groupedBySellerId[key].find((method: any) => method.id === selectedMethodId)
                                      if (selectedMethod) {
                                        const price = selectedMethod.price_type === "flat" 
                                          ? selectedMethod.amount 
                                          : calculatedPricesMap[selectedMethod.id]
                                        return `${selectedMethod.name} - ${price ? convertToLocale({
                                          amount: price,
                                          currency_code: cart?.currency_code,
                                        }) : '-'}`
                                      }
                                    }
                                    
                                    return settingShippingMethod ? "Ustawianie..." : "Wybierz opcję dostawy"
                                  })()
                                }</span>
                                <ChevronUpDownWrapper
                                  className={clx(
                                    "transition-rotate duration-200",
                                    {
                                      "transform rotate-180": open,
                                    }
                                  )}
                                />
                              </>
                            )}
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options
                              className="absolute z-20 w-full overflow-auto text-small-regular bg-white border rounded-lg border-top-0 max-h-60 focus:outline-none sm:text-sm"
                              data-testid="shipping-address-options"
                            >
                              {groupedBySellerId[key].map((option: any) => {
                                return (
                                  <Listbox.Option
                                    className={clsx(
                                      "cursor-pointer select-none relative pl-6 pr-10 hover:bg-gray-50 py-4 border-b",
                                      {
                                        "bg-blue-50 border-blue-200": selectedShippingMethods[key] === option.id,
                                        "opacity-50 cursor-not-allowed": settingShippingMethod !== null && settingShippingMethod !== option.id
                                      }
                                    )}
                                    value={option.id}
                                    key={option.id}
                                    disabled={settingShippingMethod !== null && settingShippingMethod !== option.id}
                                  >
                                    {option.name}
                                    {" - "}
                                    {option.price_type === "flat" ? (
                                      convertToLocale({
                                        amount: option.amount!,
                                        currency_code: cart?.currency_code,
                                      })
                                    ) : calculatedPricesMap[option.id] ? (
                                      convertToLocale({
                                        amount: calculatedPricesMap[option.id],
                                        currency_code: cart?.currency_code,
                                      })
                                    ) : isLoadingPrices ? (
                                      <LoaderWrapper />
                                    ) : (
                                      "-"
                                    )}
                                    {settingShippingMethod === option.id && (
                                      <span className="ml-2 text-blue-600">
                                        <LoaderWrapper className="w-4 h-4" />
                                      </span>
                                    )}
                                    {selectedShippingMethods[key] === option.id && settingShippingMethod !== option.id && (
                                      <span className="ml-2 text-green-600">✓</span>
                                    )}
                                  </Listbox.Option>
                                )
                              })}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>
                  )
                })}
                {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
                  <div className="flex flex-col">
                    {cart.shipping_methods?.map((method: any) => {
                      // Check if this is an InPost shipping method
                      const isInpostMethod = isInpostShippingOption(method);
                      
                      // Extract seller ID from the method if available
                      // @ts-ignore - Handle potential missing seller_id property
                      const sellerId = method.seller_id || 
                        // @ts-ignore
                        method.seller?.id || 
                        // If there are items from this seller in the cart, use that seller's ID
                        // Need to cast cart.items to access extended properties safely
                        (cart.items as (CartItem & { variant?: { product?: { seller?: { id: string } } } })[])?.find(item => 
                          item.variant?.product?.seller?.id
                        )?.variant?.product?.seller?.id || 
                        undefined;
                      
                      // Cast to the expected type to avoid TypeScript errors
                      // This is safe because we're only using compatible properties
                      const typedMethod = method as unknown as HttpTypes.StoreCartShippingMethod;
                      
                      return (
                        <div key={method.id} className="flex flex-col w-full">
                          <CartShippingMethodRow
                            method={method}
                            currency_code={cart.currency_code}
                            onMethodRemoved={handleMethodRemoved}
                          />
                          
                          {/* Wrap with InPost component if it's an InPost shipping method */}
                          {isInpostMethod && (
                            <div className="mt-2 pl-4">
                              <InpostShippingMethodWrapper
                                shippingMethod={typedMethod}
                                sellerId={sellerId}
                                cartId={cart.id}
                                onComplete={() => {
                                  // Optionally refresh data or show a success message
                                  console.log('InPost parcel selection completed');
                                }}
                                onError={(error) => {
                                  console.error('InPost error:', error);
                                  setError(`InPost error: ${error}`);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              onClick={handleSubmit}
              variant="tonal"
              disabled={!cart.shipping_methods?.[0] || isSubmitting || isLoadingPrices}
              loading={isSubmitting || isLoadingPrices}
            >
              {isSubmitting ? "Przechodzenie..." : "Kontynuuj do płatności"}
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col">
                {cart.shipping_methods?.map((method: any) => (
                  <div key={method.id} className="mb-4 border rounded-md p-4">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Metoda
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {method.name}{" "}
                      {convertToLocale({
                        amount: method.amount!,
                        currency_code: cart?.currency_code,
                      })}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CartShippingMethodsSection