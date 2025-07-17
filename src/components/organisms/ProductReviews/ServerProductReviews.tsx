// src/components/organisms/ProductReviews/ServerProductReviews.tsx
"use server"

import { retrieveCustomer, isAuthenticated } from "@/lib/data/customer" // Changed import
import { ProductReviews } from "./ProductReviews"
import { getProductReviews } from "@/lib/data/reviews"
import { unstable_noStore as noStore } from 'next/cache'

// This function will fetch both auth and reviews in parallel
export async function ServerProductReviews({
  productId,
}: {
  productId: string
}) {
  // Opt out of caching for this component
  noStore()
  console.log('🔍 ServerProductReviews called for product:', productId)
  
  // Fetch authentication status and reviews in parallel - handle each separately for better error isolation
  let authenticated = false
  // Properly type the reviewsData to match the return type from getProductReviews
  let reviewsData: { reviews: any[] } = { reviews: [] }
  
  try {
    console.log('🔒 Checking authentication status')
    authenticated = await isAuthenticated()
    console.log('🔒 Authentication status:', authenticated)
  } catch (error) {
    console.error('❌ Error checking authentication:', error)
    authenticated = false
  }
  
  try {
    console.log('📥 Starting to fetch product reviews for ID:', productId)
    reviewsData = await getProductReviews(productId)
    console.log('📥 Fetched reviews data:', JSON.stringify(reviewsData, null, 2))
  } catch (error) {
    console.error('❌ Error prefetching reviews:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available')
  }

  // Only fetch customer if authenticated (this can't be parallelized with the above)
  const customer = authenticated ? await retrieveCustomer() : null
  console.log('👤 Customer data available:', customer ? 'Yes' : 'No')

  console.log("🔐 Authentication check in ServerProductReviews:", {
    authenticated,
    hasCustomer: !!customer,
    customerId: customer?.id,
    customerEmail: customer?.email,
    reviewsCount: reviewsData?.reviews?.length || 0
  })

  return (
    <ProductReviews
      productId={productId}
      isAuthenticated={authenticated}
      customer={customer}
      prefetchedReviews={reviewsData?.reviews || []}
    />
  )
}