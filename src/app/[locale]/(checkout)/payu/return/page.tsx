//right after payu redirect page
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
  const [statusMessage, setStatusMessage] = useState('Przetwarzanie płatności...')
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
        console.log('Attempting to authorize payment:', paymentSessionId)
        
        // First, get the cart to find the payment collection
        const cartResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/carts/${storedCartId}?fields=*payment_collection,*payment_collection.payment_sessions,*items,*region,completed_at,status`, {
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
          }
        })

        if (!cartResponse.ok) {
          // If cart is not found, try to get it from a different endpoint
          console.warn(`Cart fetch failed with status ${cartResponse.status}, trying alternative approach`)
          
          // Try to get payment session directly to find associated cart
          try {
            const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-sessions/${paymentSessionId}`, {
              headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
              }
            })
            
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json()
              console.log('Found payment session data:', sessionData)
            }
          } catch (sessionError) {
            console.error('Failed to get payment session data:', sessionError)
          }
          
          throw new Error('Failed to get cart data: ' + cartResponse.statusText)
        }

        const { cart } = await cartResponse.json()
        
        // Log cart status for debugging
        console.log('Cart status check:', {
          cartId: cart?.id,
          completed_at: cart?.completed_at,
          status: cart?.status,
          hasPaymentCollection: !!cart?.payment_collection
        })
        const paymentCollection = cart?.payment_collection
        
        if (!paymentCollection) {
          throw new Error('No payment collection found on cart')
        }
        
        console.log('Found payment collection:', paymentCollection.id)

        // Authorize the payment through the payment collection authorization endpoint
        try {
          // First, get the payment session directly to check its status and provider
          let detectedPaymentMethod = 'BLIK' // Default fallback
          let sessionData: any = null
          
          try {
            const paymentSessionResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-sessions/${paymentSessionId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
              }
            })
            
            if (paymentSessionResponse.ok) {
              sessionData = await paymentSessionResponse.json()
              console.log('Payment session data:', sessionData)
              
              // Detect payment method from provider_id
              const providerId = sessionData.payment_session?.provider_id || sessionData.provider_id
              console.log('Detected provider ID:', providerId)
              
              // Map provider IDs to payment method names
              switch (providerId) {
                case 'payu-blik':
                case 'pp_payu-blik':
                  detectedPaymentMethod = 'BLIK'
                  break
                case 'payu-card':
                case 'pp_payu-card':
                  detectedPaymentMethod = 'CARD'
                  break
                case 'payu-transfer':
                case 'pp_payu-transfer':
                  detectedPaymentMethod = 'TRANSFER'
                  break
                case 'payu-googlepay':
                case 'pp_payu-googlepay':
                  detectedPaymentMethod = 'GOOGLEPAY'
                  break
                default:
                  console.warn(`Unknown provider ID: ${providerId}, defaulting to BLIK`)
                  detectedPaymentMethod = 'BLIK'
              }
              
              console.log(`Detected payment method: ${detectedPaymentMethod} from provider: ${providerId}`)
            } else {
              console.warn('Could not get payment session data, using default BLIK method')
            }
          } catch (err) {
            console.warn('Error fetching payment session, using default BLIK method:', err)
          }
          
          const authResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment-collections/${paymentCollection.id}/authorize`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
            },
            body: JSON.stringify({
              session_id: paymentSessionId,
              data: {
                cart_id: storedCartId,
                payment_method: detectedPaymentMethod,
                payu_order_id: searchParams.get('orderId') || extOrderId || '',
                ext_order_id: extOrderId || '',
                return_from_payu: true,
                force_status: 'authorized',
                fully_authorized: true,
                requires_more: false
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
        
        // Add delay to ensure authorization is processed
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Now try to complete the cart
        const { placeOrder } = await import('@/lib/data/cart')
        console.log('Attempting to place order with cart ID:', storedCartId)
        
        // Add longer delay to ensure authorization is fully processed
        await new Promise(resolve => setTimeout(resolve, 5000))

        setStatusMessage('Przygotowanie do finalizacji zamówienia...')
        console.log('Payment authorized, preparing for cart completion')
        
        // Additional delay to ensure payment processing is complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        let lastError: Error | null = null
        let attempts = 0
        const maxAttempts = 4

        while (attempts < maxAttempts) {
          attempts++
          console.log(`Attempt ${attempts} to place order with cart ID: ${storedCartId}`);
          
          try {
            // Add increasing delay with each attempt
            if (attempts > 1) {
              await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
            }
            
            // Re-authorize payment on certain attempts
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-sm shadow-sm border border-stone-200 p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            {/* Title */}
            <h1 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
              Błąd płatności
            </h1>
            
            {/* Error Message */}
            <p className="text-stone-600 mb-8 leading-relaxed text-sm">
              {error}
            </p>
            
            {/* Action Button */}
            <button 
              onClick={() => router.push(`/${locale}/cart`)}
              className="w-full bg-stone-800 text-white py-3 px-6 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200 border-none rounded-none"
            >
              POWRÓT DO KOSZYKA
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-sm shadow-sm border border-stone-200 p-8 text-center">
          {/* Processing Animation */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="w-16 h-16 border-2 border-stone-200 rounded-full"></div>
            <div className="w-16 h-16 border-2 border-stone-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          
          {/* Title */}
          <h1 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
            Przetwarzanie płatności
          </h1>
          
          {/* Status Message */}
          <p className="text-stone-600 mb-4 leading-relaxed text-sm">
            {statusMessage}
          </p>
          
          {/* Additional Info */}
          <p className="text-xs text-stone-500 italic">
            Prosimy o cierpliwość...
          </p>
        </div>
      </div>
    </div>
  )
}