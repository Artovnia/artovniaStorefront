import { OrderReturnSection } from "@/components/sections/OrderReturnSection/OrderReturnSection"
import {
  retrieveOrder,
  retrieveReturnReasons,
  retrieveReturnMethods,
} from "@/lib/data/orders"

export default async function ReturnOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // retrieveOrder transforms order_set to a flattened order structure
  // It includes the orders array AND flattened items from all orders
  const transformedOrder = (await retrieveOrder(id)) as any
  const returnReasons = await retrieveReturnReasons()
  
  // For return methods, we need the individual order ID, not the order set ID
  // If this is an order set, use the first order's ID
  const orderIdForReturnMethods = transformedOrder.orders?.[0]?.id || id
  const returnMethods = await retrieveReturnMethods(orderIdForReturnMethods)
  
  
  const order = transformedOrder.orders?.[0] || transformedOrder


  return (
    <main className="container">
      <OrderReturnSection
        order={order}
        orderSet={transformedOrder.is_order_set ? transformedOrder : undefined}
        returnReasons={returnReasons}
        shippingMethods={returnMethods as any}
      />
    </main>
  )
}
