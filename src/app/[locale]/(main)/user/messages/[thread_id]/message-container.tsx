"use client"

import { useState, useEffect, useRef } from "react"
import { Message, MessageThread as ThreadType, MessageSender } from "@/lib/data/messages"
import { MessageThread } from "./message-thread"
import { MessageForm } from "./message-form"
import { Divider } from "@/components/atoms"
import { sendMessage, markThreadAsRead } from "@/lib/data/actions/messages"
import { markThreadAsReadLocally, updateUnreadCountLocally } from "@/lib/utils/message-utils"

export function MessageContainer({ thread }: { thread: ThreadType }) {
  // Initialize optimistic messages as empty array to avoid hydration mismatch
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [isClient, setIsClient] = useState(false)
  
  // Load optimistic messages from localStorage only on client side
  useEffect(() => {
    setIsClient(true)
    
    try {
      const storedMessages = localStorage.getItem(`optimistic-messages-${thread.id}`)
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as Message[]
        
        // Smart comparison: check if optimistic message content exists in database messages
        // This handles the case where user navigates away and comes back
        const serverMessages = thread.messages || []
        const filteredMessages = parsedMessages.filter(optimisticMsg => {
          // Check if any server message has the same content (indicating it was saved to DB)
          const existsInDatabase = serverMessages.some(serverMsg => 
            serverMsg.content.trim() === optimisticMsg.content.trim() &&
            serverMsg.sender_type === optimisticMsg.sender_type
          )
          
          // Only keep optimistic message if it doesn't exist in database yet
          return !existsInDatabase
        })
        
        // Update localStorage with filtered messages (remove ones that are now in database)
        if (filteredMessages.length !== parsedMessages.length) {
          if (filteredMessages.length === 0) {
            localStorage.removeItem(`optimistic-messages-${thread.id}`)
          } else {
            localStorage.setItem(`optimistic-messages-${thread.id}`, JSON.stringify(filteredMessages))
          }
        }
        
        setOptimisticMessages(filteredMessages)
      }
    } catch (error) {
     
    }
  }, [thread.id, thread.messages]) // Include thread.messages to update when new data arrives
  
  // Mark thread as read when component mounts
  useEffect(() => {
    const markAsRead = async () => {
      try {
        // Call the server API to mark the thread as read
        const success = await markThreadAsRead(thread.id)
        
        if (success) {
          // Update the unread count in localStorage to 0
          updateUnreadCountLocally(0)
          
          // Dispatch a custom event to notify the UserNavigation component
          if (typeof window !== 'undefined') {
            const markAsReadEvent = new CustomEvent('messages:marked-as-read', {
              detail: { threadId: thread.id }
            })
            window.dispatchEvent(markAsReadEvent)
          }
        } else {
    
        }
      } catch (error) {
      
      }
    }
    
    // Call the mark as read function
    markAsRead()
  }, [thread.id])
  
  
  // Save optimistic messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && optimisticMessages.length > 0) {
      localStorage.setItem(`optimistic-messages-${thread.id}`, JSON.stringify(optimisticMessages))
    }
  }, [optimisticMessages, thread.id])
  
  // Combine server messages with optimistic messages, avoiding duplicates
  // Only include optimistic messages on client side to prevent hydration mismatch
  const allMessages = [
    ...(thread.messages || []),
    ...(isClient ? optimisticMessages : [])
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  
  // Create a new thread object with the combined messages and mark as read locally
  const threadWithOptimisticMessages = markThreadAsReadLocally({
    ...thread,
    messages: allMessages
  })
  
  // Function to add an optimistic message
  const handleOptimisticUpdate = (message: Message) => {
    setOptimisticMessages(prev => {
      const newMessages = [...prev, message]
      
      // Store in localStorage for persistence across page reloads
      try {
        localStorage.setItem(`optimistic-messages-${thread.id}`, JSON.stringify(newMessages))
      } catch (error) {}
      return newMessages
    })
  }
  
  // Handle message sent - don't remove optimistic messages immediately
  // Let the natural comparison process handle cleanup when user navigates back
  const handleMessageSent = (messageId: string) => {
    // Message was sent successfully, but keep optimistic message visible
    // It will be cleaned up automatically when the page reloads and compares with database
    // No action needed here - optimistic message stays visible
  }
  
  // Handle message error - remove the specific optimistic message that failed
  const handleMessageError = (optimisticId: string) => {
    setOptimisticMessages(prev => {
      const filtered = prev.filter(msg => msg.id !== optimisticId)
      
      // Update localStorage
      if (filtered.length === 0) {
        localStorage.removeItem(`optimistic-messages-${thread.id}`)
      } else {
        localStorage.setItem(`optimistic-messages-${thread.id}`, JSON.stringify(filtered))
      }
      
      return filtered
    })
  }
  
  return (
    <div className="space-y-4">
      <MessageThread thread={threadWithOptimisticMessages} />
      <Divider />
      <MessageForm 
        threadId={thread.id} 
        onOptimisticUpdate={handleOptimisticUpdate}
        onMessageSent={handleMessageSent}
        onMessageError={handleMessageError}
      />
    </div>
  )
}
