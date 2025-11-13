"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { verifyGuestOrder, createGuestReturnRequest, getGuestReturnShippingOptions, getGuestReturnReasons } from "@/lib/data/guest-returns"

interface OrderItem {
  id: string
  title: string
  variant_title?: string
  thumbnail?: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  display_id: string
  email: string
  items: OrderItem[]
  created_at: string
}

interface ReturnReason {
  id: string
  label: string
  value: string
}

const GuestReturnForm = () => {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const email = searchParams.get("email")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [itemReasons, setItemReasons] = useState<Record<string, string>>({})
  const [customerNote, setCustomerNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>("")
  const [returnReasons, setReturnReasons] = useState<ReturnReason[]>([])
  const [reasonsLoading, setReasonsLoading] = useState(true)

  useEffect(() => {
    if (!orderId || !email) {
      setError("Brak wymaganych parametrów (order_id i email)")
      setLoading(false)
      return
    }

    // Verify order and load details
    const verifyOrder = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await verifyGuestOrder({
          order_id: orderId!,
          email: email!,
        })

        if (!result || !result.order) {
          throw new Error("Nie można zweryfikować zamówienia")
        }

        setOrder(result.order as any)

        // Initialize quantities with item quantities
        const quantities: Record<string, number> = {}
        result.order.items.forEach((item: any) => {
          quantities[item.id] = item.quantity || 1
        })
        setItemQuantities(quantities)
        
        // Debug log
        console.log('Order items:', result.order.items)
        console.log('Initialized quantities:', quantities)

        // Fetch return reasons directly from backend (no auth required)
        try {
          const reasons = await getGuestReturnReasons()
          setReturnReasons(reasons)
        } catch (err) {
          console.error('Error fetching return reasons:', err)
        } finally {
          setReasonsLoading(false)
        }

        // Fetch return shipping options directly from backend (no auth required)
        try {
          const shippingOpts = await getGuestReturnShippingOptions(orderId!)
          console.log('Fetched shipping options:', shippingOpts)
          if (shippingOpts && shippingOpts.length > 0) {
            setShippingOptions(shippingOpts)
            setSelectedShippingOption(shippingOpts[0].id)
          } else {
            console.warn('No shipping options available for order:', orderId)
          }
        } catch (err) {
          console.error('Error fetching shipping options:', err)
        }
      } catch (err) {
        console.error('Guest return form error:', err)
        const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas ładowania formularza zwrotu"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    verifyOrder()
  }, [orderId, email])

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: quantity,
    }))
  }

  const handleReasonChange = (itemId: string, reasonId: string) => {
    setItemReasons((prev) => ({
      ...prev,
      [itemId]: reasonId,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedItems.size === 0) {
      setError("Wybierz przynajmniej jeden produkt do zwrotu")
      return
    }

    // Validate reasons
    for (const itemId of selectedItems) {
      if (!itemReasons[itemId]) {
        setError("Wybierz powód zwrotu dla wszystkich produktów")
        return
      }
    }

    // Validate shipping option
    if (!selectedShippingOption) {
      setError("Wybierz metodę zwrotu")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const lineItems = Array.from(selectedItems).map((lineItemId) => ({
        line_item_id: lineItemId,
        quantity: itemQuantities[lineItemId],
        reason_id: itemReasons[lineItemId],
      }))

      const result = await createGuestReturnRequest({
        order_id: orderId!,
        email: email!,
        line_items: lineItems,
        shipping_option_id: selectedShippingOption,
        customer_note: customerNote,
      })

      if (!result) {
        throw new Error("Nie udało się utworzyć zwrotu")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B3634] mx-auto mb-4"></div>
          <p className="text-gray-600 font-instrument-sans">
            Weryfikacja zamówienia...
          </p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="font-instrument-serif text-2xl mb-4 text-red-800">
            Błąd
          </h2>
          <p className="text-red-700 font-instrument-sans">{error}</p>
          <p className="text-red-600 font-instrument-sans text-sm mt-4">
            Sprawdź link w emailu lub skontaktuj się z obsługą klienta.
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#fff] border border-[#3B3634] rounded-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#3B3634] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="font-instrument-serif text-3xl mb-4 text-[#3B3634]">
              Zwrot zgłoszony!
            </h2>
            <p className="text-[#3B3634] font-instrument-sans mb-6">
              Twój wniosek o zwrot został pomyślnie utworzony. Sprzedawca
              rozpatrzy go w ciągu 2-3 dni roboczych.
            </p>
            <p className="text-[#3B3634] font-instrument-sans text-sm">
              Otrzymasz email z dalszymi instrukcjami.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-instrument-serif text-4xl md:text-5xl mb-4 font-normal italic text-[#3B3634]">
          Zgłoś zwrot zamówienia
        </h1>
        <p className="text-lg text-gray-600 font-instrument-sans">
          Zamówienie #{order.display_id}
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-instrument-sans">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Items Selection */}
        <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200">
          <h2 className="font-instrument-serif text-2xl mb-6 text-[#3B3634]">
            Wybierz produkty do zwrotu
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#3B3634] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id={`item-${item.id}`}
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleItemToggle(item.id)}
                    className="mt-1 w-5 h-5 text-[#3B3634] border-gray-300 rounded focus:ring-[#3B3634]"
                  />

                  <div className="flex-1">
                    <label
                      htmlFor={`item-${item.id}`}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        )}
                        <div>
                          <h3 className="font-instrument-sans font-semibold text-[#3B3634]">
                            {item.title}
                          </h3>
                          {item.variant_title && (
                            <p className="text-sm text-gray-600 font-instrument-sans">
                              {item.variant_title}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 font-instrument-sans">
                            Ilość: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </label>

                    {selectedItems.has(item.id) && (
                      <div className="mt-4 space-y-4 pl-6 border-l-2 border-[#3B3634]">
                        {/* Quantity Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 font-instrument-sans mb-2">
                            Ilość do zwrotu
                          </label>
                          <select
                            value={itemQuantities[item.id] || 1}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-32 border border-gray-300 rounded-md px-3 py-2 font-instrument-sans focus:ring-[#3B3634] focus:border-[#3B3634]"
                          >
                            {Array.from(
                              { length: item.quantity },
                              (_, i) => i + 1
                            ).map((qty) => (
                              <option key={qty} value={qty}>
                                {qty}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Reason Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 font-instrument-sans mb-2">
                            Powód zwrotu *
                          </label>
                          <select
                            value={itemReasons[item.id] || ""}
                            onChange={(e) =>
                              handleReasonChange(
                                item.id,
                                e.target.value
                              )
                            }
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 font-instrument-sans focus:ring-[#3B3634] focus:border-[#3B3634]"
                          >
                            <option value="">Wybierz powód...</option>
                            {returnReasons.map((reason) => (
                              <option key={reason.id} value={reason.id}>
                                {reason.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Method Selection */}
        <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200">
          <h2 className="font-instrument-serif text-2xl mb-6 text-[#3B3634]">
            Metoda zwrotu
          </h2>
          {shippingOptions.length === 0 ? (
            <p className="text-gray-600 font-instrument-sans">
              Brak dostępnych metod zwrotu
            </p>
          ) : (
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#3B3634] transition-colors"
                >
                  <input
                    type="radio"
                    name="shipping_option"
                    value={option.id}
                    checked={selectedShippingOption === option.id}
                    onChange={(e) => setSelectedShippingOption(e.target.value)}
                    className="w-5 h-5 text-[#3B3634] border-gray-300 focus:ring-[#3B3634]"
                  />
                  <span className="font-instrument-sans font-medium text-[#3B3634]">
                    {option.name === 'customer-shipping' ? 'Wysyłka przez klienta' : option.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Customer Note */}
        <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200">
          <h2 className="font-instrument-serif text-2xl mb-4 text-[#3B3634]">
            Dodatkowe informacje (opcjonalnie)
          </h2>
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            rows={4}
            placeholder="Dodaj notatkę dla sprzedawcy..."
            className="w-full border border-gray-300 rounded-md px-4 py-3 font-instrument-sans focus:ring-[#3B3634] focus:border-[#3B3634]"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={submitting || selectedItems.size === 0 || !selectedShippingOption}
            className="px-8 py-3 bg-[#3B3634] text-white rounded-lg font-instrument-sans font-semibold hover:bg-[#2d2a28] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Wysyłanie..." : "Zgłoś zwrot"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default GuestReturnForm
