'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ReactDOM from 'react-dom'
import Image from 'next/image'
import { useGalleryPrefetch } from '@/hooks/useGalleryPrefetch'
import { MedusaProductImage } from '@/types/product'

// Inline icon components to avoid external dependencies
const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

interface ImageZoomModalProps {
  images: MedusaProductImage[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export const ImageZoomModal = ({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImageZoomModalProps) => {
  // All state hooks must be at the top of the component
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [mounted, setMounted] = useState(false)
  const [isImageTransitioning, setIsImageTransitioning] = useState(false)
  const [transitionFromIndex, setTransitionFromIndex] = useState<number | null>(null)
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev'>('next')
  const transitionTimeoutRef = useRef<number | null>(null)
  const { prefetchGalleryImage } = useGalleryPrefetch()

  const getImageKey = useCallback((image: MedusaProductImage, index: number) => {
    return `${image.id ?? 'no-id'}-${image.url ?? 'no-url'}-${index}`
  }, [])

  const prefetchAtIndex = useCallback((index: number) => {
    if (!images.length) return
    const safeIndex = (index + images.length) % images.length
    const targetUrl = images[safeIndex]?.url
    if (targetUrl) {
      prefetchGalleryImage(targetUrl, 100)
    }
  }, [images, prefetchGalleryImage])

  const transitionToIndex = useCallback((nextIndex: number, direction: 'next' | 'prev') => {
    if (nextIndex === currentIndex) return

    setTransitionDirection(direction)
    setIsImageTransitioning(true)
    setTransitionFromIndex(currentIndex)
    setCurrentIndex(nextIndex)
    setIsZoomed(false)

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsImageTransitioning(false)
      setTransitionFromIndex(null)
      transitionTimeoutRef.current = null
    }, 300)
  }, [currentIndex])

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Mount/unmount effect for portal
  useEffect(() => {
    setMounted(true)
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
      setMounted(false)
    }
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          transitionToIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1, 'prev')
          break
        case 'ArrowRight':
          e.preventDefault()
          transitionToIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1, 'next')
          break
        case ' ':
          e.preventDefault()
          setIsZoomed((prev) => !prev)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, images.length, isOpen, onClose, transitionToIndex])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || images.length <= 1) return

    prefetchAtIndex(currentIndex + 1)
    prefetchAtIndex(currentIndex - 1)
  }, [currentIndex, images.length, isOpen, prefetchAtIndex])

  const goToPrevious = useCallback(() => {
    const nextIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    transitionToIndex(nextIndex, 'prev')
  }, [currentIndex, images.length, transitionToIndex])

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    transitionToIndex(nextIndex, 'next')
  }, [currentIndex, images.length, transitionToIndex])

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed)
  }, [isZoomed])

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isZoomed) {
      setIsZoomed(false)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomPosition({ x, y })
      setIsZoomed(true)
    }
  }, [isZoomed])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }, [isZoomed])

  if (!isOpen || !images.length) return null

  const currentImage = images[currentIndex]
  const outgoingImage = transitionFromIndex !== null ? images[transitionFromIndex] : null
  
  // The modal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm min-h-screen" style={{ isolation: 'isolate' }} role="dialog" aria-modal="true" aria-label="Powiększenie zdjęcia produktu">
      {/* Header with close button and counter */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white text-sm font-medium" aria-live="polite" aria-atomic="true">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full"
          aria-label="Zamknij powiększenie"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            onMouseEnter={() => prefetchAtIndex(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 hover:bg-white/10 rounded-full"
            aria-label="Poprzednie zdjęcie"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          <button
            onClick={goToNext}
            onMouseEnter={() => prefetchAtIndex(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 hover:bg-white/10 rounded-full"
            aria-label="Następne zdjęcie"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main image container */}
      <div className="flex items-center justify-center w-full h-full p-8">
        <div 
          className="relative max-w-full max-h-full cursor-zoom-in"
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
          style={{
            cursor: isZoomed ? 'zoom-out' : 'zoom-in'
          }}
        >
          <div className="relative">
            {outgoingImage && (
              <Image
                key={`zoom-outgoing-${getImageKey(outgoingImage, transitionFromIndex ?? 0)}`}
                src={decodeURIComponent(outgoingImage.url)}
                alt={`Product image ${transitionFromIndex !== null ? transitionFromIndex + 1 : currentIndex + 1}`}
                width={1200}
                height={1200}
                quality={100}
                className={`absolute inset-0 max-w-full max-h-[80vh] w-auto h-auto object-contain pointer-events-none will-change-transform ${
                  transitionDirection === 'next'
                    ? 'animate-[zoom-modal-slide-out-next_300ms_ease-out_forwards]'
                    : 'animate-[zoom-modal-slide-out-prev_300ms_ease-out_forwards]'
                }`}
              />
            )}
            <Image
              key={`zoom-main-${getImageKey(currentImage, currentIndex)}`}
              src={decodeURIComponent(currentImage.url)}
              alt={`Product image ${currentIndex + 1}`}
              width={1200}
              height={1200}
              quality={100}
              className={`max-w-full max-h-[80vh] w-auto h-auto object-contain transition-all duration-300 ease-out ${
                isZoomed ? 'scale-200' : 'scale-100'
              } ${
                isImageTransitioning
                  ? transitionDirection === 'next'
                    ? 'opacity-0  scale-[1.015]'
                    : 'opacity-0  scale-[1.015]'
                  : 'opacity-100 translate-x-0'
              }`}
              style={{
                transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
              }}
              priority
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
        <div className="flex items-center gap-4 text-xs">
          <span>Kliknij aby powiększyć</span>
          {images.length > 1 && <span>← → Nawiguj</span>}
          <span>ESC Zamknij</span>
        </div>
      </div>

      {/* Thumbnail strip for multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 p-3 rounded-lg backdrop-blur-sm">
          {images.map((image, index) => (
            <button
              key={getImageKey(image, index)}
              onClick={() => {
                const direction = index >= currentIndex ? 'next' : 'prev'
                transitionToIndex(index, direction)
              }}
              aria-label={`Miniatura ${index + 1} z ${images.length}`}
              aria-current={currentIndex === index ? "true" : undefined}
              className={`relative w-12 h-12 rounded-sm overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? 'border-white ring-2 ring-white/50'
                  : 'border-white/30 hover:border-white/60'
              }`}
            >
              <Image
                src={decodeURIComponent(image.url)}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes zoom-modal-slide-out-next {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(0) scale(0.985);
          }
        }

        @keyframes zoom-modal-slide-out-prev {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(0) scale(0.985);
          }
        }
      `}</style>
    </div>
  )
  
  // Return portal only on client side
  if (!mounted) return null
  
  return ReactDOM.createPortal(
    modalContent,
    document.body
  )
}
