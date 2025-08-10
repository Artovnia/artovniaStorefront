// src/app/[locale]/user/orders/[id]/page.tsx
import { UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { Button } from "@/components/atoms"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowLeftIcon } from "@/icons"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { retrieveOrder } from "@/lib/data/orders"
import { OrderDetailsSection } from "@/components/sections/OrderDetailsSection/OrderDetailsSection"
import type { Order } from "@/lib/utils/order-transformations"

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await retrieveCustomer()
  const order = await retrieveOrder(id) as unknown as Order

  if (!user) return redirect("/login")
  if (!order) return redirect("/user/orders")


  // Ensure we have the correct data structure for OrderDetailsSection
  const orderData = {
    id: order.id,
    display_id: order.display_id,
    created_at: order.created_at,
    currency_code: order.currency_code,
    shipping_total: 0, // Will be calculated from orders
    payment_collection: order.payment_collection || {
      currency_code: order.currency_code,
      amount: order.total || 0,
      status: order.payment_status || 'pending'
    },
    // Use the orders array from the transformed order
    orders: (order as any).orders || [order]
  }

  return (
    <main className="container  ">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8 ">
        <UserNavigation />
        <div className="md:col-span-3 ">
          <LocalizedClientLink href="/user/orders">
            <Button
              variant="tonal"
              className="label-md text-action-on-secondary uppercase flex items-center gap-2"
            >
              <ArrowLeftIcon className="size-4" />
              Wszystkie zamówienia
            </Button>
          </LocalizedClientLink>
          <div className="sm:flex items-center justify-between ">
            <h1 className="heading-md uppercase my-8">
              Zamówienie #{orderData.display_id}
            </h1>
            <p className="label-md text-secondary">
              Data zamówienia:{" "}
              <span className="text-primary">
                {format(new Date(orderData.created_at || ""), "yyyy-MM-dd")}
              </span>
            </p>
          </div>
          <OrderDetailsSection orderSet={orderData} />
        </div>
      </div>
    </main>
  )
}