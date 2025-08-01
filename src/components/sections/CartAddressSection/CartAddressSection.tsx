"use client"

import { Heading, Text, useToggleState } from "@medusajs/ui"
import { setAddresses, retrieveCartForAddress } from "@/lib/data/cart"
import compareAddresses from "@/lib/helpers/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/atoms"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import Spinner from "@/icons/spinner"
import ShippingAddress from "@/components/organisms/ShippingAddress/ShippingAddress"
import CheckCircleSolidFixed from "@/components/atoms/icons/CheckCircleSolidFixed"
import { CheckCircleSolid } from "@medusajs/icons"
import { Link } from "@/i18n/routing"

export const CartAddressSection = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Memoize address validation to prevent unnecessary recalculations
  const isAddress = useMemo(() => Boolean(
    cart?.shipping_address &&
      cart?.shipping_address.first_name &&
      cart?.shipping_address.last_name &&
      cart?.shipping_address.address_1 &&
      cart?.shipping_address.city &&
      cart?.shipping_address.postal_code &&
      cart?.shipping_address.country_code
  ), [cart?.shipping_address])
  const isOpen = searchParams.get("step") === "address" || !isAddress

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const [message, formAction, isPending] = useActionState(setAddresses, sameAsBilling)

  useEffect(() => {
    if (!isAddress) {
      router.replace(pathname + "?step=address")
    }
  }, [isAddress, router, pathname])

  // Memoize handleEdit to prevent unnecessary re-renders
  const handleEdit = useCallback(() => {
    router.replace(pathname + "?step=address")
  }, [router, pathname])

  return (
    <div className="border p-4 rounded-sm bg-ui-bg-interactive">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline items-center"
        >
          {!isOpen && <CheckCircleSolidFixed />} Adres dostawy
        </Heading>
        {!isOpen && isAddress && (
          <Text>
            <Button onClick={handleEdit} variant="tonal">
              Edytuj
            </Button>
          </Text>
        )}
      </div>
      <form
        action={async (data) => {
          await formAction(data)
          router.replace(`/checkout`)
        }}
      >
        {isOpen ? (
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />
            <Button
              className="mt-6"
              data-testid="submit-address-button"
              variant="tonal"
              loading={isPending}
              disabled={isPending}
            >
              {isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
            <ErrorMessage
              error={message !== "success" && message}
              data-testid="address-error-message"
            />
          </div>
        ) : (
          <div>
            <div className="text-small-regular">
              {cart && cart.shipping_address ? (
                <div className="flex items-start gap-x-8">
                  <div className="flex items-start gap-x-1 w-full">
                    <div>
                      <Text className="txt-medium-plus font-bold">
                        {cart.shipping_address.first_name}{" "}
                        {cart.shipping_address.last_name}
                      </Text>
                      <Text>
                        {cart.shipping_address.address_1}{" "}
                        {cart.shipping_address.address_2},{" "}
                        {cart.shipping_address.postal_code}{" "}
                        {cart.shipping_address.city},{" "}
                        {cart.shipping_address.country_code?.toUpperCase()}
                      </Text>
                      <Text>
                        {cart.email}, {cart.shipping_address.phone}
                      </Text>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Spinner />
                </div>
              )}
            </div>
          </div>
        )}
        {isAddress && !searchParams.get("step") && (
          <Link href="/checkout?step=delivery">
            <Button className="mt-6" variant="tonal">
              Kontunuuj do dostawy
            </Button>
          </Link>
        )}
      </form>
    </div>
  )
}