"use client"

import { ProductPageAccordion } from '@/components/molecules';
import { convertToLocale } from "@/lib/helpers/money"
import { getProductShippingOptions } from "@/lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text, Heading } from "@medusajs/ui"
import { useState, useEffect } from "react"
import { LoaderWrapper } from "@/components/atoms/icons/IconWrappers"

type ProductDetailsShippingProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion | null | undefined
  initialShippingOptions?: any[]
}

export const ProductDetailsShipping = ({
  product,
  region,
  initialShippingOptions,
}: ProductDetailsShippingProps) => {
  // When server-fetched options are provided, use them directly (no client fetch)
  const [shippingMethods, setShippingMethods] = useState<any[]>(
    initialShippingOptions ?? []
  )
  const [loading, setLoading] = useState(!initialShippingOptions)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Skip client-side fetch if server already provided shipping options
    if (initialShippingOptions) {
      setShippingMethods(initialShippingOptions)
      setLoading(false)
      return
    }

    const fetchShippingMethods = async () => {
      if (!product?.id || !region?.id) {
        setLoading(false)
        setShippingMethods([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const shippingOptions = await getProductShippingOptions(product.id, region.id)
        setShippingMethods(shippingOptions)
      } catch (err) {
        console.error("ProductDetailsShipping: Error fetching shipping methods:", err)
        setError("Failed to load shipping methods")
        setShippingMethods([])
      } finally {
        setLoading(false)
      }
    }

    fetchShippingMethods()
  }, [product?.id, region?.id, initialShippingOptions])

  return (
    <ProductPageAccordion
      heading='Dostawa & Zwroty'
      defaultOpen={false}
    >
      <div className='product-details font-instrument-sans'>
        {/* Shipping Methods Section */}
        <div className="mb-8">
          <Heading level="h3" className="mb-4 text-ui-fg-base font-instrument-sans font-medium tracking-tight">
            Dostępne metody dostawy dla regionu
          </Heading>
          
          {loading ? (
            <div className="flex items-center gap-2 py-6">
              <LoaderWrapper className="w-4 h-4" />
              <Text className="text-ui-fg-subtle font-instrument-sans">Ładowanie metod dostawy...</Text>
            </div>
          ) : shippingMethods && shippingMethods.length > 0 ? (
            <div className="border border-ui-border-base rounded-xl overflow-hidden bg-[#BFB7AD]/40 backdrop-blur-sm">
              {shippingMethods.map((method: any, index: number) => (
                <div key={method.id} className={`
                  px-5 py-4 transition-colors hover:bg-ui-bg-subtle/30
                  ${index !== shippingMethods.length - 1 ? 'border-b border-ui-border-base/50' : ''}
                `}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <Text className="font-medium text-ui-fg-base font-instrument-sans text-sm leading-relaxed">
                        {method.name}
                      </Text>
                      {method.seller_name && (
                        <Text className="text-xs text-ui-fg-muted font-instrument-sans mt-0.5 opacity-75">
                          przez {method.seller_name}
                        </Text>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      {method.amount != null ? (
                        <Text className="font-semibold text-ui-fg-base font-instrument-sans text-sm tracking-tight">
                          {convertToLocale({
                            amount: method.amount,
                            currency_code: method.prices?.[0]?.currency_code || region?.currency_code || 'PLN',
                          })}
                        </Text>
                      ) : method.price_type === "calculated" ? (
                        <Text className="text-xs text-ui-fg-muted font-instrument-sans opacity-75">
                          Cena do ustalenia
                        </Text>
                      ) : (
                        <Text className="text-xs text-ui-fg-muted font-instrument-sans opacity-75">
                          Cena do ustalenia
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 border border-dashed border-ui-border-base rounded-xl bg-ui-bg-subtle/20">
              <Text className="text-ui-fg-muted font-instrument-sans text-sm">
                Brak dostępnych metod dostawy dla tego produktu.
              </Text>
            </div>
          )}
        </div>

        {/* Returns & Refunds Section */}
        <div className="border-t border-ui-border-base/30 pt-8">
          <Heading level="h3" className="mb-4 text-ui-fg-base font-instrument-sans font-medium tracking-tight">
            Zwroty i reklamacje
          </Heading>
          <div className="text-ui-fg-subtle font-instrument-sans prose prose-sm max-w-none">
            <p className="leading-relaxed mb-3">
              Zgodnie z obowiązującym prawem, każdy sprzedawca ma obowiązek umożliwić klientowi zwrot towaru w terminie 14 dni od otrzymania przesyłki, z wyjątkiem produktów wykonywanych na zamówienie lub personalizowanych. Sprzedawca musi:
            </p>
            <ul className="space-y-1.5 ml-4 mb-3">
              <li className="flex items-start gap-2">
                <span className="text-ui-fg-muted mt-1.5 text-xs">•</span>
                <span>udostępnić adres do zwrotów (może się różnić od adresu kontaktowego),</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-fg-muted mt-1.5 text-xs">•</span>
                <span>obsługiwać zwroty i reklamacje zgodnie z ustawą o prawach konsumenta,</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ui-fg-muted mt-1.5 text-xs">•</span>
                <span>udostępnić klientowi formularz zwrotu (lub przyjąć go przez panel klienta).</span>
              </li>
            </ul>
            <p className="leading-relaxed text-sm">
              Reklamacje są rozpatrywane bezpośrednio między klientem a sprzedawcą.
            </p>
          </div>
        </div>
      </div>
    </ProductPageAccordion>
  );
};