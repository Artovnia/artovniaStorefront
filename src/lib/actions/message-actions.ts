"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./auth-actions"
import type { Message, MessageThread } from "@/types/messages"

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

    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ message_threads: MessageThread[] }>(`/store/message-threads`, {
      method: "GET",
      query,
      headers,
      cache: "no-cache"
    })
    
    return response.message_threads || []
  } catch (error) {
    console.error("Error fetching message threads:", error)
    return []
  }
}

/**
 * Fetches a single message thread with all its messages
 */
export async function getMessageThread(threadId: string): Promise<MessageThread | null> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ message_thread: MessageThread }>(`/store/message-threads/${threadId}`, {
      method: "GET",
      headers,
      cache: "no-cache"
    })
    
    return response.message_thread || null
  } catch (error) {
    console.error(`Error fetching message thread ${threadId}:`, error)
    return null
  }
}

/**
 * Creates a new message thread
 */
export async function createMessageThread(sellerId: string, initialMessage: string): Promise<MessageThread | null> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ message_thread: MessageThread }>(`/store/message-threads`, {
      method: "POST",
      headers,
      body: {
        seller_id: sellerId,
        message: initialMessage
      },
    })
    
    return response.message_thread || null
  } catch (error) {
    console.error(`Error creating message thread with seller ${sellerId}:`, error)
    return null
  }
}

/**
 * Sends a message in a thread
 */
export async function sendMessage(threadId: string, content: string): Promise<Message | null> {
  try {
    const headers = {
      ...(await getAuthHeaders()),
    }

    const response = await sdk.client.fetch<{ message: Message }>(`/store/message-threads/${threadId}`, {
      method: "POST",
      headers,
      body: {
        message: content
      },
    })
    
    return response.message || null
  } catch (error) {
    console.error(`Error sending message to thread ${threadId}:`, error)
    return null
  }
}
