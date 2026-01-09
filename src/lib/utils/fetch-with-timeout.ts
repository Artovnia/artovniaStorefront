/**
 * Fetch utility with timeout and retry logic
 * Prevents hanging requests and handles transient failures
 */

export interface FetchWithTimeoutOptions {
  timeout?: number
  maxRetries?: number
  retryDelay?: number
  onRetry?: (attempt: number, error: Error) => void
}

/**
 * Wraps a promise with a timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  ms: number = 15000,
  errorMessage?: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(errorMessage || `Request timeout after ${ms}ms`)),
        ms
      )
    ),
  ])
}

/**
 * Executes a fetch function with timeout and retry logic
 * 
 * @example
 * const data = await fetchWithRetry(
 *   () => sdk.client.fetch('/store/products', {...}),
 *   { timeout: 10000, maxRetries: 3 }
 * )
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const {
    timeout = process.env.NODE_ENV === 'development' ? 30000 : 15000,
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
  } = options

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(
        fetchFn(),
        timeout,
        `Fetch timeout after ${timeout}ms (attempt ${attempt}/${maxRetries})`
      )
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      const isLastAttempt = attempt === maxRetries
      
      if (isLastAttempt) {
        console.error(`❌ Fetch failed after ${maxRetries} attempts:`, {
          error: lastError.message,
          stack: lastError.stack,
        })
        throw lastError
      }

      // Check if error is retryable
      const isRetryable = isRetryableError(lastError)
      
      if (!isRetryable) {
        console.warn(`⚠️ Non-retryable error, failing immediately:`, lastError.message)
        throw lastError
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError)
      }

      // Exponential backoff with jitter
      const delay = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      
      console.warn(`⚠️ Fetch attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`, {
        error: lastError.message,
      })
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Fetch failed with unknown error')
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()
  
  // Retryable errors
  const retryablePatterns = [
    'timeout',
    'fetch failed',
    'network',
    'econnreset',
    'enotfound',
    'econnrefused',
    'socket',
    'etimedout',
  ]
  
  // Non-retryable errors
  const nonRetryablePatterns = [
    '400',
    '401',
    '403',
    '404',
    '422',
    'validation',
    'unauthorized',
    'forbidden',
  ]
  
  // Check if non-retryable
  if (nonRetryablePatterns.some(pattern => message.includes(pattern))) {
    return false
  }
  
  // Check if retryable
  if (retryablePatterns.some(pattern => message.includes(pattern))) {
    return true
  }
  
  // Default to retryable for unknown errors
  return true
}
