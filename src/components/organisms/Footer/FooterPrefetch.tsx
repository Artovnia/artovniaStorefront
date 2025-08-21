"use client"

import { useEffect } from 'react'

export function FooterPrefetch() {
  useEffect(() => {
    // Simple prefetch without dynamic imports
    const prefetchFooterLinks = () => {
      if (typeof window === 'undefined') return

      try {
        // Prefetch common footer links
        const urls = ['/blog', '/categories', '/about']
        urls.forEach(url => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = url
          document.head.appendChild(link)
        })
      } catch (error) {
        console.warn('Failed to prefetch footer links:', error)
      }
    }

    // Run prefetch after a longer delay since footer is lower priority
    const timeoutId = setTimeout(prefetchFooterLinks, 3000)
    
    return () => clearTimeout(timeoutId)
  }, [])

  return null // This component only handles prefetching
}
