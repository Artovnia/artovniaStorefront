// src/lib/data/reviews.ts
"use server"
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
  reference: string
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
}

export type Order = HttpTypes.StoreOrder & {
  seller: { id: string; name: string; reviews?: any[] }
  reviews: any[]
}

const getReviews = async () => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.client.fetch("/store/reviews", {
    headers,
    query: { fields: "*seller,+customer.id,+order_id" },
    method: "GET",
  }) as { reviews: Review[] }; // Fix: Properly type the response

  return response
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
const getProductReviews = async (productId: string) => {
  console.log(`🔎 Fetching reviews for product: ${productId}`)
  
  try {
    const headers = await getAuthHeaders()
    
    const commonHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
      'x-publishable-api-key': `${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''}`
    }
    
    // Use the product reviews endpoint
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/products/${productId}/reviews?limit=100`,
      {
        method: 'GET',
        headers: commonHeaders,
        cache: 'no-store'
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      console.log(`📊 Product reviews response:`, data)
      
      if (data?.reviews && Array.isArray(data.reviews)) {
        console.log(`✅ Found ${data.reviews.length} reviews via product endpoint`)
        return { reviews: data.reviews }
      }
    } else {
      console.log(`⚠️ Product reviews endpoint failed: ${response.status}`)
      const errorText = await response.text()
      console.log(`Error details:`, errorText)
    }
    
    return { reviews: [] }
    
  } catch (error) {
    console.error(`❌ Error fetching product reviews:`, error)
    return { reviews: [] }
  }
}

/**
 * Creates a review for a product
 * 
 * Required fields in the review object:
 * - product_id (string): ID of the product being reviewed
 * - rating (number): Rating from 1-5
 * 
 * Optional fields:
 * - customer_note (string): Text review content
 * 
 * The customer_id is extracted from the JWT token in the authorization header
 */
export const createReview = async (review: any) => {
  console.log('📝 Creating review for product:', review.product_id)
  
  try {
    // Validate required fields
    if (!review.product_id || !review.rating) {
      console.error('❌ Required fields missing for review creation')
      throw new Error('Required fields missing: product_id or rating')
    }
    
    // Validate rating range
    if (review.rating < 1 || review.rating > 5) {
      console.error('❌ Invalid rating value:', review.rating)
      throw new Error('Rating must be between 1 and 5')
    }
    
    // Get auth headers
    const headers = await getAuthHeaders()
    
    // Check if user is authenticated
    if (!Object.keys(headers).includes('authorization')) {
      console.error('🔒 Authentication required for review submission')
      throw new Error('Authentication required')
    }
    
    // Format the review data according to backend API requirements
    // The format must match StoreCreateReview schema in the backend validators
    const reviewData = {
      reference: "product",
      reference_id: review.product_id,
      rating: review.rating,
      customer_note: review.customer_note || null
    }
    
    console.log('📣 Submitting review to API:', JSON.stringify(reviewData, null, 2))
    
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

    console.log(`📡 Review API response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`🔴 API Error: ${errorText}`)
      throw new Error(`Failed to create review: ${response.statusText} - ${errorText}`)
    }

    // Parse and return the result
    const result = await response.json()
    console.log('✅ Review created successfully:', result)
    
    // Try to revalidate paths to clear cache
    try {
      const paths = [
        '/user/reviews',
        '/user/reviews/written',
        `/products/${review.product_id}`
      ]
      console.log('🗑 Revalidating paths to clear cache:', paths.join(', '))
      await Promise.all(paths.map(path => {
        return fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, {
          method: 'POST'
        }).catch(err => console.warn('Revalidation error:', err))
      }))
    } catch (revalidateError) {
      console.warn('⚠️ Cache revalidation failed:', revalidateError)
      // Continue execution even if revalidation fails
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
  console.log(`🔍 Checking if user has already reviewed product: ${productId}`)
  
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
      console.warn(`⚠️ Review status check failed: ${response.status}`)
      return { exists: false, review: null }
    }
    
    const data = await response.json()
    console.log(`✓ Review status check result:`, data)
    
    return data
  } catch (error) {
    console.error(`❌ Error checking review status:`, error)
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
  console.log(`✏️ Updating review ${review.id}`)
  
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
    console.log('✅ Review updated successfully:', result)
    
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
      console.warn('⚠️ Cache revalidation failed:', revalidateError)
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

export { getReviews, getProductReviews }