"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { notFound, useRouter, useSearchParams } from "next/navigation"

// Define window with Medusa publishable key
declare global {
  interface Window {
    __MEDUSA_PUBLISHABLE_KEY__: string;
  }
}

type Order = {
  id: string
  status: string
  display_id: string
  cart_id: string
  customer?: {
    email: string
    first_name: string
    last_name: string
  }
  shipping_address?: {
    first_name: string
    last_name: string
    address_1: string
    city: string
    postal_code: string
    country_code: string
  }
  items: Array<{
    title: string
    quantity: number
    unit_price: number
  }>
  total: number
  currency_code: string
  payment_status: string
}

// Payment processing component
function PaymentProcessingPage({ orderId }: { orderId: string }) {
  return (
    <div className="bg-gray-50 py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex justify-center">
        <div className="max-w-4xl h-full bg-white w-full">
          <div className="flex flex-col gap-y-4 p-10 pb-16 items-center">
            <h1 className="text-2xl-semi">Processing Payment</h1>
            <p className="text-gray-700 text-center mb-4">
              Your payment is being processed. Please wait a moment...
            </p>
            <div className="my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4 w-full max-w-md">
              <p className="text-blue-800 text-center">Order ID: {orderId}</p>
            </div>
            <p className="text-gray-600 text-center">
              Please do not close this page. You will be redirected once the payment is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Order confirmation page component
function OrderConfirmedPage({ order }: { order: Order }) {
  return (
    <div className="bg-gray-50 py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex justify-center">
        <div className="max-w-4xl h-full bg-white w-full">
          <div className="flex flex-col gap-y-4 p-10 pb-16">
            <h1 className="text-2xl-semi">Order Confirmed</h1>
            <p className="text-gray-700">
              Thank you for your order! Your order has been confirmed and is being processed.
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-green-800">Order ID: {order.display_id || order.id}</p>
              <p className="text-green-800">Status: {order.status}</p>
              <p className="text-green-800">Payment Status: {order.payment_status}</p>
            </div>
            
            <h2 className="text-xl font-semibold mt-4">Order Summary</h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 notranslate">
                        {(item.unit_price / 100).toFixed(2)} {order.currency_code.toUpperCase()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 notranslate">
                      {(order.total / 100).toFixed(2)} {order.currency_code.toUpperCase()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-8">
              <Link 
                href="/"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Updated Props type for Next.js 15
type Props = {
  params: Promise<{ locale: string }>
}

// Main client component - updated for Next.js 15
export default function PaymentConfirmedPage({ params }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<string>('');
  
  // Resolve params on component mount
  useEffect(() => {
    params.then(resolvedParams => {
      setLocale(resolvedParams.locale);
    });
  }, [params]);
  
  // Function to fetch order details
  const fetchOrder = useCallback(async (orderId: string) => {
    try {
      // Get the publishable API key from window object
      const publishableApiKey = window.__MEDUSA_PUBLISHABLE_KEY__;
      
      if (!publishableApiKey) {
        console.error("Missing Medusa publishable API key");
        setError("Configuration error. Please contact support.");
        setLoading(false);
        return;
      }
      
      // Fetch order details from Medusa
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableApiKey
          },
          credentials: "include"
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Function to check payment status
  const checkPaymentStatus = useCallback(async (orderId: string) => {
    try {
      // Get the publishable API key from window object
      const publishableApiKey = window.__MEDUSA_PUBLISHABLE_KEY__;
      
      if (!publishableApiKey) {
        console.error("Missing Medusa publishable API key");
        return false;
      }
      
      // Fetch order details to check payment status
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableApiKey
          },
          credentials: "include"
        }
      );
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.order.payment_status === "captured" || data.order.payment_status === "confirmed";
    } catch (err) {
      console.error("Error checking payment status:", err);
      return false;
    }
  }, []);
  
  useEffect(() => {
    // Get the order_id from searchParams
    const orderIdParam = searchParams.get("order_id");
    if (!orderIdParam) {
      router.push("/404");
      return;
    }
    
    // Check if this is a payment processing page or confirmation page
    const status = searchParams.get("status");
    
    if (status === "COMPLETED" || status === "SUCCESS") {
      // Payment completed, fetch order details
      fetchOrder(orderIdParam);
    } else if (status === "FAILED" || status === "CANCELED") {
      // Payment failed, redirect to error page
      router.push(`/checkout/payment-error?order_id=${orderIdParam}`);
    } else {
      // Payment in progress, check status periodically
      let checkCount = 0;
      const maxChecks = 10; // Maximum number of checks (10 x 3s = 30 seconds)
      
      const checkInterval = setInterval(async () => {
        checkCount++;
        const isComplete = await checkPaymentStatus(orderIdParam);
        
        if (isComplete) {
          clearInterval(checkInterval);
          fetchOrder(orderIdParam);
        } else if (checkCount >= maxChecks) {
          clearInterval(checkInterval);
          setLoading(false);
          // After max checks, just show the order details anyway
          fetchOrder(orderIdParam);
        }
      }, 3000); // Check every 3 seconds
      
      // Initial fetch to show something while checking
      fetchOrder(orderIdParam);
      
      // Cleanup interval on component unmount
      return () => clearInterval(checkInterval);
    }
  }, [searchParams, router, fetchOrder, checkPaymentStatus]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-50 py-6 min-h-[calc(100vh-64px)]">
        <div className="content-container flex justify-center">
          <div className="max-w-4xl h-full bg-white w-full">
            <div className="flex flex-col gap-y-4 p-10 pb-16">
              <h1 className="text-2xl-semi">Error</h1>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
              <div className="mt-8">
                <Link 
                  href="/checkout"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                >
                  Return to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    // Show payment processing page if we don't have order details yet
    const orderId = searchParams.get("order_id") || "";
    return <PaymentProcessingPage orderId={orderId} />;
  }
  
  // Order confirmation page
  return <OrderConfirmedPage order={order} />;
}