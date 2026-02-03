"use server"

import { sdk } from "../config"
import medusaError from "@/lib/helpers/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { cache } from "react"

export const listRegions = async () => {
  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next: { revalidate: 3600 }, // Cache for 1 hour - regions rarely change
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    .then(({ region }) => region)
    .catch(medusaError)
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
