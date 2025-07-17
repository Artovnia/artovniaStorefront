/**
 * Message data types and utilities for the storefront
 */

// Re-export message types from lib/data/messages.ts to avoid duplication
export { 
  MessageSender,
  MessageThreadTypeEnum,
} from "@/lib/data/messages"

// Re-export types with the proper syntax for isolatedModules
export type { 
  Message,
  MessageThread 
} from "@/lib/data/messages"

// Export the server actions from the actions file
export { 
  listMessageThreads, 
  getMessageThread, 
  createMessageThread, 
  sendMessage 
} from "@/lib/data/messages"

// Add any additional types specific to this file here if needed
