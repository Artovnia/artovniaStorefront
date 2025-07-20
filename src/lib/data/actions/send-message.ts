"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { MessageThread, MessageThreadTypeEnum } from "@/lib/data/messages"

/**
 * Server action to create a new message thread
 * This ensures proper authentication handling by running on the server
 */
export async function sendMessageToSeller(data: {
  subject: string
  type: MessageThreadTypeEnum
  seller_id: string
  content: string
}): Promise<{ success: boolean; thread?: MessageThread; error?: string }> {
  try {
    // Get auth headers using the project's authentication pattern
    const headers = {
      ...(await getAuthHeaders()),
    }
    
    // If there are no auth headers, the user is not authenticated
    if (!headers || !('authorization' in headers)) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      }
    }

    console.log('Creating message thread with seller:', { 
      sellerId: data.seller_id,
      hasAuthorization: 'authorization' in headers
    })

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
      cache: 'no-store', // Ensure we're not using cached responses
      next: { revalidate: 0 } // Ensure we're not using cached data
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
    console.error(`Error creating message thread with seller ${data.seller_id}:`, error)
    return { 
      success: false, 
      error: error?.message || 'An unknown error occurred' 
    }
  }
}
