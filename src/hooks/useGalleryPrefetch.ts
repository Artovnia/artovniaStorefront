"use client"

import { useCallback, useRef } from "react"

/**
 * Prefetches gallery images at main-image display size.
 *
 * Used by ProductCarousel to eliminate the flash/delay when:
 * 1. User clicks a thumbnail → the main image is already in browser cache
 * 2. User hovers the KenBurns thumbnail → ALL images are prefetched
 * 3. After selecting any image → adjacent images are prefetched
 * 4. KenBurnsSlide internally → next image prefetched before crossfade
 *
 * Uses `new Image()` (not `<link rel="prefetch">`) for the same reason
 * as useProductImagePrefetch: Next.js /_next/image returns `Vary: Accept`,
 * and `new Image()` sends the exact same Accept header as a DOM `<img>`,
 * guaranteeing a cache HIT when the actual component renders.
 */

// Combined and sorted sizes from next.config.ts
// imageSizes: [80, 160, 252, 370] + deviceSizes: [640, 828, 1200, 1920]
const ALL_WIDTHS = [80, 160, 252, 370, 640, 828, 1200, 1920]

// Must match the quality used in ProductCarousel's main LqipImage (quality={80})
const MAIN_IMAGE_QUALITY = 80

// KenBurns images use quality={70}
const KENBURNS_QUALITY = 70

// LQIP: tiny placeholder for instant visual feedback
const LQIP_QUALITY = 10
const LQIP_WIDTH = 80

/**
 * Calculates the width parameter Next.js will use for the gallery main image,
 * based on current viewport and device pixel ratio.
 *
 * The main image uses sizes="(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
 * and fill mode, so the browser picks the smallest srcset width >= (cssPixels * dpr).
 */
function getGalleryImageWidth(): number {
  if (typeof window === "undefined") return 828

  const viewportWidth = window.innerWidth
  const dpr = Math.min(window.devicePixelRatio || 1, 3)

  let cssPixels: number
  if (viewportWidth <= 828) {
    cssPixels = viewportWidth // 100vw
  } else {
    cssPixels = viewportWidth * 0.5 // 50vw
  }

  const targetWidth = Math.ceil(cssPixels * dpr)
  return ALL_WIDTHS.find((w) => w >= targetWidth) || ALL_WIDTHS[ALL_WIDTHS.length - 1]
}

function buildNextImageUrl(src: string, width: number, quality: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}

export function useGalleryPrefetch() {
  // Track prefetched URLs to avoid duplicate fetches
  const prefetchedRef = useRef<Set<string>>(new Set())
  // Hold references to prevent GC before fetch completes
  const imagesRef = useRef<HTMLImageElement[]>([])

  /**
   * Prefetch a single image at gallery main-image size.
   * Fetches both the LQIP (tiny, instant) and full-quality versions.
   */
  const prefetchImage = useCallback((imageUrl: string, quality = MAIN_IMAGE_QUALITY) => {
    if (!imageUrl || typeof window === "undefined") return

    const cacheKey = `${imageUrl}:${quality}`
    if (prefetchedRef.current.has(cacheKey)) return
    prefetchedRef.current.add(cacheKey)

    try {
      // 1. LQIP version — tiny (~2-5KB), loads almost instantly
      const lqipUrl = buildNextImageUrl(imageUrl, LQIP_WIDTH, LQIP_QUALITY)
      const lqipImg = new window.Image()
      lqipImg.src = lqipUrl
      imagesRef.current.push(lqipImg)

      const lqipCleanup = () => {
        imagesRef.current = imagesRef.current.filter((i) => i !== lqipImg)
      }
      lqipImg.onload = lqipCleanup
      lqipImg.onerror = lqipCleanup
      setTimeout(lqipCleanup, 15000)

      // 2. Full-quality version at the exact size the gallery will request
      const width = getGalleryImageWidth()
      const fullUrl = buildNextImageUrl(imageUrl, width, quality)
      const fullImg = new window.Image()
      fullImg.src = fullUrl
      imagesRef.current.push(fullImg)

      const fullCleanup = () => {
        imagesRef.current = imagesRef.current.filter((i) => i !== fullImg)
      }
      fullImg.onload = fullCleanup
      fullImg.onerror = fullCleanup
      setTimeout(fullCleanup, 30000)
    } catch {
      // Prefetch is an optimization, never block on failure
    }
  }, [])

  /**
   * Prefetch a gallery image at main-image quality (80).
   */
  const prefetchGalleryImage = useCallback((imageUrl: string) => {
    prefetchImage(imageUrl, MAIN_IMAGE_QUALITY)
  }, [prefetchImage])

  /**
   * Prefetch a gallery image at KenBurns quality (70).
   */
  const prefetchKenBurnsImage = useCallback((imageUrl: string) => {
    prefetchImage(imageUrl, KENBURNS_QUALITY)
  }, [prefetchImage])

  /**
   * Prefetch ALL images for KenBurns (called on KenBurns thumbnail hover).
   */
  const prefetchAllForKenBurns = useCallback((imageUrls: string[]) => {
    imageUrls.forEach((url) => prefetchKenBurnsImage(url))
  }, [prefetchKenBurnsImage])

  /**
   * Prefetch adjacent images (next and previous) relative to the current index.
   * Called after the user selects any image to prepare neighbors.
   */
  const prefetchAdjacent = useCallback((
    imageUrls: string[],
    currentIndex: number,
  ) => {
    if (imageUrls.length <= 1) return

    const nextIndex = (currentIndex + 1) % imageUrls.length
    const prevIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length

    prefetchGalleryImage(imageUrls[nextIndex])
    if (prevIndex !== nextIndex) {
      prefetchGalleryImage(imageUrls[prevIndex])
    }
  }, [prefetchGalleryImage])

  return {
    prefetchGalleryImage,
    prefetchKenBurnsImage,
    prefetchAllForKenBurns,
    prefetchAdjacent,
  }
}
