"use client"

import { OrdersPagination } from "@/components/sections"
import { ProductReview } from "../ProductReview/ProductReview"
import { useSearchParams } from "next/navigation"

const LIMIT = 10

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
  }
}

export const ProductReviewList = ({ reviews, title = "Recenzje produktu" }: { reviews?: ProductReviewData[], title?: string }) => {
  const searchParams = useSearchParams()
  const page = searchParams.get("page") || 1

  const pages = Math.ceil((reviews?.length || 0) / LIMIT) || 1
  const filteredReviews = reviews?.slice((+page - 1) * LIMIT, +page * LIMIT)

  if (!reviews?.length) {
    return (
      <div className="w-full py-8">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-ui-fg-subtle">Brak recenzji dla tego produktu.</p>
      </div>
    )
  }

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-ui-fg-subtle notranslate">
          {reviews.length} {reviews.length === 1 ? 'recenzja' : 
            reviews.length % 10 >= 2 && reviews.length % 10 <= 4 && (reviews.length % 100 < 10 || reviews.length % 100 >= 20) ? 'recenzje' : 'recenzji'}
        </span>
      </div>
      
      <div>
        {filteredReviews?.map((review) => (
          <ProductReview key={review.id} review={review} />
        ))}
      </div>

      {pages > 1 && <OrdersPagination pages={pages} />}
    </div>
  )
}
