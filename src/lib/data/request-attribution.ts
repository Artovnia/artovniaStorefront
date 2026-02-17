"use server"

import { cache } from "react"
import { headers } from "next/headers"

const getRequestAttributionId = cache(async () => {
  try {
    const incomingHeaders = await headers()
    const existingRequestId =
      incomingHeaders.get("x-request-id") ||
      incomingHeaders.get("x-vercel-id") ||
      incomingHeaders.get("traceparent")

    return existingRequestId || crypto.randomUUID()
  } catch {
    return crypto.randomUUID()
  }
})

export const getAttributionHeaders = cache(
  async (callsite: string, page: string): Promise<Record<string, string>> => {
    const includeRequestId = process.env.NEXT_PUBLIC_ENABLE_PRODUCT_TRACE_REQUEST_ID === "true"
    const requestId = includeRequestId ? await getRequestAttributionId() : null

    return {
      "x-artovnia-callsite": callsite,
      "x-artovnia-page": page,
      ...(requestId ? { "x-artovnia-request-id": requestId } : {}),
    }
  }
)
