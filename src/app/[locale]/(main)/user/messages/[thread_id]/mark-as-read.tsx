"use client"

import { useEffect } from "react"
import { markThreadAsRead } from "@/lib/data/actions/message-actions"
import { markThreadAsReadLocally, updateUnreadCountLocally } from "@/lib/utils/message-utils"

/**
 * Component that automatically marks a message thread as read when mounted
 * This runs client-side and calls the server action to mark the thread as read
 */
export function MarkAsRead({ threadId }: { threadId: string }) {
  useEffect(() => {
    // Mark the thread as read when the component mounts
    const markAsRead = async () => {
      if (!threadId) return
      
      // Track if we need to apply client-side fallback
      let apiSuccess = false
      
      // First try the API endpoint
      try {
        console.log(`Marking thread ${threadId} as read...`)
        apiSuccess = await markThreadAsRead(threadId)
        
        if (apiSuccess) {
          console.log(`Successfully marked thread ${threadId} as read via API`)
          
          // Update the UI to reflect read state
          updateUnreadCountLocally(0)
          
          // Dispatch event to update the notification bell in the navigation
          const markAsReadEvent = new CustomEvent('messages:marked-as-read', {
            detail: { threadId, success: true }
          })
          window.dispatchEvent(markAsReadEvent)
        } else {
          console.warn(`API call succeeded but returned failure response for thread ${threadId}`)
        }
      } catch (error) {
        console.error(`Error marking thread ${threadId} as read:`, error)
      }
      
      // If the API call failed, still update the UI using client-side fallback
      if (!apiSuccess) {
        console.log(`Using client-side fallback to mark thread ${threadId} as read`)
        
        // Update the local storage state to consider this thread read
        // This ensures the UI shows the correct state even if the API failed
        updateUnreadCountLocally(0)
        
        // Dispatch event to update the notification bell in the navigation
        const markAsReadEvent = new CustomEvent('messages:marked-as-read', {
          detail: { threadId, success: false, fallback: true }
        })
        window.dispatchEvent(markAsReadEvent)
      }
    }
    
    // Small delay to ensure the page has loaded
    const timeoutId = setTimeout(markAsRead, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [threadId])
  
  // This component doesn't render anything
  return null
}
