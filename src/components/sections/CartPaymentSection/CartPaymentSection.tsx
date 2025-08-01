"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { initiatePaymentSession, selectPaymentSession, retrieveCartForPayment } from "@/lib/data/cart"
import { RadioGroup } from "@headlessui/react"
import {
  isStripe as isStripeFunc,
  isPayU as isPayUFunc,
  paymentInfoMap,
} from "../../../lib/constants"
// Using our wrapper components instead of direct imports to fix SVG attribute warnings
import { CheckCircleSolidWrapper, CreditCardWrapper } from "@/components/atoms/icons/IconWrappers"
import { Container, Heading, Text } from "@medusajs/ui"
import PaymentContainer, {
  StripeCardContainer,
  PayUCardContainer,
} from "../../organisms/PaymentContainer/PaymentContainer"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useMemo } from "react"
import { Button } from "@/components/atoms"
import PaymentProcessor from "../PaymentProcessors/PaymentProcessor"

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
  // Find active payment session if it exists
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  // Debug logging for payment sessions
  useEffect(() => {
    console.log('CartPaymentSection - Payment Info:', {
      cartId: cart?.id,
      hasPaymentCollection: !!cart?.payment_collection,
      paymentSessions: cart?.payment_collection?.payment_sessions?.map((s: any) => ({
        id: s.id,
        providerId: s.provider_id,
        status: s.status
      })) || [],
      selectedPaymentMethod,
      availablePaymentMethods: availablePaymentMethods?.map(m => m.id) || []
    })
  }, [cart, selectedPaymentMethod, availablePaymentMethods])

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const isPayU = isPayUFunc(selectedPaymentMethod)

  const setPaymentMethod = async (method: string) => {
    // Request deduplication: prevent concurrent calls for the same method
    const requestKey = `payment-${method}-${cart.id}`
    if (pendingRequests.has(requestKey)) {
      console.log(`Payment method selection already in progress for ${method}`)
      return
    }
    
    setPendingRequests(prev => new Set(prev).add(requestKey))
    setError(null)
    setSelectedPaymentMethod(method)
    setIsLoading(true)
    
    try {
      console.log(`Setting payment method: ${method} for cart ${cart.id}`)
      
      // Check if a payment session already exists for this provider
      const existingSession = cart?.payment_collection?.payment_sessions?.find(
        (session: any) => session.provider_id === method && session.status === 'pending'
      )
      
      if (existingSession) {
        console.log(`Payment session already exists for ${method}, reusing session:`, existingSession.id)
        // Quick optimization: Set loading to false faster for existing sessions
        setIsLoading(false)
        return
      } else {
        // Only create a new payment session if one doesn't exist
        try {
          console.log('Initializing payment session for cart:', cart.id)
          // Enhanced payment session with detailed cart context
          await initiatePaymentSession(cart, { 
            provider_id: method,
            // Context data will be stored in metadata by initiatePaymentSession function
            context: {
              cart_id: cart.id,
              // Include any IP address if available from client
              customer_ip: window.sessionStorage.getItem('client_ip') || undefined,
              // Explicit flag to indicate this is coming from our enhanced storefront
              enhanced_storefront: true,
              // Include customer email for better tracking
              customer_email: cart.email || ''
            }
          })
          console.log('Payment session initialized successfully with enhanced context')
        } catch (initError: any) {
          console.log('Payment session initialization error (may be normal if session exists):', initError)
          
          // Check if the error is about a payment collection already existing
          // or if it's about a payment session already existing - these are expected errors
          const errorMsg = initError?.message || ''
          const isExpectedError = 
            errorMsg.includes('already has a payment collection') || 
            errorMsg.includes('already exists') ||
            errorMsg.includes('payment session')
          
          if (!isExpectedError) {
            // If it's not an expected error, rethrow it
            throw initError
          }
          // Otherwise, continue with selecting the payment session
        }
      }
      
      // Now select the payment session - this will also update cart metadata with payment_provider_id
      try {
        console.log('Selecting payment session:', method)
        const updatedCart = await selectPaymentSession(cart.id, method)
        console.log('Payment session selected successfully, cart updated:', updatedCart.id)
        
        // Store the selected payment provider in localStorage as a fallback mechanism
        try {
          localStorage.setItem('selected_payment_provider', method)
          localStorage.setItem('cart_payment_ready', 'true')
          console.log('Stored payment selection in localStorage')
        } catch (storageError) {
          console.warn('Could not store payment selection in localStorage:', storageError)
        }
        
      } catch (selectError: any) {
        console.error('Payment session selection error:', selectError)
        if (selectError?.message?.includes('not available') || 
            selectError?.message?.includes('not found')) {
          throw new Error(`Payment method ${method} is not available. Please try another payment method.`)
        }
        
        throw selectError
      }
      
      // Clear any previous errors
      setError(null)
      
      // For PayU payments, we don't need to collect card details
      // so we can mark the card as complete
      if (isPayUFunc(method)) {
        setCardComplete(true)
      }
    } catch (error: any) {
      console.error('Error setting payment method:', error)
      
      // Format the error message to be more user-friendly
      let errorMessage = 'Error setting payment method'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      // Clean up error messages from backend
      if (errorMessage.includes('Error setting up the request:')) {
        errorMessage = errorMessage.replace('Error setting up the request:', '').trim()
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      // Clean up request tracking
      setPendingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestKey)
        return newSet
      })
    }
  }

  // These are now memoized above to prevent unnecessary recalculations

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  // Memoize payment method validation to prevent unnecessary recalculations
  const paidByGiftcard = useMemo(() => 
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0,
    [cart?.gift_cards, cart?.total]
  )

  const paymentReady = useMemo(() => 
    (activeSession && (cart?.shipping_methods?.length || 0) !== 0) || paidByGiftcard,
    [activeSession, cart?.shipping_methods?.length, paidByGiftcard]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      console.log('Handling payment submission for:', selectedPaymentMethod)
      
      if (!selectedPaymentMethod) {
        throw new Error('Proszę wybrać metodę płatności')
      }
      
      // **CRITICAL FIX: Do NOT create or initialize payment sessions in handleSubmit**
      // Payment sessions should ONLY be created in setPaymentMethod when user selects a payment method
      // This function should only handle navigation to the review step
      
      console.log('Payment method already selected, proceeding to review step')

      // For Stripe, if we need to collect card details, don't proceed to review
      const shouldInputCard = isStripeFunc(selectedPaymentMethod) && !cardComplete
      if (shouldInputCard) {
        console.log('Need to collect card details for Stripe')
        setIsLoading(false)
        return
      }

      // Proceed to review step
      router.push(pathname + "?" + createQueryString("step", "review"), {
        scroll: false,
      })
    } catch (error) {
      console.error('Error during payment submission:', error)
      setError(error instanceof Error ? error.message : String(error))
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
          {!isOpen && paymentReady && <CheckCircleSolidWrapper />}
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
                onChange={setPaymentMethod}
              >
                {/* Show all available payment methods */}
                {availablePaymentMethods
                  // No filtering for PayU methods to show all variants
                  .filter(method => 
                    // Allow all PayU variants to pass through or keep normal deduplication for others
                    method.id.includes('payu') || 
                    availablePaymentMethods.findIndex(m => m.id.includes(method.id.split('_')[1])) === 
                    availablePaymentMethods.indexOf(method)
                  )
                  .map((paymentMethod) => (
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

          {/* Check if the cart has a payment session with HTML content to render */}
          {cart?.payment_session?.data?.direct_html ? (
            <div className="mt-4">
              <PaymentProcessor 
                cart={cart} 
                onPaymentComplete={() => {
                  router.push(pathname + "?" + createQueryString("step", "review"), {
                    scroll: false,
                  });
                }}
                onPaymentError={(err) => setError(err.message)}
              />
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="tonal"
              loading={isLoading}
              disabled={
                (isStripe && !cardComplete) ||
                (!selectedPaymentMethod && !paidByGiftcard)
              }
            >
              {isLoading
                ? "Przetwarzanie..."
                : isStripe && !cardComplete
                ? "Wprowadź dane karty"
                : "Przejdź do podsumowania"}
            </Button>
          )}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Metoda płatności
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
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
                      <CreditCardWrapper />
                    )}
                  </Container>
                  <Text>
                    {isStripeFunc(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Another step will appear"}
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
    </div>
  )
}

export default CartPaymentSection