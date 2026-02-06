"use client"

import { useCallback, useRef } from "react"

/**
 * Prefetches the detail-page-sized product image on hover/touch.
 *
 * When a user is about to navigate to a product page, this hook preloads
 * the main gallery image at the exact size the detail page will request,
 * so it's already in the browser's HTTP cache when the page renders.
 *
 * URL matching strategy:
 * - Reads viewport width and devicePixelRatio
 * - Evaluates the detail page's sizes attribute: "(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
 * - Snaps to the nearest Next.js width from next.config.ts deviceSizes/imageSizes
 * - Constructs the exact /_next/image URL with matching quality=80
 *
 * WHY `new Image()` instead of `<link rel="prefetch">`:
 * Next.js /_next/image returns `Vary: Accept` header. The browser caches
 * responses keyed by the Accept header. `<link rel="prefetch">` may send
 * a different Accept header than `<img>`, causing a cache MISS when the
 * detail page renders — the prefetched bytes are wasted.
 * `new Image()` sends the EXACT same Accept header as a DOM `<img>` tag,
 * guaranteeing a cache HIT on navigation.
 */

// Combined and sorted sizes from next.config.ts
// imageSizes: [80, 160, 252, 370] + deviceSizes: [640, 828, 1200, 1920]
const ALL_WIDTHS = [80, 160, 252, 370, 640, 828, 1200, 1920]

// Must match the quality used in ProductCarousel's main image
const DETAIL_QUALITY = 80

// LQIP: tiny placeholder image for instant visual feedback
const LQIP_QUALITY = 10
const LQIP_WIDTH = 80

/**
 * Calculates the exact width parameter Next.js will use for the detail page
 * main image, based on current viewport and device pixel ratio.
 */
function getDetailImageWidth(): number {
  const viewportWidth = window.innerWidth
  // Cap DPR at 3 (same as Next.js internal behavior)
  const dpr = Math.min(window.devicePixelRatio || 1, 3)

  // Evaluate the detail page sizes attribute:
  // "(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
  let cssPixels: number
  if (viewportWidth <= 828) {
    cssPixels = viewportWidth // 100vw
  } else {
    cssPixels = viewportWidth * 0.5 // 50vw
  }

  // Browser picks smallest srcset width >= (cssPixels * dpr)
  const targetWidth = Math.ceil(cssPixels * dpr)
  return ALL_WIDTHS.find((w) => w >= targetWidth) || ALL_WIDTHS[ALL_WIDTHS.length - 1]
}

/**
 * Constructs the exact /_next/image URL that matches what Next.js Image component generates.
 */
function buildNextImageUrl(src: string, width: number, quality: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}

export function useProductImagePrefetch() {
  // Track prefetched URLs to avoid duplicate fetches
  const prefetchedRef = useRef<Set<string>>(new Set())
  // Hold references to prefetch Image objects to prevent garbage collection
  // before the fetch completes (browser may cancel fetch if Image is GC'd)
  const prefetchImagesRef = useRef<HTMLImageElement[]>([])

  const prefetchProductImage = useCallback((imageUrl: string | undefined | null) => {
    if (!imageUrl || typeof window === "undefined") return

    // Skip if already prefetched this image
    if (prefetchedRef.current.has(imageUrl)) return
    prefetchedRef.current.add(imageUrl)

    try {
      // 1. Prefetch the LQIP version FIRST — tiny (~2-5KB), loads almost instantly.
      //    When user navigates, the blurred placeholder appears immediately.
      const lqipUrl = buildNextImageUrl(imageUrl, LQIP_WIDTH, LQIP_QUALITY)
      const lqipImg = new window.Image()
      lqipImg.src = lqipUrl
      prefetchImagesRef.current.push(lqipImg)

      const lqipCleanup = () => {
        prefetchImagesRef.current = prefetchImagesRef.current.filter((i) => i !== lqipImg)
      }
      lqipImg.onload = lqipCleanup
      lqipImg.onerror = lqipCleanup
      setTimeout(lqipCleanup, 15000)

      // 2. Prefetch the full-quality image — sends identical Accept headers as <img> tags.
      //    This guarantees the browser HTTP cache serves the same response when
      //    the detail page's <Image priority> component requests the same URL.
      //    The image is decoded in advance, making display even faster.
      const width = getDetailImageWidth()
      const nextImageUrl = buildNextImageUrl(imageUrl, width, DETAIL_QUALITY)
      const img = new window.Image()
      img.src = nextImageUrl
      // Keep reference alive until fetch completes, then release
      prefetchImagesRef.current.push(img)

      // Release the Image object reference after fetch completes (or timeout)
      // The HTTP cache retains the response independently of the Image object
      const cleanup = () => {
        prefetchImagesRef.current = prefetchImagesRef.current.filter((i) => i !== img)
      }
      img.onload = cleanup
      img.onerror = cleanup
      setTimeout(cleanup, 30000)
    } catch {
      // Prefetch is an optimization, never block on failure
    }
  }, [])

  return { prefetchProductImage }
}
