import { StarRating } from "@/components/atoms"

// Update to a more flexible review type that handles possible variations
type ReviewData = {
  id: string
  rating: number
  customer_note?: string
  created_at?: string
  updated_at?: string
  customer?: {
    id?: string
    first_name?: string
    last_name?: string
    email?: string
  }
}

export const SellerReview = ({ review }: { review: any }) => {
  // Safety check for invalid review object
  if (!review) {
    console.warn('Received null or undefined review in SellerReview component')
    return null
  }

  try {
    // Process customer data with safety checks
    const hasCustomer = review.customer && typeof review.customer === 'object'
    const firstName = hasCustomer && review.customer.first_name ? review.customer.first_name : ''
   {/* const lastName = hasCustomer && review.customer.last_name ? review.customer.last_name : '' */}
    const customerName = hasCustomer
      ? `${firstName}`.trim()
      : "Ukryty Klient"

    // Get customer initials with safety checks
    const customerInitials = customerName
      .split(" ")
      .filter((part: string) => part.length > 0) // Filter out empty parts
      .map((n: string) => n[0] || '')
      .join("")
      .toUpperCase()
      .slice(0, 2) || 'UK' // Default if no initials available

    // Calculate rating stars with safety checks
    const rating = typeof review.rating === 'number' ? review.rating : 0
    const fullStars = Math.floor(rating)
    const halfStars = rating % 1 >= 0.5 ? 1 : 0
    const emptyStars = 5 - fullStars - halfStars

    // Format date with safety checks
    function formatDate(dateString?: string) {
      if (!dateString) {
        return "Nieznana data"
      }
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "Nieznana data" // Invalid date check
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`
      } catch (e) {
        return "Nieznana data"
      }
    }

    // Use created_at or updated_at, whichever exists
    const dateToUse = review.created_at || review.updated_at
    const displayDate = formatDate(dateToUse)

    // Make sure we're safely rendering text content
    // Ensure we never try to render HTML - convert everything to plain text
    const customerNote = typeof review.customer_note === 'string' 
      ? String(review.customer_note).replace(/(<([^>]+)>)/gi, '') // Strip any HTML tags
      : "Brak komentarza"
    
    return (
      <div className="mb-4 border-b pb-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 text-white bg-[#3B3634] rounded-full flex items-center justify-center">
              {customerInitials || "UK"}
            </div>
            <span className="label-semibold ">{customerName}</span>
          </div>
          <span className="text-secondary">{displayDate}</span>
        </div>
        <div className="flex py-2">
          {[...Array(fullStars)].map((_, i) => (
            <span key={`star-full-${i}`} className="text-star">
              ★
            </span>
          ))}
          {[...Array(halfStars)].map((_, i) => (
            <span key={`star-half-${i}`} className="text-star">
              ☆
            </span>
          ))}
          {[...Array(emptyStars)].map((_, i) => (
            <span key={`star-empty-${i}`} className="text-border-base">
              ☆
            </span>
          ))}
        </div>
        <p>{customerNote}</p>
      </div>
    )
  } catch (error) {
    console.error(`Error rendering review: ${error instanceof Error ? error.message : 'Unknown error'}`)
    // Return a minimal fallback UI rather than crashing the component
    return (
      <div className="mb-4 border-b pb-4 text-secondary">
        Błąd podczas ładowania recenzji
      </div>
    )
  }
}