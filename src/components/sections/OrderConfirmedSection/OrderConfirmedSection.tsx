// src/components/sections/OrderConfirmedSection/OrderConfirmedSection.tsx
import OrderDetails from "@/components/organisms/OrderDefails/OrderDetails"
import OrderShipping from "@/components/organisms/OrderDefails/OrderShipping"
import OrderTotals from "@/components/organisms/OrderDefails/OrderTotals"
import OrderItems from "@/components/organisms/OrderItems/OrderItems"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, Text } from "@medusajs/ui"
import React from "react"
import { useMediaQuery } from "react-responsive"
import SVGWrapper from "@/components/atoms/SVGWrapper/SVGWrapper"

interface OrderConfirmedSectionProps {
  order: any
  locale?: string
  isOrderSet?: boolean
}

// Translations with better fallbacks
const translations = {
  pl: {
    orderConfirmed: 'Zamówienie potwierdzone!',
    orderSetConfirmed: 'Zamówienia potwierdzone!',
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
    thankYou: 'Dziękujemy za zakup!',
    viewOrders: 'Zobacz zamówienia',
    continueShopping: 'Kontynuuj zakupy',
    orderDetails: 'Szczegóły będą dostępne w Twoim koncie.',
    ordersInSet: 'zamówień w zestawie'
  },
  en: {
    orderConfirmed: 'Order Confirmed!',
    orderSetConfirmed: 'Orders Confirmed!',
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
    thankYou: 'Thank you for your purchase!',
    viewOrders: 'View Orders',
    continueShopping: 'Continue Shopping',
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
    <div className="py-8">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full mx-auto">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10 px-6"
          data-testid="order-complete-container"
        >
          {/* Success Header */}
          <div className="text-center w-full mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <SVGWrapper className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </SVGWrapper>
            </div>
            
            <Heading level="h1" className="text-3xl font-bold text-green-600 mb-4">
              {isOrderSet ? t.orderSetConfirmed : t.orderConfirmed}
            </Heading>

            <Text className="text-lg text-gray-600 mb-2">
              {t.thankYou}
            </Text>

            <Text className="text-gray-600 mb-6">
              {isOrderSet ? t.orderSetSuccess : t.orderSuccess}
            </Text>
            
            {/* Email Confirmation */}
            {orderEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <Text className="text-blue-800">
                  {t.confirmationSent}{" "}
                  <span className="font-semibold">{orderEmail}</span>
                </Text>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Text className="text-sm text-gray-500 uppercase mb-2">
                  {isOrderSet ? t.orderNumbers : t.orderNumber}
                </Text>
                <Text className="font-bold text-lg">{displayId}</Text>
              </div>

              <div className="text-center">
                <Text className="text-sm text-gray-500 uppercase mb-2">
                  {t.status}
                </Text>
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t.confirmed}
                </span>
              </div>

              <div className="text-center">
                <Text className="text-sm text-gray-500 uppercase mb-2">
                  {t.date}
                </Text>
                <Text className="font-bold text-lg">
                  {createdAt.toLocaleDateString(locale)}
                </Text>
              </div>

              <div className="text-center">
                <Text className="text-sm text-gray-500 uppercase mb-2">
                  {t.total}
                </Text>
                <Text className="font-bold text-lg text-green-600">
                  {formatCurrency(orderTotal, orderCurrency)}
                </Text>
              </div>
            </div>

            {/* Order Set Additional Info */}
            {isOrderSet && ordersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <Text className="text-sm text-gray-600">
                    {ordersCount} {t.ordersInSet}
                    {itemsCount > 0 && ` • ${itemsCount} produktów`}
                  </Text>
                </div>
              </div>
            )}
          </div>

          {/* Multi-store Notice */}
          {isOrderSet && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <SVGWrapper className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </SVGWrapper>
                <Text className="text-blue-800 text-sm">{t.multiStoreNotice}</Text>
              </div>
            </div>
          )}

          {/* Order Details - Show if available */}
          {order && order.items && order.items.length > 0 && (
            <div className="space-y-6">
              {/* Uncomment when ready to show details
              <OrderItems order={order} />
              <OrderTotals totals={order} />
              <OrderDetails order={order} />
              <OrderShipping order={order} />
              */}
            </div>
          )}

          {/* Fallback message if no detailed data */}
          {(!order?.items || order.items.length === 0) && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Text className="text-gray-600">{t.orderDetails}</Text>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a
              href={`/${locale}/user/orders`}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t.viewOrders}
            </a>
            <a
              href={`/${locale}`}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t.continueShopping}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}