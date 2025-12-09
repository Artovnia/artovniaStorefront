"use client"

import { useEffect } from 'react'
import { preloadOnHover } from '@/lib/utils/preload-resources'
import type { SellerPost } from '@/app/[locale]/(main)/blog/lib/data'

interface DesignerPrefetchProps {
  post: SellerPost
}

export function DesignerPrefetch({ post }: DesignerPrefetchProps) {
  useEffect(() => {
    // Prefetch the specific seller post
    preloadOnHover(`/blog/${post.slug.current}`)
    
    // Prefetch blog page as well since users might navigate there
    preloadOnHover('/blog')
    
    // Prefetch Sanity images on idle
    const prefetchImages = () => {
      if (post.mainImage) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'image'
        link.href = post.mainImage.asset ? `/api/sanity-image?ref=${post.mainImage.asset._ref}` : '/images/hero/Image.jpg'
        document.head.appendChild(link)
      }
      
      if (post.secondaryImage) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'image'
        link.href = post.secondaryImage.asset ? `/api/sanity-image?ref=${post.secondaryImage.asset._ref}` : '/images/hero/Image.jpg'
        document.head.appendChild(link)
      }
    }

    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchImages)
    } else {
      setTimeout(prefetchImages, 500)
    }
  }, [post])

  return null // This component only handles prefetching
}
