"use server"

// ✅ Use native fetch (no Authorization header) so Next.js Data Cache works.
// sdk.client.fetch injects the JWT globally which busts next:{revalidate}.
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
const PRODUCT_CACHE_REVALIDATE_SECONDS = 600

/**
 * Fetch attribute values for a specific product variant
 */
export async function getVariantAttributes(productId: string, variantId: string) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/store/products/${productId}/variants/${variantId}/attributes`,
      {
        headers: {
          'accept': 'application/json',
          'x-publishable-api-key': PUB_KEY,
        },
        next: {
          revalidate: PRODUCT_CACHE_REVALIDATE_SECONDS,
          tags: [`variant-${variantId}-attributes`, `product-${productId}`],
        }
      }
    )
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
