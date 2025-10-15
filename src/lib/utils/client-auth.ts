/**
 * Client-side authentication utilities
 * This file provides client-side alternatives to server-only authentication functions
 */

import { sdk } from "@/lib/config"
import { MessageSender } from "@/lib/data/messages"

// Type definitions to fix TypeScript errors
type Customer = {
  id: string
  email: string
  [key: string]: any
}

type AuthResponse = {
  customer?: Customer
  [key: string]: any
}

type MessageResponse = {
  count?: number
  threads?: ThreadType[]
  [key: string]: any
}

type ThreadType = {
  id: string
  user_read_at?: string
  messages: MessageType[]
  [key: string]: any
}

type MessageType = {
  id: string
  sender_type: string
  created_at: string
  [key: string]: any
}

/**
 * Gets the current authentication status from the client side
 * This doesn't use server-only components like next/headers
 */
export async function getClientAuthStatus() {
  try {
    // Make a request to check authentication status
    const response = await sdk.client.fetch<AuthResponse>('/store/auth', {
      method: 'GET',
      credentials: 'include', // Important: include cookies in the request
    })
    
    return {
      isAuthenticated: !!response?.customer,
      customer: response?.customer || null
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      customer: null
    }
  }
}

/**
 * Client-side function to fetch messages
 * Doesn't rely on server-only components
 */
export async function fetchClientMessages(threadId?: string): Promise<MessageResponse> {
  try {
    const endpoint = threadId 
      ? `/store/messages/${threadId}`
      : '/store/messages'
      
    const response = await sdk.client.fetch<MessageResponse>(endpoint, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    })
    
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Client-side function to send a message
 * Doesn't rely on server-only components
 */
export async function sendClientMessage(threadId: string, content: string) {
  try {
    const response = await sdk.client.fetch(`/store/messages/${threadId}/reply`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        content,
        sender_type: 'user'
      })
    })
    
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Client-side function to check for unread messages
 * Doesn't rely on server-only components
 */
export async function getClientUnreadCount(): Promise<number> {
  try {
    // First try the dedicated endpoint
    try {
      const response = await sdk.client.fetch<MessageResponse>('/store/messages/unread/count', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      })
      
      if (response && typeof response.count === 'number') {
        return response.count
      }
    } catch (error) {
    throw error
    }
    
    // If the dedicated endpoint fails, calculate manually
    const response = await sdk.client.fetch<MessageResponse>('/store/messages', {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    })
    
    if (!response || !response.threads || !Array.isArray(response.threads)) {
      return 0
    }
    
    // Calculate unread count manually
    let unreadCount = 0
    
    for (const thread of response.threads) {
      if (!thread.user_read_at) {
        // If never read, count all seller messages
        unreadCount += thread.messages.filter((m: MessageType) => m.sender_type === 'seller').length
      } else {
        // Count only newer messages from seller
        const lastReadTime = new Date(thread.user_read_at).getTime()
        const unreadInThread = thread.messages.filter((m: MessageType) => 
          m.sender_type === 'seller' && 
          new Date(m.created_at).getTime() > lastReadTime
        ).length
        
        unreadCount += unreadInThread
      }
    }
    
    return unreadCount
  } catch (error) {
    return 0
  }
}
