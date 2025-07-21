// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { UserNavigation } from "@/components/molecules/UserNavigation/UserNavigation"
import { OrderReturnRequests } from "@/components/sections/OrderReturnRequests/OrderReturnRequests"
import { retrieveCustomer } from "@/lib/data/customer"
import { getReturns } from "@/lib/data/orders"

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; return?: string }>
}

export default async function ReturnsPage(
  { params, searchParams }: PageProps
) {
  try {
  // Get returns data with error handling
  const { order_return_requests = [] } = await getReturns()

  // Log for debugging - check if we actually get multiple return requests
  console.log(`Retrieved ${order_return_requests?.length || 0} return requests`)
  
  const user = await retrieveCustomer()

  // Await the searchParams Promise
  const resolvedParams = await searchParams
  const page = resolvedParams.page
  const returnId = resolvedParams.return

  // Improved sorting logic that works with potentially incomplete data
  const sortedReturns = [...(order_return_requests || [])].sort((a, b) => {
    // Get created_at dates, falling back through multiple potential sources
    const aDate = getReturnDate(a);
    const bDate = getReturnDate(b);
    
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1; // b comes first
    if (!bDate) return -1; // a comes first
    
    // Sort by date descending (newest first)
    return bDate.getTime() - aDate.getTime();
  });
  
  // Helper function to get the best available date from a return request
  function getReturnDate(request: any): Date | null {
    if (!request) return null;
    
    // Try multiple date sources in order of preference
    if (request.created_at) {
      return new Date(request.created_at);
    }
    
    if (request.line_items?.[0]?.created_at) {
      return new Date(request.line_items[0].created_at);
    }
    
    if (request.updated_at) {
      return new Date(request.updated_at);
    }
    
    return null;
  }

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3">
          <h1 className="heading-md uppercase">Zwroty</h1>
          <OrderReturnRequests
            returns={sortedReturns}
            user={user || null}
            page={page || ""}
            currentReturn={returnId || ""}
          />
        </div>
      </div>
    </main>
  )
  } catch (error) {
    console.error("Error rendering returns page:", error)
    // Add error fallback UI
    return (
      <main className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
          <UserNavigation />
          <div className="md:col-span-3">
            <h1 className="heading-md uppercase">Zwroty</h1>
            <p>Wystąpił problem podczas ładowania zwrotów. Spróbuj ponownie później.</p>
          </div>
        </div>
      </main>
    )
  }
}
