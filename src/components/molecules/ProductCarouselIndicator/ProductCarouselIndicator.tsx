"use client"
import Image from "next/image"
import { EmblaCarouselType } from "embla-carousel"
import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { Indicator } from "@/components/atoms"
import useEmblaCarousel from "embla-carousel-react"
import { MedusaProductImage } from "@/types/product"

interface ProductCarouselIndicatorProps {
  slides: MedusaProductImage[]
  selectedIndex: number
  showAnimatedSlide?: boolean
  embla?: EmblaCarouselType
}

export const ProductCarouselIndicator = ({
  slides = [],
  selectedIndex,
  showAnimatedSlide = false,
  embla: parentEmbla,
}: ProductCarouselIndicatorProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: true,
    align: "start",
  })

  const changeSlideHandler = useCallback(
    (index: number) => {
      if (!parentEmbla) return
      parentEmbla.scrollTo(index)

      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [parentEmbla, emblaApi]
  )

  // Calculate total slides for indicator
  const totalSlides = showAnimatedSlide ? slides.length + 1 : slides.length

  return (
    <div className="embla__dots relative lg:absolute lg:top-3 lg:bottom-auto w-full lg:w-auto lg:max-w-[calc(100%-24px)] py-3 lg:py-0 lg:block">
      {/* Mobile indicator - needs explicit width for Indicator to work */}
      <div className="lg:hidden w-full px-4">
        <Indicator
          step={selectedIndex + 1}
          size="large"
          maxStep={totalSlides}
        />
      </div>

      {/* Desktop thumbnails */}
      <div className="embla relative hidden lg:block">
        <div
          className="embla__viewport overflow-hidden rounded-xs"
          ref={emblaRef}
        >
          <div className="embla__container h-[350px] lg:h-[680px] flex lg:block">
            {(slides || []).map((slide, index) => (
              <div
                key={slide.id}
                className="mb-3 rounded-sm cursor-pointer w-16 h-16 bg-primary"
                onClick={() => changeSlideHandler(index)}
              >
                <Image
                  src={decodeURIComponent(slide.url)}
                  alt="Product carousel Indicator"
                  width={64}
                  height={64}
                  className={cn(
                    "rounded-sm border-2 transition-color duration-300 w-16 h-16 object-cover",
                    selectedIndex === index
                      ? "border-primary"
                      : "border-tertiary"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}