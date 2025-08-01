import { CartAddressSection } from "@/components/sections/CartAddressSection/CartAddressSection"
import CartPaymentSection from "@/components/sections/CartPaymentSection/CartPaymentSection"
import CartReview from "@/components/sections/CartReview/CartReview"
import { HttpTypes } from "@medusajs/types"
import CartShippingMethodsSection from "@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection"
import { retrieveCart, retrieveCartForAddress, retrieveCartForShipping, retrieveCartForPayment } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { listCartShippingMethods } from "@/lib/data/fulfillment"
import { listCartPaymentMethods } from "@/lib/data/payment"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "Checkout",
  description: "My cart page - Checkout",
}

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
    // Load comprehensive cart data once at the page level
    // This prevents multiple API calls from individual components
    const cart = await retrieveCart()

    if (!cart) {
      return notFound()
    }
    
    // Load all required data in parallel for better performance
    const [shippingMethods, paymentMethods, customer] = await Promise.all([
      listCartShippingMethods(cart.id).catch(error => {
        console.warn('Failed to load shipping methods:', error)
        return []
      }),
      listCartPaymentMethods(cart.region?.id ?? "").catch(error => {
        console.warn('Failed to load payment methods:', error)
        return []
      }),
      retrieveCustomer().catch(error => {
        console.warn('Failed to load customer:', error)
        return null
      })
    ])

    // Provide comprehensive cart data to all components
    // This eliminates the need for individual components to load their own data
    const typeSafeCart = cart as any;
    const typeSafeShippingMethods = shippingMethods as any

    return (
      <main className="container">
        <div className="grid lg:grid-cols-11 gap-8">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <CartAddressSection 
              cart={typeSafeCart} 
              customer={customer}
              // Pass a key to force re-render when cart changes
              key={`address-${cart.id}-${cart.updated_at}`}
            />
            <CartShippingMethodsSection
              cart={typeSafeCart}
              availableShippingMethods={typeSafeShippingMethods}
              key={`shipping-${cart.id}-${cart.updated_at}`}
            />
            <CartPaymentSection
              cart={typeSafeCart}
              availablePaymentMethods={paymentMethods}
              key={`payment-${cart.id}-${cart.updated_at}`}
            />
          </div>

          <div className="lg:col-span-5">
            <CartReview 
              cart={typeSafeCart} 
              key={`review-${cart.id}-${cart.updated_at}`}
            />
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