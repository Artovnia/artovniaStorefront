"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { MessageThread } from "@/types/messages"
import { countUnreadMessages, updateUnreadCountLocally } from "@/lib/utils/message-utils"

/**
 * Checks if the current user has any unread messages
 * @returns The count of unread messages or 0 if none
 */
export async function getUnreadMessagesCount(): Promise<number> {
  try {
    // First try to get the count from the dedicated API endpoint
    try {
      const headers = await getAuthHeaders()

      // Use the specific endpoint for getting unread count
      const response = await sdk.client.fetch<{ count: number }>(`/store/messages/unread/count`, {
        method: "GET",
        headers,
        cache: "no-store", // Don't cache this response
        next: { revalidate: 0 } // Force revalidation every time
      })
      
      if (response && typeof response.count === 'number') {
        // Cache the count in localStorage for UI consistency
        updateUnreadCountLocally(response.count)
        return response.count
      }
    } catch (apiError) {
      console.error("API error fetching unread count, falling back to manual calculation:", apiError)
      // Fall through to the manual calculation below
    }
    
    // If the API fails, calculate it manually by fetching all threads
    const headers = await getAuthHeaders()
    
    // Get all threads for the user
    const response = await sdk.client.fetch<{ threads: MessageThread[] }>(`/store/messages`, {
      method: "GET",
      headers,
      cache: "no-store",
      next: { revalidate: 0 }
    })
    
    if (!response || !response.threads || !Array.isArray(response.threads)) {
      return 0
    }
    
    // Use the helper function to calculate unread messages
    const unreadCount = countUnreadMessages(response.threads)
    
    // Cache the count in localStorage for UI consistency
    updateUnreadCountLocally(unreadCount)
    
    return unreadCount
  } catch (error) {
    console.error("Error calculating unread messages count:", error)
    return 0
  }
}
