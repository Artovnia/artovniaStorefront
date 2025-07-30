// src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx
//after processing payment and order, order confirmation page
import { Container, Heading, Text } from "@medusajs/ui"
import React from "react"
import SVGWrapper from "@/components/atoms/SVGWrapper/SVGWrapper"

interface OrderConfirmedSectionProps {
  order: any
  locale?: string
  isOrderSet?: boolean
}

// Translations with better fallbacks
const translations = {
  pl: {
    orderConfirmed: 'Zamówienie potwierdzone',
    orderSetConfirmed: 'Zamówienia potwierdzone',
    orderSuccess: 'Twoje zamówienie zostało pomyślnie złożone.',
    orderSetSuccess: 'Twój zestaw zamówień został pomyślnie złożony.',
    orderNumber: 'Numer zamówienia',
    orderNumbers: 'Numery zamówień',
    status: 'Status',
    confirmed: 'Potwierdzone',
    date: 'Data',
    total: 'Suma',
    confirmationSent: 'Potwierdzenie zostało wysłane na',
    multiStoreNotice: 'To zamówienie zawiera produkty z różnych sklepów i może być wysłane osobno.',
    thankYou: 'Dziękujemy za zakup',
    viewOrders: 'ZOBACZ ZAMÓWIENIA',
    continueShopping: 'KONTYNUUJ ZAKUPY',
    orderDetails: 'Szczegóły będą dostępne w Twoim koncie.',
    ordersInSet: 'zamówień w zestawie'
  },
  en: {
    orderConfirmed: 'Order Confirmed',
    orderSetConfirmed: 'Orders Confirmed',
    orderSuccess: 'Your order has been placed successfully.',
    orderSetSuccess: 'Your order set has been placed successfully.',
    orderNumber: 'Order Number',
    orderNumbers: 'Order Numbers',
    status: 'Status',
    confirmed: 'Confirmed',
    date: 'Date',
    total: 'Total',
    confirmationSent: 'Confirmation sent to',
    multiStoreNotice: 'This order contains products from different stores and may be shipped separately.',
    thankYou: 'Thank you for your purchase',
    viewOrders: 'VIEW ORDERS',
    continueShopping: 'CONTINUE SHOPPING',
    orderDetails: 'Details will be available in your account.',
    ordersInSet: 'orders in set'
  }
}

export const OrderConfirmedSection = ({
  order, 
  locale = 'pl',
  isOrderSet = false
}: OrderConfirmedSectionProps) => {
  // Get translations for current locale with fallback
  const t = translations[locale as keyof typeof translations] || translations.pl
  
  // Extract order information with fallbacks
  const displayId = order?.display_id || order?.id?.replace('ordset_', '') || 'N/A'
  const orderEmail = order?.email || order?.customer?.email
  const orderTotal = order?.total || 0
  const orderCurrency = order?.currency_code || 'PLN'
  const createdAt = order?.created_at ? new Date(order.created_at) : new Date()
  const ordersCount = order?.orders?.length || 0
  const itemsCount = order?.items?.length || 0

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount) // No need to convert from cents
    } catch {
      return `${amount.toFixed(2)} ${currency.toUpperCase()}`
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-sm shadow-sm border border-stone-200 p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
            <SVGWrapper className="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </SVGWrapper>
          </div>
          
          {/* Title */}
          <h1 className="text-xl font-light text-stone-800 mb-4 tracking-wide">
            {isOrderSet ? t.orderSetConfirmed : t.orderConfirmed}
          </h1>

          {/* Thank you message */}
          <p className="text-stone-600 mb-8 leading-relaxed text-sm">
            {t.thankYou}
          </p>

          {/* Email Confirmation */}
          {orderEmail && (
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 mb-8">
              <p className="text-stone-700 text-sm">
                {t.confirmationSent}{" "}
                <span className="font-medium">{orderEmail}</span>
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-stone-50 rounded-sm border border-stone-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
                  {isOrderSet ? t.orderNumbers : t.orderNumber}
                </p>
                <p className="font-light text-lg text-stone-800">{displayId}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
                  {t.status}
                </p>
                <span className="inline-block bg-stone-200 text-stone-700 px-3 py-1 text-xs font-light tracking-wide uppercase">
                  {t.confirmed}
                </span>
              </div>

              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
                  {t.date}
                </p>
                <p className="font-light text-lg text-stone-800">
                  {createdAt.toLocaleDateString(locale)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
                  {t.total}
                </p>
                <p className="font-light text-lg text-stone-800">
                  {formatCurrency(orderTotal, orderCurrency)}
                </p>
              </div>
            </div>

            {/* Order Set Additional Info */}
            {isOrderSet && ordersCount > 0 && (
              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="text-center">
                  <p className="text-sm text-stone-600">
                    {ordersCount} {t.ordersInSet}
                    {itemsCount > 0 && ` • ${itemsCount} produktów`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Multi-store Notice */}
          {isOrderSet && (
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 mb-8">
              <div className="flex items-start">
                <SVGWrapper className="w-5 h-5 text-stone-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </SVGWrapper>
                <p className="text-stone-700 text-sm leading-relaxed">{t.multiStoreNotice}</p>
              </div>
            </div>
          )}

          {/* Fallback message if no detailed data */}
          {(!order?.items || order.items.length === 0) && (
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-6 mb-8">
              <p className="text-stone-600 text-sm">{t.orderDetails}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <a
              href={`/${locale}/user/orders`}
              className="block w-full bg-stone-800 text-white py-3 px-6 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200 border-none rounded-none"
            >
              {t.viewOrders}
            </a>
            <a
              href={`/${locale}`}
              className="block w-full bg-white border border-stone-300 text-stone-700 py-3 px-6 text-sm font-light tracking-wide hover:bg-stone-50 transition-colors duration-200 rounded-none"
            >
              {t.continueShopping}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}