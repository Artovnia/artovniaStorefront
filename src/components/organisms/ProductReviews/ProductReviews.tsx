// src/components/organisms/ProductReviews/ProductReviews.tsx
"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/atoms"
import { StarRating } from "@/components/atoms/StarRating/StarRating"
import { StarIcon } from '@/icons'
import { getProductReviews, createReview, checkUserReviewStatus, updateReview } from "@/lib/data/reviews"
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
  prefetchedReviews?: ReviewData[]
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
  const customerName = review.customer?.first_name && review.customer?.last_name
    ? `${review.customer.first_name} ${review.customer.last_name}`
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
    <div className="bg-white border border-ui-border-base rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ui-button-neutral rounded-full flex items-center justify-center text-white font-medium">
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

// Review Form Component
const ReviewForm = ({ productId, customer, existingReview, onSuccess }: {
  productId: string
  customer: HttpTypes.StoreCustomer
  existingReview: ReviewData | null
  onSuccess: () => void
}): JSX.Element => {
  const isEditMode = !!existingReview
  const [rating, setRating] = useState(existingReview ? existingReview.rating : 0)
  const [submitting, setSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormValues>({
    defaultValues: {
      customer_note: existingReview?.customer_note || ''
    }
  })
  
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setValue('customer_note', existingReview.customer_note || '')
    }
  }, [existingReview, setValue])
  
  const onSubmit = async (data: FormValues): Promise<void> => {
    if (rating === 0) {
      toast.error("Prosimy wybrać ocenę w gwiazdkach")
      return
    }
    
    setSubmitting(true)
    
    try {
      let response
      
      if (isEditMode && existingReview) {
        // Update existing review
        response = await updateReview({
          id: existingReview.id,
          rating: rating,
          customer_note: data.customer_note
        })
        
        if (response.success) {
          toast.success("Recenzja została zaktualizowana!")
          onSuccess()
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
        
        if (response.success) {
          toast.success("Dziękujemy za dodanie recenzji!")
          reset()
          setRating(0)
          onSuccess()
        } else {
          toast.error(`Błąd: ${response.error || 'Nie udało się dodać recenzji'}`)
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Wystąpił błąd podczas zapisywania recenzji.")
    } finally {
      setSubmitting(false)
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
          disabled={submitting}
        >
          {submitting ? "Zapisywanie..." : isEditMode ? "Zaktualizuj recenzję" : "Dodaj recenzję"}
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

// Main ProductReviews Component
export const ProductReviews = ({ 
  productId, 
  isAuthenticated, 
  customer, 
  prefetchedReviews = [] 
}: ProductReviewsProps): JSX.Element => {
  const [reviews, setReviews] = useState<ReviewData[]>(prefetchedReviews)
  const [loading, setLoading] = useState<boolean>(prefetchedReviews.length === 0)
  const [userReview, setUserReview] = useState<ReviewData | null>(null)
  const [checkingUserReview, setCheckingUserReview] = useState<boolean>(false)
  
  const averageRating = calculateAverageRating(reviews)
  
  console.log('🗂 Client ProductReviews component initialized for product:', productId)
  
  // Function to check if the user has already reviewed this product - wrapped in useCallback
  const checkUserHasReviewed = useCallback(async (): Promise<void> => {
    console.log('🔍 Checking if user has already reviewed this product:', productId)
    
    setCheckingUserReview(true)
    try {
      const result = await checkUserReviewStatus(productId)
      if (result.exists && result.review) {
        console.log('👤 User has already reviewed this product:', result.review)
        setUserReview(result.review)
      } else {
        console.log('👤 User has not reviewed this product yet')
        setUserReview(null)
      }
    } catch (error) {
      console.error('❌ Error checking user review status:', error)
    } finally {
      setCheckingUserReview(false)
    }
  }, [productId, setCheckingUserReview, setUserReview])
  
  const fetchReviews = useCallback(async (): Promise<void> => {
    console.log('🔄 Fetching reviews for product:', productId)
    setLoading(true)
    
    try {
      const { reviews: fetchedReviews = [] } = await getProductReviews(productId)
      
      console.log(`✅ Fetched ${fetchedReviews.length} reviews for product ${productId}`)
      setReviews(fetchedReviews)
      
      // Check if user has already reviewed this product
      if (isAuthenticated && customer) {
        await checkUserHasReviewed()
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error)
      toast.error("Błąd podczas pobierania recenzji")
    } finally {
      setLoading(false)
    }
  }, [productId, setLoading, setReviews, isAuthenticated, customer, checkUserHasReviewed])
  
  const onReviewAdded = (): void => {
    console.log('✨ Review added, refreshing reviews list')
    fetchReviews()
  }
  
  useEffect(() => {
    if (productId && !prefetchedReviews.length) {
      fetchReviews()
    } else {
      setLoading(false)
      
      // Still check if the user has already reviewed this product
      if (isAuthenticated && customer) {
        checkUserHasReviewed().catch((err: Error) => {
          console.error('Error checking user review:', err)
        })
      }
    }
  }, [productId, prefetchedReviews.length, isAuthenticated, customer, fetchReviews, checkUserHasReviewed])
  
  if (loading) {
    return (
      <div className="w-full py-16">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-border-interactive"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full py-8">
      <div className="border-t border-ui-border-base pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ui-fg-base">Recenzje produktu</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rate={Math.round(averageRating)} starSize={16} />
              <span className="text-sm text-ui-fg-subtle">
                {averageRating}/5 ({reviews.length} {reviews.length === 1 ? 'recenzja' : 'recenzji'})
              </span>
            </div>
          )}
        </div>
        
        {/* Review Form or Login Prompt */}
        {isAuthenticated && customer ? (
          checkingUserReview ? (
            <div className="bg-ui-bg-subtle p-6 rounded-lg mb-8 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ui-border-interactive"></div>
              </div>
              <p className="mt-2 text-ui-fg-subtle">Sprawdzanie statusu recenzji...</p>
            </div>
          ) : (
            <ReviewForm 
              productId={productId} 
              customer={customer}
              existingReview={userReview} 
              onSuccess={onReviewAdded} 
            />
          )
        ) : (
          <LoginPrompt />
        )}
        
        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-ui-bg-subtle rounded-lg">
            <p className="text-ui-fg-subtle">
              Ten produkt nie ma jeszcze żadnych recenzji. Bądź pierwszy!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}