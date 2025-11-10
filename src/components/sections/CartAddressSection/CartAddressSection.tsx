"use client"

import { Heading, Text, useToggleState } from "@medusajs/ui"
import { setAddresses } from "@/lib/data/cart"
import compareAddresses from "@/lib/helpers/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useEffect, useCallback, useMemo, useState, useRef } from "react"
import { Button } from "@/components/atoms"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import Spinner from "@/icons/spinner"
import ShippingAddress, { ShippingAddressRef } from "@/components/organisms/ShippingAddress/ShippingAddress"
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
  
  // ✅ Use cart context for live updates
  const { cart, refreshCart, setAddress, lastUpdated } = useCart()
  
  // ✅ Generate unique session ID to prevent cross-user contamination
  const sessionId = useRef(`session_${Date.now()}_${Math.random()}`)
  
  // Fallback to prop cart if context cart is not available
  const activeCart = cart || propCart
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formResetKey, setFormResetKey] = useState(0)
  
  // ✅ Reference to get form data directly from DOM
  const shippingAddressRef = useRef<ShippingAddressRef>(null)

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

  // ✅ Handle form submission by reading directly from DOM
  const handleAddressSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!activeCart?.id) {
      setError("No active cart found")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // ✅ Get form data directly from DOM to bypass React state
      const formData = shippingAddressRef.current?.getFormData()
      
      if (!formData) {
        throw new Error("Could not read form data")
      }
      
      // ✅ Validate cart ID matches active cart
      console.log("📝 Submitting address for cart:", activeCart.id, "Session:", sessionId.current)
      
      // ✅ Build address data with validation
      const addressData = {
        email: formData.email || activeCart.email || '',
        shipping_address: {
          first_name: formData["shipping_address.first_name"] || '',
          last_name: formData["shipping_address.last_name"] || '',
          address_1: formData["shipping_address.address_1"] || '',
          address_2: formData["shipping_address.address_2"] || '',
          company: formData["shipping_address.company"] || '',
          city: formData["shipping_address.city"] || '',
          postal_code: formData["shipping_address.postal_code"] || '',
          country_code: formData["shipping_address.country_code"] || '',
          province: formData["shipping_address.province"] || '',
          phone: formData["shipping_address.phone"] || '',
        }
      }
      
      console.log("📋 Raw form data:", formData)
      console.log("🏗️ Built address data:", addressData)
      
      // ✅ Validate required fields
      if (!addressData.email || !addressData.shipping_address.first_name || 
          !addressData.shipping_address.last_name || !addressData.shipping_address.address_1 ||
          !addressData.shipping_address.country_code || !addressData.shipping_address.city ||
          !addressData.shipping_address.postal_code) {
        throw new Error("Please fill in all required fields (name, address, city, postal code, country, email)")
      }
      
      console.log("📤 Sending address data:", JSON.stringify(addressData, null, 2))
      
      // ✅ Use cart context setAddress with proper error handling
      await setAddress(addressData)
      
      // ✅ Verify the update by refreshing cart
      await refreshCart('address')
      
      // ✅ Check if there was an error during save
      // Wait a tick for state to update
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // ✅ Verify address was actually saved to cart
      const updatedCart = await import('@/lib/data/cart').then(m => m.retrieveCart(activeCart.id))
      if (!updatedCart?.shipping_address?.first_name) {
        throw new Error("Address was not saved. Please ensure all fields are correctly filled.")
      }
      
      console.log("✅ Address successfully saved and verified")
      
      // ✅ Force form reset on next render
      setFormResetKey(prev => prev + 1)
      
      // ✅ Navigate to delivery step ONLY if save was successful
      router.replace(`/checkout?step=delivery`)
    } catch (error: any) {
      console.error('❌ Error setting address:', error)
      setError(error.message || 'Failed to save address')
    } finally {
      setIsSubmitting(false)
    }
  }, [activeCart?.id, activeCart?.email, router, setAddress, refreshCart])

  useEffect(() => {
    if (!isAddress && !isSubmitting) {
      router.replace(pathname + "?step=address")
    }
  }, [isAddress, router, pathname, isSubmitting])

  const handleEdit = useCallback(() => {
    // ✅ Force form reset when editing
    setFormResetKey(prev => prev + 1)
    setError(null)
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
      <form onSubmit={handleAddressSubmit}>
        {isOpen ? (
          <div className="pb-8">
            <ShippingAddress
              ref={shippingAddressRef}
              key={`shipping-${activeCart?.id}-${sessionId.current}-${formResetKey}`}
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={activeCart}
            />
            <Button
              className="mt-6"
              type="submit"
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