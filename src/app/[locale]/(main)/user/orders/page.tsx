import { LoginForm, ParcelAccordion, UserPageLayout } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { OrdersPagination } from "@/components/sections"
import { isEmpty } from "lodash"
import { listOrders } from "@/lib/data/orders"

const LIMIT = 10

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>
}) {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const orders = await listOrders()

  const { page } = await searchParams
  
  // Early check for empty orders to prevent errors when processing
  if (isEmpty(orders)) {
    return (
      <UserPageLayout title="Zamówienia">
        <div className="text-center">
          <h3 className="heading-lg text-primary uppercase">Brak zamówień</h3>
          <p className="text-lg text-secondary mt-2 font-instrument-sans">
            Nie dokonałeś jeszcze żadnego zamówienia. Po dokonaniu zamówienia
            pojawi się tutaj.
          </p>
        </div>
      </UserPageLayout>
    )
  }

  // Only process orders if they exist
  const pages = Math.ceil(orders.length / LIMIT)
  const currentPage = +page || 1
  const offset = (+currentPage - 1) * LIMIT

  const orderSetsGrouped = orders.reduce((acc, order) => {
    // Safely access order_set - it should exist but add a check just in case
    const orderSet = (order as any).order_set
    if (!orderSet) return acc
    
    const orderSetId = orderSet.id
    if (!acc[orderSetId]) {
      acc[orderSetId] = []
    }
    acc[orderSetId].push(order)
    return acc
  }, {} as Record<string, typeof orders>)

  const orderSets = Object.entries(orderSetsGrouped).map(
    ([orderSetId, orders]) => {
      const firstOrder = orders[0]
      const orderSet = (firstOrder as any).order_set

      return {
        id: orderSetId,
        orders: orders,
        created_at: orderSet.created_at,
        display_id: orderSet.display_id,
        total: orders.reduce((sum, order) => sum + order.total, 0),
        currency_code: firstOrder.currency_code,
      }
    }
  )

  const processedOrders = orderSets.slice(offset, offset + LIMIT)

  return (
    <UserPageLayout title="Zamówienia">
      {isEmpty(orders) ? (
        <div className="text-center">
          <h3 className="heading-lg text-primary uppercase font-instrument-serif">Brak zamówień</h3>
          <p className="text-lg text-secondary mt-2">
            Nie dokonałeś jeszcze żadnego zamówienia. Po dokonaniu zamówienia
            pojawi się tutaj.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full max-w-full">
            {processedOrders.map((orderSet) => (
              <ParcelAccordion
                key={orderSet.id}
                orderId={orderSet.id}
                orderDisplayId={`#${orderSet.display_id}`}
                createdAt={orderSet.created_at}
                total={orderSet.total}
                items={orderSet.orders.flatMap(order => order.items || [])}
                currency_code={orderSet.currency_code}
              />
            ))}
          </div>
          {/* TODO - pagination */}
          <OrdersPagination pages={pages} />
        </>
      )}
    </UserPageLayout>
  )
}