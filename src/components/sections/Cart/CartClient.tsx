'use client'

import { Button } from "@/components/atoms"
import { GuestCheckoutModal } from "@/components/molecules/GuestCheckoutModal/GuestCheckoutModal"
import { useRouter } from "@/i18n/routing"
import { useState } from "react"
import { useCart } from "@/components/context/CartContext"

interface CartClientProps {
  cartTotal: number
  currencyCode: string
  hasCustomer?: boolean // Pass from cart.customer
}

export const CartClient = ({ cartTotal, currencyCode, hasCustomer = false }: CartClientProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [stockError, setStockError] = useState<string | null>(null)
  const router = useRouter()
  const { cart, refreshInventory } = useCart()

  // Use cart customer data for auth detection (more reliable than cookies)
  const isAuthenticated = hasCustomer

  // Validate stock levels before proceeding to checkout
  const validateStock = async (): Promise<boolean> => {
    setStockError(null)

    // Refresh inventory and use the returned data directly (avoids stale closure)
    const freshInventory = await refreshInventory()

    // Check each cart item against current inventory
    const overStockItems: string[] = []
    for (const item of cart?.items || []) {
      const variantId = item.variant_id
      if (!variantId) continue

      const inv = freshInventory[variantId]
      if (!inv) continue // No inventory data — skip (will be caught at order time)
      if (!inv.manage_inventory || inv.allow_backorder) continue

      if (item.quantity > inv.inventory_quantity) {
        const productName = item.product_title || item.title || 'Produkt'
        overStockItems.push(
          `${productName}: w koszyku ${item.quantity}, dostępne ${inv.inventory_quantity}`
        )
      }
    }

    if (overStockItems.length > 0) {
      setStockError(
        `Niektóre produkty przekraczają dostępną ilość:\n${overStockItems.join('\n')}\nZmniejsz ilość przed kontynuacją.`
      )
      return false
    }

    return true
  }

  const handleCheckoutClick = async () => {
    setIsLoading(true)
    
    const stockOk = await validateStock()
    if (!stockOk) {
      setIsLoading(false)
      return
    }

    // If user is authenticated, go directly to checkout
    if (isAuthenticated) {
      proceedToCheckout()
    } else {
      setIsLoading(false)
      // Show guest/signin modal
      setShowGuestModal(true)
    }
  }

  const proceedToCheckout = () => {
    setIsLoading(true)
    setShowGuestModal(false)
    setStockError(null)
    // Use router.push to maintain cart state
    router.push('/checkout?step=address')
  }

  return (
    <>
      {/* Stock validation error */}
      {stockError && (
        <div className="mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs" role="alert">
          <div className="flex items-start gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="flex-shrink-0 mt-0.5">
              <path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none" />
              <path d="M7 5V8M7 10V10.01" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="whitespace-pre-line">{stockError}</span>
          </div>
        </div>
      )}

      <Button 
        className="w-full py-3 flex justify-center items-center disabled:opacity-50" 
        onClick={handleCheckoutClick}
        disabled={isLoading || cartTotal === 0}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
            Sprawdzanie dostępności...
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
