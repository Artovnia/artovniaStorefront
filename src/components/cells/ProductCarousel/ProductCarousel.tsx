"use client"

import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { ProductCarouselIndicator } from "@/components/molecules"
import { KenBurnsSlide } from "@/components/cells"
import { ImageZoomModal } from "@/components/molecules/ImageZoomModal/ImageZoomModal"
import { useScreenSize } from "@/hooks/useScreenSize"
import { MedusaProductImage } from "@/types/product"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@/icons"

export const ProductCarousel = ({
  slides = [],
  title = "Product image",
}: {
  slides: MedusaProductImage[]
  title?: string
}) => {
  const screenSize = useScreenSize()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false)
  const [zoomModalInitialIndex, setZoomModalInitialIndex] = useState(0)
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [isAnimatedSlideActive, setIsAnimatedSlideActive] = useState(false)
  const [mobileSelectedIndex, setMobileSelectedIndex] = useState(0)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)

  // Check if we should show animated slide (only if we have at least 1 image)
  const showAnimatedSlide = slides.length >= 1
  // Total slides including animated slide
  const totalSlides = showAnimatedSlide ? slides.length + 1 : slides.length
  // Index of the animated slide (last position)
  const animatedSlideIndex = slides.length

  // Determine if we're on mobile/tablet
  const isMobile =
    screenSize === "xs" || screenSize === "sm" || screenSize === "md"

  // Navigation functions for arrows (now includes animated slide)
  const goToPrevious = () => {
    if (totalSlides <= 1) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImageIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
      setIsTransitioning(false)
    }, 150)
  }

  const goToNext = () => {
    if (totalSlides <= 1) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImageIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
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

  // Handle animated slide activation
  const handleAnimatedSlideClick = () => {
    if (selectedImageIndex === animatedSlideIndex) return
    setIsTransitioning(true)
    setTimeout(() => {
      setSelectedImageIndex(animatedSlideIndex)
      setIsAnimatedSlideActive(true)
      setIsTransitioning(false)
    }, 150)
  }

  // Update animated slide active state when index changes
  useEffect(() => {
    setIsAnimatedSlideActive(selectedImageIndex === animatedSlideIndex)
  }, [selectedImageIndex, animatedSlideIndex])

  const openZoomModal = (index: number) => {
    setZoomModalInitialIndex(index)
    setIsZoomModalOpen(true)
  }

  const closeZoomModal = () => {
    setIsZoomModalOpen(false)
  }

  // Thumbnail scroll functions
  const scrollThumbnails = (direction: "up" | "down") => {
    if (!thumbnailContainerRef.current) return

    const container = thumbnailContainerRef.current
    const scrollAmount = 96 // Height of one thumbnail (80px) + gap (16px)
    const newPosition =
      direction === "up"
        ? Math.max(0, thumbnailScrollPosition - scrollAmount)
        : Math.min(
            container.scrollHeight - container.clientHeight,
            thumbnailScrollPosition + scrollAmount
          )

    container.scrollTo({
      top: newPosition,
      behavior: "smooth",
    })

    setThumbnailScrollPosition(newPosition)
  }

  // Update scroll button states
  const updateScrollButtons = () => {
    if (!thumbnailContainerRef.current) return

    const container = thumbnailContainerRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    setCanScrollUp(scrollTop > 0)
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1)
    setThumbnailScrollPosition(scrollTop)
  }

  // Initialize scroll state and listen for scroll events
  useEffect(() => {
    const container = thumbnailContainerRef.current
    if (!container) return

    updateScrollButtons()

    container.addEventListener("scroll", updateScrollButtons)
    return () => container.removeEventListener("scroll", updateScrollButtons)
  }, [slides])

  // Mobile carousel - always use horizontal axis
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "x",
    loop: true,
    align: "start",
  })

  // Track mobile carousel slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const index = emblaApi.selectedScrollSnap()
    setMobileSelectedIndex(index)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    // Set initial index
    onSelect()

    // Subscribe to events
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <>
      {/* Mobile/Tablet: Carousel Layout */}
      <div className="lg:hidden w-full overflow-hidden bg-[#F4F0EB]" style={{ backgroundColor: '#F4F0EB' }}>
        <div className="embla relative w-full">
          <div
            className="embla__viewport overflow-hidden rounded-xs"
            ref={emblaRef}
          >
            <div className="embla__container h-[350px] flex w-full">
              {/* Regular image slides */}
              {(slides || []).map((slide, index) => (
                <div
                  key={slide.id}
                  className="embla__slide flex-[0_0_100%] min-w-0 h-[350px] cursor-zoom-in bg-[#F4F0EB]"
                  style={{ backgroundColor: '#F4F0EB' }}
                  onClick={() => openZoomModal(index)}
                >
                  <Image
                    src={slide.url}
                    alt={title}
                    width={800}
                    height={800}
                    quality={index === 0 ? 80 : 70}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    placeholder={index === 0 ? "blur" : "empty"}
                    blurDataURL={
                      index === 0
                        ? "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        : undefined
                    }
                    sizes="(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
                    className="max-h-[700px] w-full h-auto aspect-square object-cover object-center hover:scale-105 transition-transform duration-300"
                    unoptimized={false}
                  />
                </div>
              ))}

              {/* Animated slide for mobile */}
              {showAnimatedSlide && slides.length > 0 && (
                <div
                  key="animated-slide"
                  className="embla__slide flex-[0_0_100%] min-w-0 h-[350px] relative"
                >
                  <KenBurnsSlide
                    images={slides}
                    alt={`${title} - podgląd animowany`}
                    isActive={true}
                    className="h-full"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Indicator moved outside embla__viewport */}
          {slides?.length ? (
            <ProductCarouselIndicator
              slides={slides}
              selectedIndex={mobileSelectedIndex}
              showAnimatedSlide={showAnimatedSlide}
            />
          ) : null}
        </div>
      </div>

      {/* Desktop: Thumbnails on left, main image on right */}
      <div className="hidden lg:block bg-[#F4F0EB]" style={{ backgroundColor: '#F4F0EB' }}>
        <div className="flex gap-4">
          {/* Left: Thumbnail Column with Scroll */}
          {totalSlides > 1 && (
            <div className="relative flex flex-col w-20 flex-shrink-0 py-4">
              {/* Scroll Up Button */}
              {canScrollUp && (
                <button
                  onClick={() => scrollThumbnails("up")}
                  className="absolute -top-[2px] left-1/2 -translate-x-1/2 z-10 bg-white/95 hover:bg-[#3B3634] rounded-full p-2  transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-[#3B3634]"
                  aria-label="Scroll thumbnails up"
                >
                  <ArrowUpIcon
                    size={16}
                    className="text-[#3B3634] hover:text-white"
                  />
                </button>
              )}

              {/* Scrollable Thumbnail Container */}
              <div
                ref={thumbnailContainerRef}
                className="flex flex-col gap-2 max-h-[624px] overflow-y-auto no-scrollbar scroll-smooth mt-5"
              >
                {/* Regular image thumbnails */}
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative w-20 h-20 rounded-xs overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                      selectedImageIndex === index
                        ? "border-[#3B3634] ring-2 ring-[#3B3634] shadow-md"
                        : "border-gray-200 hover:border-[#3B3634]/50"
                    }`}
                  >
                    <Image
                      src={slide.url}
                      alt={title}
                      fill
                      quality={50}
                      loading="lazy"
                      placeholder="empty"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="80px"
                      unoptimized={false}
                    />
                  </button>
                ))}

                {/* Animated slide thumbnail */}
                {showAnimatedSlide && slides[0] && (
                  <button
                    onClick={handleAnimatedSlideClick}
                    className={`relative w-20 h-20 rounded-xs overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                      selectedImageIndex === animatedSlideIndex
                        ? "border-[#3B3634] ring-2 ring-[#3B3634] shadow-md"
                        : "border-gray-200 hover:border-[#3B3634]/50"
                    }`}
                    title="Podgląd animowany"
                  >
                    <Image
                      src={slides[0].url}
                      alt={`${title} - animacja`}
                      fill
                      quality={50}
                      loading="lazy"
                      placeholder="empty"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="80px"
                      unoptimized={false}
                    />
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-[#3B3634] ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Scroll Down Button */}
              {canScrollDown && (
                <button
                  onClick={() => scrollThumbnails("down")}
                  className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 z-10 bg-white/95 hover:bg-[#3B3634] rounded-full p-2 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-[#3B3634]"
                  aria-label="Scroll thumbnails down"
                >
                  <ArrowDownIcon
                    size={16}
                    className="text-[#3B3634] hover:text-white"
                  />
                </button>
              )}
            </div>
          )}

          {/* Right: Main Image */}
          <div className="flex-1 min-w-0 bg-[#F4F0EB]">
            <div className="relative aspect-square w-full max-h-[698px] overflow-hidden rounded-xs group bg-[#F4F0EB]" style={{ backgroundColor: '#F4F0EB' }}>
              {/* Navigation Arrows */}
              {totalSlides > 1 && (
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

              {/* Main Image with Transition - Regular images */}
              {selectedImageIndex < slides.length &&
                slides[selectedImageIndex] && (
                  <div
                    className="relative w-full h-full cursor-zoom-in bg-[#F4F0EB]"
                    style={{ backgroundColor: '#F4F0EB' }}
                    onClick={() => openZoomModal(selectedImageIndex)}
                  >
                    <Image
                      src={slides[selectedImageIndex].url}
                      alt={title}
                      fill
                      quality={selectedImageIndex === 0 ? 85 : 75}
                      priority={selectedImageIndex === 0}
                      loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                      fetchPriority={selectedImageIndex === 0 ? "high" : "auto"}
                      placeholder={selectedImageIndex === 0 ? "blur" : "empty"}
                      blurDataURL={
                        selectedImageIndex === 0
                          ? "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                          : undefined
                      }
                      className={`object-cover bg-[#F4F0EB] transition-all duration-500 ease-out hover:scale-105 ${
                        isTransitioning
                          ? "opacity-0 scale-105 blur-sm"
                          : "opacity-100 scale-100 blur-0"
                      }`}
                      sizes="(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
                      unoptimized={false}
                    />

                    {/* Elegant overlay gradient for premium feel */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

              {/* Ken Burns Animated Slide */}
              {selectedImageIndex === animatedSlideIndex &&
                showAnimatedSlide &&
                slides.length > 0 && (
                  <KenBurnsSlide
                    images={slides}
                    alt={`${title} - podgląd animowany`}
                    isActive={isAnimatedSlideActive && !isTransitioning}
                    className={`transition-opacity duration-500 ${
                      isTransitioning ? "opacity-0" : "opacity-100"
                    }`}
                  />
                )}

              {/* Image counter for regular images only (Ken Burns has its own counter) */}
              {totalSlides > 1 && selectedImageIndex !== animatedSlideIndex && (
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