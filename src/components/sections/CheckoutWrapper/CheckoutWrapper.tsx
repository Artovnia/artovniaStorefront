"use client"

import React, { useState } from "react"
import { CartAddressSection } from "@/components/sections/CartAddressSection/CartAddressSection"
import CartPaymentSection from "@/components/sections/CartPaymentSection/CartPaymentSection"
import CartReview from "@/components/sections/CartReview/CartReview"
import CartShippingMethodsSection from "@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection"
import { TermsAcceptance } from "@/components/cells/TermsAcceptance"
import { HttpTypes } from "@medusajs/types"

interface CheckoutWrapperProps {
  cart: any
  customer: HttpTypes.StoreCustomer | null
  availableShippingMethods: any[]
  availablePaymentMethods: any[]
}

const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({
  cart,
  customer,
  availableShippingMethods,
  availablePaymentMethods
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleTermsAcceptanceChange = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  return (
    <div className="grid lg:grid-cols-11 gap-8">
      <div className="flex flex-col gap-4 lg:col-span-6">
        <CartAddressSection 
          cart={cart} 
          customer={customer}
          key={`address-${cart.id}-${cart.updated_at}`}
        />
        <CartShippingMethodsSection
          cart={cart}
          availableShippingMethods={availableShippingMethods}
          key={`shipping-${cart.id}-${cart.updated_at}`}
        />
        <CartPaymentSection
          cart={cart}
          availablePaymentMethods={availablePaymentMethods}
          key={`payment-${cart.id}-${cart.updated_at}`}
        />
        <TermsAcceptance
          onAcceptanceChange={handleTermsAcceptanceChange}
          className="mt-4"
        />
      </div>

      <div className="lg:col-span-5">
        <CartReview 
          cart={cart} 
          termsAccepted={termsAccepted}
          key={`review-${cart.id}-${cart.updated_at}`}
        />
      </div>
    </div>
  )
}

export default CheckoutWrapper
