import { LoginForm, UserNavigation } from "@/components/molecules"
import { ReviewsToWrite } from "@/components/organisms"
import { retrieveCustomer } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"
import { getReviews } from "@/lib/data/reviews"

export default async function Page() {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  // Add try/catch to handle potential errors in data fetching
  try {
    const orders = await listOrders()
    const { reviews = [] } = await getReviews() // Provide default empty array

    // Ensure both orders and reviews are arrays before proceeding
    if (!Array.isArray(orders) || !Array.isArray(reviews)) {
      console.error('Invalid data format: orders or reviews is not an array')
      return (
        <main className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
            <UserNavigation />
            <div className="md:col-span-3">
              <p>Unable to load your reviews at this time. Please try again later.</p>
            </div>
          </div>
        </main>
      )
    }
  
    const reviewsToWrite = orders.reduce((acc: any[], order) => {
    if (!order.seller) return acc

    const hasReview = reviews.some(
      (review: any) => review.seller?.id === order.seller.id
    )

    if (
      !hasReview &&
      !acc.some((item) => item.seller?.id === order.seller.id)
    ) {
      acc.push({
        ...order,
      })
    }

    return acc
  }, [])

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <ReviewsToWrite reviews={reviewsToWrite} />
      </div>
    </main>
  )
  } catch (error) {
    console.error('Error in reviews page:', error)
    return (
      <main className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
          <UserNavigation />
          <div className="md:col-span-3">
            <p>Unable to load your reviews at this time. Please try again later.</p>
          </div>
        </div>
      </main>
    )
  }
}
