"use client"

import React, { useState, createContext, useContext, useEffect } from "react"
import { CartAddressSection } from "@/components/sections/CartAddressSection/CartAddressSection"
import CartShippingMethodsSection from "../CartShippingMethodsSection/CartShippingMethodsSection"
import CartPaymentSection from "../CartPaymentSection/CartPaymentSection"
import CartReview from "../CartReview/CartReview"
import TermsAcceptance from "@/components/cells/TermsAcceptance/TermsAcceptance"
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

  // Reset terms acceptance when cart changes (new cart)
  useEffect(() => {
    const isNewCart = cart?.id && cart.id !== lastCartId
    
    if (isNewCart) {
      console.log('🔍 New cart detected - resetting terms acceptance:', {
        oldCartId: lastCartId,
        newCartId: cart.id,
        wasAccepted: termsAccepted
      })
      
      setTermsAccepted(false)
      setLastCartId(cart.id)
    }
  }, [cart?.id, lastCartId, termsAccepted])

  const handleTermsAcceptanceChange = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  return (
    <TermsContext.Provider value={{ termsAccepted, setTermsAccepted }}>
      <div className="grid lg:grid-cols-11 gap-8">
        <div className="flex flex-col gap-4 lg:col-span-6">
          <CartAddressSection cart={cart as any} customer={customer || null} />
          <CartShippingMethodsSection
            cart={cart as any}
            availableShippingMethods={availableShippingMethods || null}
          />
          <CartPaymentSection
            cart={cart as any}
            availablePaymentMethods={availablePaymentMethods || null}
          />
          <TermsAcceptance
            onAcceptanceChange={handleTermsAcceptanceChange}
          />
        </div>
        <div className="lg:col-span-1"></div>
        <div className="lg:col-span-4">
          <CartReview
            cart={cart as any} 
            key={`review-${cart.id}-${cart.updated_at}`}
          />
        </div>
      </div>
    </TermsContext.Provider>
  )
}

export default CheckoutWrapper
