"use client"

import Image from "next/image"
import { useState, useEffect, useCallback } from "react"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  prefetch?: boolean
}

// Client-side image prefetching utility
const prefetchImage = (src: string) => {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = src
  link.as = 'image'
  document.head.appendChild(link)
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🖼️ Prefetched image: ${src}`)
  }
}

// Performance measurement utility for client-side
const measureImageLoad = (alt: string, startTime: number) => {
  if (process.env.NODE_ENV === 'production') return 0
  
  const duration = performance.now() - startTime
  if (duration > 100) { // Only log slow loads
    console.warn(`⚠️ Slow image load: ${alt} took ${duration.toFixed(0)}ms`)
  }
  return duration
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  prefetch = false,
  ...props
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const [startTime] = useState(() => performance.now())

  // Prefetch image if requested
  useEffect(() => {
    if (prefetch && !priority && typeof window !== 'undefined') {
      prefetchImage(src)
    }
  }, [src, prefetch, priority])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    
    // Measure load time
    const duration = measureImageLoad(alt, startTime)
    setLoadTime(duration)
    
    onLoad?.()
  }, [alt, startTime, onLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    console.warn(`🖼️ Image failed to load: ${src}`)
    onError?.()
  }, [src, onError])

  // Generate optimized sizes if not provided
  const optimizedSizes = sizes || (
    width && width <= 64 ? "64px" :
    width && width <= 384 ? "(max-width: 768px) 100vw, 384px" :
    width && width <= 750 ? "(max-width: 768px) 100vw, 750px" :
    "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  )

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image unavailable</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        sizes={optimizedSizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Loading indicator for development */}
      {process.env.NODE_ENV === 'development' && isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
      )}
      
      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && loadTime !== null && loadTime > 100 && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {loadTime.toFixed(0)}ms
        </div>
      )}
    </div>
  )
}

// Client-side image prefetching hook with batching
export const usePrefetchImages = (urls: string[]) => {
  useEffect(() => {
    const prefetchBatch = async () => {
      if (typeof window === 'undefined' || urls.length === 0) return
      
      // Prefetch in small batches to avoid overwhelming the browser
      const batchSize = 3
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize)
        
        // Prefetch all images in the batch
        batch.forEach(url => {
          prefetchImage(url)
        })
        
        // Small delay between batches
        if (i + batchSize < urls.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }

    prefetchBatch()
  }, [urls])
}

// Batch image preloading utility
export const batchPrefetchImages = (imageUrls: string[], batchSize: number = 3) => {
  if (typeof window === 'undefined') return Promise.resolve()
  
  return new Promise<void>((resolve) => {
    let processed = 0
    const total = imageUrls.length
    
    if (total === 0) {
      resolve()
      return
    }
    
    const processBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + batchSize, total)
      
      for (let i = startIndex; i < endIndex; i++) {
        prefetchImage(imageUrls[i])
      }
      
      processed = endIndex
      
      if (processed >= total) {
        resolve()
      } else {
        // Continue with next batch after a short delay
        setTimeout(() => processBatch(processed), 50)
      }
    }
    
    processBatch(0)
  })
}