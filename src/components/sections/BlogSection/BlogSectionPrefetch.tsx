"use client"

import { useEffect } from 'react'
import type { BlogPost } from '@/app/[locale]/blog/lib/data'

interface BlogSectionPrefetchProps {
  posts: BlogPost[]
}

export function BlogSectionPrefetch({ posts }: BlogSectionPrefetchProps) {
  useEffect(() => {
    // Simple prefetch without external dependencies
    const prefetchPosts = () => {
      if (typeof window === 'undefined') return

      try {
        // Prefetch blog page
        const blogLink = document.createElement('link')
        blogLink.rel = 'prefetch'
        blogLink.href = '/blog'
        document.head.appendChild(blogLink)

        // Prefetch first few post URLs
        posts.slice(0, 3).forEach((post, index) => {
          setTimeout(() => {
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.href = `/blog/${post.slug.current}`
            document.head.appendChild(link)
          }, index * 200)
        })
      } catch (error) {
        console.warn('Failed to prefetch posts:', error)
      }
    }

    // Run prefetch after a delay
    const timeoutId = setTimeout(prefetchPosts, 1500)
    
    return () => clearTimeout(timeoutId)
  }, [posts])

  return null // This component only handles prefetching
}
