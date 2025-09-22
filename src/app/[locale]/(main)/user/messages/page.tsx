import { LoginForm, UserPageLayout } from "@/components/molecules"
import { retrieveCustomer } from "@/lib/data/customer"
import { listMessageThreads } from "@/lib/data/actions/message-actions"
import { MessageThread, MessageSender } from "@/types/messages"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { isEmpty } from "lodash"
import { MessagePagination } from "./message-pagination"
import { hasUnreadMessages } from "@/lib/utils/message-utils"
import { markThreadAsRead } from "@/lib/data/actions/message-read-actions"

// Simple Bell Icon component
const BellIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

// Define the correct type for Next.js 15
type PageProps = {
  searchParams: Promise<{ page?: string }>
}

export default async function MessagesPage({ searchParams }: PageProps) {
  // Properly await the searchParams Promise
  const resolvedParams = await searchParams
  
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  // Get current page from search params
  // Use nullish coalescing to safely handle searchParams
  const page = resolvedParams.page ?? '1'
  const currentPage = parseInt(page)
  const threadsPerPage = 5
  
  // Add error handling for message threads retrieval
  let messageThreads: MessageThread[] = []
  let error: Error | null = null
  let hasUnauthorizedError = false
  
  try {
    // Attempt to fetch message threads
    let fetchedThreads = await listMessageThreads()
    
    // Validate the message threads data
    fetchedThreads = fetchedThreads.filter(thread => {
      // Ensure the thread has the required properties
      if (!thread || !thread.id) {
        return false
      }
      return true
    })
    
    // If we successfully got threads, sort them properly
    if (fetchedThreads.length > 0) {
      // Sort threads to put unread messages at the top, then by most recent activity
      messageThreads = fetchedThreads.sort((a, b) => {
        // First sort by unread status (unread comes first)
        const aHasUnread = hasUnreadMessages(a);
        const bHasUnread = hasUnreadMessages(b);
        
        if (aHasUnread && !bHasUnread) return -1;
        if (!aHasUnread && bHasUnread) return 1;
        
        // If both are unread or both are read, sort by most recent activity
        const aLastActivity = a.last_message_at || a.updated_at || a.created_at;
        const bLastActivity = b.last_message_at || b.updated_at || b.created_at;
        
        // Sort by most recent activity (descending order)
        return new Date(bLastActivity).getTime() - new Date(aLastActivity).getTime();
      });
    }
  } catch (err) {
    // Check specifically for unauthorized error (status 401)
    if (err instanceof Error && 
        (err.message.includes('Unauthorized') || 
         /\b401\b/.test(err.message) || 
         (err as any)?.status === 401)) {
      hasUnauthorizedError = true
      // Don't log as error since this is expected for new users
      console.log('User is not yet authorized for messages or has no message threads')
    } else {
      console.error('Error retrieving message threads:', err)
      error = err instanceof Error ? err : new Error(String(err))
    }
  }
  
  // Calculate total pages
  const totalPages = Math.ceil(messageThreads.length / threadsPerPage)
  
  // Paginate the message threads
  const paginatedThreads = messageThreads.slice(
    (currentPage - 1) * threadsPerPage,
    currentPage * threadsPerPage
  )

  return (
    <UserPageLayout title="Wiadomości">
      <div className="space-y-8">
          
          {hasUnauthorizedError || isEmpty(paginatedThreads) ? (
            <div className="text-center">
              <h3 className="heading-lg text-primary uppercase">Brak wiadomości</h3>
              <p className="text-lg text-secondary mt-2 font-instrument-sans">
                Nie rozpoczęto żadnych rozmów. Zacznij nową rozmowę, aby skontaktować się z sprzedawcami lub wsparciem.
              </p>
            </div>
          ) : (
            <>
              <div className="w-full max-w-full space-y-4">
                {paginatedThreads.map((thread) => {
                  // Safe date formatting function
                  const formatDate = (dateString: string) => {
                    try {
                      return format(new Date(dateString), 'MMM d, yyyy')
                    } catch (error) {
                      console.warn(`Error formatting date: ${dateString}`, error)
                      return 'Unknown date'
                    }
                  }
                  
                  return (
                    <Link 
                      key={thread.id} 
                      href={`/user/messages/${thread.id}`}
                      className="block border border-gray-200 rounded-md p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          {/* Seller avatar/photo */}
                          {thread.seller?.photo ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                              <Image 
                                src={thread.seller.photo} 
                                alt={thread.seller.name || 'Sprzedawca'}
                                className="w-full h-full object-cover"
                                width={48}
                                height={48}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-500 font-medium">
                                {(thread.seller?.name || 'S').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">Rozmowa z {thread.seller?.name || 'Sprzedawca'}</h3>
                              {/* Bell icon indicator for unread messages - using consistent helper function */}
                              {hasUnreadMessages(thread) ? (
                                <span className="inline-flex items-center">
                                  <BellIcon className="text-red-500 animate-pulse" />
                                </span>
                              ) : null}
                            </div>
                            {thread.subject && (
                              <h4 className="font-medium text-md text-gray-700">{thread.subject}</h4>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              Rozpoczęta {thread.created_at ? formatDate(thread.created_at) : 'Nieznana data'}
                            </p>
                           
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="text-xs text-gray-500">
                            {thread.updated_at ? formatDate(thread.updated_at) : 'Nieznana data'}
                          </p>
                          {hasUnreadMessages(thread) && (
                            <span className="inline-block bg-primary text-[#3B3634] text-xs px-2 py-1 rounded-full mt-2">
                              {/* Show either the actual count or a default of 1 if we can't determine the exact count */}
                              {thread.unread_count && thread.unread_count > 0 ? `${thread.unread_count} nowych` : 'Nowa wiadomość'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <MessagePagination 
                  totalPages={totalPages} 
                  currentPage={currentPage} 
                />
              )}
            </>
          )}
      </div>
    </UserPageLayout>
  )
}