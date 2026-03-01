"use client"

import React, { useState, createContext, useContext, useEffect } from "react"
import { CartAddressSection } from "@/components/sections/CartAddressSection/CartAddressSection"
import CartShippingMethodsSection from "../CartShippingMethodsSection/CartShippingMethodsSection"
import CartPaymentSection from "../CartPaymentSection/CartPaymentSection"
import CartReview from "../CartReview/CartReview"
import TermsAcceptance from "@/components/cells/TermsAcceptance/TermsAcceptance"
import CheckoutStepErrorBoundary from "@/components/molecules/CheckoutStepErrorBoundary/CheckoutStepErrorBoundary"
import { usePathname } from "@/i18n/routing"
import { HttpTypes } from "@medusajs/types"

// Simple Terms Context to avoid cart caching issues
interface TermsContextType {
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
}

const TermsContext = createContext<TermsContextType | null>(null)

export const useTerms = () => {
  const context = useContext(TermsContext)
  if (!context) {
    throw new Error('useTerms must be used within TermsContext')
  }
  return context
}

type CheckoutWrapperProps = {
  cart: HttpTypes.StoreCart
  customer?: HttpTypes.StoreCustomer | null | undefined
  availableShippingMethods?: any[] | null | undefined
  availablePaymentMethods?: any[] | null | undefined
}

const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({
  cart,
  customer,
  availableShippingMethods,
  availablePaymentMethods,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [lastCartId, setLastCartId] = useState(cart?.id)
  const pathname = usePathname()
  const locale = cart?.region?.countries?.[0]?.iso_2?.toUpperCase() ?? undefined

  // Reset terms acceptance when cart changes (new cart)
  useEffect(() => {
    const isNewCart = cart?.id && cart.id !== lastCartId
    
    if (isNewCart) {
      setTermsAccepted(false)
      setLastCartId(cart.id)
    }
  }, [cart?.id, lastCartId, termsAccepted])

  const handleTermsAcceptanceChange = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  return (
    <TermsContext.Provider value={{ termsAccepted, setTermsAccepted }}>
      <div className="py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <CheckoutStepErrorBoundary
              step="address"
              cartId={cart?.id ?? undefined}
              pathname={pathname ?? undefined}
              locale={locale}
            >
              <CartAddressSection cart={cart as any} customer={customer || null} />
            </CheckoutStepErrorBoundary>

            <CheckoutStepErrorBoundary
              step="delivery"
              cartId={cart?.id ?? undefined}
              pathname={pathname ?? undefined}
              locale={locale}
            >
              <CartShippingMethodsSection
                cart={cart as any}
                availableShippingMethods={availableShippingMethods || null}
              />
            </CheckoutStepErrorBoundary>

            <CheckoutStepErrorBoundary
              step="payment"
              cartId={cart?.id ?? undefined}
              pathname={pathname ?? undefined}
              locale={locale}
            >
              <CartPaymentSection
                cart={cart as any}
                availablePaymentMethods={availablePaymentMethods || null}
              />
            </CheckoutStepErrorBoundary>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8 space-y-4">
              <CheckoutStepErrorBoundary
                step="review"
                cartId={cart?.id ?? undefined}
                pathname={pathname ?? undefined}
                locale={locale}
              >
                <CartReview
                  cart={cart as any}
                  key={`review-${cart.id}-${cart.updated_at}`}
                />
              </CheckoutStepErrorBoundary>

              <CheckoutStepErrorBoundary
                step="review"
                cartId={cart?.id ?? undefined}
                pathname={pathname ?? undefined}
                locale={locale}
              >
                <TermsAcceptance
                  onAcceptanceChange={handleTermsAcceptanceChange}
                />
              </CheckoutStepErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </TermsContext.Provider>
  )
}

export default CheckoutWrapper
