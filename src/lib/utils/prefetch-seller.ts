"use client"

/**
 * Prefetch seller page data on hover to enable instant navigation
 * This fetches the actual API data, not just the RSC payload
 */

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

// Track which sellers have been prefetched to avoid duplicate requests
const prefetchedSellers = new Set<string>()

export async function prefetchSellerData(handle: string): Promise<void> {
  // Skip if already prefetched
  if (prefetchedSellers.has(handle)) {
    console.log(`[PREFETCH] Already prefetched: ${handle}`)
    return
  }

  prefetchedSellers.add(handle)
  console.log(`[PREFETCH] Starting data prefetch for: ${handle}`)

  try {
    // Prefetch seller data and products in parallel
    const [sellerResponse, productsResponse] = await Promise.all([
      fetch(`${MEDUSA_BACKEND_URL}/store/seller/${encodeURIComponent(handle)}?fields=id,name,handle,description,photo,address_line,city,postal_code,country_code,tax_id,created_at,email`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
      }),
      fetch(`${MEDUSA_BACKEND_URL}/store/seller/${encodeURIComponent(handle)}/products?limit=20&offset=0`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
      }),
    ])

    if (sellerResponse.ok && productsResponse.ok) {
      const [sellerData, productsData] = await Promise.all([
        sellerResponse.json(),
        productsResponse.json(),
      ])

      // Extract variant IDs for price prefetch
      const variantIds = productsData.products
        ?.map((p: any) => p.variants?.[0]?.id)
        .filter(Boolean) as string[] || []

      // Prefetch price history if we have variants
      if (variantIds.length > 0) {
        fetch(`${MEDUSA_BACKEND_URL}/store/variants/lowest-prices-batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            variant_ids: variantIds,
            currency_code: 'PLN',
            days: 30
          }),
        }).catch(() => {}) // Ignore errors for prefetch
      }

      console.log(`[PREFETCH] Completed for: ${handle} (${productsData.products?.length || 0} products)`)
    }
  } catch (error) {
    // Remove from prefetched set on error so it can be retried
    prefetchedSellers.delete(handle)
    console.log(`[PREFETCH] Failed for: ${handle}`, error)
  }
}

// Clear prefetch cache (useful for testing)
export function clearPrefetchCache(): void {
  prefetchedSellers.clear()
}
