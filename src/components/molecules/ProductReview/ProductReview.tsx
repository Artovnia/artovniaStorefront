import { StarRating } from "@/components/atoms"

// Review data type for product reviews
export type ProductReviewData = {
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
  } | null
}

export const ProductReview = ({ review }: { review: ProductReviewData }) => {
  // Safety check for invalid review object
  if (!review) {
    console.warn('Received null or undefined review in ProductReview component')
    return null
  }

  try {
    // Process customer data with safety checks
    const hasCustomer = review.customer !== null && review.customer !== undefined && typeof review.customer === 'object'
    const firstName = hasCustomer && review.customer?.first_name ? review.customer.first_name : ''
    const lastName = hasCustomer && review.customer?.last_name ? review.customer.last_name : ''
    const customerName = hasCustomer
      ? `${firstName} ${lastName}`.trim() || "Ukryty Klient"
      : "Ukryty Klient"

    // Get customer initials with safety checks
    const customerInitials = customerName
      .split(" ")
      .filter((part: string) => part.length > 0) // Filter out empty parts
      .map((n: string) => n[0] || '')
      .join("")
      .toUpperCase()
      .slice(0, 2) || 'UK' // Default if no initials available

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
    const customerNote = typeof review.customer_note === 'string' 
      ? String(review.customer_note).replace(/(<([^>]+)>)/gi, '') // Strip any HTML tags
      : "Brak komentarza"
    
    return (
      <div className="mb-4 border-b pb-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-ui-button-neutral flex items-center justify-center text-white">
              {customerInitials || "UK"}
            </div>
            <span className="label-semibold">{customerName}</span>
          </div>
          <span className="text-secondary notranslate">{displayDate}</span>
        </div>
        <div className="flex py-2">
          <StarRating rating={review.rating} size="small" />
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
