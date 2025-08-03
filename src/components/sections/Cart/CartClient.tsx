'use client'

import { Button } from "@/components/atoms"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CartClientProps {
  cartTotal: number
  currencyCode: string
}

export const CartClient = ({ cartTotal, currencyCode }: CartClientProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      // Navigate to checkout
      router.push('/checkout?step=address')
    } catch (error) {
      console.error('Error navigating to checkout:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button 
      className="w-full py-3 flex justify-center items-center disabled:opacity-50" 
      onClick={handleCheckout}
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
  )
}
