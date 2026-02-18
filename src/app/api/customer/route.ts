import { NextResponse } from "next/server"
import { retrieveCustomer } from "@/lib/data/customer"

/**
 * GET /api/customer
 * 
 * Client-side endpoint to fetch current customer data.
 * Used by ProductUserDataProvider for client-side hydration.
 * This allows product pages to use ISR caching while still
 * showing personalized content after hydration.
 */
export async function GET() {
  try {
    const customer = await retrieveCustomer()
    
    if (!customer) {
      return NextResponse.json(null, { status: 200 })
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json(null, { status: 200 })
  }
}
