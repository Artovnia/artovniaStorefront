/**
 * Backend Health Check Utility
 * 
 * Checks if the Medusa backend is available and healthy.
 * Used by middleware to show maintenance page when backend is down.
 */

const HEALTH_CHECK_TIMEOUT = 5000 // 5 seconds
const CACHE_DURATION = 30000 // 30 seconds - cache health status to avoid hammering backend

interface HealthCheckResult {
  isHealthy: boolean
  timestamp: number
  error?: string
}

// In-memory cache for health check results (per-request in serverless)
let healthCache: HealthCheckResult | null = null

/**
 * Check if backend is healthy
 * Returns cached result if available and fresh
 */
export async function checkBackendHealth(): Promise<boolean> {
  const now = Date.now()
  
  // Return cached result if available and fresh
  if (healthCache && (now - healthCache.timestamp) < CACHE_DURATION) {
    return healthCache.isHealthy
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const healthEndpoint = `${backendUrl}/health`

    // Use AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)

    const response = await fetch(healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    })

    clearTimeout(timeoutId)

    const isHealthy = response.ok && response.status === 200

    // Cache the result
    healthCache = {
      isHealthy,
      timestamp: now,
    }

    return isHealthy
  } catch (error) {
    console.error('[Health Check] Backend health check failed:', error)

    // Cache the failure
    healthCache = {
      isHealthy: false,
      timestamp: now,
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    return false
  }
}

/**
 * Clear health check cache
 * Useful for testing or forcing a fresh check
 */
export function clearHealthCache(): void {
  healthCache = null
}

/**
 * Get cached health status without making a new request
 */
export function getCachedHealthStatus(): HealthCheckResult | null {
  return healthCache
}
