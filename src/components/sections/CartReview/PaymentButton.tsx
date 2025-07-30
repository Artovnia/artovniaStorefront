"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { selectPaymentSession } from "@/lib/data/cart"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { isManual, isPayU, paymentInfoMap } from "../../../lib/constants"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/atoms"
import { CreditCard } from "@medusajs/icons"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

// Main PaymentButton component that determines which payment method to use
const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}): React.ReactElement => {
  // Check if cart is ready for checkout
  const notReady = !cart || 
    !cart.shipping_address || 
    !cart.email || 
    (cart.shipping_methods?.length ?? 0) < 1

  // Get all possible payment sessions from the cart
  const paymentSessions = cart?.payment_collection?.payment_sessions || []
  
  // Find active payment session (status pending) if it exists
  const activeSession = paymentSessions.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )
  
  // Check if there's a selected session - consider any pending session as selected
  const hasValidPaymentSession = paymentSessions.length > 0 && !!activeSession

  // Get payment provider ID from the active session or first available
  const paymentProviderId = activeSession?.provider_id || paymentSessions[0]?.provider_id
  
  // Log detailed payment info for debugging
  console.log('PaymentButton - Debug info:', {
    id: cart?.id,
    email: cart?.email,
    hasShippingAddress: !!cart?.shipping_address,
    hasShippingMethod: !!cart?.shipping_methods?.length,
    paymentSessionsCount: paymentSessions.length,
    paymentSessions: paymentSessions.map((s: any) => ({
      id: s.id,
      providerId: s.provider_id,
      status: s.status
    })),
    activeSession: activeSession ? {
      id: activeSession.id,
      providerId: activeSession.provider_id,
      status: activeSession.status
    } : null,
    hasValidPaymentSession,
    finalPaymentProviderId: paymentProviderId,
  })
  
  // Determine which payment button to show based on the payment provider
  switch (true) {
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
            {!hasValidPaymentSession ? 'Wybierz metodę płatności' : 'Ładowanie...'}
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
      
      console.log('Manual payment result:', result);
      
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
        <CreditCard className="mr-2" /> Pay with Manual Test
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
      console.log('Payment session data:', {
        id: activeSession.id,
        providerId: activeSession.provider_id,
        status: activeSession.status
      })
    }
    
    const checkPaymentStatus = (): void => {
      const storedCartId = localStorage.getItem('payu_cart_id')
      
      if (storedCartId && storedCartId === cart.id) {
        console.log('Detected returning from payment flow, checking status')
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
        console.log('Detected PayU redirect with status:', payuStatus)
        
        localStorage.setItem('payu_cart_id', '')
        
        if (payuStatus.toUpperCase() === 'SUCCESS') {
          const orderId = searchParams.get('orderId') || cart.id
          console.log('Payment successful, redirecting to order confirmation', orderId)
          router.push(`/order/confirmed/${orderId}`)
        }
      }
    }
    
    checkRedirectStatus()
  }, [router, cart.id])

  const handlePayment = async (): Promise<void> => {
    if (submitting || hasRedirected || paymentInitiated || processingRef.current) {
      console.log('Payment already in progress, skipping...', {
        submitting,
        hasRedirected,
        paymentInitiated,
        processing: processingRef.current
      })
      return
    }

    processingRef.current = true
    setSubmitting(true)
    setPaymentInitiated(true)
    setErrorMessage(null)
    
    try {
      console.log('Processing payment with provider:', selectedProvider)
      
      let currentSession = activeSession

      // **CRITICAL FIX: Never create new sessions in PaymentButton - only use existing ones**
      // Payment sessions should only be created in CartPaymentSection when user selects payment method
      if (!currentSession) {
        // Try to find any pending session for the selected provider
        const allSessions = cart?.payment_collection?.payment_sessions || []
        currentSession = allSessions.find(
          (session: any) => session.provider_id === selectedProvider && session.status === 'pending'
        )
        
        if (!currentSession) {
          throw new Error(`No payment session found for provider: ${selectedProvider}. Please go back and select a payment method.`)
        }
        
        console.log('Found existing payment session:', currentSession.id)
      } else {
        console.log('Using active payment session:', currentSession.id)
      }

      // Ensure we have the correct session for the selected provider
      if (currentSession.provider_id !== selectedProvider) {
        console.warn(`Session provider mismatch: expected ${selectedProvider}, got ${currentSession.provider_id}`)
        
        // Try to find the correct session
        const correctSession = cart?.payment_collection?.payment_sessions?.find(
          (session: any) => session.provider_id === selectedProvider && session.status === 'pending'
        )
        
        if (correctSession) {
          currentSession = correctSession
          console.log('Found correct payment session:', currentSession.id)
        } else {
          throw new Error(`No payment session found for selected provider: ${selectedProvider}. Please go back and select the payment method again.`)
        }
      }

      // Check for redirect URL in the current session
      const sessionData = currentSession.data as any
      const sessionAny = currentSession as any
      
      const redirectUrl = 
        sessionData?.redirect_url || 
        sessionData?.redirectUrl || 
        sessionData?.redirectUri || 
        sessionData?.redirect || 
        sessionData?.url ||
        sessionAny.redirect_url || 
        sessionAny.redirectUrl ||
        sessionAny.redirectUri ||
        sessionAny.redirect ||
        sessionData?.payu_data?.redirectUri ||
        sessionAny.payu_data?.redirectUri ||
        sessionData?.next_action?.redirect_to_url?.url ||
        sessionAny.next_action?.redirect_to_url?.url;

      if (redirectUrl) {
        console.log('Found redirect URL in payment session, redirecting:', redirectUrl)
        localStorage.setItem('payu_cart_id', cart.id)
        setHasRedirected(true)
        
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 100)
        
        return
      }

      // CRITICAL FIX: Avoid calling placeOrder as it triggers validateCartPaymentsStep which creates duplicate sessions
      // Instead, try to authorize the existing payment session to get redirect URL
      console.log('No redirect URL found, attempting to authorize existing payment session')
      
      try {
        // Try to authorize the payment session to get redirect URL without creating new sessions
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-sessions/${currentSession.id}/authorize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
          },
          body: JSON.stringify({
            context: { cart_id: cart.id }
          })
        })
        
        if (authResponse.ok) {
          const authResult = await authResponse.json()
          console.log('Payment authorization result:', authResult)
          
          // Check for redirect URL in authorization result
          const authRedirectUrl = 
            authResult?.redirect_url || 
            authResult?.redirectUrl || 
            authResult?.data?.redirect_url || 
            authResult?.data?.redirectUrl || 
            authResult?.data?.redirectUri ||
            authResult?.payu_data?.redirectUri ||
            authResult?.next_action?.redirect_to_url?.url
          
          if (authRedirectUrl) {
            console.log('Found redirect URL from payment authorization:', authRedirectUrl)
            localStorage.setItem('payu_cart_id', cart.id)
            setHasRedirected(true)
            
            setTimeout(() => {
              window.location.href = authRedirectUrl
            }, 100)
            
            return
          }
        }
      } catch (authError) {
        console.warn('Payment authorization failed, falling back to order placement:', authError)
      }
      
      // Only as last resort, call placeOrder (this will create duplicate session but we have no choice)
      console.log('Authorization failed, attempting to place order as last resort')
      
      const { placeOrder } = await import('@/lib/data/cart')
      const orderResult = await placeOrder(cart.id)
      console.log('Order placement result:', orderResult)
      
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
          console.log('Found redirect URL in order result:', orderRedirectUrl)
          localStorage.setItem('payu_cart_id', cart.id)
          setHasRedirected(true)
          
          setTimeout(() => {
            window.location.href = orderRedirectUrl
          }, 100)
          
          return
        }
        
        // Check if order was completed successfully without redirect
        const orderId = orderResult.id || (orderResult.order && orderResult.order.id)
        if (orderId) {
          console.log('Order completed successfully without redirect, going to confirmation:', orderId)
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
        {hasRedirected ? 'Przekierowywanie...' : 'Złóż zamówienie'}
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