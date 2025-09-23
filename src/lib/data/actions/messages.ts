"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { Message, MessageSender, MessageThread, MessageThreadTypeEnum } from "@/types/messages"
import { countUnreadMessages, updateUnreadCountLocally } from "@/lib/utils/message-utils"
import { retrieveCustomer } from "@/lib/data/customer"

/**
 * Consolidated message service - replaces all duplicate message action files
 */

// ============================================================================
// AUTHENTICATION & UNREAD COUNT
// ============================================================================

/**
 * Checks if the current user has any unread messages
 * Only works for authenticated users - returns 0 for unauthenticated users
 */
export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const headers = await getAuthHeaders()
    
    // If no authorization header, user is not authenticated
    if (!('authorization' in headers)) {
      return 0
    }
    
    // Try dedicated endpoint first
    try {
      const response = await sdk.client.fetch<{ count: number }>(`/store/messages/unread/count`, {
        method: "GET",
        headers,
        cache: "no-store",
        next: { revalidate: 0 }
      })
      
      if (response && typeof response.count === 'number') {
        updateUnreadCountLocally(response.count)
        return response.count
      }
    } catch (apiError: any) {
      if (apiError?.status === 401) {
        updateUnreadCountLocally(0)
        return 0
      }
    }
    
    // Fallback: calculate manually
    try {
      const response = await sdk.client.fetch<{ threads: MessageThread[] }>(`/store/messages`, {
        method: "GET",
        headers,
        cache: "no-store",
        next: { revalidate: 0 }
      })
      
      if (!response?.threads || !Array.isArray(response.threads)) {
        return 0
      }
      
      const unreadCount = countUnreadMessages(response.threads)
      updateUnreadCountLocally(unreadCount)
      return unreadCount
    } catch (fallbackError: any) {
      if (fallbackError?.status === 401) {
        updateUnreadCountLocally(0)
        return 0
      }
      throw fallbackError
    }
  } catch (error) {
    return 0
  }
}

// ============================================================================
// THREAD MANAGEMENT
// ============================================================================

/**
 * Creates a new message thread with a seller
 */
export async function createMessageThread(data: {
  subject: string
  seller_id: string
  content: string
  type?: MessageThreadTypeEnum
}): Promise<{ success: boolean; thread?: MessageThread; error?: string }> {
  try {
    // Verify authentication
    const customer = await retrieveCustomer()
    if (!customer) {
      return { success: false, error: 'User not authenticated' }
    }
    
    const headers = await getAuthHeaders()
    if (!('authorization' in headers)) {
      return { success: false, error: 'Authentication token not found' }
    }

    const response = await sdk.client.fetch<{ thread: MessageThread }>(`/store/messages`, {
      method: "POST",
      headers,
      body: {
        subject: data.subject,
        type: data.type || 'general',
        seller_id: data.seller_id,
        initial_message: {
          content: data.content
        }
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    })
    
    if (!response?.thread) {
      return { success: false, error: 'Invalid response from server' }
    }
    
    return { success: true, thread: response.thread }
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || 'An unknown error occurred' 
    }
  }
}

/**
 * Fetches all message threads for the current user
 */
export async function listMessageThreads(options: {
  type?: string
  skip?: number
  take?: number
} = {}): Promise<MessageThread[]> {
  try {
    const { type, skip = 0, take = 10 } = options
    let query: Record<string, any> = {}

    if (type) query.type = type
    if (skip) query.skip = skip
    if (take) query.take = take

    const headers = await getAuthHeaders()
    
    // Return empty array for unauthenticated users
    if (!('authorization' in headers)) {
      return []
    }

    const response = await sdk.client.fetch<{ threads?: MessageThread[] }>(`/store/messages`, {
      method: "GET",
      query,
      headers,
      cache: "no-cache"
    })
    
    let threads: MessageThread[] = response.threads || []
    
    // Process threads to ensure proper structure
    threads = threads.map(thread => {
      if (!thread.messages) {
        thread.messages = []
      }
      
      // Deduplicate messages by ID (API might return duplicates)
      if (thread.messages && Array.isArray(thread.messages)) {
        const uniqueMessages = new Map()
        thread.messages.forEach(msg => {
          uniqueMessages.set(msg.id, msg)
        })
        thread.messages = Array.from(uniqueMessages.values())
      }
      
      // Set last_message from messages array if missing
      if (thread.messages.length > 0 && !thread.last_message) {
        const sortedMessages = [...thread.messages].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        thread.last_message = sortedMessages[0]
      }
      
      // Calculate unread count
      let unreadCount = 0
      if (thread.messages && Array.isArray(thread.messages) && thread.messages.length > 0) {
        if (thread.user_read_at) {
          const userReadAt = new Date(thread.user_read_at)
          unreadCount = thread.messages.filter(msg => 
            new Date(msg.created_at) > userReadAt && 
            (msg.sender_type === MessageSender.SELLER || msg.sender_type === MessageSender.ADMIN)
          ).length
        } else {
          unreadCount = thread.messages.filter(msg => 
            msg.sender_type === MessageSender.SELLER || msg.sender_type === MessageSender.ADMIN
          ).length
        }
      }
      
      return { ...thread, unread_count: unreadCount }
    })
    
    // Fetch seller information for all threads
    if (threads.length > 0) {
      try {
        // Fetch all sellers once to avoid multiple API calls
        const sellersResponse = await sdk.client.fetch<{ sellers: any[] }>(`/store/seller`, {
          method: "GET",
          headers,
          cache: "no-cache"
        })
        
        const sellers = sellersResponse?.sellers || []
        
        // Process each thread to add seller information
        threads = threads.map(thread => {
          // Skip if thread already has seller information
          if (thread.seller && thread.seller.name && thread.seller.name !== 'Sprzedawca') {
            return thread
          }
          
          // Skip if thread doesn't have a seller_id
          if (!thread.seller_id || typeof thread.seller_id !== 'string') {
            return {
              ...thread,
              seller: { id: 'unknown', name: 'Sprzedawca' }
            }
          }
          
          // Find matching seller by ID
          const matchingSeller = sellers.find(s => s.id === thread.seller_id)
          
          if (matchingSeller) {
            return {
              ...thread,
              seller: {
                id: matchingSeller.id,
                name: matchingSeller.name,
                handle: matchingSeller.handle,
                email: matchingSeller.email,
                photo: matchingSeller.photo
              }
            }
          }
          
          // If no matching seller found, return thread with default seller
          return {
            ...thread,
            seller: { id: thread.seller_id, name: 'Sprzedawca' }
          }
        })
      } catch (sellerError) {
        // Continue with threads without seller information if fetch fails
      }
    }
    
    return threads
  } catch (error) {
    return []
  }
}

/**
 * Fetches a single message thread with all its messages and seller information
 */
export async function getMessageThread(threadId: string): Promise<MessageThread | null> {
  try {
    const headers = await getAuthHeaders()
    
    if (!('authorization' in headers)) {
      return null
    }

    const response = await sdk.client.fetch<{ thread: MessageThread }>(`/store/messages/${threadId}`, {
      method: "GET",
      headers,
      cache: "no-cache"
    })
    
    let thread = response.thread || null
    
    if (!thread) {
      return null
    }
    
    // Deduplicate messages by ID (API might return duplicates)
    if (thread.messages && Array.isArray(thread.messages)) {
      const uniqueMessages = new Map()
      thread.messages.forEach(msg => {
        uniqueMessages.set(msg.id, msg)
      })
      thread.messages = Array.from(uniqueMessages.values())
    }
    
    
    // If we have a thread with a seller_id but no seller object, fetch the seller info
    if (thread.seller_id && typeof thread.seller_id === 'string') {
      try {
        // Fetch all sellers and find the one with matching ID
        const sellersResponse = await sdk.client.fetch<{ sellers: any[] }>(`/store/seller`, {
          method: "GET",
          headers,
          cache: "no-cache"
        })
        
        // Find the seller with matching ID
        const matchingSeller = sellersResponse?.sellers?.find(s => s.id === thread.seller_id)
        
        if (matchingSeller) {
          thread = {
            ...thread,
            seller: {
              id: matchingSeller.id,
              name: matchingSeller.name,
              handle: matchingSeller.handle,
              email: matchingSeller.email,
              photo: matchingSeller.photo
            }
          }
        } else {
          // Set a default seller object if we couldn't find the real one
          thread = {
            ...thread,
            seller: {
              id: thread.seller_id || 'unknown',
              name: 'Sprzedawca'
            }
          }
        }
      } catch (sellerError) {
        // Set a default seller object if we couldn't fetch seller info
        thread = {
          ...thread,
          seller: {
            id: thread.seller_id || 'unknown',
            name: 'Sprzedawca'
          }
        }
      }
    }
    
    return thread
  } catch (error) {
    return null
  }
}

// ============================================================================
// MESSAGE SENDING
// ============================================================================

/**
 * Sends a message in an existing thread
 */
export async function sendMessage(threadId: string, content: string): Promise<Message | null> {
  if (!threadId || !content.trim()) {
    return null
  }

  try {
    const headers = await getAuthHeaders()
    
    if (!('authorization' in headers)) {
      throw new Error('Authentication required')
    }

    // Try POST endpoint first
    try {
      const response = await sdk.client.fetch<{ message: Message }>(`/store/messages/${threadId}`, {
        method: "POST",
        headers,
        body: {
          content: content,
          sender_type: "USER"
        },
      })
      
      if (response?.message) {
        return response.message
      }
    } catch (postError) {
      // Fallback to reply endpoint
      const replyResponse = await sdk.client.fetch<{ message: Message }>(`/store/messages/${threadId}/reply`, {
        method: "POST",
        headers,
        body: {
          content: content,
          sender_type: "USER"
        },
      })
      
      if (replyResponse?.message) {
        return replyResponse.message
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

/**
 * Marks a message thread as read by the user
 */
export async function markThreadAsRead(threadId: string): Promise<boolean> {
  if (!threadId) {
    return false
  }

  try {
    const headers = await getAuthHeaders()
    
    if (!('authorization' in headers)) {
      return false
    }
    
    const response = await sdk.client.fetch<{ success: boolean }>(`/store/messages/${threadId}/read`, {
      method: "POST",
      headers,
      cache: "no-store",
      next: { revalidate: 0 }
    })
    
    return response?.success || false
  } catch (error) {
    return false
  }
}
