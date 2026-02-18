import { NextResponse } from "next/server"
import { getUserWishlists } from "@/lib/data/wishlist"

/**
 * GET /api/wishlists
 * 
 * Client-side endpoint to fetch user wishlists.
 * Used by ProductUserDataProvider for client-side hydration.
 * This allows product pages to use ISR caching while still
 * showing personalized wishlist icons after hydration.
 */
export async function GET() {
  try {
    const wishlistData = await getUserWishlists()
    
    return NextResponse.json({
      wishlists: wishlistData?.wishlists || [],
      count: wishlistData?.count || 0,
    })
  } catch (error) {
    console.error("Error fetching wishlists:", error)
    return NextResponse.json({ wishlists: [], count: 0 }, { status: 200 })
  }
}
