"use client"

import { Badge, Button } from "@/components/atoms"
import { CartDropdownItem, Dropdown } from "@/components/molecules"
import { usePrevious } from "@/hooks/usePrevious"
import { Link } from "@/i18n/routing"
import { CartIcon } from "@/icons"
import { convertToLocale } from "@/lib/helpers/money"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"
import { useCart } from "@/lib/context/CartContext"

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
  const { cart: contextCart, refreshCart, removeItem, lastUpdated } = useCart()
  
  // Always use context cart for real-time updates - ignore prop cart completely
  const cart = contextCart

  // Force recalculation on every render to avoid stale closures
  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const previousItemCount = usePrevious(cartItemsCount)

  const total = convertToLocale({
    amount: cart?.item_total || 0,
    currency_code: cart?.currency_code || "eur",
  })

  // Auto-refresh cart on mount to ensure we have cart data
  useEffect(() => {
    if (!contextCart) {
      refreshCart()
    }
  }, [contextCart, refreshCart])



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
      <Link href="/cart" className="relative">
        <CartIcon size={20} />
        {Boolean(cartItemsCount) && (
          <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0">
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
                  {cart?.items?.map((item) => (
                    <CartDropdownItem
                      key={item.id}
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
                  <Link href="/cart">
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
