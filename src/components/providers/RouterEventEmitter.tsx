"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * RouterEventEmitter - Emits custom events for Next.js App Router navigation
 * This component bridges the gap between Next.js App Router and our LoadingProvider
 * by emitting custom events that can be listened to for loading states
 */
export function RouterEventEmitter() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialMount = useRef(true)
  const previousUrl = useRef<string>("")

  useEffect(() => {
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    // Skip initial mount to avoid false route change events
    if (isInitialMount.current) {
      isInitialMount.current = false
      previousUrl.current = currentUrl
      return
    }

    // Only emit events if the URL actually changed
    if (previousUrl.current !== currentUrl) {
      // Emit route change complete event
      const completeEvent = new CustomEvent('routeChangeComplete', {
        detail: { 
          url: currentUrl,
          previousUrl: previousUrl.current 
        }
      })
      window.dispatchEvent(completeEvent)
      
      // Update previous URL
      previousUrl.current = currentUrl
    }
  }, [pathname, searchParams])

  // This component doesn't render anything
  return null
}
