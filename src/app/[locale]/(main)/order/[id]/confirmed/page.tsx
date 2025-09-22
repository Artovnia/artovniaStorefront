// src/app/[locale]/(main)/order/[id]/confirmed/page.tsx
import { OrderConfirmedSection } from "@/components/sections/OrderConfirmedSection/OrderConfirmedSection"
import { retrieveOrder } from "@/lib/data/orders"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

type Props = {
  params: Promise<{ id: string; locale?: string }>
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

// Loading skeleton component
function OrderConfirmedSkeleton() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full mb-6 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>

        {/* Order details skeleton */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items skeleton */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="px-6 py-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Error component
function OrderConfirmedError({ 
  error, 
  locale 
}: { 
  error: string
  locale?: string 
}) {
  const isPolish = locale === 'pl'
  
  return (
    <div className="container py-8">
      <div className="max-w-md mx-auto text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg 
            className="h-8 w-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPolish ? 'Wystąpił błąd' : 'An Error Occurred'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isPolish 
            ? 'Nie udało się załadować szczegółów zamówienia. Sprawdź swój e-mail z potwierdzeniem.'
            : 'Failed to load order details. Please check your confirmation email.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {isPolish ? 'Błąd' : 'Error'}: {error}
        </p>
        <div className="space-y-3">
          <a
            href={`/${locale || 'pl'}/user/orders`}
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isPolish ? 'Zobacz wszystkie zamówienia' : 'View All Orders'}
          </a>
          <a
            href={`/${locale || 'pl'}`}
            className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
          >
            {isPolish ? 'Wróć do sklepu' : 'Back to Store'}
          </a>
        </div>
      </div>
    </div>
  )
}

export default async function OrderConfirmedPage(props: Props) {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<OrderConfirmedSkeleton />}>
        <OrderConfirmedContent params={await props.params} />
      </Suspense>
    </main>
  )
}

async function OrderConfirmedContent({ 
  params 
}: { 
  params: { id: string; locale?: string } 
}) {
  try {
    
    // Retrieve the order with enhanced error handling
    const order = await retrieveOrder(params.id).catch((error) => {
      console.error('Order retrieval error:', error)
      return null // Return null instead of throwing
    })

    if (!order) {
      
      // Show a more user-friendly error instead of 404
      return (
        <OrderConfirmedError 
          error="Order details are being processed. Please check back in a few minutes." 
          locale={params.locale} 
        />
      )
    }


    // Check if this is an order set (marketplace order)
    const isOrderSet = order.is_order_set || params.id.startsWith('ordset_')
    
    return (
      <div className=" bg-primary">
        <OrderConfirmedSection 
          order={order} 
          locale={params.locale}
          isOrderSet={isOrderSet}
        />
      </div>
    )
    
  } catch (error) {
    console.error('Order confirmation page error:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred'
    
    return (
      <OrderConfirmedError 
        error={errorMessage} 
        locale={params.locale} 
      />
    )
  }
}