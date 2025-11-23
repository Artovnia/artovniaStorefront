import { listRegions } from '@/lib/data/regions'
import { retrieveCart } from '@/lib/data/cart'
import { CountrySelector } from './CountrySelector'

/**
 * Server component wrapper for CountrySelector
 * Fetches regions from backend and detects current region from cart
 */
export async function CountrySelectorWrapper() {
  // Fetch all available regions from backend
  const regions = await listRegions().catch(() => [])
  
  if (!regions || regions.length === 0) {
    console.warn('No regions available from backend')
    return null
  }
  
  // Try to get current region from cart
  let currentRegionId: string | undefined
  try {
    const cart = await retrieveCart()
    currentRegionId = cart?.region_id
  } catch (error) {
    // Cart doesn't exist yet or user not authenticated - that's fine
    // Will default to first region (Poland)
  }
  
  return <CountrySelector regions={regions} currentRegionId={currentRegionId} />
}
