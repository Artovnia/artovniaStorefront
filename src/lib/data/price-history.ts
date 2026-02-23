import { LowestPriceData } from "@/types/price-history"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PRICE_BATCH_DEDUP_TTL_MS = Number(process.env.PRICE_BATCH_DEDUP_TTL_MS || 2000)

const inflightPriceBatchRequests = new Map<string, { promise: Promise<Record<string, LowestPriceData | null>>; timestamp: number }>()

function getDeduplicatedPriceBatch(
  dedupKey: string,
  fetcher: () => Promise<Record<string, LowestPriceData | null>>
) {
  const now = Date.now()
  const existing = inflightPriceBatchRequests.get(dedupKey)
  if (existing && now - existing.timestamp < PRICE_BATCH_DEDUP_TTL_MS) {
    return existing.promise
  }

  const promise = fetcher().finally(() => {
    setTimeout(() => {
      inflightPriceBatchRequests.delete(dedupKey)
    }, PRICE_BATCH_DEDUP_TTL_MS)
  })

  inflightPriceBatchRequests.set(dedupKey, { promise, timestamp: now })
  return promise
}

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

  const dedupKey = JSON.stringify({
    variantIds: [...variantIds].sort(),
    currencyCode,
    regionId: regionId || null,
    days,
  })

  return getDeduplicatedPriceBatch(dedupKey, async () => {
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
  })
}
