"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { calculatePriceForShippingOption, listCartShippingMethods } from "@/lib/data/fulfillment"
import { convertToLocale } from "@/lib/helpers/money"
import { isInpostShippingOption } from "@/lib/helpers/inpost-helpers"
import { CheckCircleSolidWrapper, ChevronUpDownWrapper, LoaderWrapper } from "@/components/atoms/icons/IconWrappers"
import { HttpTypes } from "@medusajs/types"
import { clx, Heading, Text } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Fragment, useEffect, useState, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/atoms"
import { Modal, SelectField } from "@/components/molecules"
import { CartShippingMethodRow } from "./CartShippingMethodRow"
import { Listbox, Transition } from "@headlessui/react"
import clsx from "clsx"
import { InpostShippingMethodWrapper } from "@/components/molecules/InpostShippingMethodWrapper/InpostShippingMethodWrapper"
import { setShippingMethod } from "@/lib/data/cart"
import { unifiedCache } from "@/lib/utils/unified-cache"
import { useCart } from "@/components/context/CartContext"

// Types remain the same
type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  seller?: {
    id: string
    name: string
  }
}

type ExtendedStoreVariant = HttpTypes.StoreProductVariant & {
  product?: ExtendedStoreProduct
}

type CartItem = {
  product?: ExtendedStoreProduct
  variant?: ExtendedStoreVariant
}

type ExtendedShippingMethod = HttpTypes.StoreCartShippingMethod & {
  rules?: any[]
  seller_id: string
  price_type: string
  seller_name?: string
}

type ShippingProps = {
  cart: Omit<HttpTypes.StoreCart, "items"> & {
    items?: CartItem[]
  }
  availableShippingMethods: ExtendedShippingMethod[] | null
}

const CartShippingMethodsSection: React.FC<ShippingProps> = ({
  cart: propCart,
  availableShippingMethods,
}) => {
  const { cart, refreshCart, setShipping } = useCart()
  const activeCart = cart || propCart
  
  // STABLE shipping methods - only update when absolutely necessary
  const [shippingMethods, setShippingMethods] = useState<ExtendedShippingMethod[]>(() => {
    return availableShippingMethods?.filter(
      (sm) => sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !== "true"
    ) || []
  })
  
  // Track if we've ever loaded methods for this cart/address combo
  const [hasLoadedMethods, setHasLoadedMethods] = useState(!!availableShippingMethods?.length)
  
  // Loading states
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settingShippingMethod, setSettingShippingMethod] = useState<string | null>(null)
  
  // Other states
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [missingModal, setMissingModal] = useState(false)
  const [missingShippingSellers, setMissingShippingSellers] = useState<string[]>([])
  
  // Track address to know when to refetch
  const lastAddressRef = useRef<string>("")
  
  // Track cart shipping methods to detect changes
  const lastCartShippingMethodsRef = useRef<string>("")

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // ONLY fetch fresh methods when address actually changes or we don't have any methods
  useEffect(() => {
    if (!activeCart?.id || !isOpen) return
    
    const currentAddressKey = JSON.stringify(activeCart.shipping_address || {})
    const addressChanged = lastAddressRef.current !== currentAddressKey
    
    // Only fetch if:
    // 1. Address changed, OR
    // 2. We don't have methods AND haven't loaded them yet
    if (addressChanged || (!shippingMethods.length && !hasLoadedMethods)) {
      lastAddressRef.current = currentAddressKey
      
      const fetchShippingMethods = async () => {
        try {
          const freshMethods = await listCartShippingMethods(activeCart.id, {}, { cache: 'no-store' })
          const filteredMethods: ExtendedShippingMethod[] = (freshMethods || [])
            .filter((sm: any) => sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !== "true")
            .map((sm: any) => ({
              ...sm,
              rules: sm.rules || [],
              seller_id: sm.seller_id || '',
              price_type: sm.price_type || 'flat',
              seller_name: sm.seller_name
            }))
          
          setShippingMethods(filteredMethods)
          setHasLoadedMethods(true)
        } catch (error) {
          console.error('Error fetching shipping methods:', error)
        }
      }
      
      fetchShippingMethods()
    }
  }, [activeCart?.id, activeCart?.shipping_address, isOpen, shippingMethods.length, hasLoadedMethods])

  // Initialize from props if we don't have methods
  useEffect(() => {
    if (!hasLoadedMethods && availableShippingMethods?.length) {
      const filteredMethods = availableShippingMethods.filter(
        (sm) => sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !== "true"
      )
      setShippingMethods(filteredMethods)
      setHasLoadedMethods(true)
    }
  }, [availableShippingMethods, hasLoadedMethods])

  // HIGH-CLASS SOLUTION: Listen to cart changes and sync our component state
  useEffect(() => {
    if (!activeCart) return
    
    const currentCartShippingMethods = JSON.stringify(activeCart.shipping_methods || [])
    const cartShippingMethodsChanged = lastCartShippingMethodsRef.current !== currentCartShippingMethods
    
    if (cartShippingMethodsChanged) {
      lastCartShippingMethodsRef.current = currentCartShippingMethods
      
      // This effect will trigger when:
      // 1. Shipping methods are added
      // 2. Shipping methods are removed (what we need!)
      // 3. Shipping methods are modified
      
      // Force re-render by updating a timestamp or trigger refresh if needed
      // The component will automatically re-render because activeCart changed
    }
  }, [activeCart?.shipping_methods])

  // STABLE selected shipping methods - memoized properly
  const selectedShippingMethods = useMemo(() => {
    const selectedMap: Record<string, string> = {}
    
    if (activeCart?.shipping_methods?.length && shippingMethods.length) {
      activeCart.shipping_methods.forEach((method: any) => {
        const availableMethod = shippingMethods.find(am => am.id === method.shipping_option_id)
        if (availableMethod) {
          selectedMap[availableMethod.seller_id] = method.shipping_option_id
        }
      })
    }
    
    return selectedMap
  }, [activeCart?.shipping_methods, shippingMethods])

  // STABLE grouped methods - only recalculate when methods actually change
  const groupedBySellerId = useMemo(() => {
    if (!shippingMethods.length) return {}
    
    return shippingMethods.reduce((acc: Record<string, ExtendedShippingMethod[]>, method) => {
      const sellerId = method.seller_id
      if (!acc[sellerId]) {
        acc[sellerId] = []
      }
      acc[sellerId].push(method)
      return acc
    }, {})
  }, [shippingMethods])

  // Calculate shipping prices - only when methods change
  useEffect(() => {
    if (!shippingMethods?.length) {
      setIsLoadingPrices(false)
      return
    }
    
    const calculatedMethods = shippingMethods.filter((sm) => sm.price_type === "calculated")
    if (!calculatedMethods.length) {
      setIsLoadingPrices(false)
      return
    }
    
    const needsPricing = calculatedMethods.some(sm => !(sm.id in calculatedPricesMap))
    if (!needsPricing) {
      return
    }
    
    setIsLoadingPrices(true)
    
    const promises = calculatedMethods.map((sm) => 
      calculatePriceForShippingOption(sm.id, activeCart?.id || '')
    )
    
    Promise.allSettled(promises).then((res) => {
      const pricesMap: Record<string, number> = { ...calculatedPricesMap }
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
  }, [shippingMethods, activeCart?.id, calculatedPricesMap])

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

  // NO REFETCH on method selection - just update cart
  const handleSetShippingMethod = useCallback(
    async (shippingMethodId: string) => {
      if (!activeCart?.id || settingShippingMethod) {
        return
      }

      setError(null)
      setSettingShippingMethod(shippingMethodId)

      try {
        await setShipping(shippingMethodId)
        // Don't refetch shipping methods - they haven't changed!
        // The cart context will handle updating the cart state
        // Our useEffect above will detect the cart change and trigger re-render
      } catch (error: any) {
        console.error("❌ Error setting shipping method:", error)
        setError(error.message || "Failed to set shipping method")
      } finally {
        setSettingShippingMethod(null)
      }
    },
    [activeCart?.id, settingShippingMethod, setShipping]
  )

  // HIGH-CLASS SOLUTION: Proper method removal handling
  const handleMethodRemoved = useCallback(async (methodId: string, sellerId?: string) => {
    try {
      
      // Force cart context to refresh from server
      // This will trigger our useEffect that monitors cart.shipping_methods changes
      await refreshCart()
      
    } catch (error) {
      console.error('❌ Error refreshing cart after method removal:', error)
      setError('Wystąpił błąd podczas odświeżania koszyka')
    }
  }, [refreshCart])

  const handleEdit = useCallback(() => {
    router.replace(pathname + "?step=delivery")
  }, [router, pathname])

  // Clear error when section opens
  useEffect(() => {
    if (isOpen) {
      setError(null)
    }
  }, [isOpen])

  // Show current selected shipping methods (this is the key part that wasn't updating)
  const currentSelectedMethods = useMemo(() => {
    return activeCart?.shipping_methods || []
  }, [activeCart?.shipping_methods])

  return (
    <div className="border p-4 rounded-sm bg-ui-bg-interactive">
      <div className="flex items-center justify-between">
        <Heading
          level="h2"
          className={clx("flex items-center gap-x-2 text-ui-fg-base")}
        >
          {!isOpen && currentSelectedMethods.length > 0 && (
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
                {/* STABLE SELECTOR - No skeleton flashing */}
                {Object.keys(groupedBySellerId).map((sellerId) => {
                  const methods = groupedBySellerId[sellerId]
                  if (!methods?.length) return null
                  
                  const selectedMethodId = selectedShippingMethods[sellerId] || ""
                  const selectedMethod = methods.find((m) => m.id === selectedMethodId)
                  
                  return (
                    <div key={sellerId} className="mb-4">
                      {/* STABLE HEADER */}
                      <Heading level="h3" className="mb-2">
                        {methods[0].seller_name}
                      </Heading>
                      
                      {/* STABLE SELECTOR */}
                      <Listbox
                        value={selectedMethodId}
                        onChange={handleSetShippingMethod}
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
                                  {settingShippingMethod === selectedMethodId ? (
                                    "Ustawianie..."
                                  ) : selectedMethod ? (
                                    `${selectedMethod.name} - ${
                                      selectedMethod.price_type === "flat" && (selectedMethod as any).prices?.[0]?.amount
                                        ? convertToLocale({
                                            amount: (selectedMethod as any).prices[0].amount,
                                            currency_code: (selectedMethod as any).prices[0].currency_code || activeCart?.currency_code || 'PLN',
                                          })
                                        : selectedMethod.price_type === "flat" && selectedMethod.amount
                                        ? convertToLocale({
                                            amount: selectedMethod.amount,
                                            currency_code: activeCart?.currency_code || 'PLN',
                                          })
                                        : calculatedPricesMap[selectedMethod.id] 
                                          ? convertToLocale({
                                              amount: calculatedPricesMap[selectedMethod.id],
                                              currency_code: activeCart?.currency_code || 'PLN',
                                            })
                                          : "-"
                                    }`
                                  ) : (
                                    "Wybierz opcję dostawy"
                                  )}
                                </span>
                                <div className="flex items-center">
                                  {settingShippingMethod === selectedMethodId && (
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
                            <Listbox.Options className="absolute z-20 w-full overflow-auto text-small-regular bg-white border rounded-lg border-top-0 max-h-60 focus:outline-none sm:text-sm">
                              {methods.map((option) => {
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
                                        {option.name} - {
                                          option.price_type === "flat" && (option as any).prices?.[0]?.amount ? (
                                            convertToLocale({
                                              amount: (option as any).prices[0].amount,
                                              currency_code: (option as any).prices[0].currency_code || activeCart?.currency_code || 'PLN',
                                            })
                                          ) : option.price_type === "flat" && option.amount ? (
                                            convertToLocale({
                                              amount: option.amount,
                                              currency_code: activeCart?.currency_code || 'PLN',
                                            })
                                          ) : calculatedPricesMap[option.id] ? (
                                            convertToLocale({
                                              amount: calculatedPricesMap[option.id],
                                              currency_code: activeCart?.currency_code || 'PLN',
                                            })
                                          ) : isLoadingPrices ? (
                                            <LoaderWrapper />
                                          ) : (
                                            "-"
                                          )
                                        }
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
                
                {/* CRITICAL: Show selected shipping methods - now properly reactive to deletions */}
                {currentSelectedMethods.length > 0 && (
                  <div className="flex flex-col">
                    {currentSelectedMethods.map((method: any) => {
                      // CRITICAL FIX: Enrich the method with name from available shipping methods
                      // The cart's shipping_methods might not have the name field populated
                      const availableMethod = shippingMethods.find(am => am.id === method.shipping_option_id)
                      const enrichedMethod = {
                        ...method,
                        name: method.name || availableMethod?.name // Use available method name if cart method name is missing
                      }
                      
                      const isInpostMethod = isInpostShippingOption(enrichedMethod);
                      const typedMethod = enrichedMethod as unknown as HttpTypes.StoreCartShippingMethod;
                      
                      return (
                        <div key={method.id} className="flex flex-col w-full">
                          <CartShippingMethodRow
                            method={typedMethod}
                            currency_code={activeCart?.currency_code || 'PLN'}
                            cartId={activeCart!.id}
                            onMethodRemoved={handleMethodRemoved}
                          />
                          
                          {isInpostMethod && (
                            <div className="mt-2 pl-4">
                              <InpostShippingMethodWrapper
                                shippingMethod={typedMethod}
                                sellerId={undefined}
                                cartId={activeCart!.id}
                                onComplete={async () => {
                                  await unifiedCache.invalidate('cart')
                                  router.refresh();
                                }}
                                onError={(error) => {
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
            <ErrorMessage error={error} data-testid="delivery-option-error-message" />
            <Button
              onClick={handleSubmit}
              variant="tonal"
              disabled={currentSelectedMethods.length === 0 || isSubmitting || isLoadingPrices}
              loading={isSubmitting || isLoadingPrices}
            >
              {isSubmitting ? "Przechodzenie..." : "Kontynuuj do płatności"}
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {currentSelectedMethods.length > 0 && (
              <div className="flex flex-col">
                {currentSelectedMethods.map((method: any) => {
                  const availableMethod = shippingMethods?.find(am => am.id === method.shipping_option_id)
                  const methodName = method.name || availableMethod?.name || 'Metoda dostawy'
                  const sellerName = availableMethod?.seller_name || ''
                  
                  return (
                    <div key={method.id} className="mb-4 border rounded-md p-4">
                      <Text className="txt-medium-plus text-ui-fg-base mb-1">
                        {sellerName && `${sellerName} - `}Metoda dostawy
                      </Text>
                      <Text className="txt-medium text-ui-fg-subtle">
                        {methodName} {convertToLocale({
                          amount: method.amount!,
                          currency_code: activeCart?.currency_code || 'PLN',
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