import CheckoutWrapper from "@/components/sections/CheckoutWrapper/CheckoutWrapper"
import { retrieveCart } from "@/lib/data/cart"
import { setCartId } from "@/lib/data/cookies"
import { listCartShippingMethods } from "@/lib/data/fulfillment"
import { listCartPaymentMethods } from "@/lib/data/payment"
import { retrieveCustomer } from "@/lib/data/cookies"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { CartProvider } from "@/components/context/CartContext"

// 🔒 CRITICAL: Disable all caching for checkout page
export const dynamic = 'force-dynamic'
export const revalidate = 0

type CheckoutPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <Suspense
      fallback={
        <div className="container flex items-center justify-center">
          Ładowanie...
        </div>
      }
    >
      <CheckoutPageContent searchParams={resolvedSearchParams} />
    </Suspense>
  )
}

async function CheckoutPageContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  try {
    const rawCartId = searchParams?.cart_id
    const cartIdFromQuery = typeof rawCartId === "string" ? rawCartId : undefined
    const paymentCancelled = searchParams?.payment_cancelled === "true"
    
    // Prefer explicit query cart_id when returning from external payment pages.
    const cart = await retrieveCart(cartIdFromQuery).catch(() => null)

    if (cart?.id && cartIdFromQuery && cart.id === cartIdFromQuery) {
      await setCartId(cart.id)
    }
    
    if (!cart) {
      const reason = paymentCancelled ? "payment_cancelled" : "checkout_cart_missing"
      redirect(`/cart?error=${reason}`)
    }

    const [shippingMethods, paymentMethods, customer] = await Promise.all([
      listCartShippingMethods(cart.id).catch(() => []),
      listCartPaymentMethods(cart.region?.id || '').catch(() => []),
      retrieveCustomer().catch(() => null)
    ]);

    return (
      <CartProvider initialCart={cart}>
        <div className="container">
          <CheckoutWrapper
            cart={cart}
            customer={customer}
            availableShippingMethods={shippingMethods}
            availablePaymentMethods={paymentMethods}
          />
        </div>
      </CartProvider>
    )
  } catch (error) {
    const digest =
      error && typeof error === "object" && "digest" in error
        ? (error as { digest?: string }).digest
        : undefined

    if (digest?.startsWith("NEXT_REDIRECT") || digest?.startsWith("NEXT_HTTP_ERROR_FALLBACK")) {
      throw error
    }

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