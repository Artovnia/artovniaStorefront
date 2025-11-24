"use server"

import { sdk } from "../config"
import { getPublishableApiKey } from "../get-publishable-key"
import { getAuthHeaders } from "./cookies"

export interface CreateTicketInput {
  title: string
  description: string
  type: "feature_request" | "bug_report" | "support" | "other"
  priority?: "low" | "medium" | "high" | "urgent"
  customer_email: string
  customer_name: string
  files?: File[]
}

export interface Ticket {
  id: string
  ticket_number: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  customer_id: string
  customer_email: string
  customer_name: string
  created_at: string
  updated_at: string
  messages?: TicketMessage[]
}

export interface TicketMessage {
  id: string
  ticket_id: string
  content: string
  author_type: "customer" | "admin"
  author_name: string
  created_at: string
  attachments?: TicketAttachment[]
}

export interface TicketAttachment {
  id: string
  filename: string
  url: string
  mime_type: string
  size: number
}

async function getTicketHeaders() {
  const authHeaders = await getAuthHeaders()
  const publishableKey = await getPublishableApiKey()
  
  // Only include auth headers if they exist (for logged-in users)
  // Guest users will only have the publishable key
  const headers: Record<string, string> = {
    "x-publishable-api-key": publishableKey,
  }
  
  if (authHeaders && (authHeaders as any).authorization) {
    headers.authorization = (authHeaders as any).authorization
  }
  
  return headers
}

/**
 * Create a new support ticket
 */
export async function createTicket(data: CreateTicketInput) {

  const headers = await getTicketHeaders()


  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

  try {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("type", data.type)
    formData.append("priority", data.priority || "medium")
    formData.append("customer_email", data.customer_email)
    formData.append("customer_name", data.customer_name)

    if (data.files && data.files.length > 0) {
      for (const file of data.files) {
 
        formData.append("files", file, file.name)
      }
    }

    const url = `${backendUrl}/store/tickets`
 
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
     
      } 
    }

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: formData,
    })

  

    if (!response.ok) {
      let errorMessage = "Failed to create ticket"
      const contentType = response.headers.get("content-type")
      
      try {
        if (contentType?.includes("application/json")) {
          const error = await response.json()
          console.error("❌ [createTicket] Error response:", error)
          errorMessage = error.message || errorMessage
        } else {
          const textError = await response.text()
          console.error("❌ [createTicket] Error text:", textError)
          errorMessage = textError || `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (parseError) {
        console.error("❌ [createTicket] Parse error:", parseError)
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      
      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    throw new Error(error.message || "Failed to create ticket")
  }
}

/**
 * Get customer's tickets
 */
export async function getCustomerTickets() {
  const headers = await getTicketHeaders()

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/tickets`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch tickets")
    }

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch tickets")
  }
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(id: string) {
  const headers = await getTicketHeaders()

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/tickets/${id}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch ticket")
    }

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch ticket")
  }
}

/**
 * Add a message to a ticket
 */
export async function addTicketMessage(
  ticketId: string,
  content: string,
  files?: File[]
) {
  const headers = await getTicketHeaders()

  try {
    const formData = new FormData()
    formData.append("content", content)

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file)
      })
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/tickets/${ticketId}/messages`,
      {
        method: "POST",
        headers: {
          ...headers,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add message")
    }

    return await response.json()
  } catch (error: any) {
    throw new Error(error.message || "Failed to add message")
  }
}
