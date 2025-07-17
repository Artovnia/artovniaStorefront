/**
 * Message data types and utilities for the storefront
 */

// Define message types here to avoid import path issues
export enum MessageSender {
  ADMIN = 'admin',
  SELLER = 'seller',
  USER = 'user',
}
  
export enum MessageThreadTypeEnum {
  ORDER = 'order',
  INQUIRY = 'inquiry',
  SUPPORT = 'support',
  GENERAL = 'general',
}

// Message thread type definitions
export type Message = {
  id: string
  thread_id: string
  sender_type: MessageSender
  content: string
  created_at: string
  updated_at: string
  attachment_url?: string | null
  attachment_thumbnail_url?: string | null
  attachment_name?: string | null
  attachment_type?: string | null
}

export type MessageThread = {
  id: string
  subject: string
  type: string
  user_id: string
  customer_id?: string | null
  seller_id?: string | null
  last_message_at?: string | null
  user_read_at?: string | null
  admin_read_at?: string | null
  seller_read_at?: string | null
  created_at: string
  updated_at: string
  messages: Message[]
  // Additional properties for UI
  seller?: {
    id: string
    name: string
    handle?: string
    email?: string
    photo?: string
  } | null
  last_message?: Message
  unread_count?: number
  // Metadata for customer identification
  metadata?: {
    customer_id?: string
    customer_email?: string | null
  } | string
}

// Export the server actions from the actions file
export { listMessageThreads, getMessageThread, createMessageThread, sendMessage, markThreadAsRead } from "@/lib/data/actions/message-actions"