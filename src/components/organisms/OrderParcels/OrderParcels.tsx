import { Avatar } from "@/components/atoms"
import { retrieveCustomer } from "@/lib/data/customer"
import { OrderParcelItems } from "@/components/molecules/OrderParcelItems/OrderParcelItems"
import { OrderParcelStatus } from "@/components/molecules/OrderParcelStatus/OrderParcelStatus"
import { OrderParcelActions } from "@/components/molecules/OrderParcelActions/OrderParcelActions"
import { SellerMessageTab } from "@/components/cells/SellerMessageTab/SellerMessageTab"
import { parcelStatuses } from "@/lib/helpers/parcel-statuses"

// CRITICAL FIX: Extract the fulfillment status calculation to share between components
const getFulfillmentStatus = (order: any) => {
  const realizacje = order.fulfillments || []
  
  
  
  // Jeśli nie ma realizacji, sprawdź status zamówienia
  if (realizacje.length === 0) {
    
    switch (order.status) {
      case "completed":
        return "delivered"
      case "canceled":
        return "canceled"
      case "pending":
      default:
        return "not_fulfilled"
    }
  }
  
  // Sprawdź wszystkie realizacje, aby znaleźć najbardziej zaawansowany status
  let najbardziejZaawansowanyStatus = "not_fulfilled"
  
  for (const realizacja of realizacje) {

    
    if (realizacja.canceled_at) {
      
      return "canceled"
    }
    
    if (realizacja.delivered_at) {
      
      najbardziejZaawansowanyStatus = "delivered"
      continue
    }
    
    if (realizacja.shipped_at) {
      
      if (najbardziejZaawansowanyStatus === "not_fulfilled") {
        najbardziejZaawansowanyStatus = "shipped"
      }
      continue
    }
    
    if (realizacja.packed_at) {
      
      if (najbardziejZaawansowanyStatus === "not_fulfilled") {
        najbardziejZaawansowanyStatus = "prepared"
      }
      continue
    }
    
    // Jeśli realizacja istnieje, ale nie ma konkretnych znaczników czasu, to jest co najmniej zrealizowana
    if (najbardziejZaawansowanyStatus === "not_fulfilled") {
      
      najbardziejZaawansowanyStatus = "fulfilled"
    }
  }
  
 
  return najbardziejZaawansowanyStatus
}

export const OrderParcels = async ({ orders, orderSetId }: { orders: any[], orderSetId?: string }) => {
  const user = await retrieveCustomer()

  return (
    <>
      {orders.map((order, index) => {
        // CRITICAL FIX: Calculate status once and enrich the order object
        const statusRealizacji = getFulfillmentStatus(order)
        const aktualnyKrok = parcelStatuses(statusRealizacji)
        
        // Create enriched order object with calculated status AND order_set_id for return link
        const enrichedOrder = {
          ...order,
          statusRealizacji,
          aktualnyKrok,
          ma_realizacje: (order.fulfillments?.length || 0) > 0,
          order_set_id: orderSetId || order.order_set_id  // Pass order set ID for return link
        }
      
        
        return (
          <div key={order.id} className="w-full mb-8">
            <div className="border rounded-sm p-4 bg-component-secondary font-semibold text-secondary uppercase">
              Paczka {index + 1}
            </div>
            <div className="border rounded-sm">
              <div className="p-4 border-b">
                <OrderParcelStatus order={enrichedOrder} />
              </div>
              <div className="p-4 border-b md:flex items-center justify-between">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <Avatar src={order.seller?.photo || ''} />
                  <p className="text-primary">{order.seller?.name || 'Seller'}</p>
                </div>
                {order.seller && (
                  <SellerMessageTab
                    seller_id={order.seller.id}
                    seller_name={order.seller.name}
                    isAuthenticated={user !== null}
                  />
                )}
              </div>
              <div className="p-4 border-b">
                <OrderParcelItems
                  items={order.items}
                  currency_code={order.currency_code}
                />
              </div>
              <div className="p-4">
                <OrderParcelActions order={enrichedOrder} />
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
