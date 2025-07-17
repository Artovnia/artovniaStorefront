"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { MessageThread, MessageThreadTypeEnum } from "@/types/messages"

/**
 * Creates a new message thread
 */
export async function createMessageThread(data: {
  subject: string
  type: MessageThreadTypeEnum
  seller_id: string
  initial_message: {
    content: string
    attachment_url?: string
    attachment_thumbnail_url?: string
    attachment_name?: string
    attachment_type?: string
  }
}): Promise<{ thread: MessageThread } | null> {
  try {
    // Get auth headers using the project's authentication pattern
    const headers = {
      ...(await getAuthHeaders()),
    }
    
    // If there are no auth headers, the user is not authenticated
    if (!headers || !headers.authorization) {
      throw new Error('User not authenticated')
    }

    console.log('Creating message thread with headers:', { 
      hasAuthorization: !!headers.authorization,
      authHeaderLength: headers.authorization ? headers.authorization.length : 0 
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
          content: data.initial_message.content,
          attachment_url: data.initial_message.attachment_url,
          attachment_thumbnail_url: data.initial_message.attachment_thumbnail_url,
          attachment_name: data.initial_message.attachment_name,
          attachment_type: data.initial_message.attachment_type
        }
      },
      cache: 'no-store', // Ensure we're not using cached responses
      next: { revalidate: 0 } // Ensure we're not using cached data
    })
    
    if (!response || !response.thread) {
      throw new Error('Invalid response from server')
    }
    
    return { thread: response.thread }
  } catch (error) {
    console.error(`Error creating message thread with seller ${data.seller_id}:`, error)
    throw error // Re-throw to allow proper error handling in the component
  }
}
