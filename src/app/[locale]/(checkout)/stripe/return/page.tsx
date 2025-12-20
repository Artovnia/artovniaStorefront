"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { useSearchParams, useParams } from 'next/navigation'
import { useCart } from '@/components/context/CartContext'
import { removeCartId } from '@/lib/data/cookies'
import { placeOrder } from '@/lib/data/cart'

const StripeReturnPageContent: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string || 'pl'
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get cart context to clear cart after successful completion
  const { clearCart, refreshCart, cart } = useCart()

  useEffect(() => {
    const processStripeReturn = async () => {
      try {
        
        // Extract Stripe parameters
        const paymentIntent = searchParams.get('payment_intent')
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
        const redirectStatus = searchParams.get('redirect_status')
        const cartId = searchParams.get('cart_id')
        const status = searchParams.get('status') // Our custom status parameter
        
        
        if (!cartId) {
          throw new Error('Missing cart_id parameter')
        }
        
        // Use our custom status parameter if redirect_status is not available
        const finalStatus = redirectStatus || status

        if (finalStatus === 'succeeded' || finalStatus === 'success') {
          
          // For Stripe Checkout payments, the payment providers now automatically detect
          // completed Stripe Checkout sessions and authorize the payment accordingly
          try {
            
            // Use placeOrder function directly (bypassing server action routing issues)
            let result
            try {
              result = await placeOrder(cartId, true)
            } catch (placeOrderError: any) {
              result = undefined
            }
         
            
            // Clear the cart completely after successful completion
            // placeOrder already calls removeCartId() on success, but we ensure client-side is cleared too
            if (result) {
              // Clear client-side cart context and storage (fast, synchronous operations)
              clearCart()
              
              if (typeof window !== 'undefined') {
                try {
                  localStorage.removeItem('_medusa_cart_id')
                  localStorage.removeItem('medusa_cart_id')
                } catch (error) {
                  // Ignore localStorage errors
                }
              }
            } else {
              // Fallback cart clearing even if no result
              try {
                await removeCartId()
                clearCart()
              } catch (error) {
                // Ignore errors
              }
            }
            
            // Handle different response formats from cart completion
            let orderId = null
            
            if (result) {
              // Check various possible response formats
              orderId = result.id || 
                       result.order?.id || 
                       result.data?.id ||
                       result.order_set?.id ||
                       (result.type === 'order' && result.order?.id) ||
                       (result.type === 'order_set' && result.order_set?.id)
            }
            
            if (orderId) {
              router.push(`/order/${orderId}/confirmed`)
              return
            } else {
              setError(locale === 'pl' ? 'Zamówienie zostało utworzone, ale nie znaleziono ID zamówienia. Sprawdź historię zamówień.' : 'Order was created but order ID not found. Please check your order history.')
            }
            
          } catch (error: any) {
            setError(locale === 'pl' ? 'Płatność zakończona sukcesem, ale finalizacja zamówienia nie powiodła się. Skontaktuj się z obsługą klienta.' : 'Payment succeeded but order completion failed. Please contact support.')
          }
          
        } else if (finalStatus === 'failed') {
          setError(locale === 'pl' ? 'Płatność nie powiodła się. Spróbuj ponownie.' : 'Payment failed. Please try again.')
          
          // Redirect back to checkout after a delay
          setTimeout(() => {
            router.push(`/checkout?step=payment&cart_id=${cartId}`)
          }, 3000)
          
        } else {
          setError(locale === 'pl' ? 'Nieznany status płatności. Skontaktuj się z obsługą klienta.' : 'Unknown payment status. Please contact support.')
          
          // Redirect back to checkout after a delay
          setTimeout(() => {
            router.push(`/checkout?step=payment&cart_id=${cartId}`)
          }, 3000)
        }
        
      } catch (error: any) {
        console.error('Error processing Stripe return:', error)
        setError(error.message || (locale === 'pl' ? 'Wystąpił błąd podczas przetwarzania płatności' : 'An error occurred while processing your payment'))
        
        // Redirect back to checkout after a delay
        setTimeout(() => {
          const cartId = searchParams.get('cart_id')
          if (cartId) {
            router.push(`/checkout?step=payment&cart_id=${cartId}`)
          } else {
            router.push('/checkout')
          }
        }, 3000)
      } finally {
        setIsProcessing(false)
      }
    }

    processStripeReturn()
  }, [router, searchParams])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F4F0EB' }}>
        <div className="p-12 bg-white rounded-2xl shadow-xl text-center max-w-md relative overflow-hidden">          
          <div className="mb-8 relative z-10">
            {/* Artistic broken craft icon */}
            <svg className="w-20 h-20 mx-auto" viewBox="0 0 80 80">
              <defs>
                <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5A3C"/>
                  <stop offset="100%" stopColor="#D2691E"/>
                </linearGradient>
              </defs>
              
              {/* Broken vase/craft piece */}
              <path d="M25,20 Q25,15 30,15 L50,15 Q55,15 55,20 L55,30 Q60,35 60,50 L60,60 Q60,65 55,65 L45,65" fill="url(#errorGradient)" opacity="0.7"/>
              <path d="M35,65 L25,65 Q20,65 20,60 L20,50 Q20,35 25,30 L25,20" fill="url(#errorGradient)" opacity="0.7"/>
              
              {/* Crack lines */}
              <path d="M40,20 L42,35 L38,50 L40,65" stroke="#8B5A3C" strokeWidth="2" fill="none"/>
              <path d="M30,40 L45,42 L50,38" stroke="#8B5A3C" strokeWidth="1.5" fill="none"/>
              
              {/* Scattered pieces */}
              <circle cx="65" cy="35" r="3" fill="#8B5A3C" opacity="0.6"/>
              <path d="M15,45 L18,42 L21,48 L15,48 Z" fill="#D2691E" opacity="0.6"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Instrument Serif, serif', color: '#8B5A3C' }}>
              {locale === 'pl' ? 'Coś Poszło Nie Tak' : 'Something Went Wrong'}
            </h1>
            <p className="mb-6 text-lg" style={{ fontFamily: 'Instrument Sans, sans-serif', color: '#6B6B6B' }}>
              {error}
            </p>
            <p className="text-sm" style={{ fontFamily: 'Instrument Sans, sans-serif', color: '#999' }}>
              {locale === 'pl' ? 'Przekierowujemy Cię z powrotem do kasy...' : 'Redirecting you back to checkout...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F4F0EB' }}>
      <div className="p-12 bg-white rounded-2xl shadow-xl text-center max-w-md relative overflow-hidden">
        <div className="mb-8 relative z-10">
          {/* Simplified spinning design */}
          <div className="relative w-20 h-20 mx-auto">
            <svg className="w-full h-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 80 80">
              <defs>
                <radialGradient id="craftGradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#3B3634" stopOpacity="0.3"/>
                  <stop offset="70%" stopColor="#3B3634" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3B3634"/>
                </radialGradient>
              </defs>
              
              {/* Outer decorative ring */}
              <circle cx="40" cy="40" r="35" fill="none" stroke="#3B3634" strokeWidth="1" opacity="0.3"/>
              
              {/* Artistic craft elements */}
              <g transform="translate(40,40)">
                {/* Paintbrush strokes */}
                <path d="M-20,-20 Q0,-25 20,-20 Q15,0 0,5 Q-15,0 -20,-20" fill="#3B3634" opacity="0.6"/>
                <path d="M20,-20 Q25,0 20,20 Q0,15 -5,0 Q0,-15 20,-20" fill="#3B3634" opacity="0.4"/>
                <path d="M20,20 Q0,25 -20,20 Q-15,0 0,-5 Q15,0 20,20" fill="#3B3634" opacity="0.6"/>
                <path d="M-20,20 Q-25,0 -20,-20 Q0,-15 5,0 Q0,15 -20,20" fill="#3B3634" opacity="0.4"/>
                
                {/* Center craft tool */}
                <circle cx="0" cy="0" r="8" fill="url(#craftGradient)"/>
                <circle cx="0" cy="0" r="3" fill="#3B3634"/>
              </g>
              
              {/* Decorative dots around the design */}
              <circle cx="40" cy="8" r="2" fill="#3B3634" opacity="0.7">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="72" cy="40" r="2" fill="#3B3634" opacity="0.7">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="0.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="40" cy="72" r="2" fill="#3B3634" opacity="0.7">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="8" cy="40" r="2" fill="#3B3634" opacity="0.7">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin="1.5s" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Instrument Serif, serif', color: '#3B3634' }}>
            {locale === 'pl' ? 'Malujemy Twoje Zamówienie' : 'Crafting Your Order'}
          </h1>
          <p className="mb-8 text-lg" style={{ fontFamily: 'Instrument Sans, sans-serif', color: '#6B6B6B' }}>
            {locale === 'pl' 
              ? 'Proszę czekać, podczas gdy potwierdzamy płatność i przygotowujemy Twoje dzieła sztuki...' 
              : 'Please wait while we confirm your payment and prepare your artworks...'
            }
          </p>
          
          {/* Artistic progress bar */}
          <div className="relative">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full animate-pulse"
                style={{ backgroundColor: '#3B3634', animation: 'pulse 2s ease-in-out infinite' }}
              />
            </div>
            {/* Decorative elements on progress bar */}
            <div className="absolute -top-1 left-0 w-3 h-3 rounded-full" style={{ backgroundColor: '#3B3634' }}>
              <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: '#3B3634', opacity: '0.3' }}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the component directly - it will use the CartProvider from the layout
export default StripeReturnPageContent