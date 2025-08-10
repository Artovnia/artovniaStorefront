"use client"

import { format } from "date-fns"
import { MessageThread as ThreadType, MessageSender } from "@/lib/data/messages"


export function MessageThread({ thread }: { thread: ThreadType }) {
  
  
  
  // Initialize messages array safely and sort by date (oldest first for display)
  const messages = thread.messages ? [...thread.messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ) : [];
  
  const hasMessages = Array.isArray(messages) && messages.length > 0;
  
  // Get seller information
  const sellerName = thread.seller?.name || 'Sprzedawca';
  
  // Log message details for debugging
  if (hasMessages) {
   
  }
  
  if (!hasMessages) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-500">W tej konwersacji nie ma żadnych wiadomości.</p>
        <p className="text-xs mt-2 text-gray-400">
          Debug info: {JSON.stringify({
            threadId: thread.id,
            subject: thread.subject,
            hasSeller: !!thread.seller,
            sellerName,
            messagesExists: !!thread.messages,
            isArray: Array.isArray(thread.messages),
            length: thread.messages ? thread.messages.length : 0,
            hasLastMessage: !!thread.last_message
          })}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isUserMessage = message.sender_type === MessageSender.USER;
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg p-4 max-w-[80%] ring-1 ring-gray-200 ${
                isUserMessage 
                  ? 'bg-white text-black' 
                  : 'bg-[#3B3634] text-white'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">
                  {isUserMessage ? 'Ty' : sellerName}
                </span>
                <span className="text-xs opacity-70">
                  {format(new Date(message.created_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  )
}