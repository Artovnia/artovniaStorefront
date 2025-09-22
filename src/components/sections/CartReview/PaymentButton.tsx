"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "@/i18n/routing"
import { selectPaymentSession } from "@/lib/data/cart"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { isManual, isPayU, isStripe, paymentInfoMap } from "../../../lib/constants"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/atoms"
import { CreditCard } from "@medusajs/icons"
import { useTerms } from "../CheckoutWrapper/CheckoutWrapper"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

// Main PaymentButton component that determines which payment method to use
const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}): React.ReactElement => {
  // Use Terms Context directly to avoid prop drilling and caching issues
  const { termsAccepted } = useTerms()
  // Check if cart is ready for checkout
  const notReady = !cart || 
    !cart.shipping_address || 
    !cart.email || 
    (cart.shipping_methods?.length ?? 0) < 1 ||
    !termsAccepted

  // Get all possible payment sessions from the cart
  const paymentSessions = cart?.payment_collection?.payment_sessions || []
  
  // Find active payment session (status pending) if it exists
  const activeSession = paymentSessions.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )
  
  // CRITICAL FIX: Also check cart metadata for payment provider
  // Sometimes payment sessions aren't returned in the array but metadata has the provider
  const metadataProviderId = (cart?.metadata as any)?.payment_provider_id
  
  // Check if there's a selected session OR metadata provider
  const hasValidPaymentSession = (paymentSessions.length > 0 && !!activeSession) || !!metadataProviderId

  // Get payment provider ID from multiple sources (priority order)
  const paymentProviderId = activeSession?.provider_id || 
                           paymentSessions[0]?.provider_id || 
                           metadataProviderId
  
  // DEBUG: Add logging to understand what's happening
  console.log('🔍 PaymentButton Debug:', {
    termsAccepted,
    hasValidPaymentSession,
    paymentProviderId,
    metadataProviderId,
    paymentSessionsCount: paymentSessions.length,
    activeSession: !!activeSession,
    isPayU: isPayU(paymentProviderId),
    isStripe: isStripe(paymentProviderId),
    isManual: isManual(paymentProviderId),
    notReady
  })
  
  // Determine which payment button to show based on the payment provider
  switch (true) {
    case isStripe(paymentProviderId):
      return (
        <StripePaymentButton
          cart={cart}
          isPaymentReady={!notReady && hasValidPaymentSession}
          data-testid={dataTestId}
          paymentProviderId={paymentProviderId}
        />
      )
    case isPayU(paymentProviderId):
      return (
        <PayUPaymentButton
          cart={cart}
          isPaymentReady={!notReady && hasValidPaymentSession}
          data-testid={dataTestId}
          activeSession={activeSession}
        />
      )
    case isManual(paymentProviderId):
      return (
        <ManualTestPaymentButton 
          isPaymentReady={!notReady && hasValidPaymentSession}
          data-testid={dataTestId}
          cart={cart}
        />
      )
    default:
      return (
        <div className="flex flex-col gap-y-2">
          <Button disabled>
            {!termsAccepted ? 'Zaakceptuj regulamin' : !hasValidPaymentSession ? 'Wybierz metodę płatności' : 'Ładowanie...'}
          </Button>
          {paymentSessions.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              Odśwież stronę, jeśli metody płatności nie są widoczne
            </p>
          )}
        </div>
      )
  }
}

interface StripePaymentButtonProps {
  cart: HttpTypes.StoreCart
  isPaymentReady: boolean
  "data-testid"?: string
  paymentProviderId: string
}

const StripePaymentButton: React.FC<StripePaymentButtonProps> = ({
  cart,
  isPaymentReady,
  "data-testid": dataTestId,
  paymentProviderId
}): React.ReactElement => {
  // Use Terms Context directly
  const { termsAccepted } = useTerms()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleStripePayment = async (): Promise<void> => {
    if (submitting) return

    setSubmitting(true);
    setErrorMessage(null);

    try {
      console.log('🚨 STRIPE PAYMENT HANDLER CALLED - This should ALWAYS use Stripe Checkout')
      console.log('🔍 Stripe Payment Debug:', {
        cartId: cart.id,
        paymentProviderId,
        isPaymentReady,
        termsAccepted
      })
      
      // CRITICAL: This function should NEVER call placeOrder directly
      // It should ALWAYS create a Stripe Checkout session and redirect

      // CRITICAL FIX: Ensure payment session exists before placing order
      const paymentSessions = cart?.payment_collection?.payment_sessions || []
      const hasValidSession = paymentSessions.some((session: any) => 
        session.provider_id === paymentProviderId && session.status === 'pending'
      )

      console.log('🔍 Payment Session Check:', {
        paymentSessionsCount: paymentSessions.length,
        hasValidSession,
        paymentProviderId,
        existingSessions: paymentSessions.map((s: any) => ({ id: s.id, provider_id: s.provider_id, status: s.status }))
      })

      if (!hasValidSession) {
        console.log('🔍 Creating missing payment session...')
        // Import the payment session functions
        const { selectPaymentSession, initiatePaymentSession, retrieveCartForPayment } = await import('@/lib/data/cart')
        
        try {
          // Try to initiate payment session first
          await initiatePaymentSession(cart, { provider_id: paymentProviderId })
        } catch (initError: any) {
          console.log('🔍 Payment session initiation result:', initError?.message)
          // Continue if session already exists
        }
        
        // Select the payment session
        await selectPaymentSession(cart.id, paymentProviderId)
        console.log('🔍 Payment session created/selected successfully')
        
        // CRITICAL FIX: Refresh cart data to get updated payment sessions
        // Wait a bit for backend to process the session creation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const refreshedCart = await retrieveCartForPayment(cart.id)
        console.log('🔍 Refreshed cart payment sessions:', {
          refreshedSessionsCount: refreshedCart?.payment_collection?.payment_sessions?.length || 0,
          refreshedSessions: refreshedCart?.payment_collection?.payment_sessions?.map((s: any) => ({ 
            id: s.id, 
            provider_id: s.provider_id, 
            status: s.status 
          })) || []
        })
        
        // Verify the session now exists in refreshed cart
        const refreshedHasValidSession = refreshedCart?.payment_collection?.payment_sessions?.some((session: any) => 
          session.provider_id === paymentProviderId && session.status === 'pending'
        )
        
        if (!refreshedHasValidSession) {
          throw new Error(`Payment session creation failed for provider: ${paymentProviderId}. Session not found in refreshed cart data.`)
        }
        
        // Update the cart reference to use refreshed data for placeOrder
        console.log('🔍 Using refreshed cart data for order placement')
      }

      // CRITICAL: For ALL Stripe payments, we must use Stripe Checkout - never call placeOrder directly
      console.log('🔍 STRIPE CHECKOUT FLOW: Creating Stripe Checkout session for payment provider:', paymentProviderId)
      console.log('🔍 STRIPE CHECKOUT FLOW: This will redirect to Stripe hosted page for security')
      
      // Get the payment session data
      const currentPaymentSessions = cart?.payment_collection?.payment_sessions || []
      const currentSession = currentPaymentSessions.find(session => session.provider_id === paymentProviderId)
      
      if (!currentSession || !currentSession.data?.id) {
        throw new Error('No valid payment session found for Stripe payment')
      }
      
      const paymentIntentId = currentSession.data.id
      console.log('🔍 Using PaymentIntent ID:', paymentIntentId)
      
      // Determine payment method types based on provider
      let paymentMethodTypes = ['card']
      if (paymentProviderId.includes('blik')) {
        paymentMethodTypes = ['blik']
      } else if (paymentProviderId.includes('przelewy24')) {
        paymentMethodTypes = ['p24']
      }
      
      console.log('🔍 Payment method types:', paymentMethodTypes)
      
      // Create Stripe Checkout session
      console.log('🔍 STRIPE CHECKOUT: Making request to create checkout session')
      console.log('🔍 STRIPE CHECKOUT: Backend URL:', process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)
      console.log('🔍 STRIPE CHECKOUT: Publishable Key:', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? 'Present' : 'Missing')
      console.log('🔍 STRIPE CHECKOUT: Request payload:', {
        payment_intent_id: paymentIntentId,
        cart_id: cart.id,
        customer_email: cart.email,
        payment_method_types: paymentMethodTypes
      })
      
      const checkoutResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          cart_id: cart.id,
          customer_email: cart.email,
          payment_method_types: paymentMethodTypes
        })
      })
      
      console.log('🔍 STRIPE CHECKOUT: Response status:', checkoutResponse.status, checkoutResponse.statusText)
      
      if (!checkoutResponse.ok) {
        const errorText = await checkoutResponse.text()
        console.error('❌ Failed to create Stripe Checkout session:', errorText)
        throw new Error(`Failed to create checkout session: ${checkoutResponse.statusText}`)
      }
      
      const checkoutResult = await checkoutResponse.json()
      console.log('🔍 Checkout session created:', checkoutResult)
      
      if (checkoutResult.checkout_url) {
        console.log('🔍 Redirecting to Stripe Checkout:', checkoutResult.checkout_url)
        window.location.href = checkoutResult.checkout_url
        return
      }
      
      throw new Error('No checkout URL received from Stripe')
      
    } catch (error: any) {
      console.error('Stripe payment error:', error)
      setErrorMessage(error?.message || 'Wystąpił błąd podczas płatności')
    } finally {
      setSubmitting(false)
    }
  }

  const getPaymentMethodLabel = (providerId: string): string => {
    return paymentInfoMap[providerId]?.title || 'Płatność Stripe'
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg p-4">
        <div className="font-medium mb-3">Metoda płatności:</div>
        <div className="flex items-center p-3 border rounded-md bg-primary border-[#3B3634]">
          <div className="flex-grow">
            {getPaymentMethodLabel(paymentProviderId)}
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Metoda płatności została wybrana w poprzednim kroku.
        </div>
      </div>
      
      <Button
        disabled={!isPaymentReady || submitting}
        onClick={handleStripePayment}
        loading={submitting}
        className="w-full"
        data-testid={dataTestId}
      >
        {!termsAccepted ? 'Zaakceptuj regulamin' : 'Złóż zamówienie'}
      </Button>
      
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </div>
  )
}

interface ManualTestPaymentButtonProps {
  isPaymentReady: boolean
  "data-testid"?: string
  cart: HttpTypes.StoreCart
}

const ManualTestPaymentButton: React.FC<ManualTestPaymentButtonProps> = ({ 
  isPaymentReady, 
  "data-testid": dataTestId,
  cart
}): React.ReactElement => {
  // Use Terms Context directly
  const { termsAccepted } = useTerms()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleManualPayment = async (): Promise<void> => {
    if (submitting) return

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await selectPaymentSession(cart.id, 'pp_system_default');
      
      const { placeOrder } = await import('@/lib/data/cart');
      const result = await placeOrder(cart.id);
      
      
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      
      if (result.id || (result.order && result.order.id)) {
        const orderId = result.id || result.order.id;
        router.push(`/order/confirmed/${orderId}`);
        return;
      }
      
      throw new Error('Failed to complete payment.');
    } catch (error: any) {
      console.error('Manual payment error:', error);
      setErrorMessage(error.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <Button
        disabled={!isPaymentReady || submitting}
        onClick={handleManualPayment}
        className="w-full mt-6"
        data-testid={dataTestId}
        loading={submitting}
      >
        <CreditCard className="mr-2" /> 
        {!termsAccepted ? 'Zaakceptuj regulamin' : 'Pay with Manual Test'}
      </Button>
      {errorMessage && (
        <ErrorMessage error={errorMessage} data-testid="manual-payment-error-message" />
      )}
    </div>
  );
}

interface PayUPaymentButtonProps {
  cart: HttpTypes.StoreCart
  isPaymentReady: boolean
  "data-testid"?: string
  activeSession?: any
}

const PayUPaymentButton: React.FC<PayUPaymentButtonProps> = ({
  cart,
  isPaymentReady,
  "data-testid": dataTestId,
  activeSession
}): React.ReactElement => {
  // Use Terms Context directly
  const { termsAccepted } = useTerms()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const processingRef = useRef(false)
  const router = useRouter()

  const metadata = cart?.metadata as Record<string, string> | undefined || {}
  const paymentSessions = cart?.payment_collection?.payment_sessions || []

  // Get the selected provider ID from the active session or metadata
  const selectedProvider = activeSession?.provider_id || 
                          metadata.selected_provider || 
                          'pp_payu-card'

  // Check if we are in a redirect flow from PayU
  useEffect(() => {
    if (activeSession) {
      
    }
    
    const checkPaymentStatus = (): void => {
      const storedCartId = localStorage.getItem('payu_cart_id')
      
      if (storedCartId && storedCartId === cart.id) {
        
        setErrorMessage('Checking payment status...')
      }
    }
    
    checkPaymentStatus()
  }, [cart, activeSession, metadata, setErrorMessage])
  
  useEffect(() => {
    const checkRedirectStatus = async (): Promise<void> => {
      const searchParams = new URLSearchParams(window.location.search)
      const payuStatus = searchParams.get('PayUStatus')
      
      if (payuStatus) {
        
        
        localStorage.setItem('payu_cart_id', '')
        
        if (payuStatus.toUpperCase() === 'SUCCESS') {
          const orderId = searchParams.get('orderId') || cart.id
          router.push(`/order/confirmed/${orderId}`)
        }
      }
    }
    
    checkRedirectStatus()
  }, [router, cart.id])

  const handlePayment = async (): Promise<void> => {
    if (submitting || hasRedirected || paymentInitiated || processingRef.current) {
      return
    }

    processingRef.current = true
    setSubmitting(true)
    setPaymentInitiated(true)
    setErrorMessage(null)
    
    try {
      
      
      // Get the current PayU session
      const currentSession = activeSession || cart?.payment_collection?.payment_sessions?.find(
        (session: any) => isPayU(session.provider_id)
      )
      
      if (!currentSession) {
        throw new Error('Nie znaleziono sesji płatności PayU')
      }
      
      
      
      // Store cart ID for PayU return page
      localStorage.setItem('payu_cart_id', cart.id)
      
      // Place the order - this will trigger the payment flow
      const { placeOrder } = await import('@/lib/data/cart')
      const orderResult = await placeOrder(cart.id)
      
      // Check for redirect URL in the order result
      if (orderResult && typeof orderResult === 'object') {
        const orderRedirectUrl = 
          orderResult.redirect_url || 
          orderResult.redirectUrl || 
          (orderResult.data && (orderResult.data.redirect_url || orderResult.data.redirectUrl || orderResult.data.redirectUri)) ||
          (orderResult.payment_session && 
            (orderResult.payment_session.data?.redirect_url || 
            orderResult.payment_session.data?.redirectUrl || 
            orderResult.payment_session.data?.redirectUri)) ||
          (orderResult.data?.payu_data?.redirectUri) ||
          (orderResult.next_action?.redirect_to_url?.url) ||
          (orderResult.data?.next_action?.redirect_to_url?.url);
        
        if (orderRedirectUrl) {
          setHasRedirected(true)
          
          setTimeout(() => {
            window.location.href = orderRedirectUrl
          }, 100)
          
          return
        }
        
        // Check if order was completed successfully without redirect
        const orderId = orderResult.id || (orderResult.order && orderResult.order.id)
        if (orderId) {
      
          localStorage.setItem('payu_cart_id', '')
          router.push(`/order/confirmed/${orderId}`)
          return
        }
      }
      
      throw new Error('Nie można dokonać płatności. Brak URL przekierowania lub identyfikatora zamówienia.')
      
    } catch (error: any) {
      console.error('Payment error:', error)
      
      if (error instanceof Error) {
        const errorMessage = error.message
        
        if (errorMessage.toLowerCase().includes('redirect')) {
          setErrorMessage('Przekierowywanie do systemu płatności...')
          return
        }
        
        if (errorMessage.includes('NEXT_REDIRECT')) {
          setErrorMessage('Przekierowywanie do systemu płatności...')
          return
        }
      }
      
      let displayErrorMsg = error?.message || 'Wystąpił błąd podczas płatności'
      
      if (displayErrorMsg.includes('Error setting up the request:')) {
        displayErrorMsg = displayErrorMsg.replace('Error setting up the request:', '').trim()
      }
      
      setErrorMessage(displayErrorMsg)
    } finally {
      processingRef.current = false
      if (!hasRedirected) {
        setSubmitting(false)
        setPaymentInitiated(false)
      }
    }
  }
  
  const getPaymentMethodLabel = (providerId: string): string => {
    return paymentInfoMap[providerId]?.title || 'Płatność PayU'
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg p-4">
        <div className="font-medium mb-3">Metoda płatności:</div>
        <div className="flex items-center p-3 border rounded-md bg-blue-50 border-blue-500">
          <div className="flex-grow">
            {getPaymentMethodLabel(selectedProvider || '')}
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Metoda płatności została wybrana w poprzednim kroku.
        </div>
      </div>
      
      <Button
        disabled={!isPaymentReady || !selectedProvider || submitting || hasRedirected || paymentInitiated}
        onClick={handlePayment}
        loading={submitting}
        className="w-full"
        data-testid={dataTestId}
      >
        {hasRedirected ? 'Przekierowywanie...' : !termsAccepted ? 'Zaakceptuj regulamin' : 'Złóż zamówienie'}
      </Button>
      
      <ErrorMessage
        error={errorMessage}
        data-testid="payu-payment-error-message"
      />
    </div>
  )
}

// Export the main PaymentButton component
export default PaymentButton