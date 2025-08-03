'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

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
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
        case ' ':
          e.preventDefault()
          toggleZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

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

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setIsZoomed(false)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setIsZoomed(false)
  }, [images.length])

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

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header with close button and counter */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full"
          aria-label="Close zoom modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 hover:bg-white/10 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors p-3 hover:bg-white/10 rounded-full"
            aria-label="Next image"
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
            <Image
              src={decodeURIComponent(currentImage.url)}
              alt={`Product image ${currentIndex + 1}`}
              width={1200}
              height={1200}
              quality={100}
              className={`max-w-full max-h-[80vh] w-auto h-auto object-contain transition-transform duration-300 ease-out ${
                isZoomed ? 'scale-200' : 'scale-100'
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
          <span>Click to zoom</span>
          {images.length > 1 && <span>← → Navigate</span>}
          <span>ESC Close</span>
        </div>
      </div>

      {/* Thumbnail strip for multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 p-3 rounded-lg backdrop-blur-sm">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setCurrentIndex(index)
                setIsZoomed(false)
              }}
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
    </div>
  )
}
