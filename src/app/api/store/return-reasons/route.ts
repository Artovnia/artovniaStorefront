// Next.js API Route handler for fetching return reasons
import { NextResponse } from "next/server"
import { retrieveReturnReasons } from "@/lib/data/orders"

export async function GET() {
  try {
    // Fetch return reasons using the Medusa client
    const returnReasons = await retrieveReturnReasons()

    // Extract reasons and format them - use type assertion to handle null values
    const formattedReasons = returnReasons.map((reason: any) => ({
      id: reason.id,
      value: reason.value || reason.id,
      label: reason.label || formatReasonId(reason.id),
      description: reason.description || undefined
    }))

    // Debug log
    console.log(`API: Fetched ${formattedReasons.length} return reasons`)
    
    return NextResponse.json({ return_reasons: formattedReasons })
  } catch (error) {
    console.error("Error fetching return reasons:", error)
    return NextResponse.json(
      { error: "Failed to load return reasons" },
      { status: 500 }
    )
  }
}

// Helper function to format reason IDs into readable labels
function formatReasonId(id: string): string {
  if (!id) return "Unknown reason"
  
  // Remove prefix if exists
  const withoutPrefix = id.startsWith('rr_') ? id.substring(3) : id
  
  // Convert snake_case to Title Case
  return withoutPrefix
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
