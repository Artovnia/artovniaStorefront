"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { MessageThread } from "@/types/messages"
import { revalidateTag } from "next/cache"

/**
 * Marks a message thread as read and updates cache
 * @param threadId The ID of the thread to mark as read
 * @returns Promise<boolean> indicating success
 */
export async function markThreadAsRead(threadId: string): Promise<boolean> {
  if (!threadId) {
    console.error('Invalid thread ID')
    return false
  }

  try {
    const headers = await getAuthHeaders()
    
    const response = await sdk.client.fetch<{ success: boolean, thread: MessageThread }>(`/store/messages/${threadId}/read`, {
      method: "POST",
      headers,
      cache: "no-store"
    })
    
    if (response?.success) {
      // Invalidate message-related cache
      revalidateTag('messages')
      revalidateTag('message-threads')
      revalidateTag(`message-thread-${threadId}`)
      
      console.log(`Successfully marked thread ${threadId} as read`)
      return true
    }
    
    console.warn(`Failed to mark thread ${threadId} as read`)
    return false
  } catch (error) {
    console.error(`Error marking thread ${threadId} as read:`, error)
    return false
  }
}

/**
 * Gets unread message count from backend
 * @returns Promise<number> unread count
 */
export async function getUnreadMessageCount(): Promise<number> {
  try {
    const headers = await getAuthHeaders()
    
    const response = await sdk.client.fetch<{ count: number }>(`/store/messages/unread/count`, {
      method: "GET",
      headers,
      cache: "no-store"
    })
    
    return response?.count || 0
  } catch (error) {
    console.error('Error fetching unread message count:', error)
    return 0
  }
}

/**
 * Updates thread read status locally and on server
 * @param thread The thread to update
 * @returns Promise<MessageThread> updated thread
 */
export async function updateThreadReadStatus(thread: MessageThread): Promise<MessageThread> {
  if (!thread?.id) return thread
  
  // Mark as read on server
  const success = await markThreadAsRead(thread.id)
  
  if (success) {
    // Update local thread state
    return {
      ...thread,
      user_read_at: new Date().toISOString(),
      unread_count: 0
    }
  }
  
  return thread
}
