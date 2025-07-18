import { CartAddressSection } from "@/components/sections/CartAddressSection/CartAddressSection"
import CartPaymentSection from "@/components/sections/CartPaymentSection/CartPaymentSection"
import CartReview from "@/components/sections/CartReview/CartReview"

import CartShippingMethodsSection from "@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection"
import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { listCartShippingMethods } from "@/lib/data/fulfillment"
import { listCartPaymentMethods } from "@/lib/data/payment"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Checkout",
  description: "My cart page - Checkout",
}

export default async function CheckoutPage({}) {
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

async function CheckoutPageContent({}) {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }
  
  try {
    // Wrap API calls in try/catch to handle potential errors
    const shippingMethods = await listCartShippingMethods(cart.id)
    const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")
    const customer = await retrieveCustomer()

    return (
      <main className="container">
        <div className="grid lg:grid-cols-11 gap-8">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <CartAddressSection cart={cart} customer={customer} />
            <CartShippingMethodsSection
              cart={cart}
              availableShippingMethods={shippingMethods}
            />
            <CartPaymentSection
              cart={cart}
              availablePaymentMethods={paymentMethods}
            />
          </div>

          <div className="lg:col-span-5">
            <CartReview cart={cart} />
          </div>
        </div>
      </main>
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
