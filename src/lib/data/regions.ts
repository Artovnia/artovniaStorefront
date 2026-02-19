"use server"

import { HttpTypes } from "@medusajs/types"
import { cache } from "react"

// ✅ Use native fetch (no Authorization header) so Next.js Data Cache works.
// sdk.client.fetch injects the JWT globally which busts next:{revalidate:3600}.
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

const PUBLIC_HEADERS = {
  'accept': 'application/json',
  'x-publishable-api-key': PUB_KEY,
}

export const listRegions = async () => {
  const res = await fetch(`${BACKEND_URL}/store/regions`, {
    headers: PUBLIC_HEADERS,
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`listRegions → ${res.status}`)
  const { regions } = await res.json() as { regions: HttpTypes.StoreRegion[] }
  return regions
}

export const retrieveRegion = async (id: string) => {
  const res = await fetch(`${BACKEND_URL}/store/regions/${id}`, {
    headers: PUBLIC_HEADERS,
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`retrieveRegion → ${res.status}`)
  const { region } = await res.json() as { region: HttpTypes.StoreRegion }
  return region
}

// ⚠️ NOTE: Region selection is PER-USER (client-side selection in CountrySelector)
// Cannot use unstable_cache because different users may have different regions
// The countryCode parameter comes from user's cart region, not a global setting
// 
// Caching strategy:
// - listRegions() uses next: { revalidate: 3600 } for raw region data
// - This function builds the mapping on each call (cheap operation)
// - React cache() deduplicates identical calls within same request (per-render)
const getRegionInternal = async (countryCode: string): Promise<HttpTypes.StoreRegion | null> => {
  try {
    const regions = await listRegions()

    if (!regions) {
      return null
    }

    // Build lookup map (fast operation, no need to cache)
    const countryToRegionMap = new Map<string, HttpTypes.StoreRegion>()
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c?.iso_2) {
          countryToRegionMap.set(c.iso_2.toLowerCase(), region)
        }
      })
    })

    // Find region by country code
    const region = countryToRegionMap.get(countryCode.toLowerCase())
    
    // Fallback to US or first region
    if (!region) {
      const fallback = countryToRegionMap.get('us') || regions[0]
      return fallback || null
    }

    return region
  } catch (e) {
    console.error('❌ getRegion failed:', { countryCode, error: e })
    return null
  }
}

// ✅ OPTIMIZATION: Wrap with React cache() to deduplicate calls within same request
// This reduces 6+ region fetches to 1 per page load
// React cache() is per-request, so different users still get correct regions
export const getRegion = cache(getRegionInternal)
