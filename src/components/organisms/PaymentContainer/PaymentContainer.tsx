import { Radio, Radio as RadioGroupOption } from "@headlessui/react"
import { Text, clx } from "@medusajs/ui"
import React, { useContext, useMemo, type JSX } from "react"
import { CreditCardWrapper } from "@/components/atoms/icons/IconWrappers"

import { isManual, isStripe as isStripeFunc } from "../../../lib/constants"
import SkeletonCardDetails from "./SkeletonCardDetails"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "./PaymentTest"
import { StripeContext } from "./StripeWrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "rounded-sm flex flex-col gap-y-2 text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
        {
          "border-primary/20": selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio value={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover transition-all duration-300 ease-in-out",
      },
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Enter your card details:
            </Text>
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={(e) => {
                setCardBrand(
                  e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                )
                setError(e.error?.message || null)
                setCardComplete(e.complete)
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}

// PayU payment container that immediately marks the payment as complete
// since PayU handles payment collection on its own page after redirection
export const PayUCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  // Get payment method info from the map or create a default one using useMemo to prevent re-rendering
  const paymentInfo = useMemo(() => {
    return paymentInfoMap[paymentProviderId] || { 
      title: "PayU", 
      icon: <CreditCardWrapper /> 
    };
  }, [paymentProviderId, paymentInfoMap])


  // Extract payment method type from the provider ID (card, blik, transfer)
  const getPaymentMethodType = () => {
    if (paymentProviderId.includes('-card')) {
      return 'card'
    } else if (paymentProviderId.includes('-blik')) {
      return 'blik'
    } else if (paymentProviderId.includes('-transfer')) {
      return 'transfer'
    }
    return 'card' // Default to card
  }
  
  const paymentMethodType = getPaymentMethodType()
  
  // Log the payment provider info for debugging
  React.useEffect(() => {
    console.log('PayU Container - Provider Info:', {
      providerId: paymentProviderId,
      selected: selectedPaymentOptionId === paymentProviderId,
      type: paymentMethodType,
      title: paymentInfo.title
    })
  }, [paymentProviderId, selectedPaymentOptionId, paymentMethodType, paymentInfo])
  
  // When a PayU payment method is selected, we can immediately mark it as complete
  // as there's no card input needed on our side
  React.useEffect(() => {
    if (selectedPaymentOptionId === paymentProviderId) {
      // Set card brand to the specific PayU payment method for display purposes
      setCardBrand(paymentInfo.title || `PayU - ${paymentMethodType}`)
      // No errors at this stage
      setError(null)
      // Mark as complete so the continue button is enabled
      setCardComplete(true)
    }
  }, [paymentProviderId, selectedPaymentOptionId, setCardBrand, setCardComplete, setError, paymentInfo, paymentMethodType])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId && (
        <div className="my-4 transition-all duration-150 ease-in-out">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Secure payment via {paymentInfo.title}
          </Text>
          <Text className="text-ui-fg-subtle">
            You will be redirected to PayU&apos;s secure payment page to complete your {paymentMethodType} payment after reviewing your order.
          </Text>
        </div>
      )}
    </PaymentContainer>
  )
}
