import { Avatar } from "@/components/atoms"
import { retrieveCustomer } from "@/lib/data/customer"
import { OrderParcelItems } from "@/components/molecules/OrderParcelItems/OrderParcelItems"
import { OrderParcelStatus } from "@/components/molecules/OrderParcelStatus/OrderParcelStatus"
import { OrderParcelActions } from "@/components/molecules/OrderParcelActions/OrderParcelActions"
import { SellerMessageTab } from "@/components/cells/SellerMessageTab/SellerMessageTab"

export const OrderParcels = async ({ orders }: { orders: any[] }) => {
  const user = await retrieveCustomer()

  return (
    <>
      {orders.map((order, index) => (
        <div key={order.id} className="w-full mb-8">
          <div className="border rounded-sm p-4 bg-component-secondary font-semibold text-secondary uppercase">
            Paczka {index + 1}
          </div>
          <div className="border rounded-sm">
            <div className="p-4 border-b">
              <OrderParcelStatus order={order} />
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
              <OrderParcelActions order={order} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
