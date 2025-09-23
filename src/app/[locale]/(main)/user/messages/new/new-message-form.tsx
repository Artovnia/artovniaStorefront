"use client"

import { Button, Input, Textarea } from "@/components/atoms"
import { useState } from "react"
import { MessageThreadTypeEnum } from "@/types/messages"
import { createMessageThread } from "@/lib/data/actions/messages"
import { useRouter } from "next/navigation"

export function NewMessageForm() {
  const [formData, setFormData] = useState({
    subject: "",
    type: MessageThreadTypeEnum.GENERAL,
    content: "",
    seller_id: "default" // Default seller ID
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.content.trim()) return
    
    setIsSubmitting(true)
    
    try {
      const response = await createMessageThread({
        subject: formData.subject,
        type: formData.type,
        seller_id: formData.seller_id,
        content: formData.content
      })
      
      if (response?.thread?.id) {
        router.push(`/user/messages/${response.thread.id}`)
      } else {
        router.push("/user/messages")
      }
    } catch (error) {
      alert("Failed to create message thread. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 font-instrument-sans">
        <label htmlFor="subject" className="block text-sm font-medium">Temat</label>
        <Input
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Wpisz temat"
          required
        />
      </div>
      
      <div className="space-y-2 font-instrument-sans">
        <label htmlFor="type" className="block text-sm font-medium">Typ wiadomości</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full px-[16px] py-[12px] border rounded-sm bg-component-secondary focus:border-primary focus:outline-none focus:ring-0"
        >
          <option value={MessageThreadTypeEnum.GENERAL}>General</option>
          <option value={MessageThreadTypeEnum.SUPPORT}>Support</option>
          <option value={MessageThreadTypeEnum.INQUIRY}>Product Inquiry</option>
        </select>
      </div>
      
      <div className="space-y-2 font-instrument-sans">
        <label htmlFor="message-content" className="block text-sm font-medium">Wiadomość</label>
        <Textarea
          id="message-content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Wpisz swoją wiadomość..."
          rows={6}
          required
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" variant="filled" disabled={isSubmitting}>
          {isSubmitting ? "Tworzenie..." : "Twórz wątek"}
        </Button>
      </div>
    </form>
  )
}