import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { handleStripePaymentReturn, parseStripeReturnParams } from "@/lib/helpers/stripe-helpers"

interface PaymentReturnPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PaymentReturnPage({ searchParams }: PaymentReturnPageProps) {
  // Await searchParams in Next.js 15
  const resolvedSearchParams = await searchParams
  
  return (
    <Suspense fallback={<div className="container py-10">Processing payment...</div>}>
      <PaymentReturnContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
}

interface PaymentReturnContentProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function PaymentReturnContent({ searchParams }: PaymentReturnContentProps) {
  // Parse URL parameters
  const urlParams = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlParams.set(key, value)
    }
  })
  
  const { cartId, paymentIntent, paymentIntentClientSecret, redirectStatus } = 
    parseStripeReturnParams(urlParams)


  if (!cartId) {
    console.error('❌ No cart ID in payment return')
    return notFound()
  }

  try {
    // Handle the payment return
    const result = await handleStripePaymentReturn(
      cartId,
      paymentIntent || undefined,
      paymentIntentClientSecret || undefined
    )

    if (result.success && result.orderId) {
      redirect(`/order/confirmed/${result.orderId}`)
    } else {
      console.error('❌ Payment completion failed:', result.error)
      redirect(`/cart?error=payment_failed&message=${encodeURIComponent(result.error || 'Payment failed')}`)
    }
  } catch (error: any) {
    console.error('❌ Error in payment return page:', error)
    redirect(`/cart?error=payment_error&message=${encodeURIComponent(error.message)}`)
  }
}
