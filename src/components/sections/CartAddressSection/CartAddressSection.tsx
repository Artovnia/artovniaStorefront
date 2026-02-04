"use client"

import { Heading, Text, useToggleState } from "@medusajs/ui"
import { setAddresses } from "@/lib/data/cart"
import compareAddresses from "@/lib/helpers/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter } from "@/i18n/routing"
import { useSearchParams } from "next/navigation"
import { useEffect, useCallback, useMemo, useState, useRef } from "react"
import { Button } from "@/components/atoms"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { Loader2, MapPin, Check, ChevronDown } from "lucide-react"
import ShippingAddress, {
  ShippingAddressRef,
} from "@/components/organisms/ShippingAddress/ShippingAddress"
import { useCart } from "@/components/context/CartContext"

const validateNIP = (nip: string): boolean => {
  if (!nip) return true
  let cleanNip = nip.toUpperCase().replace(/^PL/, "")
  cleanNip = cleanNip.replace(/[\s\-\.]/g, "")
  if (!/^\d{10}$/.test(cleanNip)) return false
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const digits = cleanNip.split("").map(Number)
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i]
  }
  const controlDigit = sum % 11
  return controlDigit !== 10 && controlDigit === digits[9]
}

// Step indicator component
const StepIndicator = ({
  number,
  isComplete,
  isActive,
}: {
  number: number
  isComplete: boolean
  isActive: boolean
}) => (
  <div
    className={`
      w-8 h-8 flex items-center justify-center text-sm font-medium
      transition-all duration-300
      ${
        isComplete
          ? "bg-plum text-cream-50"
          : isActive
            ? "bg-plum text-cream-50"
            : "bg-cream-200 text-plum-muted"
      }
    `}
  >
    {isComplete ? <Check size={16} /> : number}
  </div>
)

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

  const { cart, refreshCart, setAddress } = useCart()
  const sessionId = useRef(`session_${Date.now()}_${Math.random()}`)
  const activeCart = cart || propCart

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formResetKey, setFormResetKey] = useState(0)
  const shippingAddressRef = useRef<ShippingAddressRef>(null)

  const isAddress = useMemo(
    () =>
      Boolean(
        activeCart?.shipping_address &&
          activeCart?.shipping_address.first_name &&
          activeCart?.shipping_address.last_name &&
          activeCart?.shipping_address.address_1 &&
          activeCart?.shipping_address.city &&
          activeCart?.shipping_address.postal_code &&
          activeCart?.shipping_address.country_code
      ),
    [activeCart?.shipping_address]
  )

  const isOpen = searchParams.get("step") === "address" || !isAddress

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    activeCart?.shipping_address && activeCart?.billing_address
      ? compareAddresses(
          activeCart?.shipping_address,
          activeCart?.billing_address
        )
      : true
  )

  const handleAddressSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!activeCart?.id) {
        setError("Nie znaleziono aktywnego koszyka")
        return
      }

      setIsSubmitting(true)
      setError(null)

      try {
        const formData = shippingAddressRef.current?.getFormData()

        if (!formData) {
          throw new Error("Nie można odczytać danych formularza")
        }

        const nip = formData["billing_address.metadata.nip"] || ""
        const wantInvoice =
          formData["billing_address.metadata.want_invoice"] === true ||
          formData["billing_address.metadata.want_invoice"] === "true" ||
          !!nip

        if (nip && !validateNIP(nip)) {
          throw new Error("Nieprawidłowy NIP")
        }

        const companyName = formData["shipping_address.company"] || ""
        if (nip && !companyName.trim()) {
          throw new Error("Nazwa firmy jest wymagana przy podaniu NIP")
        }

        const addressData: any = {
          email: formData.email || activeCart.email || "",
          shipping_address: {
            first_name: formData["shipping_address.first_name"] || "",
            last_name: formData["shipping_address.last_name"] || "",
            address_1: formData["shipping_address.address_1"] || "",
            address_2: formData["shipping_address.address_2"] || "",
            company: formData["shipping_address.company"] || "",
            city: formData["shipping_address.city"] || "",
            postal_code: formData["shipping_address.postal_code"] || "",
            country_code: formData["shipping_address.country_code"] || "",
            province: formData["shipping_address.province"] || "",
            phone: formData["shipping_address.phone"] || "",
          },
          billing_address: {
            // Use dedicated billing address fields from form
            first_name: formData["billing_address.first_name"] || "",
            last_name: formData["billing_address.last_name"] || "",
            address_1: formData["billing_address.address_1"] || "",
            address_2: formData["billing_address.address_2"] || "",
            company: formData["billing_address.company"] || "",
            city: formData["billing_address.city"] || "",
            postal_code: formData["billing_address.postal_code"] || "",
            country_code: formData["billing_address.country_code"] || "",
            province: formData["billing_address.province"] || "",
            phone: formData["billing_address.phone"] || "",
            metadata: {
              want_invoice: wantInvoice,
              nip: nip,
              is_company: !!nip,
            },
          },
        }

        if (
          !addressData.email ||
          !addressData.shipping_address.first_name ||
          !addressData.shipping_address.last_name ||
          !addressData.shipping_address.address_1 ||
          !addressData.shipping_address.country_code ||
          !addressData.shipping_address.city ||
          !addressData.shipping_address.postal_code
        ) {
          throw new Error("Proszę wypełnić wszystkie wymagane pola")
        }

        await setAddress(addressData)
        await refreshCart("address")
        await new Promise((resolve) => setTimeout(resolve, 100))

        const updatedCart = await import("@/lib/data/cart").then((m) =>
          m.retrieveCart(activeCart.id)
        )
        if (!updatedCart?.shipping_address?.first_name) {
          throw new Error("Adres nie został zapisany")
        }

        setFormResetKey((prev) => prev + 1)
        router.replace(`/checkout?step=delivery`)
      } catch (error: any) {
        console.error("❌ Error setting address:", error)
        setError(error.message || "Nie udało się zapisać adresu")
      } finally {
        setIsSubmitting(false)
      }
    },
    [activeCart?.id, activeCart?.email, router, setAddress, refreshCart]
  )

  useEffect(() => {
    if (!isAddress && !isSubmitting) {
      router.replace(pathname + "?step=address")
    }
  }, [isAddress, router, pathname, isSubmitting])

  const handleEdit = useCallback(() => {
    setFormResetKey((prev) => prev + 1)
    setError(null)
    router.replace(pathname + "?step=address")
  }, [router, pathname])

  return (
    <div className="bg-cream-100 border border-cream-300 overflow-hidden">
      {/* Section Header */}
      <div
        className={`
          flex items-center justify-between px-6 py-5
          border-b border-cream-200
          ${isOpen ? "bg-cream-100" : "bg-cream-200/50"}
        `}
      >
        <div className="flex items-center gap-4">
          <StepIndicator number={1} isComplete={isAddress} isActive={isOpen} />
          <div>
            <h2 className="text-lg font-medium text-plum tracking-wide">
              Adres dostawy
            </h2>
            {!isOpen && isAddress && activeCart?.shipping_address && (
              <p className="text-sm text-plum-muted mt-0.5">
                {activeCart.shipping_address.first_name}{" "}
                {activeCart.shipping_address.last_name},{" "}
                {activeCart.shipping_address.city}
              </p>
            )}
          </div>
        </div>

        {!isOpen && isAddress && (
          <button
            onClick={handleEdit}
            className="text-sm text-plum hover:text-plum-light underline underline-offset-4 transition-colors"
          >
            Edytuj
          </button>
        )}
      </div>

      {/* Section Content */}
      <form onSubmit={handleAddressSubmit}>
        {isOpen ? (
          <div className="p-6">
            <ShippingAddress
              ref={shippingAddressRef}
              key={`shipping-${activeCart?.id}-${sessionId.current}-${formResetKey}`}
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={activeCart}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                mt-6 w-full py-4 px-6
                bg-plum text-cream-50 text-sm font-medium tracking-wide uppercase
                border-none cursor-pointer
                transition-all duration-200
                hover:bg-plum-dark
                disabled:bg-plum-muted disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                "Kontynuuj do dostawy"
              )}
            </button>
          </div>
        ) : (
          /* Collapsed View */
          isAddress &&
          activeCart?.shipping_address && (
            <div className="px-6 py-4 bg-cream-100/30">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-plum-muted mt-0.5 shrink-0" />
                <div className="text-sm text-plum">
                  <p className="font-medium">
                    {activeCart.shipping_address.first_name}{" "}
                    {activeCart.shipping_address.last_name}
                  </p>
                  <p className="text-plum-muted">
                    {activeCart.shipping_address.address_1}
                    {activeCart.shipping_address.address_2 &&
                      `, ${activeCart.shipping_address.address_2}`}
                  </p>
                  <p className="text-plum-muted">
                    {activeCart.shipping_address.postal_code}{" "}
                    {activeCart.shipping_address.city}
                  </p>
                  <p className="text-plum-muted mt-2">
                    {activeCart.email}
                    {activeCart.shipping_address.phone &&
                      ` • ${activeCart.shipping_address.phone}`}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </form>
    </div>
  )
}