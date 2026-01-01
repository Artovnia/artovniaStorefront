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

// Types
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
  seller_id?: string
  price_type?: string
  seller_name?: string
  capacity_info?: {
    required_capacity: number
    base_capacity: number
    overage_capacity: number
    additional_parcels: number
    overage_charge: number
    total_price: number
    needs_adjustment: boolean
    message: string
  }
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
  
  // STABLE shipping methods
  const [shippingMethods, setShippingMethods] = useState<ExtendedShippingMethod[]>(() => {
    return availableShippingMethods?.filter(
      (sm) => sm.rules?.find((rule: any) => rule.attribute === "is_return")?.value !== "true"
    ) || []
  })
  
  const [hasLoadedMethods, setHasLoadedMethods] = useState(!!availableShippingMethods?.length)
  
  // Loading states
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settingShippingMethod, setSettingShippingMethod] = useState<string | null>(null)
  
  // Other states
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [missingShippingSellers, setMissingShippingSellers] = useState<string[]>([])
  
  // Refs for tracking changes and preventing race conditions
  const lastAddressRef = useRef<string>("")
  const lastCartShippingMethodsRef = useRef<string>("")
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Fetch shipping methods when address changes
  useEffect(() => {
    if (!activeCart?.id || !isOpen) return
    
    const currentAddressKey = JSON.stringify(activeCart.shipping_address || {})
    const addressChanged = lastAddressRef.current !== currentAddressKey
    
    if (addressChanged || (!shippingMethods.length && !hasLoadedMethods)) {
      lastAddressRef.current = currentAddressKey
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal
      
      const fetchShippingMethods = async () => {
        try {
          const freshMethods = await listCartShippingMethods(
            activeCart.id,
            {},
            { cache: 'no-store' }
          )
          
          // Check if component is still mounted and request wasn't aborted
          if (!isMountedRef.current || signal.aborted) return
          
          if (!Array.isArray(freshMethods)) {
            console.error('[CartShipping] freshMethods is not an array:', typeof freshMethods)
            setShippingMethods([])
            setHasLoadedMethods(true)
            return
          }
          
          
          setShippingMethods(freshMethods)
          setHasLoadedMethods(true)
        } catch (error: any) {
          if (error.name === 'AbortError') return
          if (!isMountedRef.current) return
          console.error('[CartShipping] Error fetching shipping methods:', error)
        }
      }
      
      fetchShippingMethods()
    }
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [activeCart?.id, activeCart?.shipping_address, isOpen, shippingMethods.length, hasLoadedMethods])

  // Initialize from props if we don't have methods
  useEffect(() => {
    if (!hasLoadedMethods && availableShippingMethods?.length) {
      setShippingMethods(availableShippingMethods)
      setHasLoadedMethods(true)
    }
  }, [availableShippingMethods, hasLoadedMethods])

  // Listen to cart changes and sync component state
  useEffect(() => {
    if (!activeCart) return
    
    const currentCartShippingMethods = JSON.stringify(activeCart.shipping_methods || [])
    const cartShippingMethodsChanged = lastCartShippingMethodsRef.current !== currentCartShippingMethods
    
    if (cartShippingMethodsChanged) {
      lastCartShippingMethodsRef.current = currentCartShippingMethods
    }
  }, [activeCart?.shipping_methods])

  // STABLE selected shipping methods
  const selectedShippingMethods = useMemo(() => {
    const selectedMap: Record<string, string> = {}
    
    if (activeCart?.shipping_methods?.length && shippingMethods.length) {
      activeCart.shipping_methods.forEach((method: any) => {
        const availableMethod = shippingMethods.find(am => am.id === method.shipping_option_id)
        if (availableMethod && availableMethod.seller_id) {
          selectedMap[availableMethod.seller_id] = method.shipping_option_id
        }
      })
    }
    
    return selectedMap
  }, [activeCart?.shipping_methods, shippingMethods])

  // STABLE grouped methods
  const groupedBySellerId = useMemo(() => {
    if (!shippingMethods.length) return {}
    
    return shippingMethods.reduce((acc: Record<string, ExtendedShippingMethod[]>, method) => {
      const sellerId = method.seller_id
      if (!sellerId) return acc
      
      if (!acc[sellerId]) {
        acc[sellerId] = []
      }
      acc[sellerId].push(method)
      return acc
    }, {})
  }, [shippingMethods])

  // Calculate if all sellers have shipping methods selected
  const allSellersHaveShipping = useMemo(() => {
    const sellerIds = Object.keys(groupedBySellerId)
    return sellerIds.length > 0 && sellerIds.every(sellerId => selectedShippingMethods[sellerId])
  }, [groupedBySellerId, selectedShippingMethods])

  // Calculate shipping prices
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
      if (!isMountedRef.current) return
      
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
      if (!isMountedRef.current) return
      setIsLoadingPrices(false)
    })
  }, [shippingMethods, activeCart?.id, calculatedPricesMap])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    // Check if all sellers have shipping methods selected
    const missingSellers = Object.keys(groupedBySellerId).filter(
      sellerId => !selectedShippingMethods[sellerId]
    )
    
    if (missingSellers.length > 0) {
      setMissingShippingSellers(missingSellers)
      setError("Proszę wybrać opcję dostawy dla wszystkich sprzedawców")
      setIsSubmitting(false)
      return
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      router.replace(pathname + "?step=payment")
    } catch (err) {
      if (!isMountedRef.current) return
      setError("Wystąpił błąd podczas przechodzenia do płatności")
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  // Handle shipping method selection
  const handleSetShippingMethod = useCallback(
    async (shippingMethodId: string) => {
      if (!activeCart?.id || settingShippingMethod) {
        return
      }

      setError(null)
      setSettingShippingMethod(shippingMethodId)

      try {
        const selectedMethod = shippingMethods.find(m => m.id === shippingMethodId)
        const capacityInfo = (selectedMethod as any)?.data?.capacity_info || (selectedMethod as any)?.capacity_info
        
      
        
        await setShipping(shippingMethodId, capacityInfo ? { capacity_info: capacityInfo } : undefined)
        
        // Clear missing sellers error if this was one of them
        if (selectedMethod?.seller_id) {
          setMissingShippingSellers(prev => prev.filter(id => id !== selectedMethod.seller_id))
        }
      } catch (error: any) {
        if (!isMountedRef.current) return
        console.error("❌ Error setting shipping method:", error)
        setError(error.message || "Failed to set shipping method")
      } finally {
        if (isMountedRef.current) {
          setSettingShippingMethod(null)
        }
      }
    },
    [activeCart?.id, settingShippingMethod, setShipping, shippingMethods]
  )

  // Handle method removal
  const handleMethodRemoved = useCallback(async (methodId: string, sellerId?: string) => {
    try {
      await refreshCart()
      
      // If a method was removed, mark that seller as missing selection
      if (sellerId) {
        setMissingShippingSellers(prev => [...new Set([...prev, sellerId])])
      }
    } catch (error) {
      if (!isMountedRef.current) return
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

  // Current selected methods
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
                {/* SHIPPING SELECTORS */}
                {Object.keys(groupedBySellerId).map((sellerId) => {
                  const methods = groupedBySellerId[sellerId]
                  if (!methods?.length) return null
                  
                  const selectedMethodId = selectedShippingMethods[sellerId] || ""
                  const selectedMethod = methods.find((m) => m.id === selectedMethodId)
                  const isSellerMissing = missingShippingSellers.includes(sellerId)
                  
                  return (
                    <div key={`regular-${sellerId}`} className="mb-4">
                      {/* HEADER */}
                      <Heading level="h3" className="mb-2">
                        {methods[0].seller_name}
                        {isSellerMissing && (
                          <span className="ml-2 text-red-600 text-sm">
                            * Wymagane
                          </span>
                        )}
                      </Heading>
                      
                      {/* SELECTOR */}
                      <Listbox
                        value={selectedMethodId}
                        onChange={handleSetShippingMethod}
                        disabled={settingShippingMethod !== null}
                      >
                        <div className="relative">
                          <Listbox.Button
                            className={clsx(
                              "relative w-full flex justify-between items-center px-4 h-12 bg-component-secondary text-left cursor-default focus:outline-none border rounded-lg focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-gray-300 focus-visible:ring-offset-2 text-base-regular",
                              {
                                "opacity-50 cursor-not-allowed": settingShippingMethod !== null,
                                "border-red-500": isSellerMissing,
                                "focus-visible:border-gray-300": !isSellerMissing
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
                                    className={clsx(
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
                              {methods.map((option, idx) => {
                                const isSelected = selectedMethodId === option.id
                                const isBeingSet = settingShippingMethod === option.id
                                
                                return (
                                  <Listbox.Option
                                    key={`${option.id}-${idx}`}
                                    className={clsx(
                                      "cursor-pointer select-none relative pl-6 pr-10 hover:bg-gray-50 py-4 border-b",
                                      {
                                        "bg-blue-50 border-blue-200": isSelected,
                                        "opacity-50": settingShippingMethod !== null && !isBeingSet
                                      }
                                    )}
                                    value={option.id}
                                    disabled={settingShippingMethod !== null && !isBeingSet}
                                  >
                                    <div className="flex flex-col w-full">
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
                                      {(option as any).is_fallback && (option as any).capacity_warning && (
                                        <div className="mt-1 text-xs text-amber-600 flex items-start gap-1">
                                          <span className="mt-0.5">⚠️</span>
                                          <span>{(option as any).capacity_warning}</span>
                                        </div>
                                      )}
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
                
                {/* SELECTED SHIPPING METHODS - Display with capacity info */}
                {currentSelectedMethods.length > 0 && (
                  <div className="flex flex-col mt-6">
                    {currentSelectedMethods.map((method: any) => {
                      const availableMethod = shippingMethods.find(am => am.id === method.shipping_option_id)
                      // CRITICAL: Enrich method with capacity_info from availableMethod
                      const enrichedMethod = {
                        ...method,
                        name: method.name || availableMethod?.name,
                        data: {
                          ...(method.data || {}),
                          ...(availableMethod?.data || {}),
                          // Ensure capacity_info from availableMethod takes precedence
                          capacity_info: (availableMethod as any)?.data?.capacity_info || method.data?.capacity_info
                        }
                      }
                      
                      const isInpostMethod = isInpostShippingOption(enrichedMethod)
                      const typedMethod = enrichedMethod as unknown as HttpTypes.StoreCartShippingMethod
                      
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
                                  router.refresh()
                                }}
                                onError={(error) => {
                                  setError(`InPost error: ${error}`)
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <ErrorMessage error={error} data-testid="delivery-option-error-message" />
            {missingShippingSellers.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <Text className="text-sm text-amber-800">
                  ⚠️ Wybierz metodę dostawy dla wszystkich sprzedawców przed kontynuowaniem
                </Text>
              </div>
            )}
            
            <Button
              onClick={handleSubmit}
              variant="tonal"
              disabled={!allSellersHaveShipping || isSubmitting || isLoadingPrices}
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