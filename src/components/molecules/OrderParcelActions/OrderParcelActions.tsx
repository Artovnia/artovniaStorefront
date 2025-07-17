import { OrderCancel } from "@/components/cells/OrderCancel/OrderCancel"
import { OrderReturn } from "@/components/cells/OrderReturn/OrderReturn"
import { parcelStatuses } from "@/lib/helpers/parcel-statuses"

export const OrderParcelActions = ({ order }: { order: any }) => {
  // Calculate the aktualnyKrok if not already present
  if (order.aktualnyKrok === undefined) {
    order.aktualnyKrok = parcelStatuses(order.status || order.fulfillment_status)
  }
  
  // Only allow cancel for orders in "Zamówienie otrzymane" state (aktualnyKrok === 0)
  if (order.aktualnyKrok === 0) {
    return <OrderCancel order={order} />
  }
  
  // Only allow return for delivered orders (status === "delivered" or "completed")
  if (order.status === "delivered" || order.status === "completed" || 
      order.fulfillment_status === "delivered" || order.fulfillment_status === "completed") {
    return <OrderReturn order={order} />
  }
  
  return null
}