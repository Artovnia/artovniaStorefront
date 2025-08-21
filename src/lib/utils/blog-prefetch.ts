/**
 * CRITICAL PERFORMANCE: Blog-specific prefetching utilities
 * Intelligent prefetching for blog posts and pages to reduce perceived load time
 */

import { preloadOnHover } from './preload-resources'

// Prefetch blog posts on hover with intelligent debouncing
export const setupBlogPrefetching = () => {
  if (typeof window === 'undefined') return

  let prefetchTimeout: NodeJS.Timeout
  const prefetchedUrls = new Set<string>()

  const handleBlogLinkHover = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const link = target.closest('a')
    
    if (link?.href && (link.href.includes('/blog/') || link.href.includes('/blog'))) {
      // Avoid duplicate prefetches
      if (prefetchedUrls.has(link.href)) return
      
      clearTimeout(prefetchTimeout)
      prefetchTimeout = setTimeout(() => {
        prefetchedUrls.add(link.href)
        preloadOnHover(link.href)
        
        // Also prefetch the blog page if hovering on a specific post
        if (link.href.includes('/blog/') && !link.href.endsWith('/blog')) {
          const blogPageUrl = link.href.split('/blog/')[0] + '/blog'
          if (!prefetchedUrls.has(blogPageUrl)) {
            prefetchedUrls.add(blogPageUrl)
            preloadOnHover(blogPageUrl)
          }
        }
      }, 150) // Reduced delay for faster prefetching
    }
  }

  // Use passive listeners for better performance
  document.addEventListener('mouseover', handleBlogLinkHover, { passive: true })
  
  return () => {
    document.removeEventListener('mouseover', handleBlogLinkHover)
    clearTimeout(prefetchTimeout)
  }
}

// Prefetch blog images on intersection (viewport-based)
export const setupBlogImagePrefetching = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src || img.src
          
          if (src && src.includes('cdn.sanity.io')) {
            // Preload optimized versions
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.as = 'image'
            link.href = src
            document.head.appendChild(link)
            
            // Stop observing this image
            imageObserver.unobserve(img)
          }
        }
      })
    },
    {
      rootMargin: '50px', // Start prefetching 50px before image enters viewport
      threshold: 0.1
    }
  )

  // Observe all blog images
  const blogImages = document.querySelectorAll('img[src*="cdn.sanity.io"], img[data-src*="cdn.sanity.io"]')
  blogImages.forEach((img) => imageObserver.observe(img))

  return () => {
    imageObserver.disconnect()
  }
}

// Prefetch related blog posts based on categories/tags
export const prefetchRelatedPosts = async (currentPostSlug: string, categories?: string[], tags?: string[]) => {
  if (typeof window === 'undefined') return

  try {
    // Simple prefetch of common blog URLs instead of dynamic imports
    const commonUrls = ['/blog', '/blog/category/art', '/blog/category/design']
    commonUrls.forEach(url => preloadOnHover(url))
    
  } catch (error) {
    console.warn('Failed to prefetch related posts:', error)
  }
}

// Prefetch blog data on idle
export const prefetchBlogDataOnIdle = () => {
  if (typeof window === 'undefined') return

  const prefetchData = () => {
    try {
      // Simple URL prefetching without dynamic imports
      const blogUrls = ['/blog', '/blog/api/posts', '/blog/api/featured']
      blogUrls.forEach(url => preloadOnHover(url))
    } catch (error) {
      console.warn('Failed to prefetch blog data:', error)
    }
  }

  // Start prefetching after initial page load
  if (document.readyState === 'complete') {
    prefetchData()
  } else {
    window.addEventListener('load', prefetchData, { once: true })
  }
}

// Comprehensive blog prefetching setup
export const initializeBlogPrefetching = () => {
  if (typeof window === 'undefined') return

  const cleanupFunctions: (() => void)[] = []

  // Setup different prefetching strategies
  const blogCleanup = setupBlogPrefetching()
  const imageCleanup = setupBlogImagePrefetching()
  
  if (blogCleanup) cleanupFunctions.push(blogCleanup)
  if (imageCleanup) cleanupFunctions.push(imageCleanup)
  
  // Initialize idle prefetching
  prefetchBlogDataOnIdle()

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => {
      if (cleanup) cleanup()
    })
  }
}
