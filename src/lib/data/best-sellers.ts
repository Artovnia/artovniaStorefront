"use server"

import { HttpTypes } from "@medusajs/types"
import { getPublishableApiKey } from "../get-publishable-key"

export interface BestSellerProduct extends HttpTypes.StoreProduct {
  sales_count: number
  sales_revenue: number
}

interface BestSellersResponse {
  products: BestSellerProduct[]
  stats: { product_id: string; count: number; revenue: number }[]
}

export async function getBestSellers(
  countryCode: string = "pl",
  limit: number = 50,
  days?: number
): Promise<BestSellersResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
                  "http://localhost:9000"
  
  const params = new URLSearchParams({
    limit: limit.toString(),
    countryCode,
  })
  
  if (days) {
    params.append("days", days.toString())
  }

  try {
    const publishableKey = await getPublishableApiKey()
    
    const response = await fetch(
      `${baseUrl}/store/best-sellers?${params.toString()}`,
      {
        headers: {
          "x-publishable-api-key": publishableKey,
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 600,
          tags: ["best-sellers", "products"],
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching best sellers:", error)
    return { products: [], stats: [] }
  }
}
