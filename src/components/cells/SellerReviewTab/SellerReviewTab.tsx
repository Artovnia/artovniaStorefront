'use client'
import { SellerReviewList, SellerScore } from "@/components/molecules"
import { Review } from "@/lib/data/reviews"

export const SellerReviewTab = ({
  reviews,
}: {
  reviews: Review[]
}) => {
  // Filter out any null reviews
  const filteredReviews = reviews?.filter((r: Review | null): r is Review => r !== null) || []

  const reviewCount = filteredReviews.length

  const rating =
    filteredReviews.length > 0
      ? filteredReviews.reduce((sum: number, r: Review) => sum + (r?.rating || 0), 0) /
        filteredReviews.length
      : 0


  return (
    <div className="w-full mt-8">
      {/* Reviews layout - adjusted for two-column page layout */}
      <div className="flex flex-col gap-6">
        {/* Score Card */}
        <div className="border rounded-sm p-4 lg:max-w-xs">
          <SellerScore rate={rating} reviewCount={reviewCount} />
        </div>
        
        {/* Reviews List */}
        <div className="border rounded-sm p-4">
          <h3 className="heading-sm uppercase border-b pb-4">Recenzje sprzedawcy</h3>
          <SellerReviewList reviews={filteredReviews} />
        </div>
      </div>
    </div>
  )
}