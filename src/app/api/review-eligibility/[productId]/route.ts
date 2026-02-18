import { NextResponse } from "next/server"
import { checkProductReviewEligibility } from "@/lib/data/reviews"

/**
 * GET /api/review-eligibility/[productId]
 * 
 * Client-side endpoint to check if user is eligible to review a product.
 * Used by ProductUserDataProvider for client-side hydration.
 * This allows product pages to use ISR caching while still
 * showing personalized review eligibility after hydration.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    
    if (!productId) {
      return NextResponse.json(
        { isEligible: false, hasPurchased: false },
        { status: 200 }
      )
    }
    
    const eligibility = await checkProductReviewEligibility(productId)
    
    return NextResponse.json({
      isEligible: eligibility?.isEligible || false,
      hasPurchased: eligibility?.hasPurchased || false,
    })
  } catch (error) {
    console.error("Error checking review eligibility:", error)
    return NextResponse.json(
      { isEligible: false, hasPurchased: false },
      { status: 200 }
    )
  }
}
