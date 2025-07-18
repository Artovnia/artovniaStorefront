import { LoginForm } from "@/components/molecules"
import { UserNavigation } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { getMessageThread } from "@/lib/data/actions/message-actions"
import { Divider } from "@/components/atoms"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { MessageContainer } from "./message-container"
import { MarkAsRead } from "./mark-as-read"
import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"

export default async function MessageThreadPage(props: {
  params: { thread_id: string; locale: string }
}) {
  // Properly extract and await the params
  const params = await Promise.resolve(props.params);
  const thread_id = params.thread_id
  
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  // Use the extracted thread_id
  const messageThread = await getMessageThread(thread_id)

  if (!messageThread) {
    return notFound()
  }
  
  // We'll use a client-side approach for marking messages as read
  // This avoids the server-side errors and provides a better user experience
  // The actual marking as read happens in the MessageContainer component
  
  console.log(`Loading thread ${thread_id} - will be marked as read client-side`)
  
  // Add server-side debugging
  console.log(`Message thread data:`, {
    id: messageThread.id,
    subject: messageThread.subject,
    seller: messageThread.seller,
    hasMessages: Array.isArray(messageThread.messages) && messageThread.messages.length > 0,
    messageCount: messageThread.messages?.length || 0
  })
  
  // Add server-side debugging
  console.log('Message thread data:', {
    id: messageThread.id,
    subject: messageThread.subject,
    seller: messageThread.seller,
    hasMessages: !!messageThread.messages,
    messageCount: messageThread.messages?.length || 0
  })

  return (
    <main className="container">
      {/* Client-side component to mark messages as read and update the bell icon */}
      <MarkAsRead threadId={thread_id} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          <div className="flex justify-between items-center">
            <div className="w-full">
              <Link href="/user/messages" className="text-sm text-primary hover:underline mb-2 inline-block">
                ← Wróć do tematów
              </Link>
              
              {/* Seller information with photo if available */}
              <div className="flex items-center gap-3 mb-3">
                {messageThread.seller?.photo ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                    <Image 
                      src={messageThread.seller.photo} 
                      alt={messageThread.seller.name || 'Sprzedawca'}
                      className="w-full h-full object-cover"
                      width={40}
                      height={40}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {(messageThread.seller?.name || 'S').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div>
                  <h1 className="heading-md uppercase">Rozmowa z {messageThread.seller?.name || 'Sprzedawca'}</h1>
                  {messageThread.subject && (
                    <h2 className="text-lg font-medium mt-1">{messageThread.subject}</h2>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Rozpoczęta {new Date(messageThread.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <MessageContainer thread={messageThread} />
        </div>
      </div>
    </main>
  )
}