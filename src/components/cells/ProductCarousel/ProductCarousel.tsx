"use client"

import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { ProductCarouselIndicator } from "@/components/molecules"
import { ImageZoomModal } from "@/components/molecules/ImageZoomModal/ImageZoomModal"
import { useScreenSize } from "@/hooks/useScreenSize"
import { MedusaProductImage } from "@/types/product"
import { useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons"

export const ProductCarousel = ({
  slides = [],
}: {
  slides: MedusaProductImage[]
}) => {
  const screenSize = useScreenSize()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false)
  const [zoomModalInitialIndex, setZoomModalInitialIndex] = useState(0)

  // Navigation functions for arrows
  const goToPrevious = () => {
    if (slides.length <= 1) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImageIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 150)
  }

  const goToNext = () => {
    if (slides.length <= 1) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImageIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 150)
  }

  const handleThumbnailClick = (index: number) => {
    if (index === selectedImageIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImageIndex(index)
      setIsTransitioning(false)
    }, 150)
  }

  const openZoomModal = (index: number) => {
    setZoomModalInitialIndex(index)
    setIsZoomModalOpen(true)
  }

  const closeZoomModal = () => {
    setIsZoomModalOpen(false)
  }

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis:
      screenSize === "xs" || screenSize === "sm" || screenSize === "md"
        ? "x"
        : "y",
    loop: true,
    align: "start",
  })

  return (
    <>
      {/* Mobile/Tablet: Carousel Layout */}
      <div className="lg:hidden w-full overflow-hidden">
        <div className="embla relative w-full">
          <div
            className="embla__viewport overflow-hidden rounded-xs"
            ref={emblaRef}
          >
            <div className="embla__container h-[350px] flex w-full">
              {(slides || []).map((slide) => (
                <div
                  key={slide.id}
                  className="embla__slide min-w-0 h-[350px] cursor-zoom-in"
                  onClick={() => openZoomModal(slides.indexOf(slide))}
                >
                  <Image
                    src={decodeURIComponent(slide.url)}
                    alt="Product image"
                    width={700}
                    height={700}
                    quality={85} // Reduced from 100 for faster loading
                    priority={slides.indexOf(slide) === 0} // Only first image gets priority
                    loading={slides.indexOf(slide) === 0 ? "eager" : "lazy"} // Lazy load non-priority images
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    sizes="(max-width: 768px) 100vw, 700px"
                    className="max-h-[700px] w-full h-auto aspect-square object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            {slides?.length ? (
              <ProductCarouselIndicator slides={slides} embla={emblaApi} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop: Thumbnails on left, main image on right */}
      <div className="hidden lg:block">
        <div className="flex gap-4">
          {/* Left: Thumbnail Column */}
          {slides.length > 1 && (
            <div className="flex flex-col gap-2 w-20 flex-shrink-0">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative w-20 h-20 rounded-xs overflow-hidden border-2 transition-all duration-300 ${
                    selectedImageIndex === index
                      ? "border-[#3B3634] ring-[#3B3634] shadow-md"
                      : ""
                  }`}
                >
                  <Image
                    src={decodeURIComponent(slide.url)}
                    alt={`Product thumbnail ${index + 1}`}
                    fill
                    quality={60} // Lower quality for thumbnails
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Right: Main Image */}
          <div className="flex-1 min-w-0">
            <div className="relative aspect-square w-full max-h-[698px] overflow-hidden rounded-xs group">
              {/* Navigation Arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
                    disabled={isTransitioning}
                  >
                    <ArrowLeftIcon size={20} className="text-amber-700" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-sm"
                    disabled={isTransitioning}
                  >
                    <ArrowRightIcon size={20} className="text-amber-700" />
                  </button>
                </>
              )}
              
              {/* Main Image with Transition */}
              <div 
                className="relative w-full h-full cursor-zoom-in"
                onClick={() => openZoomModal(selectedImageIndex)}
              >
                {slides[selectedImageIndex] && (
                  <Image
                    src={decodeURIComponent(slides[selectedImageIndex].url)}
                    alt="Product image"
                    fill
                    quality={90} // Optimized quality for main image
                    priority={selectedImageIndex === 0} // Only prioritize if it's the first image
                    loading={selectedImageIndex === 0 ? "eager" : "lazy"} // Lazy load non-first images
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className={`object-cover transition-all duration-500 ease-out hover:scale-105 ${
                      isTransitioning 
                        ? "opacity-0 scale-105 blur-sm" 
                        : "opacity-100 scale-100 blur-0"
                    }`}
                    sizes="(max-width: 1024px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                )}
                
                {/* Elegant overlay gradient for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Image counter for multiple images */}
              {slides.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                  {selectedImageIndex + 1} / {slides.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        images={slides}
        initialIndex={zoomModalInitialIndex}
        isOpen={isZoomModalOpen}
        onClose={closeZoomModal}
      />
    </>
  )
}