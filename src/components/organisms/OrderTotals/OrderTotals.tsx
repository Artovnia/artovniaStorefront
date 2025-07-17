// F:\StronyInternetowe\mercur\ArtovniaStorefront\src\components\organisms\OrderTotals\OrderTotals.tsx
import { Card, Divider } from "@/components/atoms"
import { convertToLocale } from "@/lib/helpers/money"

export const OrderTotals = ({ orderSet }: { orderSet: any }) => {
  console.log('OrderTotals - Full orderSet data:', JSON.stringify(orderSet, null, 2))

  const currency_code = orderSet.payment_collection?.currency_code || 
                       orderSet.currency_code || 
                       orderSet.orders?.[0]?.currency_code || 
                       'PLN'

  // Calculate totals from individual orders
  const totals = (orderSet.orders || []).reduce((acc: any, order: any) => {
    const orderTotal = order.total || 0
    
    // Calculate item subtotal (without tax and shipping)
    const itemSubtotal = (order.items || []).reduce((itemAcc: number, item: any) => {
      // Use unit_price * quantity for items (this should be tax-inclusive price)
      const itemTotal = (item.unit_price || 0) * (item.quantity || 0)
      return itemAcc + itemTotal
    }, 0)
    
    // Calculate shipping from shipping_methods or as difference
    let shippingCost = 0
    if (order.shipping_methods?.length > 0) {
      shippingCost = order.shipping_methods.reduce((shippingAcc: number, method: any) => {
        return shippingAcc + (method.amount || method.price || method.total || 0)
      }, 0)
    } else {
      // If no shipping_methods, try other shipping fields
      shippingCost = order.shipping_total || 
                    order.shipping_subtotal || 
                    order.delivery_total || 
                    order.delivery_cost || 0
    }
    
    // If still no shipping cost found, calculate as difference
    if (shippingCost === 0) {
      shippingCost = orderTotal - itemSubtotal
    }
    
    console.log(`Order ${order.id} breakdown:`, {
      total: orderTotal,
      itemSubtotal,
      shippingCost,
      calculatedTotal: itemSubtotal + shippingCost
    })
    
    return {
      total: acc.total + orderTotal,
      itemSubtotal: acc.itemSubtotal + itemSubtotal,
      shipping: acc.shipping + shippingCost
    }
  }, { total: 0, itemSubtotal: 0, shipping: 0 })

  // Use payment collection total if available as authoritative source
  const finalTotal = orderSet.payment_collection?.amount || totals.total

  console.log('OrderTotals calculated values:', {
    itemSubtotal: totals.itemSubtotal,
    shipping: totals.shipping,
    finalTotal,
    currency_code
  })

  return (
    <Card className="mb-8 p-4">
      <p className="text-secondary label-md mb-2 flex justify-between">
        Podsumowanie:
        <span className="text-primary">
          {convertToLocale({
            amount: totals.itemSubtotal,
            currency_code,
          })}
        </span>
      </p>
      <p className="text-secondary label-md flex justify-between">
        Dostawa:
        <span className="text-primary">
          {convertToLocale({
            amount: totals.shipping,
            currency_code,
          })}
        </span>
      </p>
      <Divider className="my-4" />
      <p className="text-secondary label-md flex justify-between items-center">
        Suma:{" "}
        <span className="text-primary heading-md">
          {convertToLocale({
            amount: finalTotal,
            currency_code,
          })}
        </span>
      </p>
    </Card>
  )
}