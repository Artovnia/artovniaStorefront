import { LoginForm, ParcelAccordion, UserPageLayout } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { OrdersPagination } from "@/components/sections"
import { listOrderSets } from "@/lib/data/orders"

const LIMIT = 10

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>
}) {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const { page } = await searchParams
  const currentPage = parseInt(page) || 1
  const offset = (currentPage - 1) * LIMIT

  // Fetch order sets with server-side pagination
  const { order_sets, count } = await listOrderSets(LIMIT, offset)
  
  // Check for empty order sets
  if (!order_sets || order_sets.length === 0) {
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

  // Calculate total pages based on count from backend
  const pages = Math.ceil(count / LIMIT)

  // Transform order sets to display format
  const processedOrders = order_sets.map((orderSet: any) => {
    // Use payment_collection.amount as the authoritative total
    const orderSetTotal = orderSet.payment_collection?.amount || 
      (orderSet.orders || []).reduce((sum: number, order: any) => {
        const orderItemsTotal = (order.items || []).reduce((itemSum: number, item: any) => {
          return itemSum + (item.total || (item.unit_price * item.quantity))
        }, 0)
        const shippingTotal = order.shipping_total || 0
        return sum + orderItemsTotal + shippingTotal
      }, 0)
    
    return {
      id: orderSet.id,
      orders: orderSet.orders || [],
      created_at: orderSet.created_at,
      display_id: orderSet.display_id,
      total: orderSetTotal,
      currency_code: orderSet.orders?.[0]?.currency_code || 'PLN',
    }
  })

  return (
    <UserPageLayout title="Zamówienia">
      <div className="w-full max-w-full">
        {processedOrders.map((orderSet) => (
          <ParcelAccordion
            key={orderSet.id}
            orderId={orderSet.id}
            orderDisplayId={`#${orderSet.display_id}`}
            createdAt={orderSet.created_at}
            total={orderSet.total}
            items={orderSet.orders.flatMap((order: any) => order.items || [])}
            currency_code={orderSet.currency_code}
          />
        ))}
      </div>
      {pages > 1 && <OrdersPagination pages={pages} />}
    </UserPageLayout>
  )
}