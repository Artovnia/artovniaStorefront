"use client"

import { HttpTypes } from "@medusajs/types"
import { mapKeys } from "lodash"
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react"
import { Input } from "@/components/atoms"
import AddressSelect from "@/components/cells/AddressSelect/AddressSelect"
import CountrySelect from "@/components/cells/CountrySelect/CountrySelect"
import { Building2, Receipt } from "lucide-react"

const validateNIP = (nip: string): { isValid: boolean; error?: string } => {
  if (!nip) return { isValid: true }
  let cleanNip = nip.toUpperCase().replace(/^PL/, "")
  cleanNip = cleanNip.replace(/[\s\-\.]/g, "")
  if (!/^\d+$/.test(cleanNip)) {
    return { isValid: false, error: "NIP może zawierać tylko cyfry" }
  }
  if (cleanNip.length !== 10) {
    return { isValid: false, error: "NIP musi mieć dokładnie 10 cyfr" }
  }
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const digits = cleanNip.split("").map(Number)
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i]
  }
  const controlDigit = sum % 11
  if (controlDigit === 10) {
    return { isValid: false, error: "Nieprawidłowy NIP" }
  }
  if (controlDigit !== digits[9]) {
    return { isValid: false, error: "Nieprawidłowy NIP" }
  }
  return { isValid: true }
}

export interface ShippingAddressRef {
  getFormData: () => Record<string, any>
}

// Custom Checkbox Component
const Checkbox = ({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: () => void
  label: string
  id: string
}) => (
  <label
    htmlFor={id}
    className="flex items-center gap-3 cursor-pointer group"
  >
    <div
      className={`
        w-5 h-5 border-2 flex items-center justify-center
        transition-all duration-200
        ${
          checked
            ? "bg-plum border-plum"
            : "bg-cream-50 border-cream-300 group-hover:border-plum-muted"
        }
      `}
    >
      {checked && (
        <svg
          width="12"
          height="10"
          viewBox="0 0 12 10"
          fill="none"
          className="text-cream-50"
        >
          <path
            d="M1 5L4.5 8.5L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span className="text-sm text-plum">{label}</span>
  </label>
)

const ShippingAddress = forwardRef<
  ShippingAddressRef,
  {
    customer: HttpTypes.StoreCustomer | null
    cart: HttpTypes.StoreCart | null
    checked: boolean
    onChange: () => void
  }
>(({ customer, cart, checked, onChange }, ref) => {
  const billingMetadata = (cart?.billing_address as any)?.metadata || {}
  const cartMetadata = (cart?.metadata as any) || {}

  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code":
      cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
    "billing_address.metadata.nip":
      billingMetadata.nip || cartMetadata.nip || "",
    "billing_address.metadata.want_invoice":
      billingMetadata.want_invoice || cartMetadata.want_invoice || false,
  })

  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [nipError, setNipError] = useState<string | null>(null)
  const [companyError, setCompanyError] = useState<string | null>(null)
  const lastCartEmailRef = useRef(cart?.email)
  const inputRefsMap = useRef<
    Map<string, HTMLInputElement | HTMLSelectElement>
  >(new Map())
  const detectedValuesRef = useRef<Map<string, string>>(new Map())
  const autofillCheckCompleteRef = useRef(false)

  useEffect(() => {
    const newBillingMetadata = (cart?.billing_address as any)?.metadata || {}
    const newCartMetadata = (cart?.metadata as any) || {}
    const newNip = newBillingMetadata.nip || newCartMetadata.nip || ""
    const newWantInvoice =
      newBillingMetadata.want_invoice || newCartMetadata.want_invoice || false

    if (!hasUserInteracted) {
      setFormData((prev) => ({
        ...prev,
        "billing_address.metadata.nip": newNip,
        "billing_address.metadata.want_invoice": newWantInvoice,
      }))
    }
  }, [cart?.billing_address, cart?.metadata, hasUserInteracted])

  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const currentData: Record<string, any> = {}
      inputRefsMap.current.forEach((input, fieldName) => {
        if (input instanceof HTMLInputElement && input.type === "checkbox") {
          currentData[fieldName] = input.checked
        } else {
          currentData[fieldName] = input.value
        }
      })
      currentData["billing_address.metadata.want_invoice"] =
        formData["billing_address.metadata.want_invoice"]
      currentData["billing_address.metadata.nip"] =
        formData["billing_address.metadata.nip"]
      return currentData
    },
  }))

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = useCallback(
    (address?: HttpTypes.StoreCartAddress, email?: string) => {
      address &&
        setFormData((prevState) => ({
          ...prevState,
          "shipping_address.first_name": address?.first_name || "",
          "shipping_address.last_name": address?.last_name || "",
          "shipping_address.address_1": address?.address_1 || "",
          "shipping_address.company": address?.company || "",
          "shipping_address.postal_code": address?.postal_code || "",
          "shipping_address.city": address?.city || "",
          "shipping_address.country_code": address?.country_code || "",
          "shipping_address.province": address?.province || "",
          "shipping_address.phone": address?.phone || "",
        }))

      email &&
        setFormData((prevState) => ({
          ...prevState,
          email: email,
        }))
    },
    []
  )

  useEffect(() => {
    const cartEmailChanged = cart?.email !== lastCartEmailRef.current
    if (cartEmailChanged) {
      lastCartEmailRef.current = cart?.email
      setHasUserInteracted(false)
      autofillCheckCompleteRef.current = false
      detectedValuesRef.current.clear()
    }
    if (!hasUserInteracted) {
      if (cart && cart.shipping_address) {
        setFormAddress(cart?.shipping_address, cart?.email)
      }
      if (cart && !cart.email && customer?.email) {
        setFormAddress(undefined, customer.email)
      }
    }
  }, [cart, setFormAddress, customer, hasUserInteracted])

  const handleInputChange = useCallback(
    (fieldName: string, value: string | boolean) => {
      setHasUserInteracted(true)
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }))
    },
    []
  )

  const registerInputRef = useCallback(
    (fieldName: string) => {
      return (el: HTMLInputElement | HTMLSelectElement | null) => {
        if (el) {
          inputRefsMap.current.set(fieldName, el)
          setTimeout(() => {
            if (!autofillCheckCompleteRef.current && el.value) {
              const previousValue = detectedValuesRef.current.get(fieldName)
              if (
                el.value !== previousValue &&
                el.value !== formData[fieldName]
              ) {
                detectedValuesRef.current.set(fieldName, el.value)
                setFormData((prev) => ({
                  ...prev,
                  [fieldName]: el.value,
                }))
                setHasUserInteracted(true)
              }
            }
          }, 100)
        } else {
          inputRefsMap.current.delete(fieldName)
        }
      }
    },
    [formData]
  )

  return (
    <div className="space-y-8">
      {/* Saved Addresses */}
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <div className="p-4 bg-cream-100 border border-cream-200">
          <p className="text-sm text-plum mb-3">
            Witaj {customer.first_name}! Wybierz zapisany adres:
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </div>
      )}

      {/* Personal Information */}
      <div>
        <h3 className="text-sm font-medium text-plum uppercase tracking-wider mb-4">
          Dane osobowe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Imię"
            name="shipping_address.first_name"
            autoComplete="given-name"
            value={formData["shipping_address.first_name"]}
            changeValue={(value) =>
              handleInputChange("shipping_address.first_name", value)
            }
            ref={registerInputRef("shipping_address.first_name")}
            required
          />
          <Input
            label="Nazwisko"
            name="shipping_address.last_name"
            autoComplete="family-name"
            value={formData["shipping_address.last_name"]}
            changeValue={(value) =>
              handleInputChange("shipping_address.last_name", value)
            }
            ref={registerInputRef("shipping_address.last_name")}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            changeValue={(value) => handleInputChange("email", value)}
            ref={registerInputRef("email")}
            required
          />
          <Input
            label="Telefon"
            name="shipping_address.phone"
            autoComplete="tel"
            value={formData["shipping_address.phone"]}
            changeValue={(value) =>
              handleInputChange("shipping_address.phone", value)
            }
            ref={registerInputRef("shipping_address.phone")}
          />
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <h3 className="text-sm font-medium text-plum uppercase tracking-wider mb-4">
          Adres dostawy
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Ulica i numer"
            name="shipping_address.address_1"
            autoComplete="address-line1"
            value={formData["shipping_address.address_1"]}
            changeValue={(value) =>
              handleInputChange("shipping_address.address_1", value)
            }
            ref={registerInputRef("shipping_address.address_1")}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Kod pocztowy"
              name="shipping_address.postal_code"
              autoComplete="postal-code"
              value={formData["shipping_address.postal_code"]}
              changeValue={(value) =>
                handleInputChange("shipping_address.postal_code", value)
              }
              ref={registerInputRef("shipping_address.postal_code")}
              required
            />
            <div className="sm:col-span-2">
              <Input
                label="Miasto"
                name="shipping_address.city"
                autoComplete="address-level2"
                value={formData["shipping_address.city"]}
                changeValue={(value) =>
                  handleInputChange("shipping_address.city", value)
                }
                ref={registerInputRef("shipping_address.city")}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Województwo"
              name="shipping_address.province"
              autoComplete="address-level1"
              value={formData["shipping_address.province"]}
              changeValue={(value) =>
                handleInputChange("shipping_address.province", value)
              }
              ref={registerInputRef("shipping_address.province")}
            />
            <div>
              <label className="block text-xs text-plum mb-1.5">
                Kraj <span className="text-accent-copper">*</span>
              </label>
              <CountrySelect
                name="shipping_address.country_code"
                autoComplete="country"
                region={cart?.region}
                value={formData["shipping_address.country_code"]}
                onChange={(e) => {
                  handleInputChange(
                    "shipping_address.country_code",
                    e.target.value
                  )
                }}
                ref={registerInputRef("shipping_address.country_code")}
                required
                className="w-full px-4 py-3.5 bg-cream-50 text-plum border border-cream-300 text-sm focus:outline-none focus:border-plum"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Section */}
      <div className="border-t border-cream-200 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt size={18} className="text-plum-muted" />
          <h3 className="text-sm font-medium text-plum uppercase tracking-wider">
            Faktura VAT
          </h3>
        </div>

        <Checkbox
          id="want-invoice"
          checked={formData["billing_address.metadata.want_invoice"] === true}
          onChange={() => {
            const newValue = !formData["billing_address.metadata.want_invoice"]
            handleInputChange(
              "billing_address.metadata.want_invoice",
              newValue
            )
          }}
          label="Chcę otrzymać fakturę VAT"
        />

        {formData["billing_address.metadata.want_invoice"] && (
          <div className="mt-4 p-4 bg-cream-100 border border-cream-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="NIP"
                  name="billing_address.metadata.nip"
                  value={formData["billing_address.metadata.nip"]}
                  changeValue={(value) => {
                    let cleanedNip = value.toUpperCase().replace(/^PL/, "")
                    cleanedNip = cleanedNip.replace(/[\s\-\.]/g, "")
                    cleanedNip = cleanedNip.replace(/[^\d]/g, "")
                    handleInputChange("billing_address.metadata.nip", cleanedNip)
                    const validation = validateNIP(cleanedNip)
                    setNipError(validation.error || null)
                  }}
                  ref={registerInputRef("billing_address.metadata.nip")}
                  placeholder="np. 1234567890"
                  maxLength={10}
                  error={nipError || undefined}
                />
              </div>
              <Input
                label="Nazwa firmy"
                name="shipping_address.company"
                value={formData["shipping_address.company"]}
                changeValue={(value) => {
                  handleInputChange("shipping_address.company", value)
                  if (value && companyError) {
                    setCompanyError(null)
                  }
                }}
                ref={registerInputRef("shipping_address.company")}
                autoComplete="organization"
                required={!!formData["billing_address.metadata.nip"]}
                error={companyError || undefined}
              />
            </div>
            <p className="text-xs text-plum-muted">
              Faktura zostanie wystawiona na powyższe dane.
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

ShippingAddress.displayName = "ShippingAddress"

export default ShippingAddress