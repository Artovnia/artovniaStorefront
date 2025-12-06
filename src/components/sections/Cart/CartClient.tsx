'use client'

import { Button } from "@/components/atoms"
import { GuestCheckoutModal } from "@/components/molecules/GuestCheckoutModal/GuestCheckoutModal"
import { useRouter } from "@/i18n/routing"
import { useState } from "react"

interface CartClientProps {
  cartTotal: number
  currencyCode: string
  hasCustomer?: boolean // Pass from cart.customer
}

export const CartClient = ({ cartTotal, currencyCode, hasCustomer = false }: CartClientProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const router = useRouter()

  // Use cart customer data for auth detection (more reliable than cookies)
  const isAuthenticated = hasCustomer

  const handleCheckoutClick = () => {
    // If user is authenticated, go directly to checkout
    if (isAuthenticated) {
      proceedToCheckout()
    } else {
      // Show guest/signin modal
      setShowGuestModal(true)
    }
  }

  const proceedToCheckout = () => {
    setIsLoading(true)
    setShowGuestModal(false)
    // Use router.push to maintain cart state
    router.push('/checkout?step=address')
  }

  return (
    <>
      <Button 
        className="w-full py-3 flex justify-center items-center disabled:opacity-50" 
        onClick={handleCheckoutClick}
        disabled={isLoading || cartTotal === 0}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
            Ładowanie...
          </>
        ) : (
          'Przejdź do realizacji'
        )}
      </Button>

      <GuestCheckoutModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onGuestCheckout={proceedToCheckout}
      />
    </>
  )
}
