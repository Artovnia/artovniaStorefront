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

// Enhanced debugging for both development and production
if (typeof window !== 'undefined') {
  // Log the environment variables and final baseUrl
  console.log('🔌 SDK Configuration:', {
    baseUrl: getBaseUrl(),
    environment: process.env.NODE_ENV,
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    runtime: 'browser'
  })
  
  // Log all API requests in production to debug CORS issues
  if (process.env.NODE_ENV === 'production') {
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      // Get URL string regardless of input type
      const urlString = typeof input === 'string' ? input : 
                      input instanceof URL ? input.toString() : 
                      input instanceof Request ? input.url : '';
      
      if (urlString.includes('/store/product-colors') || urlString.includes('/store/attributes')) {
        console.log('🌐 Fetch API call:', {
          url: urlString,
          headers: init?.headers,
          method: init?.method
        });
      }
      return originalFetch(input, init);
    };
  }
} else {
  // Server-side logging
  console.log('🔌 Server SDK Configuration:', {
    baseUrl: getBaseUrl(),
    environment: process.env.NODE_ENV,
    hasMedusaBackendUrl: !!process.env.MEDUSA_BACKEND_URL,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    runtime: 'server'
  })
}
