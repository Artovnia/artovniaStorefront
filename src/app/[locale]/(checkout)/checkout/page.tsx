import CheckoutWrapper from "@/components/sections/CheckoutWrapper/CheckoutWrapper"
import { retrieveCartForReview } from "@/lib/data/cart"
import { listCartShippingMethods } from "@/lib/data/fulfillment"
import { listCartPaymentMethods } from "@/lib/data/payment"
import { retrieveCustomer } from "@/lib/data/cookies"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"

export default async function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  )
}

async function CheckoutPageContent() {
  try {
    // Get cart with all review data including payment sessions
    const cart = await retrieveCartForReview().catch(() => null);
    
    if (!cart) {
      return notFound()
    }

    const [shippingMethods, paymentMethods, customer] = await Promise.all([
      listCartShippingMethods(cart.id).catch(() => []),
      listCartPaymentMethods(cart.region?.id || '').catch(() => []),
      retrieveCustomer().catch(() => null)
    ]);

    return (
      <div className="container">
        <CheckoutWrapper
          cart={cart}
          customer={customer}
          availableShippingMethods={shippingMethods}
          availablePaymentMethods={paymentMethods}
        />
      </div>
    )
  } catch (error) {
    console.error("Error loading checkout page:", error)
    
    // Provide a graceful fallback UI when there's an error
    return (
      <main className="container py-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-medium text-red-800 mb-2">There was a problem loading the checkout</h2>
          <p className="text-red-700 mb-4">We&apos;re having trouble loading your shipping options. This might be due to an issue with available shipping methods.</p>
          <Link href="/cart" className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Return to cart
          </Link>
        </div>
      </main>
    )
  }
}