import { MessageThread, MessageSender } from "@/lib/data/messages"

/**
 * Checks if a thread has unread messages based on user_read_at timestamp
 * @param thread The message thread to check
 * @returns True if the thread has unread messages, false otherwise
 */
export function hasUnreadMessages(thread: MessageThread): boolean {
  if (!thread) return false;
  
  // If there's no user_read_at timestamp, all messages are unread
  if (!thread.user_read_at) return true;
  
  // If there's a last_message_at timestamp and it's newer than user_read_at,
  // then there are unread messages
  if (thread.last_message_at && 
      new Date(thread.last_message_at).getTime() > new Date(thread.user_read_at).getTime()) {
    return true;
  }
  
  // If we have messages array, check each message's timestamp against user_read_at
  if (thread.messages && thread.messages.length > 0) {
    // Only count messages from seller or admin as potentially unread
    return thread.messages.some(message => 
      (message.sender_type === MessageSender.SELLER || message.sender_type === MessageSender.ADMIN) &&
      new Date(message.created_at).getTime() > new Date(thread.user_read_at as string).getTime()
    );
  }
  
  return false;
}

/**
 * Updates a thread's user_read_at timestamp locally without waiting for API
 * @param thread The message thread to mark as read
 * @returns Updated thread with current timestamp for user_read_at
 */
export function markThreadAsReadLocally(thread: MessageThread): MessageThread {
  if (!thread) return thread;
  
  // Create a new thread object with updated user_read_at timestamp
  return {
    ...thread,
    user_read_at: new Date().toISOString(),
    // Also update the unread_count to 0 since we're marking it as read
    unread_count: 0
  };
}

/**
 * Count all unread messages across multiple threads
 * @param threads Array of message threads to check
 * @returns Total number of unread messages
 */
export function countUnreadMessages(threads: MessageThread[]): number {
  if (!threads || !Array.isArray(threads) || threads.length === 0) return 0;
  
  let totalUnread = 0;
  
  for (const thread of threads) {
    // If the thread has an unread_count, use that
    if (typeof thread.unread_count === 'number') {
      totalUnread += thread.unread_count;
      continue;
    }
    
    // Otherwise, calculate it using the hasUnreadMessages function
    if (hasUnreadMessages(thread)) {
      // Count individual unread messages by checking timestamps
      const unreadInThread = thread.messages?.filter(message => 
        (message.sender_type === MessageSender.SELLER || message.sender_type === MessageSender.ADMIN) &&
        (!thread.user_read_at || new Date(message.created_at).getTime() > new Date(thread.user_read_at).getTime())
      ).length || 1; // If we can't determine exact count, assume at least 1
      
      totalUnread += unreadInThread;
    }
  }
  
  return totalUnread;
}

// Local storage key for unread count
const UNREAD_COUNT_KEY = 'user_unread_messages_count';

/**
 * Updates the unread message count in localStorage for UI consistency across pages
 * @param count The number of unread messages
 */
export function updateUnreadCountLocally(count: number): void {
  if (typeof window === 'undefined') return; // Server-side check
  
  try {
    localStorage.setItem(UNREAD_COUNT_KEY, count.toString());
  } catch (error) {
    console.error('Error updating unread count in localStorage:', error);
  }
}

/**
 * Gets the unread message count from localStorage
 * @returns The number of unread messages or 0 if not found
 */
export function getUnreadCountLocally(): number {
  if (typeof window === 'undefined') return 0; // Server-side check
  
  try {
    const count = localStorage.getItem(UNREAD_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting unread count from localStorage:', error);
    return 0;
  }
}
