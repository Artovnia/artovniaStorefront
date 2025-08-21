"use client"

import { useEffect } from 'react'

interface BlogPrefetchProviderProps {
  children: React.ReactNode
}

export function BlogPrefetchProvider({ children }: BlogPrefetchProviderProps) {
  useEffect(() => {
    // Simple prefetch logic without dynamic imports
    const prefetchBlogPages = () => {
      if (typeof window === 'undefined') return

      try {
        // Prefetch common blog URLs
        const urls = ['/blog', '/blog/category']
        urls.forEach(url => {
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = url
          document.head.appendChild(link)
        })
      } catch (error) {
        console.warn('Failed to prefetch blog pages:', error)
      }
    }

    // Run prefetch after a delay
    const timeoutId = setTimeout(prefetchBlogPages, 1000)
    
    // Cleanup
    return () => clearTimeout(timeoutId)
  }, [])

  return <>{children}</>
}
