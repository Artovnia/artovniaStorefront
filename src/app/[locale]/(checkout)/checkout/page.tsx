import { CheckoutWrapper } from "@/components/sections"
import { HttpTypes } from "@medusajs/types"
import { retrieveCart, retrieveCartForAddress, retrieveCartForShipping, retrieveCartForPayment } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { listCartShippingMethods } from "@/lib/data/fulfillment"
import { listCartPaymentMethods } from "@/lib/data/payment"
import { getCachedCheckoutData } from "@/lib/utils/persistent-cache"
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
    // Load comprehensive cart data with persistent caching
    const cart = await getCachedCheckoutData(
      'cart',
      () => retrieveCart()
    )

    if (!cart) {
      return notFound()
    }
    
    
    
    // Load all required data in parallel with persistent caching for better performance
    const [shippingMethods, paymentMethods, customer] = await Promise.all([
      getCachedCheckoutData(
        `shipping-methods-${cart.id}`,
        () => listCartShippingMethods(cart.id)
      ).catch(error => {
        console.warn('Failed to load shipping methods:', error)
        return []
      }),
      getCachedCheckoutData(
        `payment-methods-${cart.region?.id ?? 'no-region'}`,
        () => listCartPaymentMethods(cart.region?.id ?? "")
      ).catch(error => {
        console.warn('Failed to load payment methods:', error)
        return []
      }),
      getCachedCheckoutData(
        'customer',
        () => retrieveCustomer()
      ).catch(error => {
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
        <CheckoutWrapper
          cart={typeSafeCart}
          customer={customer}
          availableShippingMethods={typeSafeShippingMethods}
          availablePaymentMethods={paymentMethods || []}
        />
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