import { SellerReviewList, SellerScore } from "@/components/molecules"
import { getSellerByHandle } from "@/lib/data/seller"
import { getSellerReviews, Review } from "@/lib/data/reviews"
import { SellerProps } from "@/types/seller"

export const SellerReviewTab = async ({
  seller_handle,
}: {
  seller_handle: string
}) => {
  // Get seller info (without reviews)
  const seller = (await getSellerByHandle(seller_handle)) as SellerProps
  
  // Fetch seller reviews separately
  const { reviews, count } = await getSellerReviews(seller_handle)
  
  // Filter out any null reviews
  const filteredReviews = reviews?.filter((r: Review | null): r is Review => r !== null) || []

  const reviewCount = filteredReviews.length

  const rating =
    filteredReviews.length > 0
      ? filteredReviews.reduce((sum: number, r: Review) => sum + (r?.rating || 0), 0) /
        filteredReviews.length
      : 0


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 mt-8">
      <div className="border rounded-sm p-4">
        <SellerScore rate={rating} reviewCount={reviewCount} />
      </div>
      <div className="col-span-3 border rounded-sm p-4">
        <h3 className="heading-sm uppercase border-b pb-4">Recenzje sprzedawcy</h3>
        <SellerReviewList reviews={filteredReviews} />
      </div>
    </div>
  )
}