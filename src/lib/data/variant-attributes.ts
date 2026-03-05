"use server"

import {
  buildMedusaEndpointCandidates,
  isCannotGetHtmlResponse,
} from "@/lib/utils/medusa-backend-url"

// ✅ Use native fetch (no Authorization header) so Next.js Data Cache works.
// sdk.client.fetch injects the JWT globally which busts next:{revalidate}.
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
const PRODUCT_CACHE_REVALIDATE_SECONDS = 600

/**
 * Fetch attribute values for a specific product variant
 */
export async function getVariantAttributes(productId: string, variantId: string) {
  try {
    const endpointCandidates = buildMedusaEndpointCandidates(
      `/store/products/${productId}/variants/${variantId}/attributes`
    )

    let res: Response | null = null

    for (let candidateIndex = 0; candidateIndex < endpointCandidates.length; candidateIndex += 1) {
      const endpoint = endpointCandidates[candidateIndex]
      const currentResponse = await fetch(endpoint, {
        headers: {
          'accept': 'application/json',
          'x-publishable-api-key': PUB_KEY,
        },
        next: {
          revalidate: PRODUCT_CACHE_REVALIDATE_SECONDS,
          tags: [`variant-${variantId}-attributes`, `product-${productId}`],
        }
      })

      if (!currentResponse.ok) {
        const body = await currentResponse.text().catch(() => '')
        const retryWithAlternativePath =
          candidateIndex < endpointCandidates.length - 1 &&
          isCannotGetHtmlResponse(currentResponse.status, body)

        if (retryWithAlternativePath) {
          continue
        }

        throw new Error(`getVariantAttributes → ${currentResponse.status}`)
      }

      res = currentResponse
      break
    }

    if (!res) {
      throw new Error('getVariantAttributes → no successful endpoint candidate')
    }

    if (!res.ok) throw new Error(`getVariantAttributes → ${res.status}`)
    return res.json() as Promise<{
      attribute_values: Array<{
        id: string
        value: string
        attribute_id: string
        attribute_name: string
        attribute: {
          id: string
          name: string
          handle: string
          ui_component: string
        }
      }>
    }>
  } catch (error) {
    console.error(`Failed to fetch variant attributes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { attribute_values: [] }
  }
}
