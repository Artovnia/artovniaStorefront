"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
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
import { Checkbox, Input } from "@/components/atoms"
import AddressSelect from "@/components/cells/AddressSelect/AddressSelect"
import CountrySelect from "@/components/cells/CountrySelect/CountrySelect"

export interface ShippingAddressRef {
  getFormData: () => Record<string, any>
}

const ShippingAddress = forwardRef<
  ShippingAddressRef,
  {
    customer: HttpTypes.StoreCustomer | null
    cart: HttpTypes.StoreCart | null
    checked: boolean
    onChange: () => void
  }
>(({ customer, cart, checked, onChange }, ref) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const lastCartEmailRef = useRef(cart?.email)
  const inputRefsMap = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(new Map())
  
  // ✅ FIXED: Track what we've already detected to prevent infinite loops
  const detectedValuesRef = useRef<Map<string, string>>(new Map())
  
  // ✅ FIXED: Track if autofill check has completed
  const autofillCheckCompleteRef = useRef(false)

  // Expose method to get current form data from DOM
  useImperativeHandle(ref, () => ({
    getFormData: () => {
      const currentData: Record<string, any> = {}
      inputRefsMap.current.forEach((input, fieldName) => {
        currentData[fieldName] = input.value
      })
      console.log("📋 Getting form data from DOM:", currentData)
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
        setFormData((prevState: Record<string, any>) => ({
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
        setFormData((prevState: Record<string, any>) => ({
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
      // Reset autofill check when cart changes
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

  const handleInputChange = useCallback((fieldName: string, value: string) => {
    console.log("📝 Input change:", fieldName, value)
    setHasUserInteracted(true)
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }, [])

  // ✅ FIXED: Autofill detection with completion flag
  useEffect(() => {
    // Skip if already completed
    if (autofillCheckCompleteRef.current) {
      return
    }

    const checkAutofill = () => {
      let hasChanges = false
      inputRefsMap.current.forEach((input, fieldName) => {
        if (input && input.value) {
          // Only update if value is different from what we've already detected
          const previousValue = detectedValuesRef.current.get(fieldName)
          if (input.value !== previousValue && input.value !== formData[fieldName]) {
            console.log("🔍 Autofill detected:", fieldName, input.value)
            detectedValuesRef.current.set(fieldName, input.value)
            hasChanges = true
            setFormData((prev) => ({
              ...prev,
              [fieldName]: input.value,
            }))
          }
        }
      })
      if (hasChanges) {
        setHasUserInteracted(true)
      }
    }

    // Check immediately
    checkAutofill()
    
    // ✅ FIXED: Limited polling (only 10 checks over 2 seconds)
    const checks = [50, 100, 200, 300, 500, 1000, 1500, 2000]
    const timeouts = checks.map(delay => 
      setTimeout(() => {
        if (!autofillCheckCompleteRef.current) {
          checkAutofill()
        }
      }, delay)
    )
    
    // ✅ Mark as complete after 2 seconds
    const completeTimeout = setTimeout(() => {
      autofillCheckCompleteRef.current = true
      console.log("✅ Autofill detection complete")
    }, 2000)

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(completeTimeout)
    }
  }, [formData]) // Only re-run if formData reference changes

  const registerInputRef = useCallback((fieldName: string) => {
    return (el: HTMLInputElement | HTMLSelectElement | null) => {
      if (el) {
        inputRefsMap.current.set(fieldName, el)
        
        // Check once on mount
        setTimeout(() => {
          if (!autofillCheckCompleteRef.current && el.value) {
            const previousValue = detectedValuesRef.current.get(fieldName)
            if (el.value !== previousValue && el.value !== formData[fieldName]) {
              console.log("🔍 Ref mount autofill:", fieldName, el.value)
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
  }, [formData])

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-0 font-instrument-sans">
          <p className="text-small-regular font-instrument-sans">
            {`Dzień dobry ${customer.first_name}, czy chcesz użyć jeden z zapisanych adresów?`}
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
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4 font-instrument-sans">
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
          data-testid="shipping-first-name-input"
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
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Adres"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          changeValue={(value) =>
            handleInputChange("shipping_address.address_1", value)
          }
          ref={registerInputRef("shipping_address.address_1")}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label="Firma"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          changeValue={(value) =>
            handleInputChange("shipping_address.company", value)
          }
          ref={registerInputRef("shipping_address.company")}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
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
          data-testid="shipping-postal-code-input"
        />
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
          data-testid="shipping-city-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={(e) => {
            console.log("🌍 Country changed to:", e.target.value)
            handleInputChange(
              "shipping_address.country_code",
              e.target.value
            )
          }}
          ref={registerInputRef("shipping_address.country_code")}
          required
          data-testid="shipping-country-select"
        />
        <Input
          label="Województwo"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          changeValue={(value) =>
            handleInputChange("shipping_address.province", value)
          }
          ref={registerInputRef("shipping_address.province")}
          data-testid="shipping-province-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          changeValue={(value) => handleInputChange("email", value)}
          ref={registerInputRef("email")}
          required
          data-testid="shipping-email-input"
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
          data-testid="shipping-phone-input"
        />
      </div>
    </>
  )
})

ShippingAddress.displayName = "ShippingAddress"

export default ShippingAddress