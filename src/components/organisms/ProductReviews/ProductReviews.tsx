// src/components/organisms/ProductReviews/ProductReviews.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/atoms"
import { StarRating } from "@/components/atoms/StarRating/StarRating"
import { StarIcon } from "@/icons"
import { createReview, updateReview } from "@/lib/data/reviews"
import { HttpTypes } from "@medusajs/types"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import tailwindConfig from "../../../../tailwind.config"
import { Star, User, MessageSquare, AlertCircle, Edit3, Plus } from "lucide-react"

// Types
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
  reference?: string
}

type ProductReviewsProps = {
  productId: string
  isAuthenticated: boolean
  customer: HttpTypes.StoreCustomer | null
  prefetchedReviews: ReviewData[]
  isEligible: boolean
  hasPurchased: boolean
}

type FormValues = {
  rating: number
  customer_note: string
}

// Helper functions
const calculateAverageRating = (reviews: ReviewData[]): number => {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

const findUserReview = (
  reviews: ReviewData[],
  customer: HttpTypes.StoreCustomer | null
): ReviewData | null => {
  if (!customer || !reviews || reviews.length === 0) return null
  return (
    reviews.find(
      (review) =>
        review.customer?.id === customer.id ||
        review.customer?.email === customer.email
    ) || null
  )
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Nieznana data"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Nieznana data"
  }
}

// Interactive Star Rating Component
const InteractiveStarRating = ({
  rating,
  onRatingChange,
}: {
  rating: number
  onRatingChange: (rating: number) => void
}): JSX.Element => {
  const [hoveredRating, setHoveredRating] = useState(0)

  const starColor = tailwindConfig.theme.extend.colors.primary
  const inactiveColor = tailwindConfig.theme.extend.colors.action.on.primary

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Wybierz ocenę">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={rating === star}
          aria-label={`${star} ${star === 1 ? 'gwiazdka' : star < 5 ? 'gwiazdki' : 'gwiazdek'}`}
          className="cursor-pointer hover:scale-110 transition-transform duration-150"
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => onRatingChange(star)}
        >
          <StarIcon
            size={28}
            color={star <= (hoveredRating || rating) ? starColor : inactiveColor}
          />
        </button>
      ))}
    </div>
  )
}

// Rating Distribution Bar
const RatingBar = ({
  stars,
  count,
  total,
}: {
  stars: number
  count: number
  total: number
}): JSX.Element => {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex items-center gap-3" aria-label={`${stars} ${stars === 1 ? 'gwiazdka' : stars < 5 ? 'gwiazdki' : 'gwiazdek'}: ${count} recenzji (${Math.round(percentage)}%)`}>
      <span className="text-xs font-instrument-sans text-plum-muted w-6" aria-hidden="true">
        {stars}★
      </span>
      <div className="flex-1 h-1.5 bg-cream-200 overflow-hidden" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full bg-plum transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-instrument-sans text-plum-muted w-8 text-right" aria-hidden="true">
        {count}
      </span>
    </div>
  )
}

// Review Card Component
const ReviewCard = ({
  review,
  isUserReview,
}: {
  review: ReviewData
  isUserReview?: boolean
}): JSX.Element => {
  const customerName = review.customer?.first_name
    ? `${review.customer.first_name}`
    : "Anonimowy użytkownik"

  const initials = customerName
    .split(" ")
    .map((n, index) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`border-b border-cream-200 last:border-b-0 py-5 ${
        isUserReview ? "bg-cream-100/50 -mx-6 px-6" : ""
      }`}
      role="article"
      aria-label={`Recenzja od ${customerName}: ${review.rating} ${review.rating === 1 ? 'gwiazdka' : review.rating < 5 ? 'gwiazdki' : 'gwiazdek'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cream-200 flex items-center justify-center text-plum font-medium font-instrument-sans text-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-plum font-instrument-sans text-sm">
                {customerName}
              </h4>
              {isUserReview && (
                <span className="text-[10px] font-medium text-plum-muted uppercase tracking-wider bg-cream-200 px-2 py-0.5">
                  Twoja recenzja
                </span>
              )}
            </div>
            <p className="text-xs text-plum-muted font-instrument-sans">
              {formatDate(review.created_at || review.updated_at)}
            </p>
          </div>
        </div>
        <StarRating rate={review.rating} starSize={14} />
      </div>

      {review.customer_note && (
        <p className="text-sm text-plum font-instrument-sans leading-relaxed pl-[52px]">
          {review.customer_note}
        </p>
      )}
    </div>
  )
}

// Review Form Component
const ReviewForm = ({
  productId,
  customer,
  existingReview,
  onSuccess,
  isSubmitting,
  setIsSubmitting,
}: {
  productId: string
  customer: HttpTypes.StoreCustomer
  existingReview: ReviewData | null
  onSuccess: (review: ReviewData) => void
  isSubmitting: boolean
  setIsSubmitting: (submitting: boolean) => void
}): JSX.Element => {
  const isEditMode = !!existingReview
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      customer_note: existingReview?.customer_note || "",
    },
  })

  const onSubmit = async (data: FormValues): Promise<void> => {
    if (rating === 0) {
      toast.error("Prosimy wybrać ocenę w gwiazdkach")
      return
    }

    setIsSubmitting(true)

    try {
      let response

      if (isEditMode && existingReview) {
        response = await updateReview({
          id: existingReview.id,
          rating: rating,
          customer_note: data.customer_note,
        })

        if (response.success && response.review) {
          toast.success("Recenzja została zaktualizowana!")
          onSuccess(response.review)
        } else {
          toast.error(
            `Błąd: ${response.error || "Nie udało się zaktualizować recenzji"}`
          )
        }
      } else {
        const reviewData = {
          product_id: productId,
          rating: rating,
          customer_note: data.customer_note,
        }

        response = await createReview(reviewData)

        if (response.success && response.review) {
          toast.success("Dziękujemy za dodanie recenzji!")
          reset()
          // ✅ Pass form data along with backend response to ensure all fields are present
          const reviewWithFormData = {
            ...response.review,
            rating: rating, // Use form rating in case backend doesn't return it
            customer_note: data.customer_note || '', // Use form note in case backend doesn't return it
          }
          setRating(0)
          onSuccess(reviewWithFormData)
        } else {
          toast.error(
            `Błąd: ${response.error || "Nie udało się dodać recenzji"}`
          )
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Wystąpił błąd podczas zapisywania recenzji.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-plum-muted" aria-hidden="true" />
          <span className="text-xs font-medium text-plum uppercase tracking-wider font-instrument-sans">
            Ocena
          </span>
        </label>
        <InteractiveStarRating rating={rating} onRatingChange={setRating} />
      </div>

      <div>
        <label htmlFor="review" className="flex items-center gap-2 mb-3">
          <MessageSquare size={14} className="text-plum-muted" aria-hidden="true" />
          <span className="text-xs font-medium text-plum uppercase tracking-wider font-instrument-sans">
            Twoja opinia (opcjonalnie)
          </span>
        </label>
        <textarea
          id="review"
          rows={4}
          placeholder="Podziel się swoją opinią o produkcie..."
          className="w-full p-4 border border-cream-300 bg-white text-plum font-instrument-sans text-sm placeholder:text-plum-muted/60 focus:border-plum focus:outline-none transition-colors resize-none"
          {...register("customer_note")}
        />
        {errors.customer_note && (
          <p className="mt-2 text-xs text-red-600 font-instrument-sans">
            {errors.customer_note.message}
          </p>
        )}
      </div>

      <Button
        variant="filled"
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="large"
      >
        {isSubmitting ? (
          "Zapisywanie..."
        ) : isEditMode ? (
          <span className="flex items-center justify-center gap-2">
            <Edit3 size={16} />
            Zaktualizuj recenzję
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Plus size={16} />
            Dodaj recenzję
          </span>
        )}
      </Button>
    </form>
  )
}

// Login Prompt Component
const LoginPrompt = (): JSX.Element => {
  const pathname = usePathname()
  const redirectUrl = `/user?redirect=${encodeURIComponent(pathname)}`

  return (
    <div className="text-center py-6">
      <User size={32} className="mx-auto text-plum-muted mb-3" aria-hidden="true" />
      <h4 className="text-sm font-medium text-plum font-instrument-sans mb-1">
        Dodaj recenzję produktu
      </h4>
      <p className="text-xs text-plum-muted font-instrument-sans mb-4">
        Zaloguj się, aby móc dodać recenzję kupionego produktu
      </p>
      <Link href={redirectUrl}>
        <Button variant="filled" size="large">
          Zaloguj się
        </Button>
      </Link>
    </div>
  )
}

// Not Eligible Prompt Component
const NotEligiblePrompt = (): JSX.Element => {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200">
      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <h4 className="text-sm font-medium text-amber-800 font-instrument-sans mb-1">
          Dodaj recenzję produktu
        </h4>
        <p className="text-xs text-amber-700 font-instrument-sans">
          Recenzje mogą być dodawane tylko przez klientów, którzy zakupili ten
          produkt.
        </p>
      </div>
    </div>
  )
}

// Main ProductReviews Component
export const ProductReviews = ({
  productId,
  isAuthenticated,
  customer,
  prefetchedReviews,
  isEligible,
  hasPurchased,
}: ProductReviewsProps): JSX.Element => {
 
  const [reviews, setReviews] = useState<ReviewData[]>(prefetchedReviews)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const averageRating = calculateAverageRating(reviews)
  const userReview = findUserReview(reviews, customer)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))

  const handleReviewSuccess = (newReview: ReviewData) => {
    
    // ✅ Ensure ALL required fields are populated from current user and form data
    const enrichedReview: ReviewData = {
      ...newReview,
      // ✅ Ensure review has an ID (fallback to timestamp-based ID)
      id: newReview.id || `review_${Date.now()}_${customer?.id}`,
      // ✅ Ensure rating is present
      rating: newReview.rating || 0,
      // ✅ Ensure customer_note is present
      customer_note: newReview.customer_note || '',
      // ✅ Ensure created_at is present for date display
      created_at: newReview.created_at || new Date().toISOString(),
      // ✅ Ensure customer data is populated
      customer: newReview.customer || ({
        id: customer?.id,
        first_name: customer?.first_name ?? undefined,
        last_name: customer?.last_name ?? undefined,
        email: customer?.email,
      } as ReviewData['customer'])
    }

    
    const existingIndex = reviews.findIndex(
      (r) => r.customer?.id === customer?.id
    )
    if (existingIndex >= 0) {
      const updatedReviews = [...reviews]
      updatedReviews[existingIndex] = enrichedReview
      setReviews(updatedReviews)
    } else {
      setReviews([enrichedReview, ...reviews])
    }
  }

  return (
    <div className="w-full py-8">
      <div className="bg-cream-100 border border-cream-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-cream-200">
          <h2 className="heading-md font-medium text-plum tracking-wide font-instrument-serif">
            Recenzje produktu
          </h2>
        </div>

        {/* Rating Summary */}
        <div className="px-6 py-5 border-b border-cream-200 bg-cream-100/50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Average Rating */}
            <div className="text-center sm:text-left sm:pr-6 sm:border-r sm:border-cream-200">
              <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                <span className="text-4xl font-medium text-plum font-instrument-serif">
                  {averageRating > 0 ? averageRating : "—"}
                </span>
                <span className="text-lg text-plum-muted">/5</span>
              </div>
              <div className="mt-1">
                <StarRating rate={averageRating} starSize={16} />
              </div>
              <p className="text-xs text-plum-muted font-instrument-sans mt-2">
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "recenzja"
                  : reviews.length < 5
                  ? "recenzje"
                  : "recenzji"}
              </p>
            </div>

            {/* Rating Distribution */}
            {reviews.length > 0 && (
              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ stars, count }) => (
                  <RatingBar
                    key={stars}
                    stars={stars}
                    count={count}
                    total={reviews.length}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="px-6">
          <div className="flex items-center gap-2 py-4 border-b border-cream-200">
            <MessageSquare size={14} className="text-plum-muted" aria-hidden="true" />
            <span className="text-xs font-medium text-plum uppercase tracking-wider font-instrument-sans">
              Wszystkie recenzje ({reviews.length})
            </span>
          </div>

          {reviews.length > 0 ? (
            <div>
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isUserReview={
                    customer?.id === review.customer?.id ||
                    customer?.email === review.customer?.email
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare
                size={32}
                className="mx-auto text-plum-muted/50 mb-3"
                aria-hidden="true"
              />
              <p className="text-sm text-plum-muted font-instrument-sans">
                Brak recenzji dla tego produktu.
              </p>
              {!isAuthenticated && (
                <p className="text-xs text-plum-muted/70 font-instrument-sans mt-1">
                  Zaloguj się, aby dodać pierwszą recenzję!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Review Form Section */}
        <div className="px-6 py-5 border-b border-cream-200">
          <div className="flex items-center gap-2 mb-4">
            <Edit3 size={14} className="text-plum-muted" aria-hidden="true" />
            <span className="text-xs font-medium text-plum uppercase tracking-wider font-instrument-sans">
              {userReview ? "Edytuj swoją recenzję" : "Dodaj recenzję"}
            </span>
          </div>

          {!isAuthenticated ? (
            <LoginPrompt />
          ) : !isEligible || !hasPurchased ? (
            <NotEligiblePrompt />
          ) : customer ? (
            <ReviewForm
              productId={productId}
              customer={customer}
              existingReview={userReview}
              onSuccess={handleReviewSuccess}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          ) : null}
        </div>

        
      </div>
    </div>
  )
}