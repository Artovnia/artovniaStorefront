/**
 * CRITICAL PERFORMANCE: Resource preloading utilities
 * Reduces perceived load time by preloading critical resources
 */

/**
 * Preload critical product images
 */
export const preloadProductImages = (imageUrls: string[]) => {
  if (typeof window === 'undefined') return

  // Preload first 2 images only (main + first thumbnail)
  const criticalImages = imageUrls.slice(0, 2)
  
  criticalImages.forEach((url, index) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = decodeURIComponent(url)
    link.type = 'image/webp'
    
    // Higher fetchpriority for the main image
    if (index === 0) {
      link.setAttribute('fetchpriority', 'high')
    }
    
    document.head.appendChild(link)
  })
}

/**
 * Preload critical CSS for faster rendering
 */
export const preloadCriticalCSS = () => {
  if (typeof window === 'undefined') return

  const criticalStyles = [
    '/styles/critical.css', // Add your critical CSS path
  ]

  criticalStyles.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    document.head.appendChild(link)
  })
}

/**
 * Preload next page resources on hover
 */
export const preloadOnHover = (url: string) => {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Setup intelligent preloading for product links
 */
export const setupProductPreloading = () => {
  if (typeof window === 'undefined') return

  // Preload product pages on hover with debouncing
  let preloadTimeout: NodeJS.Timeout

  const handleLinkHover = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const link = target.closest('a')
    
    if (link?.href && link.href.includes('/products/')) {
      clearTimeout(preloadTimeout)
      preloadTimeout = setTimeout(() => {
        preloadOnHover(link.href)
      }, 100) // Small delay to avoid excessive preloading
    }
  }

  document.addEventListener('mouseover', handleLinkHover, { passive: true })
  
  return () => {
    document.removeEventListener('mouseover', handleLinkHover)
    clearTimeout(preloadTimeout)
  }
}

/**
 * Generate optimized blur data URL for images
 */
export const generateBlurDataURL = (width: number = 10, height: number = 10): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  // Create a simple gradient blur placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}
