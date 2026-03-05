const RAW_MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

export const MEDUSA_BACKEND_BASE_URL = RAW_MEDUSA_BACKEND_URL.replace(/\/+$/, "")

function ensureLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

export function buildMedusaEndpointCandidates(path: string): string[] {
  const normalizedPath = ensureLeadingSlash(path)
  const candidates: string[] = [`${MEDUSA_BACKEND_BASE_URL}${normalizedPath}`]

  if (normalizedPath.startsWith("/store/")) {
    if (MEDUSA_BACKEND_BASE_URL.endsWith("/api")) {
      candidates.push(`${MEDUSA_BACKEND_BASE_URL.slice(0, -4)}${normalizedPath}`)
    } else {
      candidates.push(`${MEDUSA_BACKEND_BASE_URL}/api${normalizedPath}`)
    }
  }

  return Array.from(new Set(candidates))
}

export function isCannotGetHtmlResponse(status: number, body: string): boolean {
  if (status !== 404) {
    return false
  }

  const normalizedBody = (body || "").toLowerCase()
  return normalizedBody.includes("cannot get") && normalizedBody.includes("<html")
}
