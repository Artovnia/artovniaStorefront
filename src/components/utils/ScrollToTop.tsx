"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ScrollToTop component ensures page always starts at top on navigation
 * Fixes issue where product pages open at random scroll positions
 */
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top immediately on route change
    window.scrollTo(0, 0)
    
    // Also scroll after a short delay to handle any layout shifts
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
