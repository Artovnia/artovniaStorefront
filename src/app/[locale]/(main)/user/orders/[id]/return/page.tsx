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

  const order = (await retrieveOrder(id)) as any
  const returnReasons = await retrieveReturnReasons()
  const returnMethods = await retrieveReturnMethods(id)
  
  console.log('Return order page loaded with:', {
    order_id: id,
    return_reasons_count: returnReasons?.length || 0,
    return_methods_count: returnMethods?.length || 0
  })

  return (
    <main className="container">
      <OrderReturnSection
        order={order}
        returnReasons={returnReasons}
        shippingMethods={returnMethods as any}
      />
    </main>
  )
}
