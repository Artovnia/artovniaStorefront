"use client"

import { CartItems, CartSummary } from "@/components/organisms"
import { retrieveCart } from "@/lib/data/cart"
import CartPromotionCode from "../CartReview/CartPromotionCode"
import { CartClient } from "./CartClient"
import { Suspense, useState, useEffect, useCallback } from "react"
import { globalDeduplicator } from "@/lib/utils/performance"
import { HttpTypes } from "@medusajs/types"

// Loading fallback component for cart sections
const CartSkeleton = () => (
  <>
    <div className="col-span-12 lg:col-span-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-sm p-4 flex gap-4">
              <div className="w-[100px] h-[132px] bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="lg:col-span-2"></div>
    <div className="col-span-12 lg:col-span-4">
      <div className="w-full mb-6 border rounded-sm p-4">
        <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
      </div>
      <div className="border rounded-sm p-4 h-fit">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </>
)

export const Cart = () => {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch cart data - always fresh, no caching to prevent stale data
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Direct cart fetch - no caching to ensure always-fresh data
      const cartData = await retrieveCart()
      
      setCart(cartData)
      
     
      
    } catch (err) {
      console.error('❌ Failed to fetch cart:', err)
      setError('Failed to load cart data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial cart fetch on component mount
  useEffect(() => {
    fetchCart()
  }, [])

  // Listen for URL changes and refresh cart (handles navigation to cart after adding items)
  useEffect(() => {
    const handleFocus = () => {
      fetchCart() // Refresh when window gains focus
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCart() // Refresh when page becomes visible
      }
    }

    // Listen for cart update events from child components
    const handleCartUpdated = (event: CustomEvent) => {
      // Force immediate refresh when cart is updated
      fetchCart()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('cart-updated', handleCartUpdated as EventListener)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('cart-updated', handleCartUpdated as EventListener)
    }
  }, [fetchCart])

  // Handle cart updates from child components (quantity changes, deletions, etc.)
  const handleCartUpdate = useCallback(async (updatedCart?: HttpTypes.StoreCart) => {
    
    
    // If we have updated cart data, use it immediately for optimistic UI
    if (updatedCart) {
      setCart(updatedCart)
    }
    
    // Always fetch fresh data from server to ensure accuracy
    // This handles cases where the optimistic update might be incomplete
    await fetchCart()
  }, [fetchCart])

  // Show loading state
  if (isLoading) {
    return <CartSkeleton />
  }

  // Show error state
  if (error) {
    return (
      <div className="col-span-12 text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="col-span-12 lg:col-span-6">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-sm p-4 flex gap-4">
                  <div className="w-[100px] h-[132px] bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }>
          <CartItems cart={cart} onCartUpdate={handleCartUpdate} />
        </Suspense>
      </div>
      <div className="lg:col-span-2"></div>
      <div className="col-span-12 lg:col-span-4">
        <div className="w-full mb-6 border rounded-sm p-4">
          <Suspense fallback={
            <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
          }>
            <CartPromotionCode cart={cart} />
          </Suspense>
        </div>
        <div className="border rounded-sm p-4 h-fit">
          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          }>
            <CartSummary
              item_total={cart?.item_total || 0}
              shipping_total={cart?.shipping_total || 0}
              total={cart?.total || 0}
              currency_code={cart?.currency_code || ""}
              tax={cart?.tax_total || 0}
            />
            <CartClient 
              cartTotal={cart?.total || 0}
              currencyCode={cart?.currency_code || ""}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}