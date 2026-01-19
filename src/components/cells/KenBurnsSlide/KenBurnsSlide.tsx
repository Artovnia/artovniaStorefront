'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface KenBurnsSlideProps {
  images: Array<{ url: string; id: string }>
  alt: string
  isActive: boolean
  onImageChange?: (index: number) => void
  className?: string
}

const ANIMATION_PATTERNS = [
  `0% { transform: scale(1) translate(0, 0); }
   50% { transform: scale(1.2) translate(-3%, -1%); }
   100% { transform: scale(1.1) translate(1%, 0); }`,
  `0% { transform: scale(1.15) translate(3%, 1%); }
   50% { transform: scale(1.25) translate(-1%, 0%); }
   100% { transform: scale(1.1) translate(0, -1%); }`,
  `0% { transform: scale(1) translate(0, 0); }
   50% { transform: scale(1.2) translate(-2%, -1%); }
   100% { transform: scale(1.15) translate(1%, 1%); }`,
  `0% { transform: scale(1.25) translate(-1%, 1%); }
   50% { transform: scale(1.15) translate(2%, -1%); }
   100% { transform: scale(1.05) translate(0, 0); }`,
]

const SLIDE_DURATION = 10000
const TRANSITION_DURATION = 1500 // Slightly longer for smoother crossfade

export const KenBurnsSlide = ({
  images,
  alt,
  isActive,
  onImageChange,
  className = '',
}: KenBurnsSlideProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const goToNextImage = useCallback(() => {
    if (images.length <= 1) return

    const nextIndex = (currentIndex + 1) % images.length
    setPreviousIndex(currentIndex)
    setCurrentIndex(nextIndex)
    onImageChange?.(nextIndex)

    setTimeout(() => {
      setPreviousIndex(null)
    }, TRANSITION_DURATION)
  }, [currentIndex, images.length, onImageChange])

  useEffect(() => {
    if (isActive && images.length > 1) {
      // Start transition BEFORE the animation ends
      // This creates overlap so you never see the animation reset
      const intervalTime = SLIDE_DURATION - TRANSITION_DURATION
      intervalRef.current = setInterval(goToNextImage, intervalTime)
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, goToNextImage, images.length])

  useEffect(() => {
    if (!isActive) {
      setCurrentIndex(0)
      setPreviousIndex(null)
    }
  }, [isActive])

  if (!images.length) return null

  const generateKeyframes = () => {
    return ANIMATION_PATTERNS.map(
      (pattern, i) => `
      @keyframes kenBurns_${i} {
        ${pattern}
      }
    `
    ).join('\n')
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      ref={containerRef}
      style={{ backgroundColor: '#F4F0EB' }}
    >
      <style jsx>{`
        ${generateKeyframes()}

        .ken-burns-image {
          will-change: transform, opacity;
        }
      `}</style>

      {images.map((image, index) => {
        const isCurrent = index === currentIndex
        const isPrevious = index === previousIndex
        const isVisible = isCurrent || isPrevious
        const patternIndex = index % ANIMATION_PATTERNS.length

        const opacity = isCurrent ? 1 : 0

        return (
          <div
            key={image.id}
            className="absolute inset-0 ken-burns-image"
            style={{
              opacity,
              transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
              zIndex: isCurrent ? 2 : isPrevious ? 1 : 0,
              animation:
                isVisible && isActive
                  ? `kenBurns_${patternIndex} ${SLIDE_DURATION}ms ease-in-out forwards`
                  : 'none',
              visibility: isVisible ? 'visible' : 'hidden',
            }}
          >
            <Image
              src={image.url}
              alt={`${alt} - ${index + 1}`}
              fill
              quality={85}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        )
      })}

      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.12) 100%)',
        }}
      />

      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span>
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  )
}

export default KenBurnsSlide