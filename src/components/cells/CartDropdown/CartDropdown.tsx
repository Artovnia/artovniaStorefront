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

interface CartDropdownProps {
  cart?: HttpTypes.StoreCart | null
}

export const CartDropdown = ({ cart: propCart }: CartDropdownProps) => {
  const [open, setOpen] = useState(false)
  const hasTriedRefresh = useRef(false)

  const cartContext = useContext(CartContext)

  const cart = cartContext?.cart || propCart
  const refreshCart = cartContext?.refreshCart
  const removeItem = cartContext?.removeItem

  const cartItemsCount =
    cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const previousItemCount = usePrevious(cartItemsCount)
  const total = convertToLocale({
    amount: cart?.item_total || 0,
    currency_code: cart?.currency_code || "pln",
  })

  useEffect(() => {
    if (
      cartContext &&
      !cartContext.cart &&
      !hasTriedRefresh.current &&
      !cartContext.isLoading &&
      refreshCart
    ) {
      hasTriedRefresh.current = true
      refreshCart()
    }
  }, [])

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
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <Link
        href="/cart"
        className="relative"
        aria-label={`Koszyk${cartItemsCount ? ` - ${cartItemsCount} ${cartItemsCount === 1 ? "produkt" : "produkty"}` : " - pusty"}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <CartIcon size={20} />
        {Boolean(cartItemsCount) && (
          <Badge className="h-4 w-4 p-2">{cartItemsCount}</Badge>
        )}
      </Link>
      <Dropdown show={open}>
        <div
          className="w-full shadow-lg lg:w-[460px]"
          role="region"
          aria-label="Podgląd koszyka"
          aria-live="polite"
        >
          <h3 className="heading-md border-b p-4 uppercase">Koszyk</h3>
          <div className="p-4">
            {Boolean(cartItemsCount) ? (
              <div>
                <div className="no-scrollbar max-h-[360px] overflow-y-scroll">
                  {cart?.items?.map((item, index) => (
                    <CartDropdownItem
                      key={item.id || `cart-item-${index}`}
                      item={item}
                      currency_code={cart.currency_code}
                      onDeleted={() => {}}
                    />
                  ))}
                </div>
                <div className="pt-4">
                  <div className="text-secondary flex items-center justify-between">
                    Suma{" "}
                    <p className="label-xl text-primary">{total}</p>
                  </div>
                  <Link href="/cart" aria-label="Przejdź do strony koszyka">
                    <Button className="mt-4 w-full py-3">
                      Przejdź do koszyka
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="px-8">
                <h4 className="heading-md text-center uppercase">
                  Twój koszyk jest pusty
                </h4>
                <p className="py-4 text-center text-lg">
                  Szukasz inspiracji?
                </p>
                <Link href="/categories" aria-label="Przeglądaj produkty">
                  <Button className="w-full py-3">
                    Przejdź do strony głównej
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Dropdown>
    </div>
  )
}