import { OrderReturnSection } from "@/components/sections/OrderReturnSection/OrderReturnSection"
import {
  retrieveOrder,
  retrieveReturnReasons,
  retrieveReturnMethods,
} from "@/lib/data/orders"

export default async function ReturnOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ order_id?: string }>
}) {
  const { id } = await params
  const { order_id } = await searchParams

  // retrieveOrder transforms order_set to a flattened order structure
  // It includes the orders array AND flattened items from all orders with correct prices
  const transformedOrder = (await retrieveOrder(id)) as any
  const returnReasons = await retrieveReturnReasons()
  
  // Use the target order ID from query parameter for return methods
  // This is the specific order the user wants to return
  const targetOrderId = order_id || transformedOrder.orders?.[0]?.id || id
  const returnMethods = await retrieveReturnMethods(targetOrderId)

  return (
    <main className="container">
      <OrderReturnSection
        orderSet={transformedOrder}
        returnReasons={returnReasons}
        shippingMethods={returnMethods as any}
        targetOrderId={targetOrderId}
      />
    </main>
  )
}
