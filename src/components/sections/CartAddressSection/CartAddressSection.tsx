"use client"

import { Heading, Text, useToggleState } from "@medusajs/ui"
import { useCart } from "@/lib/context/CartContext"
import compareAddresses from "@/lib/helpers/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useEffect, useCallback, useMemo, useState } from "react"
import { Button } from "@/components/atoms"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import Spinner from "@/icons/spinner"
import ShippingAddress from "@/components/organisms/ShippingAddress/ShippingAddress"
import CheckCircleSolidFixed from "@/components/atoms/icons/CheckCircleSolidFixed"
import { CheckCircleSolid } from "@medusajs/icons"
import { Link } from "@/i18n/routing"

export const CartAddressSection = ({
  cart: propCart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const { cart: contextCart, setAddress, refreshCart } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Use context cart if available, fallback to prop cart
  const cart = contextCart || propCart
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Handle address form submission
  const handleAddressSubmit = useCallback(async (formData: FormData) => {
    if (!cart?.id) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Extract address data from form
      const addressData = {
        shipping_address: {
          first_name: formData.get('shipping_address.first_name') as string,
          last_name: formData.get('shipping_address.last_name') as string,
          address_1: formData.get('shipping_address.address_1') as string,
          address_2: formData.get('shipping_address.address_2') as string || '',
          city: formData.get('shipping_address.city') as string,
          postal_code: formData.get('shipping_address.postal_code') as string,
          country_code: formData.get('shipping_address.country_code') as string,
          phone: formData.get('shipping_address.phone') as string || '',
        },
        billing_address: sameAsBilling ? undefined : {
          first_name: formData.get('billing_address.first_name') as string,
          last_name: formData.get('billing_address.last_name') as string,
          address_1: formData.get('billing_address.address_1') as string,
          address_2: formData.get('billing_address.address_2') as string || '',
          city: formData.get('billing_address.city') as string,
          postal_code: formData.get('billing_address.postal_code') as string,
          country_code: formData.get('billing_address.country_code') as string,
          phone: formData.get('billing_address.phone') as string || '',
        }
      }
      
      await setAddress(addressData)
      // Refresh cart with address context for optimized data loading
      await refreshCart('address')
      router.replace(`/checkout?step=delivery`)
    } catch (error: any) {
      console.error('Error setting address:', error)
      setError(error.message || 'Failed to save address')
    } finally {
      setIsSubmitting(false)
    }
  }, [cart?.id, sameAsBilling, setAddress, refreshCart, router])

  useEffect(() => {
    if (!isAddress && !isSubmitting) {
      router.replace(pathname + "?step=address")
    }
  }, [isAddress, router, pathname, isSubmitting])

  // Memoize handleEdit to prevent unnecessary re-renders
  const handleEdit = useCallback(() => {
    router.replace(pathname + "?step=address")
  }, [router, pathname])

  return (
    <div className="border p-4 rounded-sm bg-ui-bg-interactive">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-center"
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
        action={handleAddressSubmit}
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
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
            <ErrorMessage
              error={error}
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