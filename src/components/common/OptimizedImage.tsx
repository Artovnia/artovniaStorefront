"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { imageDeduplicator, performanceMonitor } from "@/lib/utils/performance"

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

  // Prefetch image if requested
  useEffect(() => {
    if (prefetch && !priority) {
      performanceMonitor.prefetch.image(src)
    }
  }, [src, prefetch, priority])

  // Track image loading performance
  useEffect(() => {
    if (!isLoading && !hasError) {
      const measureRender = performanceMonitor.measureRender(`Image-${alt}`)
      const duration = measureRender()
      setLoadTime(duration)
    }
  }, [isLoading, hasError, alt])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    console.warn(`🖼️ Image failed to load: ${src}`)
    onError?.()
  }

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
      {process.env.NODE_ENV === 'development' && loadTime !== null && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {loadTime.toFixed(0)}ms
        </div>
      )}
    </div>
  )
}

// Hook for batch image prefetching
export const usePrefetchImages = (urls: string[]) => {
  useEffect(() => {
    const prefetchBatch = async () => {
      // Prefetch in batches to avoid overwhelming the browser
      const batchSize = 3
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize)
        await Promise.all(
          batch.map(url => 
            imageDeduplicator.dedupe(
              `prefetch-${url}`,
              async () => {
                performanceMonitor.prefetch.image(url)
                return Promise.resolve()
              },
              { useCache: true }
            )
          )
        )
        
        // Small delay between batches
        if (i + batchSize < urls.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }

    if (urls.length > 0) {
      prefetchBatch()
    }
  }, [urls])
}
