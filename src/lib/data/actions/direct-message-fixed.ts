"use server"

import { sdk } from "@/lib/config"
import { MessageThread } from "@/lib/data/messages"
import { retrieveCustomer } from "@/lib/data/customer"
import { getAuthHeaders } from "@/lib/data/cookies"

/**
 * Server action to create a new message thread with proper authentication
 * This implementation directly extracts the JWT token and passes it correctly
 * Simplified to only include subject and content as requested
 */
export async function createDirectMessage(data: {
  subject: string
  seller_id: string
  content: string
}): Promise<{ success: boolean; thread?: MessageThread; error?: string }> {
  try {
    // First verify that the user is authenticated by retrieving customer data
    const customer = await retrieveCustomer()
    
    // If no customer data, the user is not authenticated
    if (!customer) {
      console.error("Authentication failed: No customer data found")
      return { 
        success: false, 
        error: 'User not authenticated' 
      }
    }
    
    // Get auth headers using the utility function
    const headers = await getAuthHeaders()
    
    // Check if we have auth headers
    const hasAuth = 'authorization' in headers
    
    if (!hasAuth) {
      console.error("Authentication failed: No authorization header")
      return { 
        success: false, 
        error: 'Authentication token not found' 
      }
    }
    
    // Verify the token format is correct (should be 'Bearer {token}')
    const authHeader = headers.authorization as string
    if (!authHeader.startsWith('Bearer ')) {
      console.error("Authentication header format is incorrect")
      console.error("Expected format: 'Bearer {token}', got:", authHeader.substring(0, 10) + '...')
    }
    
    // Log authentication details for debugging
    console.log('Creating message with server authentication:', { 
      customerId: customer.id,
      hasAuthHeader: hasAuth,
      sellerId: data.seller_id
    })

    // Use the correct endpoint for creating a message thread
    const response = await sdk.client.fetch<{ thread: MessageThread }>(`/store/messages`, {
      method: "POST",
      headers: {
        ...headers,
        "accept": "application/json",
        "content-type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      },
      body: {
        subject: data.subject,
        // Always use 'general' as the default type to ensure compatibility with the database
        type: 'general',
        seller_id: data.seller_id,
        initial_message: {
          content: data.content
        }
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
    if (!response || !response.thread) {
      console.error("Invalid response from server:", response)
      return { 
        success: false, 
        error: 'Invalid response from server' 
      }
    }
    
    console.log("Message sent successfully:", { threadId: response.thread.id })
    return { 
      success: true, 
      thread: response.thread 
    }
  } catch (error: any) {
    console.error(`Error creating message thread:`, error)
    
    // Provide more detailed error information
    const errorMessage = error?.message || error?.toString() || 'An unknown error occurred'
    const statusCode = error?.status || error?.statusCode
    
    console.error(`Message error details:`, { errorMessage, statusCode })
    
    return { 
      success: false, 
      error: errorMessage
    }
  }
}
