"use client"

import { useState, useEffect, useRef } from "react"
import { Message, MessageThread as ThreadType, MessageSender } from "@/lib/data/messages"
import { MessageThread } from "./message-thread"
import { MessageForm } from "./message-form"
import { Divider } from "@/components/atoms"
import { sendMessage, markThreadAsRead } from "@/lib/data/actions/message-actions"
import { markThreadAsReadLocally, updateUnreadCountLocally } from "@/lib/utils/message-utils"

export function MessageContainer({ thread }: { thread: ThreadType }) {
  // Load optimistic messages from localStorage on component mount
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      try {
        const storedMessages = localStorage.getItem(`optimistic-messages-${thread.id}`)
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages) as Message[]
          // Filter out any messages that are already in the thread (server has processed them)
          const serverMessageIds = new Set((thread.messages || []).map(msg => msg.id))
          return parsedMessages.filter(msg => !serverMessageIds.has(msg.id))
        }
      } catch (error) {
        console.error('Error loading optimistic messages from localStorage:', error)
      }
    }
    return []
  })
  
  // Mark thread as read when component mounts
  useEffect(() => {
    const markAsRead = async () => {
      try {
        // Call the server API to mark the thread as read
        const success = await markThreadAsRead(thread.id)
        
        if (success) {
          console.log(`Successfully marked thread ${thread.id} as read via API`)
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
          console.warn(`Failed to mark thread ${thread.id} as read via API`)
        }
      } catch (error) {
        console.error(`Error marking thread ${thread.id} as read:`, error)
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
  
  // Combine server messages with optimistic messages
  const allMessages = [
    ...(thread.messages || []),
    ...optimisticMessages
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  // Create a new thread object with the combined messages and mark as read locally
  const threadWithOptimisticMessages = markThreadAsReadLocally({
    ...thread,
    messages: allMessages
  })
  
  // Function to add an optimistic message
  const handleOptimisticUpdate = (message: Message) => {
    console.log('Adding optimistic message:', message)
    setOptimisticMessages(prev => [...prev, message])
  }
  
  // This function is no longer needed since we want to keep optimistic messages
  // until they're confirmed by the server on the next page load
  const handleMessageSent = (messageId: string) => {
    console.log('Message sent successfully, keeping optimistic message in UI')
    // We no longer remove the message after sending
  }
  
  return (
    <div className="space-y-4">
      <MessageThread thread={threadWithOptimisticMessages} />
      <Divider />
      <MessageForm 
        threadId={thread.id} 
        onOptimisticUpdate={handleOptimisticUpdate}
        onMessageSent={handleMessageSent}
      />
    </div>
  )
}
