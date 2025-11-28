// src/components/organisms/ProductReviews/ProductReviews.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/atoms"
import { StarRating } from "@/components/atoms/StarRating/StarRating"
import { StarIcon } from '@/icons'
import { createReview, updateReview } from "@/lib/data/reviews"
import { HttpTypes } from "@medusajs/types"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import tailwindConfig from '../../../../tailwind.config'

// Define the types for our component
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
  prefetchedReviews: ReviewData[] // Make this required, no default
}

type FormValues = {
  rating: number
  customer_note: string
}

// Helper function to calculate average rating
const calculateAverageRating = (reviews: ReviewData[]): number => {
  if (!reviews || reviews.length === 0) return 0
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

// Helper function to find user's existing review
const findUserReview = (reviews: ReviewData[], customer: HttpTypes.StoreCustomer | null): ReviewData | null => {
  if (!customer || !reviews || reviews.length === 0) return null
  
  return reviews.find(review => 
    review.customer?.id === customer.id || 
    review.customer?.email === customer.email
  ) || null
}

// Interactive Star Rating Component for Form
const InteractiveStarRating = ({ rating, onRatingChange }: { 
  rating: number
  onRatingChange: (rating: number) => void 
}): JSX.Element => {
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const starColor = tailwindConfig.theme.extend.colors.primary
  const inactiveColor = tailwindConfig.theme.extend.colors.action.on.primary
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="cursor-pointer hover:scale-110 transition-all"
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => onRatingChange(star)}
        >
          <StarIcon
            size={24}
            color={star <= (hoveredRating || rating) ? starColor : inactiveColor}
          />
        </button>
      ))}
    </div>
  )
}

// Individual Review Component
const ReviewCard = ({ review }: { review: ReviewData }): JSX.Element => {
  const customerName = review.customer?.first_name 
    ? `${review.customer.first_name}  `
    : "Anonimowy użytkownik"
  
  const initials = customerName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Nieznana data"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return "Nieznana data"
    }
  }
  
  return (
    <div className="bg-primary border border-ui-border-base rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ui-button-neutral rounded-full flex items-center justify-center text-black  font-medium">
            {initials}
          </div>
          <div>
            <h4 className="font-medium text-ui-fg-base">{customerName}</h4>
            <p className="text-sm text-ui-fg-subtle">{formatDate(review.created_at || review.updated_at)}</p>
          </div>
        </div>
        <StarRating rate={review.rating} starSize={16} />
      </div>
      
      {review.customer_note && (
        <p className="text-ui-fg-base leading-relaxed">{review.customer_note}</p>
      )}
    </div>
  )
}

// Review Form Component - Simplified
const ReviewForm = ({ 
  productId, 
  customer, 
  existingReview, 
  onSuccess,
  isSubmitting,
  setIsSubmitting
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
    reset
  } = useForm<FormValues>({
    defaultValues: {
      customer_note: existingReview?.customer_note || ''
    }
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
        // Update existing review
        response = await updateReview({
          id: existingReview.id,
          rating: rating,
          customer_note: data.customer_note
        })
        
        if (response.success && response.review) {
          toast.success("Recenzja została zaktualizowana!")
          onSuccess(response.review)
        } else {
          toast.error(`Błąd: ${response.error || 'Nie udało się zaktualizować recenzji'}`)
        }
      } else {
        // Create new review
        const reviewData = {
          product_id: productId,
          rating: rating,
          customer_note: data.customer_note
        }
        
        response = await createReview(reviewData)
        
        if (response.success && response.review) {
          toast.success("Dziękujemy za dodanie recenzji!")
          reset()
          setRating(0)
          onSuccess(response.review)
        } else {
          toast.error(`Błąd: ${response.error || 'Nie udało się dodać recenzji'}`)
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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-ui-bg-subtle p-6 rounded-lg mb-8">
      <h3 className="font-bold mb-4 text-ui-fg-base">
        {isEditMode ? "Edytuj swoją recenzję" : "Dodaj recenzję"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-ui-fg-base">Ocena</label>
          <InteractiveStarRating 
            rating={rating} 
            onRatingChange={setRating} 
          />
        </div>
        
        <div>
          <label htmlFor="review" className="block mb-2 text-ui-fg-base">
            Twoja opinia (opcjonalnie)
          </label>
          <textarea
            id="review"
            rows={4}
            placeholder="Podziel się swoją opinią o produkcie..."
            className="w-full p-3 border border-ui-border-base rounded-lg focus:border-ui-border-interactive focus:outline-none"
            {...register("customer_note")}
          />
          {errors.customer_note && (
            <p className="mt-1 text-sm text-ui-fg-error">{errors.customer_note.message}</p>
          )}
        </div>
        
        <Button 
          variant="filled" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Zapisywanie..." : isEditMode ? "Zaktualizuj recenzję" : "Dodaj recenzję"}
        </Button>
      </div>
    </form>
  )
}

// Login Prompt Component
const LoginPrompt = (): JSX.Element => (
  <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6 mb-8 text-center">
    <h3 className="text-lg font-semibold mb-2 text-ui-fg-base">Dodaj recenzję produktu</h3>
    <p className="text-ui-fg-subtle mb-4">
      Zaloguj się, aby móc dodać recenzję tego produktu
    </p>
    <Link 
      href="/account/login" 
      className="inline-block"
    >
      <Button variant="filled" size="large">
        Zaloguj się
      </Button>
    </Link>
  </div>
)

// Main ProductReviews Component - Rebuilt for simplicity and reliability
export const ProductReviews = ({ 
  productId, 
  isAuthenticated, 
  customer, 
  prefetchedReviews 
}: ProductReviewsProps): JSX.Element => {
  // Simple state management - no complex loading states
  const [reviews, setReviews] = useState<ReviewData[]>(prefetchedReviews)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  
  // Calculate data directly from current state
  const averageRating = calculateAverageRating(reviews)
  const userReview = findUserReview(reviews, customer)
  
  // Simple success handler that adds new review to current list
  const handleReviewSuccess = (newReview: ReviewData) => {
    // Add new review to the list or update existing one
    const existingIndex = reviews.findIndex(r => r.customer?.id === customer?.id)
    if (existingIndex >= 0) {
      // Update existing review
      const updatedReviews = [...reviews]
      updatedReviews[existingIndex] = newReview
      setReviews(updatedReviews)
    } else {
      // Add new review
      setReviews([newReview, ...reviews])
    }
  }

  return (
    <div className="w-full py-8">
      <div className="border-t border-ui-border-base pt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-ui-fg-base">
            Recenzje produktu ({reviews.length})
          </h3>
          <div className="flex items-center gap-2">
            <StarRating rate={averageRating} starSize={16} />
            <span className="text-sm text-ui-fg-subtle">
              {averageRating > 0 ? `${averageRating}/5` : 'Brak ocen'}
            </span>
          </div>
        </div>

        {/* Review Form Section */}
        {isAuthenticated && customer ? (
          <div className="mb-8">
            {userReview ? (
              <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-ui-fg-base">Twoja recenzja</h4>
                <ReviewForm 
                  productId={productId} 
                  customer={customer} 
                  existingReview={userReview} 
                  onSuccess={handleReviewSuccess}
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                />
              </div>
            ) : (
              <div className="bg-ui-bg-subtle border border-ui-border-base rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-ui-fg-base">Dodaj recenzję</h4>
                <ReviewForm 
                  productId={productId} 
                  customer={customer} 
                  existingReview={null} 
                  onSuccess={handleReviewSuccess}
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                />
              </div>
            )}
          </div>
        ) : (
          <LoginPrompt />
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center py-8 text-ui-fg-subtle">
              <p>Brak recenzji dla tego produktu.</p>
              {!isAuthenticated && (
                <p className="mt-2">Zaloguj się, aby dodać pierwszą recenzję!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}