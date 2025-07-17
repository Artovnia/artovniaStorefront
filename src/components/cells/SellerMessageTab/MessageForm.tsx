"use client"

import { useState, useEffect } from "react"
import { Button, Input, Textarea } from "@/components/atoms"
import { createDirectMessage } from "@/lib/data/actions/direct-message-fixed"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { AuthCheck } from "./AuthCheck"
import { getCompatAuthHeaders } from "@/lib/data/cookie-utils"
import { sdk } from "@/lib/config"

export const MessageForm = ({
  seller_id,
  seller_name,
  isAuthenticated
}: {
  seller_id: string
  seller_name: string
  isAuthenticated: boolean
}) => {
  const [formData, setFormData] = useState({
    subject: "",
    content: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // We'll use the server-side message creation function directly

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is authenticated first
    if (!isAuthenticated) {
      toast.error('Musisz być zalogowany, aby wysłać wiadomość')
      return
    }
    
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error('Proszę wypełnić wszystkie pola')
      return
    }
    
    // Show loading toast
    const loadingToast = toast.loading('Wysyłanie wiadomości...')
    setIsSubmitting(true)
    
    try {
      // Use the fixed direct message function with simplified parameters
      const result = await createDirectMessage({
        subject: formData.subject,
        seller_id: seller_id,
        content: formData.content
      })
      
      if (result.success) {
        // Dismiss loading toast and show success message
        toast.dismiss(loadingToast)
        toast.success('Wiadomość została wysłana. Sprzedawca odpowie wkrótce.')
        
        // Reset form
        setFormData({
          subject: "",
          content: ""
        })
        
        // Don't refresh the entire page - this would trigger many API requests
        // Instead, we could implement a more targeted approach to update the UI
        // For now, we'll just avoid the refresh to reduce network requests
      } else {
        // If there was an error, show the specific error message
        toast.dismiss(loadingToast)
        
        if (result.error?.includes('User not authenticated')) {
          toast.error('Musisz być zalogowany, aby wysłać wiadomość')
        } else {
          toast.error(result.error || 'Nie udało się wysłać wiadomości. Spróbuj ponownie.')
        }
      }
    } catch (error: any) {
      console.error("Error creating message thread:", error)
      toast.dismiss(loadingToast)
      
      // Show more specific error message
      const errorMessage = error?.toString() || ''
      if (errorMessage.includes('User not authenticated')) {
        toast.error('Musisz być zalogowany, aby wysłać wiadomość')
      } else if (errorMessage.includes('Bad Request')) {
        toast.error('Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie.')
      } else {
        toast.error('Nie udało się wysłać wiadomości. Spróbuj ponownie.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Wrap the form in the AuthCheck component
  return (
    <AuthCheck isAuthenticated={isAuthenticated}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="subject" className="block text-sm font-medium">Temat</label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Wpisz temat wiadomości"
            required
          />
        </div>
        
        {/* Type selection removed as requested */}
        
        <div className="space-y-2">
          <label htmlFor="message-content" className="block text-sm font-medium">Wiadomość</label>
          <Textarea
            id="message-content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Wpisz swoją wiadomość tutaj..."
            rows={6}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" variant="filled" disabled={isSubmitting}>
            {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
          </Button>
        </div>
      </form>
    </AuthCheck>
  )
}
