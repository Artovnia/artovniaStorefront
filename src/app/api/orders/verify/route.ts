import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { order_id, email } = await req.json()

    if (!order_id || !email) {
      return NextResponse.json(
        { error: 'Missing order_id or email' },
        { status: 400 }
      )
    }

    // Fetch order from Medusa backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/orders/${order_id}`,
      {
        headers: {
          'x-publishable-api-key':
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { order } = await response.json()

    // Verify email matches (case-insensitive)
    if (order.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if order has been delivered
    const hasDeliveredFulfillment = order.fulfillments?.some(
      (f: any) => f.delivered_at !== null
    )

    if (!hasDeliveredFulfillment) {
      return NextResponse.json(
        { error: 'Order must be delivered before return can be requested' },
        { status: 400 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify order' },
      { status: 500 }
    )
  }
}
