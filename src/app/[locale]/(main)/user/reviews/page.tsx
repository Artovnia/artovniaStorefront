import { LoginForm, UserPageLayout } from "@/components/molecules"
import { ReviewsToWrite } from "@/components/organisms"
import { retrieveCustomer } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"
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

  // Add try/catch to handle potential errors in data fetching
  try {
    const orders = await listOrders()
    const { reviews = [] } = await getReviews() // Provide default empty array

    // Ensure both orders and reviews are arrays before proceeding
    if (!Array.isArray(orders) || !Array.isArray(reviews)) {
      console.error('Invalid data format: orders or reviews is not an array')
      return (
        <UserPageLayout>
          <p>Unable to load your reviews at this time. Please try again later.</p>
        </UserPageLayout>
      )
    }
  
    const reviewsToWrite: any[] = []

    // 1. Check for sellers that need reviews
    orders.forEach((order) => {
      if (!order.seller) return

      const hasSellerReview = reviews.some(
        (review: any) => review.seller?.id === order.seller.id && review.reference === "seller"
      )

      if (
        !hasSellerReview &&
        !reviewsToWrite.some((item) => item.type === 'seller' && item.seller?.id === order.seller.id)
      ) {
        reviewsToWrite.push({
          ...order,
          type: 'seller',
          reviewType: 'seller'
        })
      }
    })

    // 2. Check for products that need reviews
    orders.forEach((order) => {
      if (!order.items || !Array.isArray(order.items)) return

      order.items.forEach((item: any) => {
        if (!item.product_id) return

        const hasProductReview = reviews.some(
          (review: any) => review.reference === "product" && review.reference_id === item.product_id
        )

        if (
          !hasProductReview &&
          !reviewsToWrite.some((r) => r.type === 'product' && r.product_id === item.product_id)
        ) {
          reviewsToWrite.push({
            id: `${order.id}-${item.id}`,
            type: 'product',
            reviewType: 'product',
            product_id: item.product_id,
            product: item.product || { title: item.title, thumbnail: item.thumbnail },
            order_id: order.id,
            seller: order.seller
          })
        }
      })
    })

  return (
    <UserPageLayout>
      <ReviewsToWrite reviews={reviewsToWrite} />
    </UserPageLayout>
  )
  } catch (error) {
    console.error('Error in reviews page:', error)
    return (
      <UserPageLayout>
        <p>Unable to load your reviews at this time. Please try again later.</p>
      </UserPageLayout>
    )
  }
}
