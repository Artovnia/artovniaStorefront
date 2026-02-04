// src/components/cells/CartDropdown/CartDropdown.tsx
"use client"

import { Badge, Button } from "@/components/atoms"
import { CartDropdownItem, Dropdown } from "@/components/molecules"
import { usePrevious } from "@/hooks/usePrevious"
import { Link } from "@/i18n/routing"
import { CartIcon } from "@/icons"
import { convertToLocale } from "@/lib/helpers/money"
import { HttpTypes } from "@medusajs/types"
import { useContext, useEffect, useState, useRef } from "react"
import CartContext from "../../context/CartContext"

const getItemCount = (cart: HttpTypes.StoreCart | null | undefined) => {
  return cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
}

interface CartDropdownProps {
  cart?: HttpTypes.StoreCart | null
}

export const CartDropdown = ({
  cart: propCart,
}: CartDropdownProps) => {
  const [open, setOpen] = useState(false)
  const hasTriedRefresh = useRef(false) // ✅ Prevent infinite refresh
  
  // Safely check for cart context - don't throw error if not available
  const cartContext = useContext(CartContext)
  
  // Use context cart if available, otherwise fall back to prop cart
  const cart = cartContext?.cart || propCart
  const refreshCart = cartContext?.refreshCart
  const removeItem = cartContext?.removeItem

  // Force recalculation on every render to avoid stale closures
  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const previousItemCount = usePrevious(cartItemsCount)
  const total = convertToLocale({
    amount: cart?.item_total || 0,
    currency_code: cart?.currency_code || "eur",
  })

  // ✅ FIXED: Auto-refresh cart only ONCE on mount
  useEffect(() => {
    // Only refresh if:
    // 1. We have cart context
    // 2. No cart exists
    // 3. We haven't tried refreshing yet
    // 4. We're not currently loading
    if (cartContext && 
        !cartContext.cart && 
        !hasTriedRefresh.current && 
        !cartContext.isLoading &&
        refreshCart) {

      hasTriedRefresh.current = true
      refreshCart()
    }
  }, []) // ✅ Empty dependency array - only run on mount

  // ✅ Reset the refresh flag when we get a cart
  useEffect(() => {
    if (cartContext?.cart) {
      hasTriedRefresh.current = false
    }
  }, [cartContext?.cart])

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        setOpen(false)
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [open])

  useEffect(() => {
    if (previousItemCount !== undefined && cartItemsCount > previousItemCount) {
      setOpen(true)
    }
  }, [cartItemsCount, previousItemCount])

  return (
    <div
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link href="/cart" className="relative" aria-label={`Koszyk${cartItemsCount ? ` - ${cartItemsCount} ${cartItemsCount === 1 ? 'produkt' : 'produkty'}` : ' - pusty'}`}>
        <CartIcon size={20} />
        {Boolean(cartItemsCount) && (
          <Badge className="w-4 h-4 p-2">
            {cartItemsCount}
          </Badge>
        )}
      </Link>
      <Dropdown show={open}>
        <div className="lg:w-[460px] shadow-lg">
          <h3 className="uppercase heading-md border-b p-4">Koszyk</h3>
          <div className="p-4">
            {Boolean(cartItemsCount) ? (
              <div>
                <div className="overflow-y-scroll max-h-[360px] no-scrollbar">
                  {cart?.items?.map((item, index) => (
                    <CartDropdownItem
                      key={item.id || `cart-item-${index}`}
                      item={item}
                      currency_code={cart.currency_code}
                      onDeleted={() => {
                        // The removeItem is already called by DeleteCartItemButton
                        // This callback is just for additional UI updates if needed
                      }}
                    />
                  ))}
                </div>
                <div className="pt-4">
                  <div className="text-secondary flex justify-between items-center">
                    Suma <p className="label-xl text-primary">{total}</p>
                  </div>
                  <Link href="/cart" aria-label="Przejdź do strony koszyka">
                    <Button className="w-full mt-4 py-3">Przejdź do koszyka</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="px-8">
                <h4 className="heading-md uppercase text-center">
                  Twój koszyk jest pusty
                </h4>
                <p className="text-lg text-center py-4">
                 Szukasz inspiracji?
                </p>
                <Link href="/categories">
                  <Button className="w-full py-3">Przejdź do strony głównej</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Dropdown>
    </div>
  )
}