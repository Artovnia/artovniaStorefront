import { Metadata } from "next"
import { redirect } from "next/navigation"
import { GuestOrderReturnSection } from "@/components/sections/OrderReturnSection"
import {
  retrieveGuestOrder,
  retrieveGuestReturnReasons,
  retrieveGuestReturnMethods,
} from "@/lib/data/guest-returns"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Zwrot zamówienia - Gość",
    description: "Zgłoś zwrot zamówienia jako gość",
  }
}

// Force dynamic rendering to handle searchParams
export const dynamic = 'force-dynamic'

/**
 * Guest Return Page - Server-Side
 * Reuses the same OrderReturnSection components as registered users
 * Only difference: fetches data via guest verification instead of auth headers
 */
export default async function GuestReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; email?: string }>
}) {
  const params = await searchParams
  const orderId = params.order_id
  const email = params.email

  // Validate required parameters
  if (!orderId || !email) {
    redirect('/?error=missing_return_params')
  }

  try {
    // Fetch data in parallel (same pattern as registered user flow)
    const [order, returnReasons, returnMethods] = await Promise.all([
      retrieveGuestOrder(orderId, email),
      retrieveGuestReturnReasons(),
      retrieveGuestReturnMethods(orderId),
    ])

    // Verify order was found
    if (!order) {
      console.error('Guest return: Order not found', { orderId, email })
      redirect('/?error=order_not_found')
    }

    // Check if order has seller (required for returns)
    if (!order.seller) {
      console.error('Guest return: Order has no seller', { orderId, order })
      redirect('/?error=seller_not_found')
    }

    console.log('✅ Guest return page loaded successfully', {
      orderId: order.id,
      displayId: order.display_id,
      seller: order.seller.name,
      itemCount: order.items?.length || 0,
      reasonCount: returnReasons.length,
      methodCount: returnMethods.length,
    })

    return (
      <main className="container">
        <GuestOrderReturnSection
          order={order}
          returnReasons={returnReasons}
          shippingMethods={returnMethods}
          email={email}
        />
      </main>
    )
  } catch (error) {
    console.error('❌ Error loading guest return page:', error)
    console.error('Failed parameters:', { orderId, email })
    redirect('/?error=return_load_failed')
  }
}
