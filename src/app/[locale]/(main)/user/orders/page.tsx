import { LoginForm, ParcelAccordion, UserPageLayout } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { OrdersPagination } from "@/components/sections"
import { listOrderSets } from "@/lib/data/orders"
import { transformOrderSetToOrder } from "@/lib/utils/order-transformations"

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


  // CRITICAL: Transform order sets using the same logic as order details page
  // This ensures items have correct subtotal, total, discount_total, unit_price, and quantity
  const processedOrders = order_sets.map((orderSet: any, index: number) => {
    // Use transformOrderSetToOrder to get properly structured data
    const transformedOrder = transformOrderSetToOrder(orderSet)
    
    
    // Get order numbers from linked orders
    const orderNumbers = (orderSet.orders || [])
      .map((order: any) => order.display_id)
      .filter(Boolean)
      .sort((a: number, b: number) => a - b)
    
    return {
      id: transformedOrder.id,
      orders: transformedOrder.orders || [],
      created_at: transformedOrder.created_at,
      display_id: transformedOrder.display_id,
      order_numbers: orderNumbers,
      total: transformedOrder.total || 0,
      currency_code: transformedOrder.currency_code || 'PLN',
    }
  })
  
  
  if (processedOrders[0]) {
   
    
    // Log what will be passed to ParcelAccordion
    const itemsForAccordion = processedOrders[0].orders.flatMap((order: any) => order.items || [])
   
    
  }


  return (
    <UserPageLayout title="Zamówienia">
      <div className="w-full max-w-full">
        {processedOrders.map((orderSet) => (
          <ParcelAccordion
            key={orderSet.id}
            orderId={orderSet.id}
            orderDisplayId={orderSet.order_numbers.length > 0 
              ? orderSet.order_numbers.map((num: number) => `#${num}`).join(', ')
              : `#${orderSet.display_id}`
            }
            createdAt={orderSet.created_at || new Date().toISOString()}
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