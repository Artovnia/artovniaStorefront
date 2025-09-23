"use client"

import { Textarea, Button } from "@/components/atoms"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Message, MessageSender } from "@/lib/data/messages"
import { sendMessage } from "@/lib/data/actions/messages"

export function MessageForm({ 
  threadId, 
  onOptimisticUpdate,
  onMessageSent,
  onMessageError
}: { 
  threadId: string, 
  onOptimisticUpdate: (message: Message) => void,
  onMessageSent: (messageId: string) => void,
  onMessageError?: (optimisticId: string) => void
}) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    // Create a unique ID for the optimistic message
    const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    // Create an optimistic message
    const optimisticMessage: Message = {
      id: optimisticId,
      content: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender_type: MessageSender.USER,
      thread_id: threadId
    }
    
    // Store the content before clearing it (in case we need to retry)
    const messageContent = content
    
    // Add the optimistic message to the UI immediately using the callback
    onOptimisticUpdate(optimisticMessage)
    
    // Clear the input field immediately for better UX
    setContent("")
    
    // Set submitting state
    setIsSubmitting(true)
    
    try {
      // Send the message to the server using server action
      const sentMessage = await sendMessage(threadId, messageContent)
      
      if (sentMessage) {
        // Message was sent successfully, remove the optimistic message
        onMessageSent(sentMessage.id)
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
      
      // Remove the optimistic message if there was an error
      if (onMessageError) {
        onMessageError(optimisticId)
      }
      
      // Restore the content to the input field so the user doesn't lose their message
      setContent(messageContent)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 font-instrument-sans">
        <label htmlFor="reply-message" className="block text-lg font-medium font-instrument-sans">Odpowiedz</label>
        <Textarea
          className="bg-white"
          id="reply-message"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder="Wpisz swoją wiadomość..."
          rows={4}
          required
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={isSubmitting}>
          {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
        </Button>
      </div>
    </form>
  )
}