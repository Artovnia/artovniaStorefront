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
    viewOrders: 'ZOBACZ ZAMÓWIENIE',
    continueShopping: 'KONTYNUUJ ZAKUPY',
    orderDetails: 'Szczegóły będą dostępne w Twoim koncie.',
    ordersInSet: 'zamówień w zestawie',
    orderItems: 'Zamówione produkty',
    seller: 'Sprzedawca',
    quantity: 'Ilość',
    each: 'za sztukę',
    defaultSeller: 'Artovnia',
    unknownProduct: 'Nieznany produkt',
    priceBreakdown: 'Podsumowanie ceny',
    subtotal: 'Produkty',
    shipping: 'Dostawa',
    tax: 'Podatek',
    discount: 'Rabat',
    finalTotal: 'Razem do zapłaty'
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
    viewOrders: 'VIEW ORDER',
    continueShopping: 'CONTINUE SHOPPING',
    orderDetails: 'Details will be available in your account.',
    ordersInSet: 'orders in set',
    orderItems: 'Order Items',
    seller: 'Seller',
    quantity: 'Quantity',
    each: 'each',
    defaultSeller: 'Artovnia',
    unknownProduct: 'Unknown Product',
    priceBreakdown: 'Price Breakdown',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    discount: 'Discount',
    finalTotal: 'Total'
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
  // CRITICAL FIX: Use payment_collection.amount (actual paid) as primary source
  const orderTotal = order?.payment_collection?.amount || order?.total || 0
  const orderCurrency = order?.currency_code || 'PLN'
  const createdAt = order?.created_at ? new Date(order.created_at) : new Date()
  const ordersCount = order?.orders?.length || 0
  const itemsCount = order?.items?.length || 0

  // Check if order contains items from multiple sellers
  const hasMultipleSellers = () => {
    if (!order?.items || !Array.isArray(order.items)) return false
    
    const sellers = new Set()
    order.items.forEach((item: any) => {
      const sellerId = item?.product?.seller?.id || item?.seller?.id || 'default'
      sellers.add(sellerId)
    })
    
    return sellers.size > 1
  }

  const isMultiSeller = hasMultipleSellers()

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
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-sm shadow-sm border border-stone-200 p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-[#3B3634] rounded-full flex items-center justify-center">
            <SVGWrapper className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </SVGWrapper>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-light font-instrument-serif text-stone-800 mb-4 tracking-wide">
            {isOrderSet ? t.orderSetConfirmed : t.orderConfirmed}
          </h1>

          {/* Thank you message */}
          <p className="text-stone-600 mb-8 leading-relaxed text-sm font-instrument-sans">
            {t.thankYou}
          </p>

          {/* Email Confirmation */}
          {orderEmail && (
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 mb-8 font-instrument-sans">
              <p className="text-stone-700 text-sm">
                {t.confirmationSent}{" "}
                <span className="font-medium">{orderEmail}</span>
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-stone-50 rounded-sm border border-stone-200 p-6 mb-8 font-instrument-sans">
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
                <span className="inline-block bg-[#3B3634] text-white px-3 py-1 text-xs font-light tracking-wide uppercase font-instrument-sans">
                  {t.confirmed}
                </span>
              </div>

              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2 font-instrument-sans">
                  {t.date}
                </p>
                <p className="font-light text-lg text-stone-800 font-instrument-sans">
                  {createdAt.toLocaleDateString(locale)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-2 font-instrument-sans">
                  {t.total}
                </p>
                <p className="font-light text-lg text-stone-800 font-instrument-sans">
                  {formatCurrency(orderTotal, orderCurrency)}
                </p>
              </div>
            </div>

            {/* Order Set Additional Info */}
            {isOrderSet && ordersCount > 0 && (
              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="text-center">
                  <p className="text-sm text-stone-600 font-instrument-sans">
                    {ordersCount} {t.ordersInSet}
                    {itemsCount > 0 && ` • ${itemsCount} produktów`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Multi-store Notice - Only show if order actually contains items from multiple sellers */}
          {isOrderSet && isMultiSeller && (
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 mb-8">
              <div className="flex items-start">
                <SVGWrapper className="w-5 h-5 text-stone-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </SVGWrapper>
                <p className="text-stone-700 text-sm leading-relaxed font-instrument-sans">{t.multiStoreNotice}</p>
              </div>
            </div>
          )}

          {/* Order Items Details */}
          {order?.items && order.items.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-6 mb-8">
              <h3 className="text-lg font-medium text-stone-800 mb-4 font-instrument-serif">
                {t.orderItems}
              </h3>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => {
                  const sellerName = item?.product?.seller?.name || item?.seller?.name || t.defaultSeller
                  const productTitle = item?.product_title || item?.title || t.unknownProduct
                  const variantTitle = item?.variant_title !== 'Default variant' ? item?.variant_title : ''
                  const quantity = item?.quantity || 1
                  const unitPrice = item?.unit_price || 0
                  
                  // CRITICAL FIX: Use item.subtotal (actual item value) instead of item.total
                  // item.subtotal = unit_price * quantity (correct per-item calculation)
                  // item.total might be incorrectly divided by backend
                  const itemSubtotal = item?.subtotal || (unitPrice * quantity)
                  const total = itemSubtotal
                  const thumbnail = item?.thumbnail || item?.product?.thumbnail
                  
                  // DEBUG: Log item pricing
                  console.log(`🛒 Order Item: ${productTitle}`, {
                    unit_price: unitPrice,
                    subtotal: item?.subtotal,
                    total: item?.total,
                    calculated_total: total,
                    discount: item?.discount_total,
                    quantity
                  })
                  
                  return (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded border border-stone-100">
                      {/* Product Image */}
                      {thumbnail && (
                        <div className="flex-shrink-0 w-16 h-16 bg-stone-100 rounded overflow-hidden">
                          <img 
                            src={thumbnail} 
                            alt={productTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                          <div>
                            <h4 className="text-sm font-medium text-stone-800 font-instrument-serif">
                              {productTitle}
                            </h4>
                            {variantTitle && (
                              <p className="text-xs text-stone-500 font-instrument-sans">
                                {variantTitle}
                              </p>
                            )}
                            <p className="text-xs text-stone-600 mt-1 font-instrument-sans">
                              {t.seller}: <span className="font-medium">{sellerName}</span>
                            </p>
                            <p className="text-xs text-stone-500 font-instrument-sans">
                              {t.quantity}: {quantity}
                            </p>
                          </div>
                          
                          {/* Price */}
                          <div className="text-left md:text-right md:flex-shrink-0">
                            <p className="text-sm font-medium text-stone-800 font-instrument-sans">
                              {formatCurrency(total, orderCurrency)}
                            </p>
                            {quantity > 1 && (
                              <p className="text-xs text-stone-500 font-instrument-sans">
                                {/* Show per-unit promotional price, not base price */}
                                {formatCurrency(total / quantity, orderCurrency)} {t.each}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          {order && (order.item_total !== undefined || order.shipping_total !== undefined || order.tax_total !== undefined || order.discount_total !== undefined) && (
            <div className="bg-stone-50 border border-stone-200 rounded-sm p-6 mb-8">
              <h3 className="text-lg font-medium text-stone-800 mb-4 font-instrument-serif">
                {t.priceBreakdown}
              </h3>
              <div className="space-y-3">
                {/* Item Total */}
                {order.item_total !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone-600 font-instrument-sans">{t.subtotal}</span>
                    <span className="text-sm font-medium text-stone-800 font-instrument-sans">
                      {formatCurrency(order.item_total, orderCurrency)}
                    </span>
                  </div>
                )}
                
                {/* Shipping Total */}
                {order.shipping_total !== undefined && order.shipping_total > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone-600 font-instrument-sans">{t.shipping}</span>
                    <span className="text-sm font-medium text-stone-800 font-instrument-sans">
                      {formatCurrency(order.shipping_total, orderCurrency)}
                    </span>
                  </div>
                )}
                
                {/* Tax Total */}
                {order.tax_total !== undefined && order.tax_total > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-stone-600 font-instrument-sans">{t.tax}</span>
                    <span className="text-sm font-medium text-stone-800 font-instrument-sans">
                      {formatCurrency(order.tax_total, orderCurrency)}
                    </span>
                  </div>
                )}
                
                {/* Discount Total */}
                {order.discount_total !== undefined && order.discount_total > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600 font-instrument-sans">-{t.discount}</span>
                    <span className="text-sm font-medium text-green-600 font-instrument-sans">
                      -{formatCurrency(order.discount_total, orderCurrency)}
                    </span>
                  </div>
                )}
                
                {/* Divider */}
                <div className="border-t border-stone-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-stone-800 font-instrument-serif">{t.finalTotal}</span>
                    <span className="text-base font-bold text-stone-800 font-instrument-sans">
                      {formatCurrency(orderTotal, orderCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback message if no detailed data */}
          {(!order?.items || order.items.length === 0) && (
            <div className="bg-primary border border-stone-200 rounded-sm p-6 mb-8">
              <p className="text-stone-600 text-sm font-instrument-sans">{t.orderDetails}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <a
              href={`/${locale}/user/orders`}
              className="block w-full bg-[#3B3634] text-white py-3 px-6 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200 border-none rounded-none font-instrument-sans"
            >
              {t.viewOrders}
            </a>
            <a
              href={`/${locale}`}
              className="block w-full bg-white border border-stone-300 text-stone-700 py-3 px-6 text-sm font-light tracking-wide hover:bg-stone-50 transition-colors duration-200 rounded-none font-instrument-sans"
            >
              {t.continueShopping}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}