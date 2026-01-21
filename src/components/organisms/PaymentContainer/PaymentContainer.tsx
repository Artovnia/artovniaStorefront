import { Radio, Radio as RadioGroupOption } from "@headlessui/react"
import React, { useContext, useMemo, type JSX } from "react"
import { CreditCard } from "lucide-react"
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

// Custom Radio Button
const CustomRadio = ({ checked }: { checked: boolean }) => (
  <div
    className={`
      w-5 h-5 border-2 flex items-center justify-center
      transition-all duration-200
      ${checked ? "border-plum" : "border-cream-300"}
    `}
  >
    {checked && <div className="w-2.5 h-2.5 bg-plum" />}
  </div>
)

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"
  const isSelected = selectedPaymentOptionId === paymentProviderId

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={`
        cursor-pointer transition-all duration-200
        bg-cream-50
        ${
          isSelected
            ? "bg-cream-100"
            : "hover:bg-cream-100/50"
        }
      `}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <CustomRadio checked={isSelected} />
          <span className="text-sm text-plum font-medium">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </span>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden sm:block" />
          )}
        </div>
        <span className="text-plum-muted">
          {paymentInfoMap[paymentProviderId]?.icon || <CreditCard size={20} />}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <div className="px-4 pb-4">
          <PaymentTest className="sm:hidden text-[10px]" />
        </div>
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
  const isSelected = selectedPaymentOptionId === paymentProviderId

  const useOptions: StripeCardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "14px",
          color: "#3B3663",
          "::placeholder": {
            color: "#6B6494",
          },
        },
      },
      classes: {
        base: "w-full px-4 py-3.5 bg-cream-50 border border-cream-300 focus:border-plum focus:outline-none transition-colors",
      },
    }),
    []
  )

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {isSelected &&
        (stripeReady ? (
          <div className="px-4 pb-4 pt-2 border-t border-cream-200 mt-2">
            <p className="text-xs text-plum-muted mb-3">
              Wprowadź dane karty:
            </p>
            <CardElement
              options={useOptions}
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
          <div className="px-4 pb-4 pt-2 border-t border-cream-200 mt-2">
            <p className="text-sm text-plum-muted">
              Po złożeniu zamówienia zostaniesz przekierowany do bezpiecznej strony płatności.
            </p>
          </div>
        ))}
    </PaymentContainer>
  )
}

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
  const paymentInfo = useMemo(
    () =>
      paymentInfoMap[paymentProviderId] || {
        title: "PayU",
        icon: <CreditCard size={20} />,
      },
    [paymentProviderId, paymentInfoMap]
  )

  const getPaymentMethodType = () => {
    if (paymentProviderId.includes("-card")) return "card"
    if (paymentProviderId.includes("-blik")) return "blik"
    if (paymentProviderId.includes("-transfer")) return "transfer"
    return "card"
  }

  const paymentMethodType = getPaymentMethodType()
  const isSelected = selectedPaymentOptionId === paymentProviderId

  React.useEffect(() => {
    if (isSelected) {
      setCardBrand(paymentInfo.title || `PayU - ${paymentMethodType}`)
      setError(null)
      setCardComplete(true)
    }
  }, [
    paymentProviderId,
    selectedPaymentOptionId,
    setCardBrand,
    setCardComplete,
    setError,
    paymentInfo,
    paymentMethodType,
    isSelected,
  ])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {isSelected && (
        <div className="px-4 pb-4 pt-2 border-t border-cream-200 mt-2">
          <p className="text-sm text-plum-muted">
            Po złożeniu zamówienia zostaniesz przekierowany do bezpiecznej strony PayU.
          </p>
        </div>
      )}
    </PaymentContainer>
  )
}