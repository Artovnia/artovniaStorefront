import { LowestPriceData } from "@/types/price-history"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

/**
 * Server-side function to fetch batch lowest prices
 * Uses GET request to enable Next.js Data Cache and Vercel Edge caching
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
    // Build URL with query parameters for GET request
    const url = new URL(`${MEDUSA_BACKEND_URL}/store/variants/lowest-prices-batch`)
    url.searchParams.set('variant_ids', variantIds.join(','))
    url.searchParams.set('currency_code', currencyCode)
    if (regionId) {
      url.searchParams.set('region_id', regionId)
    }
    url.searchParams.set('days', days.toString())
    
    const response = await fetch(url.toString(), {
      method: 'GET', // ✅ Changed to GET for Next.js caching
      headers: {
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      },
      next: { 
        revalidate: 60, // ✅ Now this works with GET!
        tags: ['prices'] // For revalidation
      }
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
