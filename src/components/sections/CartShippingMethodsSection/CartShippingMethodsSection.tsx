"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
// Removed direct import - using CartContext setShipping instead
import { calculatePriceForShippingOption, listCartShippingMethods } from "@/lib/data/fulfillment"
import { convertToLocale } from "@/lib/helpers/money"
import { isInpostShippingOption } from "@/lib/helpers/inpost-helpers"
// Using our wrapper components instead of direct imports to fix SVG attribute warnings
import { CheckCircleSolidWrapper, ChevronUpDownWrapper, LoaderWrapper } from "@/components/atoms/icons/IconWrappers"
import { HttpTypes } from "@medusajs/types"
import { clx, Heading, Text } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Fragment, useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/atoms"
import { Modal, SelectField } from "@/components/molecules"
import { CartShippingMethodRow } from "./CartShippingMethodRow"
import { Listbox, Transition } from "@headlessui/react"
import clsx from "clsx"
import { InpostShippingMethodWrapper } from "@/components/molecules/InpostShippingMethodWrapper/InpostShippingMethodWrapper"
import { useCart } from "@/lib/context/CartContext"
// Import cache invalidation function
import { invalidateCheckoutCache } from "@/lib/utils/storefront-cache"

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
  cart: propCart,
  availableShippingMethods,
}) => {
  const { cart: contextCart, refreshCart, setShipping } = useCart()
  
  // Use context cart if available, fallback to prop cart
  const cart = contextCart || propCart
  
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [missingModal, setMissingModal] = useState(false)
  const [missingShippingSellers, setMissingShippingSellers] = useState<string[]>([])
  const [settingShippingMethod, setSettingShippingMethod] = useState<string | null>(null)
  
  // State for fresh shipping methods data - bypasses all caching
  const [freshShippingMethods, setFreshShippingMethods] = useState<any[] | null>(null)
  const [isLoadingFreshMethods, setIsLoadingFreshMethods] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // Use shipping methods from props instead of fetching again
  // This eliminates redundant API calls since data is already loaded by checkout page
  useEffect(() => {
    if (availableShippingMethods) {
      setFreshShippingMethods(availableShippingMethods)
      setIsLoadingFreshMethods(false)
    }
  }, [availableShippingMethods])

  // Use fresh shipping methods if available, otherwise fall back to props
  const _shippingMethods = (freshShippingMethods || availableShippingMethods)?.filter(
    (sm) =>
      sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !==
      "true"
  )

  // Create a map of selected shipping methods by seller
  const selectedShippingMethods = useMemo(() => {
    const selectedMap: Record<string, string> = {}
    
    if (cart.shipping_methods) {
      cart.shipping_methods.forEach((method: any) => {
        // Find the corresponding available method to get the seller_id
        const availableMethod = _shippingMethods?.find(am => am.id === method.shipping_option_id)
        if (availableMethod) {
          selectedMap[availableMethod.seller_id] = method.shipping_option_id
        }
      })
    }
    
    return selectedMap
  }, [cart.shipping_methods, _shippingMethods])

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

  // Calculate shipping prices without caching
  useEffect(() => {
    if (!_shippingMethods?.length) {
      setIsLoadingPrices(false)
      return
    }
    
    const calculatedMethods = _shippingMethods.filter((sm) => sm.price_type === "calculated")
    if (!calculatedMethods.length) {
      setIsLoadingPrices(false)
      return
    }
    
    setIsLoadingPrices(true)
    
    const promises = calculatedMethods.map((sm) => 
      calculatePriceForShippingOption(sm.id, cart.id)
    )
    
    Promise.allSettled(promises).then((res) => {
      const pricesMap: Record<string, number> = {}
      res
        .filter((r) => r.status === "fulfilled")
        .forEach((p) => {
          const result = p as PromiseFulfilledResult<any>
          if (result.value?.id && result.value?.amount) {
            pricesMap[result.value.id] = result.value.amount
          }
        })

      setCalculatedPricesMap(pricesMap)
      setIsLoadingPrices(false)
    }).catch(() => {
      setIsLoadingPrices(false)
    })
  }, [_shippingMethods, cart.id])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      router.replace(pathname + "?step=payment")
    } catch (err) {
      setError("Wystąpił błąd podczas przechodzenia do płatności")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetShippingMethod = useCallback(
    async (shippingMethodId: string) => {
      if (!cart?.id || settingShippingMethod) {
        return
      }

      setError(null)
      setSettingShippingMethod(shippingMethodId)

      try {
        // Use CartContext setShipping method instead of direct API call
        await setShipping(shippingMethodId)
        // No need for manual refreshes - CartContext handles state updates
      } catch (error: any) {
        console.error("❌ Error setting shipping method:", error)
        setError(error.message || "Failed to set shipping method")
      } finally {
        setSettingShippingMethod(null)
      }
    },
    [cart.id, settingShippingMethod, setShipping]
  )

  const handleMethodRemoved = useCallback(async (methodId: string, sellerId?: string) => {
    // Refresh cart with shipping context for optimized data loading
    try {
      await refreshCart('shipping')
    } catch (error) {
      console.error('❌ Error refreshing cart after method removal:', error)
    }
  }, [refreshCart])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const groupedBySellerId = _shippingMethods?.reduce((acc: any, method) => {
    const sellerId = method.seller_id!

    if (!acc[sellerId]) {
      acc[sellerId] = []
    }

    acc[sellerId]?.push(method)
    return acc
  }, {})

  const handleEdit = useCallback(() => {
    router.replace(pathname + "?step=delivery")
  }, [router, pathname])

  const missingSellers = cart.items
    ?.filter((item) =>
      missingShippingSellers.includes((item.product as any)?.seller?.id || '')
    )
    .map((item) => (item.product as any)?.seller?.name)
    .filter(Boolean)

  return (
    <div className="border p-4 rounded-sm bg-ui-bg-interactive">
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
                {Object.keys(groupedBySellerId || {}).map((sellerId) => {
                  const methods = groupedBySellerId[sellerId]
                  const selectedMethodId = selectedShippingMethods[sellerId] || ""
                  const selectedMethod = methods.find((m: any) => m.id === selectedMethodId)
                  
                  return (
                    <div key={sellerId} className="mb-4">
                      <Heading level="h3" className="mb-2">
                        {methods[0].seller_name}
                      </Heading>
                      <Listbox
                        value={selectedMethodId}
                        onChange={(value) => {
                          handleSetShippingMethod(value)
                        }}
                        disabled={settingShippingMethod !== null}
                      >
                        <div className="relative">
                          <Listbox.Button
                            className={clsx(
                              "relative w-full flex justify-between items-center px-4 h-12 bg-component-secondary text-left cursor-default focus:outline-none border rounded-lg focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-gray-300 focus-visible:ring-offset-2 focus-visible:border-gray-300 text-base-regular",
                              {
                                "opacity-50 cursor-not-allowed": settingShippingMethod !== null
                              }
                            )}
                          >
                            {({ open }) => (
                              <>
                                <span className="block truncate">
                                  {settingShippingMethod ? (
                                    "Ustawianie..."
                                  ) : selectedMethod ? (
                                    `${selectedMethod.name} - ${
                                      selectedMethod.price_type === "flat" && selectedMethod.prices?.[0]?.amount
                                        ? convertToLocale({
                                            amount: selectedMethod.prices[0].amount,
                                            currency_code: selectedMethod.prices[0].currency_code || cart?.currency_code,
                                          })
                                        : selectedMethod.price_type === "flat" && selectedMethod.amount
                                        ? convertToLocale({
                                            amount: selectedMethod.amount,
                                            currency_code: cart?.currency_code,
                                          })
                                        : calculatedPricesMap[selectedMethod.id] 
                                          ? convertToLocale({
                                              amount: calculatedPricesMap[selectedMethod.id],
                                              currency_code: cart?.currency_code,
                                            })
                                          : "-"
                                    }`
                                  ) : (
                                    "Wybierz opcję dostawy"
                                  )}
                                </span>
                                <div className="flex items-center">
                                  {settingShippingMethod && (
                                    <LoaderWrapper className="w-4 h-4 mr-2" />
                                  )}
                                  <ChevronUpDownWrapper
                                    className={clx(
                                      "transition-rotate duration-200",
                                      {
                                        "transform rotate-180": open,
                                      }
                                    )}
                                  />
                                </div>
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
                              {methods.map((option: any) => {
                                const isSelected = selectedMethodId === option.id
                                const isBeingSet = settingShippingMethod === option.id
                                
                                return (
                                  <Listbox.Option
                                    className={clsx(
                                      "cursor-pointer select-none relative pl-6 pr-10 hover:bg-gray-50 py-4 border-b",
                                      {
                                        "bg-blue-50 border-blue-200": isSelected,
                                        "opacity-50": settingShippingMethod !== null && !isBeingSet
                                      }
                                    )}
                                    value={option.id}
                                    key={option.id}
                                    disabled={settingShippingMethod !== null && !isBeingSet}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>
                                        {option.name}
                                        {" - "}
                                        {option.price_type === "flat" && option.prices?.[0]?.amount ? (
                                          convertToLocale({
                                            amount: option.prices[0].amount,
                                            currency_code: option.prices[0].currency_code || cart?.currency_code,
                                          })
                                        ) : option.price_type === "flat" && option.amount ? (
                                          convertToLocale({
                                            amount: option.amount,
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
                                      </span>
                                      <div className="flex items-center">
                                        {isBeingSet && (
                                          <LoaderWrapper className="w-4 h-4 text-blue-600" />
                                        )}
                                        {isSelected && !isBeingSet && (
                                          <span className="text-green-600 ml-2">✓</span>
                                        )}
                                      </div>
                                    </div>
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
                      const sellerId = method.seller_id || 
                        method.seller?.id || 
                        (cart.items as (CartItem & { variant?: { product?: { seller?: { id: string } } } })[])?.find(item => 
                          item.variant?.product?.seller?.id
                        )?.variant?.product?.seller?.id || 
                        undefined;
                      
                      const typedMethod = method as unknown as HttpTypes.StoreCartShippingMethod;
                      
                      return (
                        <div key={method.id} className="flex flex-col w-full">
                          <CartShippingMethodRow
                            key={typedMethod.id}
                            method={typedMethod}
                            currency_code={cart?.currency_code!}
                            cartId={cart.id}
                            onMethodRemoved={handleMethodRemoved}
                          />
                          
                          {/* Wrap with InPost component if it's an InPost shipping method */}
                          {isInpostMethod && (
                            <div className="mt-2 pl-4">
                              <InpostShippingMethodWrapper
                                shippingMethod={typedMethod}
                                sellerId={sellerId}
                                cartId={cart.id}
                                onComplete={async () => {
                                  // Only refresh cart context - no additional API calls needed
                                  await refreshCart();
                                  router.refresh();
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
                {cart.shipping_methods?.map((method: any) => {
                  // Find the corresponding available method to get the name and seller info
                  const availableMethod = _shippingMethods?.find(am => am.id === method.shipping_option_id)
                  const methodName = method.name || availableMethod?.name || 'Metoda dostawy'
                  const sellerName = availableMethod?.seller_name || ''
                  
                  return (
                    <div key={method.id} className="mb-4 border rounded-md p-4">
                      <Text className="txt-medium-plus text-ui-fg-base mb-1">
                        {sellerName && `${sellerName} - `}Metoda dostawy
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {methodName}{" "}
                        {convertToLocale({
                          amount: method.amount!,
                          currency_code: cart?.currency_code,
                        })}
                      </Text>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CartShippingMethodsSection