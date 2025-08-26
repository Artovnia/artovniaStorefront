"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { Message, MessageSender, MessageThread, MessageThreadTypeEnum } from "@/types/messages"

// Import the createMessageThread function from message-thread-actions
import { createMessageThread as originalCreateMessageThread } from "./message-thread-actions"

// Create an async wrapper to satisfy the "use server" requirement
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
}) {
  // Simply pass through to the original function
  return originalCreateMessageThread(data)
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

    if (type) {
      query.type = type
    }

    if (skip) {
      query.skip = skip
    }

    if (take) {
      query.take = take
    }

    // Get auth headers with error handling
    let headers = {}
    try {
      headers = {
        ...(await getAuthHeaders()),
      }
    } catch (authError) {
      console.error('Error getting auth headers:', authError)
      // Continue with empty headers rather than failing completely
    }

    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching message threads with query:', query)
    }

    // Use the correct endpoint that's implemented in the backend
    // Add timeout to prevent long-hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await sdk.client.fetch<{ threads?: MessageThread[], count?: number }>(`/store/messages`, {
        method: "GET",
        query,
        headers,
        cache: "no-cache",
        signal: controller.signal
      });
      
      // Clear timeout if request completed successfully
      clearTimeout(timeoutId);
      
      // Check if we have threads in the response
      let threads: MessageThread[] = [];
      
      if (response.threads && Array.isArray(response.threads)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Received ${response.threads.length} message threads from API`)
        }
        threads = response.threads;
      } else {
        // If the response format is different, try to extract threads from the response
        const anyResponse = response as any
        if (anyResponse.data && Array.isArray(anyResponse.data)) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Received ${anyResponse.data.length} message threads from API (data property)`)
          }
          threads = anyResponse.data;
        }
      }
      
      // Process each thread to ensure messages are properly set up
      threads = threads.map(thread => {
        // Ensure messages array is properly initialized
        if (!thread.messages) {
          thread.messages = [];
        }
        
        // If we have messages but no last_message, set it from the messages array
        if (thread.messages.length > 0 && !thread.last_message) {
          // Find the most recent message
          const sortedMessages = [...thread.messages].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          // Set the last message
          thread.last_message = sortedMessages[0];
        }
        
        return thread;
      });
      
      // If we have threads, fetch seller information for each thread
      if (threads.length > 0) {
        try {
          // Fetch all sellers once to avoid multiple API calls
          const sellersResponse = await sdk.client.fetch<{ sellers: any[] }>(`/store/seller`, {
            method: "GET",
            headers,
            cache: "no-cache"
          });
          
          const sellers = sellersResponse?.sellers || [];
          
          // Process each thread to add seller information and calculate unread status
          threads = threads.map(thread => {
            // Ensure thread has all required properties
            if (!thread) return thread;
            
            // Calculate unread status for each thread
            let unreadCount = 0;
            
            // If we have messages array, count precisely
            if (thread.messages && Array.isArray(thread.messages) && thread.messages.length > 0) {
              // Count messages from seller/admin that are newer than user_read_at
              if (thread.user_read_at) {
                const userReadAt = new Date(thread.user_read_at);
                unreadCount = thread.messages.filter(msg => 
                  new Date(msg.created_at) > userReadAt && 
                  (msg.sender_type === MessageSender.SELLER || msg.sender_type === MessageSender.ADMIN)
                ).length;
              } else {
                // If never read, count all messages from seller/admin
                unreadCount = thread.messages.filter(msg => 
                  msg.sender_type === MessageSender.SELLER || msg.sender_type === MessageSender.ADMIN
                ).length;
              }
            } else {
              // Fallback: use last_message_at comparison if no messages array
              if (!thread.user_read_at && thread.last_message_at) {
                unreadCount = 1;
              } else if (thread.user_read_at && thread.last_message_at && 
                         new Date(thread.user_read_at) < new Date(thread.last_message_at)) {
                unreadCount = 1;
              }
            }
            
            // Update thread with unread count
            thread = {
              ...thread,
              unread_count: unreadCount
            };
            
            // Skip if thread already has seller information
            if (thread.seller && thread.seller.name && thread.seller.name !== 'Sprzedawca') {
              return thread;
            }
            
            // Skip if thread doesn't have a seller_id
            if (!thread.seller_id || typeof thread.seller_id !== 'string') {
              return {
                ...thread,
                seller: { id: 'unknown', name: 'Sprzedawca' }
              };
            }
            
            // Find matching seller by ID
            const matchingSeller = sellers.find(s => s.id === thread.seller_id);
            
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
              };
            }
            
            // If no matching seller found, return thread with default seller
            return {
              ...thread,
              seller: { id: thread.seller_id, name: 'Sprzedawca' }
            };
          });
        } catch (sellerError) {
          console.error('Error fetching sellers:', sellerError);
          // Continue with threads without seller information
        }
      }
      
      return threads;
    } catch (fetchError) {
      // Clear timeout if request failed
      clearTimeout(timeoutId);
      throw fetchError; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Request for message threads timed out');
    } else {
      console.error('Error fetching message threads:', error);
    }
    
    // Return empty array to prevent UI from breaking
    return [];
  }
}

/**
 * Fetches a single message thread with all its messages and seller information
 */
export async function getMessageThread(threadId: string): Promise<MessageThread | null> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    // Use the correct endpoint path for fetching a single thread
    const response = await sdk.client.fetch<{ thread: MessageThread }>(`/store/messages/${threadId}`, {
      method: "GET",
      headers,
      cache: "no-cache"
    })
    
    let thread = response.thread || null
    
    if (!thread) {
      console.error(`Thread ${threadId} not found in response`);
      return null;
    }
    
    // If we have a thread with a seller_id but no seller object, fetch the seller info
    if (thread.seller_id && typeof thread.seller_id === 'string') {
      try {
        // First, try to get all sellers and find the one with matching ID
        const sellersResponse = await sdk.client.fetch<{ sellers: any[] }>(`/store/seller`, {
          method: "GET",
          headers,
          cache: "no-cache"
        })
        
        // Find the seller with matching ID
        const matchingSeller = sellersResponse?.sellers?.find(s => s.id === thread.seller_id);
        
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
        } else if (sellersResponse?.sellers?.length > 0) {
          // If we have sellers but none match, use the first seller as fallback
          const firstSeller = sellersResponse.sellers[0];
          thread = {
            ...thread,
            seller: {
              id: thread.seller_id,
              name: firstSeller.name || 'Sprzedawca',
              handle: firstSeller.handle,
              photo: firstSeller.photo
            }
          }
        } else {
          // Set a default seller object if we couldn't fetch any sellers
          thread = {
            ...thread,
            seller: {
              id: thread.seller_id || 'unknown',
              name: 'Sprzedawca'
            }
          }
        }
      } catch (sellerError) {
        console.error(`Error fetching seller for thread ${threadId}:`, sellerError);
        
        // Set a default seller object if we couldn't fetch the real one
        thread = {
          ...thread,
          seller: {
            id: thread.seller_id || 'unknown',
            name: 'Sprzedawca'
          }
        }
      }
    }
    
    return thread;
  } catch (error) {
    console.error(`Error fetching message thread ${threadId}:`, error);
    return null;
  }
}

/**
 * Sends a message in a thread
 * Uses server-side authentication to ensure proper token handling
 */
export async function sendMessage(threadId: string, content: string): Promise<Message | null> {
  if (!threadId || !content.trim()) {
    console.error('Invalid thread ID or empty message content')
    return null
  }

  try {
    // Get authentication headers with proper error handling
    let headers = {}
    try {
      headers = await getAuthHeaders()
    } catch (authError) {
      console.error('Authentication error when sending message:', authError)
      throw new Error('Authentication failed. Please try again or refresh the page.')
    }

    // Use the correct endpoint path for sending a message to a thread
    // First try the POST endpoint
    try {
      const response = await sdk.client.fetch<{ message: Message }>(`/store/messages/${threadId}`, {
        method: "POST",
        headers,
        body: {
          content: content,
          sender_type: "USER"
        },
      })
      
      if (response && response.message) {
        console.log('Message sent successfully via POST')
        return response.message
      }
    } catch (postError) {
      console.error(`Error using POST method for thread ${threadId}:`, postError)
      // Continue to try the reply endpoint as fallback
    }

    // Fallback to the reply endpoint if the POST endpoint fails
    const replyResponse = await sdk.client.fetch<{ message: Message }>(`/store/messages/${threadId}/reply`, {
      method: "POST",
      headers,
      body: {
        content: content,
        sender_type: "USER"
      },
    })
    
    if (replyResponse && replyResponse.message) {
      console.log('Message sent successfully via reply endpoint')
      return replyResponse.message
    }
    
    // If we get here, both attempts failed but didn't throw errors
    console.error(`Failed to send message to thread ${threadId}: No valid response`)
    return null
  } catch (error) {
    console.error(`Error sending message to thread ${threadId}:`, error)
    // Return null instead of throwing, to allow optimistic UI updates to remain
    return null
  }
}

/**
 * Marks a message thread as read by the user
 * @param threadId The ID of the thread to mark as read
 * @returns A promise that resolves to a boolean indicating success or failure
 */
export async function markThreadAsRead(threadId: string): Promise<boolean> {
  if (!threadId) {
    console.error('Invalid thread ID')
    return false
  }

  try {
    // Get authentication headers
    const headers = await getAuthHeaders()
    
    // Call the backend endpoint to mark the thread as read
    const response = await sdk.client.fetch<{ success: boolean, thread: MessageThread }>(`/store/messages/${threadId}/read`, {
      method: "POST",
      headers,
      cache: "no-store",
      next: { revalidate: 0 }
    })
    
    if (response && response.success) {
      console.log(`Successfully marked thread ${threadId} as read`)
      return true
    } else {
      console.warn(`Failed to mark thread ${threadId} as read: No success confirmation in response`)
      return false
    }
  } catch (error) {
    console.error(`Error marking thread ${threadId} as read:`, error)
    return false
  }
}
