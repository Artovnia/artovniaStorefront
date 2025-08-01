import Medusa from "@medusajs/js-sdk"

// Use NEXT_PUBLIC_ variables for client-side components
// This ensures the variable is available at runtime in the browser
const getBaseUrl = (): string => {
  // For browser runtime - prefer NEXT_PUBLIC_ variables
  if (typeof window !== 'undefined') {
    const runtimeUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
    if (runtimeUrl) return runtimeUrl
  }
  
  // Fallback for server-side or if NEXT_PUBLIC_ isn't set
  // Use non-null assertion as we expect this to be set in production
  return process.env.MEDUSA_BACKEND_URL as string
}

// Initialize SDK with dynamic configuration
export const sdk = new Medusa({
  baseUrl: getBaseUrl(),
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// Optimized debugging - reduced logging for better performance
if (typeof window !== 'undefined') {
  // Only log in development to reduce production overhead
  if (process.env.NODE_ENV === 'development') {
  
  }
  
  // Remove fetch logging in production to improve performance
  // Fetch logging can be re-enabled for debugging if needed
} else {
  // Server-side logging only in development
  if (process.env.NODE_ENV === 'development') {
  
  }
}
