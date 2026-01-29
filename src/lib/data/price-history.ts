import { LowestPriceData } from "@/types/price-history"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

/**
 * Server-side function to fetch batch lowest prices
 * Can be used in Server Components to pre-fetch price data
 */
export async function getBatchLowestPrices(
  variantIds: string[],
  currencyCode: string = 'PLN',
  regionId?: string,
  days: number = 30
): Promise<Record<string, LowestPriceData | null>> {
  if (!variantIds.length) {
    return {}
  }

  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/variants/lowest-prices-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      },
      body: JSON.stringify({
        variant_ids: variantIds,
        currency_code: currencyCode,
        region_id: regionId,
        days
      }),
      next: { revalidate: 60 } // Cache for 1 minute
    })

    if (!response.ok) {
      console.error('[getBatchLowestPrices] Response error:', response.statusText)
      return {}
    }

    const result = await response.json()
    return result.results || {}
  } catch (error) {
    console.error('[getBatchLowestPrices] Error:', error)
    return {}
  }
}
