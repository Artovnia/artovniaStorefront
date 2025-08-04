"use client"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

/**
 * Simple hook for hover-based prefetching
 * Prefetches route on hover for instant navigation
 */
export const useHoverPrefetch = () => {
  const router = useRouter()

  const prefetchOnHover = useCallback((href: string) => {
    return {
      onMouseEnter: () => {
        try {
          console.log('🚀 Prefetching route on hover:', href)
          // Use Next.js router prefetch for route prefetching
          router.prefetch(href)
          console.log('✅ Prefetch initiated for:', href)
        } catch (error) {
          // Log errors for debugging
          console.error('❌ Prefetch failed for:', href, error)
        }
      }
    }
  }, [router])

  return { prefetchOnHover }
}
