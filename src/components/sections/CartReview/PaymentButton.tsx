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
        <div className="flex flex-col gap-4">
          <button
            disabled
            className={`
              w-full py-4 px-6
              bg-plum-muted text-cream-50 text-sm font-medium tracking-wide uppercase
              border-none cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {!termsAccepted ? 'Zaakceptuj regulamin' : !hasValidPaymentSession ? 'Wybierz metodę płatności' : 'Ładowanie...'}
          </button>
          {paymentSessions.length === 0 && (
            <p className="text-sm text-plum-muted text-center">
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
     
      
      // CRITICAL: This function should NEVER call placeOrder directly
      // It should ALWAYS create a Stripe Checkout session and redirect

      // CRITICAL FIX: Ensure payment session exists before placing order
      const paymentSessions = cart?.payment_collection?.payment_sessions || []
      const hasValidSession = paymentSessions.some((session: any) => 
        session.provider_id === paymentProviderId && session.status === 'pending'
      )

     
      if (!hasValidSession) {
        
        // Import the payment session functions
        const { selectPaymentSession, initiatePaymentSession, retrieveCartForPayment } = await import('@/lib/data/cart')
        
        try {
          // Try to initiate payment session first
          await initiatePaymentSession(cart, { provider_id: paymentProviderId })
        } catch (initError: any) {
          
          // Continue if session already exists
        }
        
        // Select the payment session
        await selectPaymentSession(cart.id, paymentProviderId)
        
        // CRITICAL FIX: Refresh cart data to get updated payment sessions
        // Wait a bit for backend to process the session creation
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const refreshedCart = await retrieveCartForPayment(cart.id)
        
        
        // Verify the session now exists in refreshed cart
        const refreshedHasValidSession = refreshedCart?.payment_collection?.payment_sessions?.some((session: any) => 
          session.provider_id === paymentProviderId && session.status === 'pending'
        )
        
        if (!refreshedHasValidSession) {
          throw new Error(`Payment session creation failed for provider: ${paymentProviderId}. Session not found in refreshed cart data.`)
        }
        
       
      }

      // CRITICAL: For ALL Stripe payments, we must use Stripe Checkout - never call placeOrder directly
      
      
      // Get the payment session data
      const currentPaymentSessions = cart?.payment_collection?.payment_sessions || []
      const currentSession = currentPaymentSessions.find(session => session.provider_id === paymentProviderId)
      
      if (!currentSession || !currentSession.data?.id) {
        throw new Error('No valid payment session found for Stripe payment')
      }
      
      const paymentIntentId = currentSession.data.id
      
      
      // Determine payment method types based on provider
      let paymentMethodTypes = ['card']
      if (paymentProviderId.includes('blik')) {
        paymentMethodTypes = ['blik']
      } else if (paymentProviderId.includes('przelewy24')) {
        paymentMethodTypes = ['p24']
      }
      
      
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
      
      
      if (!checkoutResponse.ok) {
        const errorText = await checkoutResponse.text()
        console.error('❌ Failed to create Stripe Checkout session:', errorText)
        throw new Error(`Failed to create checkout session: ${checkoutResponse.statusText}`)
      }
      
      const checkoutResult = await checkoutResponse.json()
      
      if (checkoutResult.checkout_url) {
        window.location.href = checkoutResult.checkout_url
        return
      }
      
      throw new Error('No checkout URL received from Stripe')
      
    } catch (error: any) {
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
      <button
        disabled={!isPaymentReady || submitting}
        onClick={handleStripePayment}
        className={`
          w-full py-4 px-6
          bg-plum text-cream-50 text-sm font-medium tracking-wide uppercase
          border-none cursor-pointer
          transition-all duration-200
          hover:bg-plum-dark
          disabled:bg-plum-muted disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
        data-testid={dataTestId}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
            Przetwarzanie...
          </span>
        ) : !termsAccepted ? (
          'Zaakceptuj regulamin'
        ) : (
          'Złóż zamówienie'
        )}
      </button>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
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
    <div className="flex flex-col gap-4">
      <button
        disabled={!isPaymentReady || submitting}
        onClick={handleManualPayment}
        className={`
          w-full py-4 px-6
          bg-plum text-cream-50 text-sm font-medium tracking-wide uppercase
          border-none cursor-pointer
          transition-all duration-200
          hover:bg-plum-dark
          disabled:bg-plum-muted disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
        data-testid={dataTestId}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
            Przetwarzanie...
          </span>
        ) : !termsAccepted ? (
          'Zaakceptuj regulamin'
        ) : (
          'Złóż zamówienie (Test)'
        )}
      </button>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
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
      <button
        disabled={!isPaymentReady || !selectedProvider || submitting || hasRedirected || paymentInitiated}
        onClick={handlePayment}
        className={`
          w-full py-4 px-6
          bg-plum text-cream-50 text-sm font-medium tracking-wide uppercase
          border-none cursor-pointer
          transition-all duration-200
          hover:bg-plum-dark
          disabled:bg-plum-muted disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
        data-testid={dataTestId}
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-cream-50 border-t-transparent rounded-full animate-spin" />
            Przetwarzanie...
          </span>
        ) : hasRedirected ? (
          'Przekierowywanie...'
        ) : !termsAccepted ? (
          'Zaakceptuj regulamin'
        ) : (
          'Złóż zamówienie'
        )}
      </button>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  )
}

// Export the main PaymentButton component
export default PaymentButton