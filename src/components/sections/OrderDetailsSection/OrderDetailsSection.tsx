import { OrderAddresses } from "@/components/organisms/OrderAddresses/OrderAddresses"
import { OrderParcels } from "@/components/organisms/OrderParcels/OrderParcels"
import { OrderTotals } from "@/components/organisms/OrderTotals/OrderTotals"

export const OrderDetailsSection = ({ orderSet }: { orderSet: any }) => {
  // Get shipping address from the first order in the set if available
  const firstOrder = orderSet.orders?.[0];
  const shippingAddress = firstOrder?.shipping_address || orderSet.shipping_address;
  
  return (
    <div>
      {orderSet.orders && <OrderParcels orders={orderSet.orders} orderSetId={orderSet.id} />}
      {orderSet.orders && <OrderTotals orderSet={orderSet} />}
      {orderSet.orders && <OrderAddresses shipping_address={shippingAddress} />}
    </div>
  )
}
