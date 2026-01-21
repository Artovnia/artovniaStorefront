"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { calculatePriceForShippingOption, listCartShippingMethods } from "@/lib/data/fulfillment"
import { convertToLocale } from "@/lib/helpers/money"
import { isInpostShippingOption } from "@/lib/helpers/inpost-helpers"
import { ChevronUpDownWrapper, LoaderWrapper } from "@/components/atoms/icons/IconWrappers"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { Check, Truck, Loader2, ChevronDown } from "lucide-react"
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

  // Step indicator component
  const StepIndicator = ({ number, isComplete, isActive }: { number: number; isComplete: boolean; isActive: boolean }) => (
    <div
      className={`
        w-8 h-8 flex items-center justify-center text-sm font-medium
        transition-all duration-300
        ${isComplete ? "bg-plum text-cream-50" : isActive ? "bg-plum text-cream-50" : "bg-cream-200 text-plum-muted"}
      `}
    >
      {isComplete ? <Check size={16} /> : number}
    </div>
  )

  const hasSelectedMethods = currentSelectedMethods.length > 0

  return (
    <div className="bg-cream-100 border border-cream-300 overflow-visible">
      {/* Section Header */}
      <div
        className={`
          flex items-center justify-between px-6 py-5
          border-b border-cream-200
          ${isOpen ? "bg-cream-100" : "bg-cream-200/50"}
        `}
      >
        <div className="flex items-center gap-4">
          <StepIndicator number={2} isComplete={hasSelectedMethods && !isOpen} isActive={isOpen} />
          <div>
            <h2 className="text-lg font-medium text-plum tracking-wide">Dostawa</h2>
            {!isOpen && hasSelectedMethods && (
              <p className="text-sm text-plum-muted mt-0.5">
                {currentSelectedMethods.length} metod{currentSelectedMethods.length === 1 ? 'a' : 'y'} dostawy
              </p>
            )}
          </div>
        </div>

        {!isOpen && hasSelectedMethods && (
          <button
            onClick={handleEdit}
            className="text-sm text-plum hover:text-plum-light underline underline-offset-4 transition-colors"
          >
            Edytuj
          </button>
        )}
      </div>

      {isOpen ? (
        <div className="p-6">
          <div data-testid="delivery-options-container">
            <div className="space-y-6">
              {/* SHIPPING SELECTORS */}
              {Object.keys(groupedBySellerId).map((sellerId) => {
                const methods = groupedBySellerId[sellerId]
                if (!methods?.length) return null

                const selectedMethodId = selectedShippingMethods[sellerId] || ""
                const selectedMethod = methods.find((m) => m.id === selectedMethodId)
                const isSellerMissing = missingShippingSellers.includes(sellerId)

                return (
                  <div key={`regular-${sellerId}`} className="space-y-3">
                    {/* HEADER */}
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-plum-muted" />
                      <h3 className="text-sm font-medium text-plum uppercase tracking-wider">
                        {methods[0].seller_name}
                      </h3>
                      {isSellerMissing && (
                        <span className="text-red-600 text-xs">• Wymagane</span>
                      )}
                    </div>

                    {/* SELECTOR */}
                    <Listbox
                      value={selectedMethodId}
                      onChange={handleSetShippingMethod}
                      disabled={settingShippingMethod !== null}
                    >
                      <div className="relative z-10">
                        <Listbox.Button
                          className={clsx(
                            "relative w-full flex justify-between items-center px-4 py-3.5 bg-cream-50 text-left cursor-pointer border transition-all duration-200",
                            "focus:outline-none focus:border-plum hover:border-plum-muted",
                            {
                              "opacity-50 cursor-not-allowed": settingShippingMethod !== null,
                              "border-red-400": isSellerMissing,
                              "border-cream-300": !isSellerMissing
                            }
                          )}
                        >
                          {({ open }) => (
                            <>
                              <span className="block truncate text-sm text-plum">
                                {settingShippingMethod === selectedMethodId ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin" />
                                    Ustawianie...
                                  </span>
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
                                  <span className="text-plum-muted">Wybierz opcję dostawy</span>
                                )}
                              </span>
                              <ChevronDown
                                size={18}
                                className={clsx(
                                  "text-plum-muted transition-transform duration-200",
                                  { "rotate-180": open }
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
                          <Listbox.Options className="absolute z-20 w-full overflow-auto bg-cream-50 border border-cream-300 border-t-0 max-h-60 focus:outline-none shadow-lg">
                            {methods.map((option, idx) => {
                              const isSelected = selectedMethodId === option.id
                              const isBeingSet = settingShippingMethod === option.id

                              return (
                                <Listbox.Option
                                  key={`${option.id}-${idx}`}
                                  className={clsx(
                                    "cursor-pointer select-none relative px-4 py-3 border-b border-cream-200 last:border-b-0",
                                    "hover:bg-cream-200/50 transition-colors",
                                    {
                                      "bg-cream-200": isSelected,
                                      "opacity-50": settingShippingMethod !== null && !isBeingSet
                                    }
                                  )}
                                  value={option.id}
                                  disabled={settingShippingMethod !== null && !isBeingSet}
                                >
                                  <div className="flex flex-col w-full">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-plum">
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
                                            <Loader2 size={14} className="animate-spin inline" />
                                          ) : (
                                            "-"
                                          )
                                        }
                                      </span>
                                      <div className="flex items-center gap-2">
                                        {isBeingSet && (
                                          <Loader2 size={14} className="animate-spin text-plum" />
                                        )}
                                        {isSelected && !isBeingSet && (
                                          <Check size={16} className="text-plum" />
                                        )}
                                      </div>
                                    </div>
                                    {(option as any).is_fallback && (option as any).capacity_warning && (
                                      <div className="mt-1 text-xs text-amber-600 flex items-start gap-1">
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
                <div className="flex flex-col mt-6 space-y-3 pt-6 border-t border-cream-200">
                  {currentSelectedMethods.map((method: any) => {
                    const availableMethod = shippingMethods.find(am => am.id === method.shipping_option_id)
                    const enrichedMethod = {
                      ...method,
                      name: method.name || availableMethod?.name,
                      data: {
                        ...(method.data || {}),
                        ...(availableMethod?.data || {}),
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
                          <div className="mt-2">
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

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {missingShippingSellers.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                Wybierz metodę dostawy dla wszystkich sprzedawców przed kontynuowaniem
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!allSellersHaveShipping || isSubmitting || isLoadingPrices}
            className={`
              mt-6 w-full py-4 px-6
              bg-plum text-cream-50 text-sm font-medium tracking-wide uppercase
              border-none cursor-pointer
              transition-all duration-200
              hover:bg-plum-dark
              disabled:bg-plum-muted disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isSubmitting || isLoadingPrices ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              "Kontynuuj do płatności"
            )}
          </button>
        </div>
      ) : (
        hasSelectedMethods && (
          <div className="px-6 py-4 bg-cream-200/30">
            <div className="space-y-3">
              {currentSelectedMethods.map((method: any) => {
                const availableMethod = shippingMethods?.find(am => am.id === method.shipping_option_id)
                const methodName = method.name || availableMethod?.name || 'Metoda dostawy'
                const sellerName = availableMethod?.seller_name || ''

                return (
                  <div key={method.id} className="flex items-start gap-3">
                    <Truck size={18} className="text-plum-muted mt-0.5 shrink-0" />
                    <div className="text-sm text-plum">
                      {sellerName && <p className="font-medium">{sellerName}</p>}
                      <p className="text-plum-muted">
                        {methodName} • {convertToLocale({
                          amount: method.amount!,
                          currency_code: activeCart?.currency_code || 'PLN',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default CartShippingMethodsSection