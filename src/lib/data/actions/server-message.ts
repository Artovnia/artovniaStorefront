"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { MessageThread, MessageThreadTypeEnum } from "@/lib/data/messages"
import { retrieveCustomer } from "@/lib/data/customer"

/**
 * Server action to create a new message thread
 * This ensures proper authentication by using the server-side authentication flow
 */
export async function createServerMessageThread(data: {
  subject: string
  type: MessageThreadTypeEnum
  seller_id: string
  content: string
}): Promise<{ success: boolean; thread?: MessageThread; error?: string }> {
  try {
    // First verify that the user is authenticated by retrieving customer data
    const customer = await retrieveCustomer()
    
    // If no customer data, the user is not authenticated
    if (!customer) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      }
    }
    
    // Get auth headers from cookies
    const headers = await getAuthHeaders()

    // Use the correct endpoint for creating a message thread
    const response = await sdk.client.fetch<{ thread: MessageThread }>(`/store/messages`, {
      method: "POST",
      headers,
      body: {
        subject: data.subject,
        type: data.type,
        seller_id: data.seller_id,
        initial_message: {
          content: data.content
        }
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
    if (!response || !response.thread) {
      return { 
        success: false, 
        error: 'Invalid response from server' 
      }
    }
    
    return { 
      success: true, 
      thread: response.thread 
    }
  } catch (error: any) {
    // Provide more detailed error information
    const errorMessage = error?.message || error?.toString() || 'An unknown error occurred'

    
    return { 
      success: false, 
      error: errorMessage
    }
  }
}
