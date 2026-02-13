"use server"

import { sdk } from "../config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

// Request deduplication for listCartPaymentMethods
// TTL-based to cover sequential Next.js server renders within the same page load
const inflightPaymentRequests = new Map<string, { promise: Promise<any>; timestamp: number }>()
const PAYMENT_DEDUP_TTL_MS = 2000

export const listCartPaymentMethods = async (regionId: string) => {
  if (!regionId) return null

  const now = Date.now()
  const existing = inflightPaymentRequests.get(regionId)
  if (existing && (now - existing.timestamp) < PAYMENT_DEDUP_TTL_MS) {
    return existing.promise
  }

  const promise = _fetchPaymentMethods(regionId)
  inflightPaymentRequests.set(regionId, { promise, timestamp: now })
  promise.finally(() => {
    setTimeout(() => inflightPaymentRequests.delete(regionId), PAYMENT_DEDUP_TTL_MS)
  })

  return promise
}

async function _fetchPaymentMethods(regionId: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  return sdk.client
      .fetch<HttpTypes.StorePaymentProviderListResponse>(
        `/store/payment-providers`,
        {
          method: "GET",
          query: { region_id: regionId },
          headers,
          next,
        cache: "force-cache",
        }
    )
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => {
        return a.id > b.id ? 1 : -1
      })
    )
    .catch(() => {
      return null
    })
}