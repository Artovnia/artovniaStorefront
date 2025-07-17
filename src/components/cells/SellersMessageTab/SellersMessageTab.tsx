"use client"

import { useState } from "react"
import { Button, Input, Textarea } from "@/components/atoms"
import { MessageThreadTypeEnum } from "@/lib/data/messages"
import { createMessageThread } from "@/lib/actions/message-actions"
import { useRouter } from "next/navigation"

export const SellersMessageTab = ({
  seller_id,
  seller_name,
}: {
  seller_id: string
  seller_name: string
}) => {
  const [formData, setFormData] = useState({
    subject: "",
    type: MessageThreadTypeEnum.INQUIRY,
    content: "",
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
        seller_id: seller_id, // Include seller_id to associate the message with this seller
        initial_message: {
          content: formData.content
        }
      })
      
      if (response.data?.thread?.id) {
        router.push(`/user/messages/${response.data.thread.id}`)
      } else {
        router.push("/user/messages")
      }
    } catch (error) {
      console.error("Error creating message thread:", error)
      alert("Failed to create message thread. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 mt-8">
      <div className="border rounded-sm p-6">
        <h3 className="heading-sm uppercase border-b pb-4 mb-6">Napisz wiadomość do {seller_name}</h3>
        
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
          
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium">Typ wiadomości</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-[16px] py-[12px] border rounded-sm bg-component-secondary focus:border-primary focus:outline-none focus:ring-0"
            >
              <option value={MessageThreadTypeEnum.INQUIRY}>Zapytanie o produkt</option>
              <option value={MessageThreadTypeEnum.GENERAL}>Ogólne</option>
              <option value={MessageThreadTypeEnum.SUPPORT}>Wsparcie</option>
            </select>
          </div>
          
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
      </div>
    </div>
  )
}