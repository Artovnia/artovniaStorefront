"use client"

import { useEffect } from 'react'
import { useViewTracker } from '@/lib/utils/view-tracker'

/**
 * Hook to automatically track product views
 * Use this in ProductDetailsPage or ProductCard components
 */
export function useProductViewTracking(productId: string | undefined, options?: {
  trackOnMount?: boolean
  trackOnce?: boolean
}) {
  const { trackView } = useViewTracker()
  const { trackOnMount = true, trackOnce = false } = options || {}

  useEffect(() => {
    if (!productId || !trackOnMount) return

    // Optional: only track once per session
    if (trackOnce) {
      const sessionKey = `viewed_${productId}`
      if (sessionStorage.getItem(sessionKey)) {
        return // Already tracked this session
      }
      sessionStorage.setItem(sessionKey, 'true')
    }

    // Small delay to avoid tracking accidental page loads
    const timer = setTimeout(() => {
      trackView(productId)
      console.log(`👁️ Tracked view for product: ${productId}`)
    }, 1000) // 1 second delay

    return () => clearTimeout(timer)
  }, [productId, trackView, trackOnMount, trackOnce])

  return {
    trackView: (id?: string) => trackView(id || productId || ''),
  }
}
