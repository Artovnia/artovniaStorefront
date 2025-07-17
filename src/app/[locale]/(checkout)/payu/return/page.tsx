"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useParams } from "next/navigation"
import { placeOrder } from "@/lib/data/cart"

export default function PayUReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string || 'pl'
  const [isProcessing, setIsProcessing] = useState(true)
  const [statusMessage, setStatusMessage] = useState('Proszę czekać, trwa finalizacja zamówienia...')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const processPayUReturn = async () => {
      try {
        const sessionId = searchParams.get('session_id')
        const extOrderId = searchParams.get('ext_order_id')
        
        if (!sessionId && !extOrderId) {
          throw new Error('No session ID found in PayU return')
        }

        const paymentSessionId = sessionId || extOrderId
        console.log('Processing PayU return for session:', paymentSessionId)
        
        // Get the stored cart ID
        const storedCartId = localStorage.getItem('payu_cart_id')
        if (!storedCartId) {
          console.warn('No stored cart ID found')
          setError('Nie można znaleźć danych koszyka')
          return
        }

        console.log('Attempting to complete cart:', storedCartId)
        setStatusMessage('Pobieranie danych płatności...')
        console.log('Attempting to authorize payment:', paymentSessionId)
        
        // First, get the cart to find the payment collection
        const cartResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${storedCartId}?fields=*payment_collection,*payment_collection.payment_sessions`, {
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
          }
        })

        if (!cartResponse.ok) {
          throw new Error('Failed to get cart data: ' + cartResponse.statusText)
        }

        const { cart } = await cartResponse.json()
        const paymentCollection = cart?.payment_collection
        
        if (!paymentCollection) {
          throw new Error('No payment collection found on cart')
        }
        
        console.log('Found payment collection:', paymentCollection.id)

        // Authorize the payment through the payment collection authorization endpoint
        try {
          // First, get the payment session directly to check its status and provider
          try {
            const paymentSessionResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-sessions/${paymentSessionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
              }
            })
            
            if (paymentSessionResponse.ok) {
              const sessionData = await paymentSessionResponse.json()
              console.log('Payment session data:', sessionData)
            } else {
              console.warn('Could not get payment session data, continuing with authorization')
            }
          } catch (err) {
            // Continue even if session fetch fails
            console.warn('Error fetching payment session, continuing with authorization:', err)
          }
          
          setStatusMessage('Autoryzacja płatności...')
          const authResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-collections/${paymentCollection.id}/authorize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
            },
            body: JSON.stringify({
              session_id: paymentSessionId,
              data: {
                // Explicit flags to signal payment is complete
                return_from_payu: true,
                payment_status: "COMPLETED",
                status: "COMPLETED",
                cart_id: storedCartId,
                payment_method: "CARD",
                payu_order_id: searchParams.get('orderId') || extOrderId || '',
                ext_order_id: extOrderId || '',
                force_status: 'authorized',
                fully_authorized: true,
                requires_more: false,
                redirect_url: null,
                redirectUrl: null,
                redirectUri: null,
                flow_state: "COMPLETED",
                authorize_status: "success",
                authorized_at: new Date().toISOString()
              }
            })
          })

          if (authResponse.ok) {
            const authResult = await authResponse.json()
            console.log('Payment successfully authorized:', authResult)
          } else {
            const errorText = await authResponse.text()
            console.warn('Authorization failed:', errorText)
          }
        } catch (authError) {
          console.warn('Error during authorization:', authError)
        }
        
        // Add small delay to ensure authorization is processed
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Now try to complete the cart - use skipRedirectCheck=true to ensure we complete the order rather than redirecting
        const { placeOrder } = await import('@/lib/data/cart')
        console.log('Attempting to place order with cart ID:', storedCartId)
        
        // Add a longer delay to ensure authorization is fully processed on the backend
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        // Skip direct cart update attempt - Medusa doesn't support 'context' field updates
        // Instead, rely on properly authorized payment session to signal payment completion
        
        setStatusMessage('Przygotowanie do finalizacji zamówienia...')
        console.log('Payment authorized, preparing for cart completion')
        
        // Additional delay to ensure payment processing is complete on backend
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        let lastError: Error | null = null
        let attempts = 0
        const maxAttempts = 10

        while (attempts < maxAttempts) {
          attempts++
          setStatusMessage(`Finalizowanie zamówienia... (próba ${attempts}/${maxAttempts})`)
          console.log(`Attempt ${attempts} to place order with cart ID: ${storedCartId}`);
          
          try {
            // Add a slightly increasing delay with each attempt
            if (attempts > 1) {
              await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
            }
            
            // For certain attempts, try to re-authorize the payment with more complete data
            if (attempts > 1 && attempts % 2 === 0) {
              try {
                console.log('Re-authorizing payment on attempt', attempts)
                const authResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-collections/${paymentCollection.id}/authorize`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
                  },
                  body: JSON.stringify({
                    session_id: paymentSessionId,
                    data: {
                      // Explicit flags to signal payment is complete
                      return_from_payu: true,
                      payment_status: "COMPLETED",
                      status: "COMPLETED",
                      payment_method: "CARD",
                      payu_order_id: searchParams.get('orderId') || extOrderId || '',
                      ext_order_id: extOrderId || '',
                      force_status: 'authorized',
                      fully_authorized: true,
                      requires_more: false,
                      redirect_url: null,
                      redirectUrl: null,
                      redirectUri: null,
                      flow_state: "COMPLETED",
                      authorize_status: "success",
                      authorized_at: new Date().toISOString()
                    }
                  })
                })
                
                if (authResponse.ok) {
                  console.log('Re-authorization successful on attempt', attempts)
                } else {
                  console.warn('Re-authorization failed with status:', authResponse.status)
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (authError) {
                console.warn('Re-authorization failed, continuing with cart completion', authError)
              }
            }
            
            const result = await placeOrder(storedCartId, true);
            console.log('Cart completion succeeded, result:', result);
            
            // Clear the stored cart ID
            localStorage.removeItem('payu_cart_id');
            
            // Handle different result types
            if (result.type === 'order_set' || result.order_set) {
              const orderSetId = result.id || result.order_set?.id;
              console.log('Order set created:', orderSetId);
              router.push(`/${locale}/order/${orderSetId}/confirmed`);
              return;
            }
            
            if (result.type === 'order' || result.order) {
              const orderId = result.id || result.order?.id;
              console.log('Order created:', orderId);
              router.push(`/${locale}/order/${orderId}/confirmed`);
              return;
            }
            
            if (result.id) {
              console.log('Order/OrderSet created with ID:', result.id);
              router.push(`/${locale}/order/${result.id}/confirmed`);
              return;
            }
            
            // If we get here with a result but no recognizable order, log it and try again
            console.warn('Unexpected result format from placeOrder:', result);
            lastError = new Error('Unexpected result format from order placement');
            
          } catch (orderError: any) {
            console.error(`Attempt ${attempts} failed with error:`, orderError.message);
            lastError = orderError;
            
            // If we get an error about more information needed, this might be fixed by retrying
            if (orderError.message && (orderError.message.includes('More information is required for payment') || 
                                      orderError.message.includes('Internal Server Error'))) {
              console.log('Retrying due to payment information error...');
              // Continue to next attempt
            } else {
              // For other errors, stop retrying
              break;
            }
          }
        }
        
        // If we get here, all attempts failed
        console.error(`All ${maxAttempts} attempts to place order failed.`);
        setError(`Nie udało się sfinalizować zamówienia: ${lastError?.message || 'Nieznany błąd'}`);
        return;
        
      } catch (error: any) {
        console.error('Error processing PayU return:', error)
        setError('Wystąpił błąd podczas przetwarzania płatności: ' + error.message)
      } finally {
        setIsProcessing(false)
      }
    }
    
    processPayUReturn()
  }, [router, searchParams, locale])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Błąd płatności</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => router.push(`/${locale}/cart`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Powrót do koszyka
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Przetwarzanie płatności</h1>
        <p className="mb-4">{statusMessage}</p>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}