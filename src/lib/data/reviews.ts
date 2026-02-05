// src/lib/data/reviews.ts
"use server"
import { cache } from "react"
import { revalidatePath } from "next/cache"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies" // Reverted to correct import path
import { HttpTypes } from "@medusajs/types"

export type Review = {
  id: string
  seller?: {
    id: string
    name: string
    photo: string
  }
  product?: {
    id?: string
    title?: string
    thumbnail?: string
  }
  product_id?: string
  reference: string
  reference_id?: string
  customer_note: string
  rating: number
  updated_at: string
  created_at: string
  customer?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  type?: 'seller' | 'product'
  reviewType?: 'seller' | 'product'
  order_id?: string
}

export type Order = HttpTypes.StoreOrder & {
  seller: { id: string; name: string; reviews?: any[] }
  reviews: any[]
}

const getReviews = async () => {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch("/store/reviews", {
      headers,
      query: { fields: "*seller,+customer.id,+order_id" },
      method: "GET",
    }) as { reviews: Review[] }; // Fix: Properly type the response

    return response
  } catch (err) {
    console.error("Error fetching reviews:", err)
    return { reviews: [] } // Return empty reviews array on error
  }
}

/**
 * Universal review fetching function that tries multiple approaches to get reviews for a product
 * 
 * This handles the potential disconnect between how reviews are stored and how they're linked to products
 * in the Medusa backend. Specifically, it accounts for:
 * 
 * 1. Reviews properly linked through the product-review link table (accessible via /products/{id}/reviews)
 * 2. Reviews with reference="product" and reference_id=productId but not in the link table (via /reviews)
 */
const getProductReviews = cache(async (productId: string) => {  
  try {
    const headers = await getAuthHeaders()
    
    const commonHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
    }
    
    // Use the product reviews endpoint with caching
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products/${productId}/reviews?limit=100`,
      {
        method: 'GET',
        headers: commonHeaders,
        next: { 
          revalidate: 300, // Cache for 5 minutes
          tags: [`product-reviews-${productId}`] // Allow targeted cache invalidation
        }
      }
    )
    
    if (response.ok) {
      const data = await response.json()
     
      
      if (data?.reviews && Array.isArray(data.reviews)) {
        return { reviews: data.reviews }
      }
    } else {
      const errorText = await response.text()
    }
    
    return { reviews: [] }
    
  } catch (error) {
    console.error(`❌ Error fetching product reviews:`, error)
    return { reviews: [] }
  }
})

/**
 * Creates a review for a product or seller
 * 
 * Required fields in the review object:
 * - rating (number): Rating from 1-5
 * - reference_id OR product_id (string): ID of the item being reviewed
 * 
 * Optional fields:
 * - reference (string): "product" or "seller" (defaults to "product")
 * - customer_note (string): Text review content
 * 
 * The customer_id is extracted from the JWT token in the authorization header
 */
export const createReview = async (review: any) => {
  try {
    // Validate required fields - need either product_id or reference_id
    if (!review.rating) {
      throw new Error('Required field missing: rating')
    }
    
    if (!review.reference_id && !review.product_id) {
      throw new Error('Required field missing: reference_id or product_id')
    }
    
    // Validate rating range
    if (review.rating < 1 || review.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
    
    // Get auth headers
    const headers = await getAuthHeaders()
    
    // Check if user is authenticated
    if (!Object.keys(headers).includes('authorization')) {
      throw new Error('Authentication required')
    }
    
    // Format the review data according to backend API requirements
    // The format must match StoreCreateReview schema in the backend validators
    const reviewData = {
      reference: review.reference || "product",
      reference_id: review.reference_id || review.product_id,
      rating: review.rating,
      customer_note: review.customer_note || null
    }
    
    
    
    // Add publishable key to headers with correct header name
    const requestHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
    }
    
    // Send the review to the backend
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/reviews`,
      {
        headers: requestHeaders,
        method: "POST",
        body: JSON.stringify(reviewData),
        cache: 'no-store'
      }
    )

    
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create review: ${response.statusText} - ${errorText}`)
    }

    // Parse and return the result
    const result = await response.json()
    console.log('📝 [createReview] Backend response:', result)
    
    // Revalidate paths and tags using Next.js cache invalidation
    try {
      const productId = review.product_id || review.reference_id
      
      // ✅ CRITICAL: Invalidate the tagged cache for product reviews
      if (productId) {
        const { revalidateTag } = await import('next/cache')
        revalidateTag(`product-reviews-${productId}`)
      }
      
      // Revalidate paths for UI updates
      revalidatePath('/user/reviews')
      revalidatePath('/user/reviews/written')
      
      // Revalidate product pages
      if (review.reference === 'product' && productId) {
        revalidatePath(`/products/${productId}`)
        revalidatePath('/products', 'page') // Revalidate all product pages
      }
    } catch (revalidateError) {
      // Revalidation is optional, continue even if it fails
      console.warn('Cache revalidation failed:', revalidateError)
    }
    
    return { success: true, review: result }
  } catch (error) {
    console.error("❌ Error creating review:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Checks if the authenticated user has already reviewed a specific product
 * Returns the review data if it exists, allowing for edit mode
 */
export const checkUserReviewStatus = async (productId: string) => {
  
  try {
    // Get auth headers - if not authenticated, this will return empty headers
    const headers = await getAuthHeaders()
    
    // If not authenticated, user definitely hasn't reviewed
    if (!Object.keys(headers).includes('authorization')) {
      return { exists: false, review: null }
    }
    
    const requestHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
    }
    
    // Call the review-status endpoint
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products/${productId}/review-status`,
      {
        method: 'GET',
        headers: requestHeaders,
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      return { exists: false, review: null }
    }
    
    const data = await response.json()
    
    return data
  } catch (error) {
    return { exists: false, review: null }
  }
}

/**
 * Updates an existing review
 * 
 * Required fields:
 * - id (string): The ID of the review to update
 * - rating (number): The new rating value (1-5)
 * 
 * Optional fields:
 * - customer_note (string): The updated review text
 */
export const updateReview = async (review: { id: string, rating: number, customer_note?: string }) => {
  
  try {
    // Validate required fields
    if (!review.id || !review.rating) {
      throw new Error('Required fields missing: id or rating')
    }
    
    // Validate rating range
    if (review.rating < 1 || review.rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
    
    // Get auth headers
    const headers = await getAuthHeaders()
    
    // Check if user is authenticated
    if (!Object.keys(headers).includes('authorization')) {
      throw new Error('Authentication required')
    }
    
    // Format the update data
    const updateData = {
      rating: review.rating,
      customer_note: review.customer_note || null
    }
    
    // Add publishable key to headers
    const requestHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
    }
    
    // Send the update to the backend
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/reviews/${review.id}`,
      {
        headers: requestHeaders,
        method: 'POST',
        body: JSON.stringify(updateData),
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update review: ${response.statusText} - ${errorText}`)
    }
    
    // Parse and return the result
    const result = await response.json()
    
    // Try to revalidate paths to clear cache
    try {
      const paths = [
        '/user/reviews',
        '/user/reviews/written'
      ]
      await Promise.all(paths.map(path => {
        return fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, {
          method: 'POST'
        }).catch(err => console.warn('Revalidation error:', err))
      }))
    } catch (revalidateError) {
    }
    
    return { success: true, review: result.review }
  } catch (error) {
    console.error("❌ Error updating review:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Fetches reviews for a specific seller by handle
 * 
 * This function calls the seller reviews endpoint to get all reviews
 * associated with a particular seller.
 */
const getSellerReviews = async (sellerHandle: string) => {
  
  try {
    const headers = await getAuthHeaders()
    
    const commonHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
    }
    
    // Encode the handle to properly handle special characters like dots
    const encodedHandle = encodeURIComponent(sellerHandle)
    
    // Use the seller reviews endpoint
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/seller/${encodedHandle}/reviews?limit=100`,
      {
        method: 'GET',
        headers: commonHeaders,
        cache: 'no-store'
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      
      if (data?.reviews && Array.isArray(data.reviews)) {
        return { reviews: data.reviews, count: data.count || data.reviews.length }
      }
    } 
    
    return { reviews: [], count: 0 }
    
  } catch (error) {
    console.error(`❌ Error fetching seller reviews:`, error)
    return { reviews: [], count: 0 }
  }
}

/**
 * Checks if the authenticated user is eligible to review a specific product
 * User is eligible if they have purchased the product in a completed order
 */
export const checkProductReviewEligibility = async (productId: string): Promise<{
  isEligible: boolean
  hasPurchased: boolean
}> => {
  try {
    // Get auth headers - if not authenticated, user is not eligible
    const headers = await getAuthHeaders()
    
    if (!Object.keys(headers).includes('authorization')) {
      return { isEligible: false, hasPurchased: false }
    }
    
    const requestHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
    }
    
    // Call the eligibility check endpoint
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products/${productId}/review-eligibility`,
      {
        method: 'GET',
        headers: requestHeaders,
        cache: 'no-store'
      }
    )
    
    if (!response.ok) {
      console.error(`❌ Review eligibility endpoint failed with status ${response.status}`)
      // If endpoint doesn't exist, fall back to checking orders
      // This is a backup method
      return await checkEligibilityViaOrders(productId, requestHeaders)
    }
    
    const data = await response.json()
    return data
    
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    // On error, try fallback method
    try {
      const headers = await getAuthHeaders()
      const requestHeaders: Record<string, string> = {
        ...headers,
        'Content-Type': 'application/json',
        'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
      }
      return await checkEligibilityViaOrders(productId, requestHeaders)
    } catch (fallbackError) {
      return { isEligible: false, hasPurchased: false }
    }
  }
}

/**
 * Fallback method to check eligibility by fetching user's orders
 */
const checkEligibilityViaOrders = async (
  productId: string, 
  headers: Record<string, string>
): Promise<{ isEligible: boolean, hasPurchased: boolean }> => {
  try {
    // Fetch user's orders
    const ordersResponse = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/customers/me/orders?limit=100`,
      {
        method: 'GET',
        headers,
        cache: 'no-store'
      }
    )
    
    if (!ordersResponse.ok) {
      return { isEligible: false, hasPurchased: false }
    }
    
    const ordersData = await ordersResponse.json()
    const orders = ordersData.orders || []
    
    // Check if user has purchased this product in any order
    const hasPurchased = orders.some((order: any) => {
      if (!order.items || !Array.isArray(order.items)) return false
      return order.items.some((item: any) => item.product_id === productId)
    })
    
    return { isEligible: hasPurchased, hasPurchased }
    
  } catch (error) {
    console.error('Error in fallback eligibility check:', error)
    return { isEligible: false, hasPurchased: false }
  }
}

export { getReviews, getProductReviews, getSellerReviews }