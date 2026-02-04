"use client"

import PaymentButton from "./PaymentButton"
import { CartItems } from "./CartItems"
import { CartSummary } from "@/components/organisms"
import InpostParcelInfo from "@/components/molecules/InpostParcelInfo/InpostParcelInfo"
import { InpostParcelData } from "@/lib/services/inpost-api"
import { useTerms } from "../CheckoutWrapper/CheckoutWrapper"
import { Package, AlertCircle, CreditCard } from "lucide-react"
import { paymentInfoMap } from "@/lib/constants"

const Review = ({ cart }: { cart: any }) => {
  const { termsAccepted } = useTerms()
  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const hasPaymentCollection = !!cart.payment_collection
  const hasPaymentSessions =
    !!(cart.payment_sessions && cart.payment_sessions.length > 0)
  const hasPaymentSession = !!cart.payment_session
  const hasPaymentProvider = !!cart.metadata?.payment_provider_id

  // Get active payment session
  const paymentSessions = cart?.payment_collection?.payment_sessions || []
  const activeSession = paymentSessions.find(
    (session: any) => session.status === "pending"
  )
  const selectedPaymentProvider = activeSession?.provider_id || 
    paymentSessions[0]?.provider_id || 
    cart?.metadata?.payment_provider_id

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods?.length > 0 &&
    (hasPaymentCollection ||
      hasPaymentSessions ||
      hasPaymentSession ||
      hasPaymentProvider ||
      paidByGiftcard)

  return (
    <div className="bg-cream-100 border border-cream-300">
      {/* Header */}
      <div className="px-6 py-5 border-b border-cream-200">
        <h2 className="text-lg font-medium text-plum tracking-wide">
          Podsumowanie zamówienia
        </h2>
      </div>

      {/* Cart Items */}
      <div className="p-6 border-b border-cream-200">
        <CartItems cart={cart} />
      </div>

      {/* Shipping Methods */}
      {cart.shipping_methods && cart.shipping_methods.length > 0 && (
        <div className="px-6 py-4 border-b border-cream-200 bg-cream-100/30">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-plum-muted" />
            <span className="text-xs font-medium text-plum uppercase tracking-wider">
              Dostawa
            </span>
          </div>
          {cart.shipping_methods.map((method: any) => (
            <div key={method.id} className="mb-2 last:mb-0">
              <p className="text-sm text-plum">{method.name}</p>
              {method.data?.inpostParcelMachine && (
                <InpostParcelInfo
                  parcelData={method.data.inpostParcelMachine as InpostParcelData}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Method */}
      {selectedPaymentProvider && (
        <div className="px-6 py-4 border-b border-cream-200 bg-cream-100/30">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-plum-muted" />
            <span className="text-xs font-medium text-plum uppercase tracking-wider">
              Płatność
            </span>
          </div>
          <p className="text-sm text-plum">
            {paymentInfoMap[selectedPaymentProvider]?.title || 'Metoda płatności'}
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="p-6">
        <CartSummary
          item_total={cart?.item_total || 0}
          shipping_total={cart?.shipping_total || 0}
          total={cart?.total || 0}
          currency_code={cart?.currency_code || ""}
        />
      </div>

      {/* Payment Button */}
      <div className="p-6 pt-0">
        <PaymentButton cart={cart} data-testid="submit-order-button" />

        {!previousStepsCompleted && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200">
            <AlertCircle
              size={16}
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <p className="text-xs text-amber-800">
              Uzupełnij wszystkie kroki, aby złożyć zamówienie.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Review