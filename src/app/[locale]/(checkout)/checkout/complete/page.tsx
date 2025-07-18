// src/app/[locale]/(checkout)/checkout/complete/page.tsx
import { completeCheckout } from "@/lib/data/checkout"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Complete",
  description: "Your order has been completed successfully"
}

// Correct typing for Next.js 15.1.4 App Router pages
type Props = {
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CheckoutCompletePage({ params, searchParams }: Props) {
  // Await the params and searchParams as they are now Promises in Next.js 15
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Completing your order...</h1>
            <p className="text-gray-600">Please wait while we process your payment.</p>
          </div>
        </div>
      }
    >
      <CheckoutCompleteContent 
        locale={resolvedParams.locale} 
        sessionId={typeof resolvedSearchParams.session_id === 'string' ? resolvedSearchParams.session_id : undefined} 
      />
    </Suspense>
  )
}

// Processing component to render while checkout completes
function ProcessingCheckout() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Processing your order...</h1>
        <p className="text-gray-600">Please wait while we complete your purchase.</p>
      </div>
    </div>
  );
}

// Error component to show checkout errors
function ErrorCheckout({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold mb-2">Checkout Error</h1>
        <p className="text-gray-700 mb-4">We encountered an error while processing your order: {error}</p>
      </div>
    </div>
  );
}

// Simplified props to avoid type conflicts with Next.js internal types
async function CheckoutCompleteContent({
  locale = 'pl',
  sessionId,
}: {
  locale: string;
  sessionId?: string;
}) {
  
  try {    
    if (!sessionId) {
      redirect(`/${locale}/cart?error=no-session`)
      return <ProcessingCheckout />;
    }

    console.log('Completing checkout for session:', sessionId)
    
    // Complete the checkout using the lib function
    const result = await completeCheckout(sessionId)
    
    // Handle different result types and redirect accordingly
    if (result && typeof result === 'object') {
      if (result.type === 'order') {
        const orderId = result.data?.id || result.order?.id
        if (orderId) {
          redirect(`/${locale}/order/${orderId}/confirmed`)
          return <ProcessingCheckout />;
        }
      }
      
      if (result.type === 'order_set') {
        const orderSetId = result.data?.id || result.order_set?.id || result.id
        if (orderSetId) {
          redirect(`/${locale}/order/${orderSetId}/confirmed`)
          return <ProcessingCheckout />;
        }
      }
      
      // If we have an order ID directly in the result
      if (result.orderId || result.id) {
        const orderId = result.orderId || result.id
        redirect(`/${locale}/order/${orderId}/confirmed`)
        return <ProcessingCheckout />;
      }
    }
    
    // If we get here, something went wrong
    redirect(`/${locale}/cart?error=checkout-failed`)
    return <ProcessingCheckout />;
    
  } catch (error) {
    console.error('Checkout completion error:', error)
    
    // Redirect to cart with error message
    const errorMessage = error instanceof Error ? error.message : 'checkout-failed'
    redirect(`/${locale}/cart?error=${encodeURIComponent(errorMessage)}`)
    
    // Always return JSX even after redirect for type safety
    return <ErrorCheckout error={typeof errorMessage === 'string' ? errorMessage : 'Unknown error'} />;
  }
}