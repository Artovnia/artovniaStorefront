"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "@/i18n/routing"
import { selectPaymentSession } from "@/lib/data/cart"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { isManual, isPayU, paymentInfoMap } from "../../../lib/constants"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/atoms"
import { CreditCard } from "@medusajs/icons"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  termsAccepted: boolean
  "data-testid": string
}

// Main PaymentButton component that determines which payment method to use
const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  termsAccepted,
  "data-testid": dataTestId,
}): React.ReactElement => {
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
  
  // Check if there's a selected session - consider any pending session as selected
  const hasValidPaymentSession = paymentSessions.length > 0 && !!activeSession

  // Get payment provider ID from the active session or first available
  const paymentProviderId = activeSession?.provider_id || paymentSessions[0]?.provider_id
  
  // Determine which payment button to show based on the payment provider
  switch (true) {
    case isPayU(paymentProviderId):
      return (
        <PayUPaymentButton
          cart={cart}
          isPaymentReady={!notReady && hasValidPaymentSession}
          termsAccepted={termsAccepted}
          data-testid={dataTestId}
          activeSession={activeSession}
        />
      )
    case isManual(paymentProviderId):
      return (
        <ManualTestPaymentButton 
          isPaymentReady={!notReady && hasValidPaymentSession}
          termsAccepted={termsAccepted}
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

interface ManualTestPaymentButtonProps {
  isPaymentReady: boolean
  termsAccepted: boolean
  "data-testid"?: string
  cart: HttpTypes.StoreCart
}

const ManualTestPaymentButton: React.FC<ManualTestPaymentButtonProps> = ({ 
  isPaymentReady, 
  termsAccepted,
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
  termsAccepted: boolean
  "data-testid"?: string
  activeSession?: any
}

const PayUPaymentButton: React.FC<PayUPaymentButtonProps> = ({
  cart,
  isPaymentReady,
  termsAccepted,
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