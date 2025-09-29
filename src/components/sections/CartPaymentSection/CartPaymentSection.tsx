"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { initiatePaymentSession } from "@/lib/data/cart"
import { RadioGroup } from "@headlessui/react"
import {
  isStripe as isStripeFunc,
  isPayU as isPayUFunc,
  paymentInfoMap,
} from "../../../lib/constants"
import CheckCircleSolidFixed from "@/components/atoms/icons/CheckCircleSolidFixed"
import { CreditCard } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import PaymentContainer, {
  StripeCardContainer,
  PayUCardContainer,
} from "../../organisms/PaymentContainer/PaymentContainer"
import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/atoms"

type StoreCardPaymentMethod = any & {
  service_zone?: {
    fulfillment_set: {
      type: string
    }
  }
}

const CartPaymentSection = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: StoreCardPaymentMethod[] | null
}) => {
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
  const isStripe = isStripeFunc(selectedPaymentMethod)

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    
    if (isStripeFunc(method)) {
      try {
        await initiatePaymentSession(cart, {
          provider_id: method,
        })
      } catch (error: any) {
        console.error('❌ Error setting payment method:', error)
        // Don't throw error - backend logs show sessions are created successfully
      }
    }
  }

  const paidByGiftcard = false // Gift cards not implemented
  const paymentReady = (activeSession && cart?.shipping_methods?.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const checkActiveSession = activeSession?.provider_id === selectedPaymentMethod

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
      }

      // Always proceed to review step - no card input required
      router.push(
        pathname + "?" + createQueryString("step", "review"),
        {
          scroll: false,
        }
      )
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
    <div className="border p-4 rounded-sm bg-ui-bg-interactive">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-center"
        >
          {!isOpen && paymentReady && <CheckCircleSolidFixed />}
          Płatność
        </Heading>
        {!isOpen && (
          <Text>
            <Button onClick={handleEdit} variant="tonal">
              Edytuj
            </Button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
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
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Metoda płatności
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Karta podarunkowa
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            onClick={handleSubmit}
            variant="tonal"
            loading={isLoading}
            disabled={
              (!selectedPaymentMethod && !paidByGiftcard)
            }
          >
            Kontunuuj do podsumowania
          </Button>
        </div>

        {cart && (paymentReady || selectedPaymentMethod || (cart?.metadata as any)?.payment_provider_id) ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Metoda płatności
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id || selectedPaymentMethod || (cart?.metadata as any)?.payment_provider_id]?.title ||
                    activeSession?.provider_id || selectedPaymentMethod || (cart?.metadata as any)?.payment_provider_id ||
                    'Metoda płatności wybrana'}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Szczegóły płatności
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Kolejny krok pojawi się"}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
               Metoda płatności
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Karta podarunkowa
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    
  )
}

export default CartPaymentSection