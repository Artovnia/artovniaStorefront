"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { initiatePaymentSession } from "@/lib/data/cart"
import { RadioGroup } from "@headlessui/react"
import {
  isStripe as isStripeFunc,
  isPayU as isPayUFunc,
  paymentInfoMap,
} from "../../../lib/constants"
import { CreditCard, Check, Loader2 } from "lucide-react"
import PaymentContainer, {
  StripeCardContainer,
  PayUCardContainer,
} from "../../organisms/PaymentContainer/PaymentContainer"
import { usePathname, useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useCart } from "@/components/context/CartContext"

// Step indicator component
const StepIndicator = ({
  number,
  isComplete,
  isActive,
}: {
  number: number
  isComplete: boolean
  isActive: boolean
}) => (
  <div
    className={`
      w-8 h-8 flex items-center justify-center text-sm font-medium
      transition-all duration-300
      ${
        isComplete
          ? "bg-plum text-cream-50"
          : isActive
            ? "bg-plum text-cream-50"
            : "bg-cream-200 text-plum-muted"
      }
    `}
  >
    {isComplete ? <Check size={16} /> : number}
  </div>
)

const CartPaymentSection = ({
  cart: propCart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[] | null
}) => {
  // CRITICAL FIX: Use cart from CartContext to get fresh data with updated shipping_total
  // The prop cart may be stale (from initial page load before shipping was selected)
  const { cart: contextCart, refreshCart } = useCart()
  const cart = contextCart || propCart
  
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"
  const paidByGiftcard = false
  const paymentReady =
    (activeSession && cart?.shipping_methods?.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)

    if (isStripeFunc(method)) {
      try {
        // Refresh cart to get latest data with shipping_total
        await refreshCart('payment')
        
        // Use cart (contextCart || propCart from render) — not a stale closure
        await initiatePaymentSession(cart, { provider_id: method })
        
        // Refresh after payment session creation to update context
        await refreshCart('payment')
      } catch (error: any) {
        console.error("❌ Error setting payment method:", error)
      }
    }
  }

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        // Refresh cart to get latest data with shipping_total before initiating payment
        await refreshCart('payment')
        
        // Use cart prop as base — contextCart is a stale closure here
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
        
        // Refresh cart AFTER initiating payment session to get payment_collection
        // into context before navigating to review step
        await refreshCart('payment')
      }

      router.push(pathname + "?" + createQueryString("step", "review"), {
        scroll: false,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-cream-100 border border-cream-300 overflow-hidden">
      {/* Section Header */}
      <div
        className={`
          flex items-center justify-between px-6 py-5
          border-b border-cream-200
          ${isOpen ? "bg-cream-100" : "bg-cream-200/50"}
        `}
      >
        <div className="flex items-center gap-4">
          <StepIndicator number={3} isComplete={paymentReady} isActive={isOpen} />
          <div>
            <h2 className="text-lg font-medium text-plum tracking-wide">
              Płatność
            </h2>
            {!isOpen && paymentReady && (
              <p className="text-sm text-plum-muted mt-0.5">
                {paymentInfoMap[
                  activeSession?.provider_id || selectedPaymentMethod
                ]?.title || "Wybrano metodę płatności"}
              </p>
            )}
          </div>
        </div>

        {!isOpen && paymentReady && (
          <button
            onClick={handleEdit}
            className="text-sm text-plum hover:text-plum-light underline underline-offset-4 transition-colors"
          >
            Edytuj
          </button>
        )}
      </div>

      {/* Section Content */}
      {isOpen && (
        <div className="p-6">
          {!paidByGiftcard && availablePaymentMethods && (
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(value: string) => setPaymentMethod(value)}
              className="divide-y divide-cream-200 border-y border-cream-200"
            >
              {availablePaymentMethods.map((paymentMethod) => (
                <div key={paymentMethod.id}>
                  {isStripeFunc(paymentMethod.id) ? (
                    <StripeCardContainer
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      paymentInfoMap={paymentInfoMap}
                      setCardBrand={setCardBrand}
                      setError={setError}
                      setCardComplete={setCardComplete}
                    />
                  ) : isPayUFunc(paymentMethod.id) ? (
                    <PayUCardContainer
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      paymentInfoMap={paymentInfoMap}
                      setCardBrand={setCardBrand}
                      setError={setError}
                      setCardComplete={setCardComplete}
                    />
                  ) : (
                    <PaymentContainer
                      paymentInfoMap={paymentInfoMap}
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                    />
                  )}
                </div>
              ))}
            </RadioGroup>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedPaymentMethod && !paidByGiftcard}
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
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              "Przejdź do podsumowania"
            )}
          </button>
        </div>
      )}

      {/* Collapsed Summary */}
      {!isOpen && paymentReady && (
        <div className="px-6 py-4 bg-cream-100/30">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-plum-muted" />
            <div className="text-sm text-plum">
              <span className="font-medium">
                {paymentInfoMap[
                  activeSession?.provider_id || selectedPaymentMethod
                ]?.title || "Metoda płatności"}
              </span>
              {cardBrand && (
                <span className="text-plum-muted ml-2">• {cardBrand}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPaymentSection