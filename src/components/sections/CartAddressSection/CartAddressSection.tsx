"use client"

import { Heading, Text, useToggleState } from "@medusajs/ui"
import { setAddresses } from "@/lib/data/cart"
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
import { useCart } from "@/components/context/CartContext"

export const CartAddressSection = ({
  cart: propCart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Use cart context for live updates
  const { cart, refreshCart, setAddress, lastUpdated } = useCart()
  
  // Fallback to prop cart if context cart is not available
  const activeCart = cart || propCart
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formResetKey, setFormResetKey] = useState(0)

  // Memoize address validation to prevent unnecessary recalculations
  const isAddress = useMemo(() => Boolean(
    activeCart?.shipping_address &&
      activeCart?.shipping_address.first_name &&
      activeCart?.shipping_address.last_name &&
      activeCart?.shipping_address.address_1 &&
      activeCart?.shipping_address.city &&
      activeCart?.shipping_address.postal_code &&
      activeCart?.shipping_address.country_code
  ), [activeCart?.shipping_address])
  const isOpen = searchParams.get("step") === "address" || !isAddress

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    activeCart?.shipping_address && activeCart?.billing_address
      ? compareAddresses(activeCart?.shipping_address, activeCart?.billing_address)
      : true
  )

  // Handle address form submission
  const handleAddressSubmit = useCallback(async (formData: FormData) => {
    if (!activeCart?.id) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Extract address data from form
      const addressData = {
        email: formData.get('email') as string,
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
      
      // Use cart context setAddress method for proper state management
      await setAddress(addressData)
      
      // Refresh cart to get updated shipping methods
      await refreshCart('address')
      
      // Force form reset on next render
      setFormResetKey(prev => prev + 1)
      
      // Navigate to delivery step
      router.replace(`/checkout?step=delivery`)
    } catch (error: any) {
      console.error('Error setting address:', error)
      setError(error.message || 'Failed to save address')
    } finally {
      setIsSubmitting(false)
    }
  }, [activeCart?.id, sameAsBilling, router, setAddress, refreshCart])

  useEffect(() => {
    if (!isAddress && !isSubmitting) {
      router.replace(pathname + "?step=address")
    }
  }, [isAddress, router, pathname, isSubmitting])

  // Memoize handleEdit to prevent unnecessary re-renders
  const handleEdit = useCallback(() => {
    // Force form reset when editing
    setFormResetKey(prev => prev + 1)
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
              key={`shipping-${activeCart?.id}-${activeCart?.email}-${lastUpdated}-${formResetKey}`}
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={activeCart}
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
              {activeCart && activeCart.shipping_address ? (
                <div className="flex items-start gap-x-8">
                  <div className="flex items-start gap-x-1 w-full">
                    <div>
                      <Text className="txt-medium-plus font-bold">
                        {activeCart.shipping_address.first_name}{" "}
                        {activeCart.shipping_address.last_name}
                      </Text>
                      <Text>
                        {activeCart.shipping_address.address_1}{" "}
                        {activeCart.shipping_address.address_2},{" "}
                        {activeCart.shipping_address.postal_code}{" "}
                        {activeCart.shipping_address.city},{" "}
                        {activeCart.shipping_address.country_code?.toUpperCase()}
                      </Text>
                      <Text>
                        {activeCart.email}, {activeCart.shipping_address.phone}
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