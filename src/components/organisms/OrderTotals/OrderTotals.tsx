import { Card, Divider } from "@/components/atoms"
import { convertToLocale } from "@/lib/helpers/money"

export const OrderTotals = ({ orderSet }: { orderSet: any }) => {

  const currency_code = orderSet.payment_collection?.currency_code || 
                       orderSet.currency_code || 
                       orderSet.orders?.[0]?.currency_code || 
                       'PLN'

  // Get order numbers from linked orders
  const orderNumbers = (orderSet.orders || [])
    .map((order: any) => order.display_id)
    .filter(Boolean)
    .sort((a: number, b: number) => a - b)

  // Calculate totals from individual orders
  const totals = (orderSet.orders || []).reduce((acc: any, order: any) => {
    // CRITICAL FIX: Always calculate item subtotal from actual item totals
    // Backend's order.item_total has incorrect negative values
    // We must sum the actual item.total values which include promotional discounts
    const itemSubtotal = (order.items || []).reduce((itemAcc: number, item: any) => {
      // Use item.total (actual price paid with promotions)
      // item.total already includes promotional discounts and quantity
      const itemTotal = item.total || ((item.unit_price || 0) * (item.quantity || 1))
      return itemAcc + itemTotal
    }, 0)
    
    // Calculate shipping cost
    let shippingCost = 0
    
    // PRIORITY 1: Use order.shipping_total if available
    if (order.shipping_total !== undefined && order.shipping_total !== null) {
      shippingCost = order.shipping_total
    }
    // PRIORITY 2: Sum shipping_methods
    else if (order.shipping_methods?.length > 0) {
      shippingCost = order.shipping_methods.reduce((shippingAcc: number, method: any) => {
        return shippingAcc + (method.total || method.amount || method.price || 0)
      }, 0)
    }
    
    // CRITICAL: Calculate order total from items + shipping, NOT from order.total
    // order.total from backend is incorrect when items are missing adjustments
    const calculatedOrderTotal = itemSubtotal + shippingCost
    
    return {
      total: acc.total + calculatedOrderTotal,
      itemSubtotal: acc.itemSubtotal + itemSubtotal,
      shipping: acc.shipping + shippingCost
    }
  }, { total: 0, itemSubtotal: 0, shipping: 0 })

  // Use payment collection total if available as authoritative source
  const finalTotal = orderSet.payment_collection?.amount || totals.total

  

  return (
    <Card className="mb-8 p-4 border-b border-[#3B3634]">
      {orderNumbers.length > 0 && (
        <p className="text-secondary label-md mb-4 font-instrument-sans">
          Zamówienia: <span className="text-black font-semibold">
            {orderNumbers.map((num: number) => `#${num}`).join(', ')}
          </span>
        </p>
      )}
      <p className="text-secondary label-md mb-2 font-instrument-sans flex justify-between ">
        Podsumowanie:
        <span className="text-black font-instrument-sans">
          {convertToLocale({
            amount: totals.itemSubtotal,
            currency_code,
          })}
        </span>
      </p>
      <p className="text-secondary label-md flex justify-between">
        Dostawa:
        <span className="text-black font-instrument-sans">
          {convertToLocale({
            amount: totals.shipping,
            currency_code,
          })}
        </span>
      </p>
      <Divider className="my-4" />
      <p className="text-secondary label-md flex justify-between items-center">
        Suma:{" "}
        <span className="text-black font-instrument-sans heading-md">
          {convertToLocale({
            amount: finalTotal,
            currency_code,
          })}
        </span>
      </p>
    </Card>
  )
}