// src/components/organisms/ProductReviews/ServerProductReviews.tsx
"use server"

import { retrieveCustomer, isAuthenticated } from "@/lib/data/customer" // Changed import
import { ProductReviews } from "./ProductReviews"
import { getProductReviews, checkProductReviewEligibility } from "@/lib/data/reviews"
import { unstable_noStore as noStore } from 'next/cache'

// This function will fetch both auth and reviews in parallel
export async function ServerProductReviews({
  productId,
}: {
  productId: string
}) {
  // Opt out of caching for this component
  noStore()
  
  // Fetch authentication status, reviews, and eligibility in parallel - handle each separately for better error isolation
  let authenticated = false
  // Properly type the reviewsData to match the return type from getProductReviews
  let reviewsData: { reviews: any[] } = { reviews: [] }
  let eligibility: { isEligible: boolean; hasPurchased: boolean } = { isEligible: false, hasPurchased: false }
  
  try {
    authenticated = await isAuthenticated()
  } catch (error) {
    console.error('❌ Error checking authentication:', error)
    authenticated = false
  }
  
  try {
    reviewsData = await getProductReviews(productId)
  } catch (error) {
    console.error('❌ Error prefetching reviews:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available')
  }
  
  // Check review eligibility (only if authenticated)
  if (authenticated) {
    try {
      eligibility = await checkProductReviewEligibility(productId)
    } catch (error) {
      console.error('❌ Error checking review eligibility:', error)
      eligibility = { isEligible: false, hasPurchased: false }
    }
  }

  // Only fetch customer if authenticated (this can't be parallelized with the above)
  const customer = authenticated ? await retrieveCustomer() : null

  return (
    <ProductReviews
      productId={productId}
      isAuthenticated={authenticated}
      customer={customer}
      prefetchedReviews={reviewsData?.reviews || []}
      isEligible={eligibility.isEligible}
      hasPurchased={eligibility.hasPurchased}
    />
  )
}