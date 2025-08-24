"use client"

import React, { useState } from "react"
import { CartAddressSection } from "@/components/sections/CartAddressSection/CartAddressSection"
import CartShippingMethodsSection from "../CartShippingMethodsSection/CartShippingMethodsSection"
import CartPaymentSection from "../CartPaymentSection/CartPaymentSection"
import CartReview from "../CartReview/CartReview"
import TermsAcceptance from "@/components/cells/TermsAcceptance/TermsAcceptance"
import { useCart } from "@/lib/context/CartContext"
import { HttpTypes } from "@medusajs/types"

type CheckoutWrapperProps = {
  customer?: HttpTypes.StoreCustomer | null | undefined
  availableShippingMethods?: any[] | null | undefined
  availablePaymentMethods?: any[] | null | undefined
}

const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({
  customer,
  availableShippingMethods,
  availablePaymentMethods,
}) => {
  const { cart, isLoading, error } = useCart()
  const [termsAccepted, setTermsAccepted] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading checkout...</span>
      </div>
    )
  }

  if (error || !cart) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error || 'Cart not found'}</p>
      </div>
    )
  }

  const handleTermsAcceptanceChange = (accepted: boolean) => {
    setTermsAccepted(accepted)
  }

  return (
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
  )
}

export default CheckoutWrapper
