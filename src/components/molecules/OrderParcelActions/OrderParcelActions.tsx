import { OrderCancel } from "@/components/cells/OrderCancel/OrderCancel"
import { OrderReturn } from "@/components/cells/OrderReturn/OrderReturn"
import { parcelStatuses } from "@/lib/helpers/parcel-statuses"

export const OrderParcelActions = ({ order }: { order: any }) => {
  // CRITICAL FIX: Use pre-calculated status from enriched order object
  // The order should now have statusRealizacji and aktualnyKrok pre-calculated
  
  
  // Fallback calculation if order is not enriched (shouldn't happen with new flow)
  let finalAktualnyKrok = order.aktualnyKrok
  
  if (finalAktualnyKrok === undefined) {
    
    
    if (order.statusRealizacji) {
      finalAktualnyKrok = parcelStatuses(order.statusRealizacji)
    } else {
      finalAktualnyKrok = parcelStatuses(order.status || order.fulfillment_status)
    }   
  }
  
  // Only allow cancel for orders in "Zamówienie otrzymane" state (aktualnyKrok === 0)
  if (finalAktualnyKrok === 0) {
    
    return <OrderCancel order={order} />
  }
  
  // CRITICAL FIX: Allow return for delivered orders based on aktualnyKrok or statusRealizacji
  // aktualnyKrok === 3 means "Dostarczono" (Delivered)
  const isDelivered = finalAktualnyKrok === 3 || 
                     order.statusRealizacji === "delivered" ||
                     order.status === "delivered" || 
                     order.status === "completed" || 
                     order.fulfillment_status === "delivered" || 
                     order.fulfillment_status === "completed"
  
  if (isDelivered) {

    return <OrderReturn order={order} />
  }
  return null
}