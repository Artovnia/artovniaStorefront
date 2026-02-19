import { LoginForm, UserNavigation } from "@/components/molecules"
import { ReviewsWritten } from "@/components/organisms"
import { retrieveCustomer } from "@/lib/data/customer"
import { getReviews } from "@/lib/data/reviews"
import { Suspense } from "react"

// 🔒 REQUIRED: User pages require authentication check (cookies) and LoginForm uses useSearchParams
export const dynamic = 'force-dynamic'

export default async function Page() {
  const user = await retrieveCustomer()

  if (!user) return (
    <Suspense fallback={<div className="container py-8">Ładowanie...</div>}>
      <LoginForm />
    </Suspense>
  )

  const { reviews = [] } = await getReviews()

  // Filter to show only written reviews (both seller and product reviews)
  const writtenReviews = reviews.filter(
    (review) => review.reference === "seller" || review.reference === "product"
  )

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <ReviewsWritten reviews={writtenReviews} />
      </div>
    </main>
  )
}