"use client"

import Image from "next/image"
import { useState, useCallback } from "react"

/**
 * LqipImage — Low Quality Image Placeholder with blur-up transition
 *
 * Strategy:
 * 1. Immediately renders a tiny q=10 version of the image (~2-5KB) with CSS blur
 * 2. Simultaneously loads the full-quality image via Next.js <Image>
 * 3. When the full image loads, fades out the LQIP layer via CSS transition
 *
 * Cache-aware (solves the "blur on every revisit" problem):
 * - Maintains a **global Set** of src URLs that have successfully loaded.
 * - On mount, if the src is already in the Set → skip blur entirely, show instant.
 * - This survives component unmount/remount (e.g. navigating away and back),
 *   because the Set lives in module scope, not component state.
 * - Only shows the blur-up effect the FIRST time an image is loaded in the session.
 *
 * Architecture:
 * - Layer 1 (bottom): Plain <img> with LQIP URL, blurred, fades out on load
 * - Layer 2 (top): Next.js <Image> with full quality, fades in on load
 * - The plain <img> doesn't generate preload hints or compete with priority
 *
 * Fill mode:
 * - When fill={true}, the wrapper uses position:absolute to fill its parent
 *   (matching Next.js Image fill behavior)
 * - When fill={false}, uses width/height for intrinsic sizing
 */

const LQIP_QUALITY = 10
const LQIP_BLUR_PX = 20
const TRANSITION_MS = 400

// Smallest useful width for LQIP — just enough to show shape/color
const LQIP_WIDTH = 80

/**
 * Global registry of image src URLs that have been fully loaded during this
 * browser session. Persists across component mount/unmount cycles.
 * When a user navigates away and back, the src is already in this Set,
 * so the image renders at full opacity immediately — no blur flash.
 */
const loadedSrcs = new Set<string>()

interface LqipImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  loading?: "eager" | "lazy"
  fetchPriority?: "high" | "low" | "auto"
  sizes?: string
  className?: string
  onLoad?: () => void
  onClick?: () => void
  unoptimized?: boolean
  style?: React.CSSProperties
}

/**
 * Build the /_next/image URL for the LQIP version.
 * Uses the smallest configured width (80px) and q=10.
 */
function buildLqipUrl(src: string): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${LQIP_WIDTH}&q=${LQIP_QUALITY}`
}

export const LqipImage = ({
  src,
  alt,
  fill,
  width,
  height,
  quality = 80,
  priority = false,
  loading,
  fetchPriority,
  sizes,
  className = "",
  onLoad,
  onClick,
  unoptimized = false,
  style,
}: LqipImageProps) => {
  // Check the global registry BEFORE initializing state.
  // If this src was loaded before (even in a previous mount), skip blur entirely.
  const alreadyLoaded = loadedSrcs.has(src)

  // 'instant' = known cached (skip blur), 'pending' = waiting, 'slow' = uncached (blur-up)
  const [loadState, setLoadState] = useState<'pending' | 'instant' | 'slow'>(
    alreadyLoaded ? 'instant' : 'pending'
  )

  const handleFullLoad = useCallback(() => {
    // Register this src as loaded for future mounts
    loadedSrcs.add(src)

    if (loadState === 'instant') {
      // Already marked as instant (from global registry) — just fire callback
      onLoad?.()
      return
    }

    // First time loading this image in this session → show blur-up transition
    setLoadState('slow')
    onLoad?.()
  }, [onLoad, loadState, src])

  const lqipUrl = buildLqipUrl(src)
  const isLoaded = loadState !== 'pending'
  const skipTransition = loadState === 'instant'

  return (
    <div
      className={`overflow-hidden ${fill ? 'absolute inset-0' : 'relative w-full h-full'}`}
      style={{ backgroundColor: '#F4F0EB' }}
      onClick={onClick}
    >
      {/* Layer 1: LQIP placeholder — tiny blurred image */}
      {/* Not rendered at all if image was previously loaded (in global registry) */}
      {/* Uses a plain <img> to avoid Next.js preload hint generation */}
      {!skipTransition && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lqipUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: `blur(${LQIP_BLUR_PX}px)`,
              transform: 'scale(1.1)',
              opacity: isLoaded ? 0 : 1,
              transition: `opacity ${TRANSITION_MS}ms ease-out`,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Layer 2: Full quality image — loads on top */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        quality={quality}
        priority={priority}
        loading={loading}
        fetchPriority={fetchPriority}
        sizes={sizes}
        placeholder="empty"
        onLoad={handleFullLoad}
        unoptimized={unoptimized}
        className={`${className}`}
        style={{
          ...style,
          // Previously loaded: show immediately (opacity 1, no transition)
          // First load pending: hide (opacity 0)
          // First load complete: fade in (opacity 1 with transition)
          opacity: skipTransition ? 1 : (isLoaded ? 1 : 0),
          // Instant (cached): no inline transition — let className transitions (hover:scale) work unimpeded.
          // Pending/slow (first load): transition opacity AND transform together so the
          // blur-up fade-in works AND any className hover transitions (e.g. hover:scale-105) animate smoothly.
          ...(skipTransition
            ? {}
            : { transition: `opacity ${TRANSITION_MS}ms ease-out, transform 500ms ease-out, filter 500ms ease-out` }),
          zIndex: 2,
        }}
      />
    </div>
  )
}

/**
 * Utility: build LQIP URL for external use (e.g., prefetch hook)
 */
export { buildLqipUrl }
export default LqipImage
