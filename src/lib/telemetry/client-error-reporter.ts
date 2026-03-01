export type ClientBoundaryErrorPayload = {
  boundary: string
  message: string
  digest?: string
  pathname?: string
  segment?: string
  step?: string
  cartId?: string
  locale?: string
  componentStack?: string
  stack?: string
  metadata?: Record<string, unknown>
}

function buildPayload(payload: ClientBoundaryErrorPayload) {
  return {
    ...payload,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    url: typeof window !== "undefined" ? window.location.href : undefined,
  }
}

export async function reportClientBoundaryError(payload: ClientBoundaryErrorPayload) {
  const normalized = buildPayload(payload)

  console.error("[ClientBoundaryError]", normalized)

  if (typeof window === "undefined") {
    return
  }

  try {
    const body = JSON.stringify(normalized)

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" })
      navigator.sendBeacon("/api/client-errors", blob)
      return
    }

    await fetch("/api/client-errors", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body,
      keepalive: true,
      cache: "no-store",
    })
  } catch {
    // Never throw from telemetry reporter.
  }
}
