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

// For debugging in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  console.log('🔌 SDK Base URL:', getBaseUrl())
}
