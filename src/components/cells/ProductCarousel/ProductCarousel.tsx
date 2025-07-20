"use client"

import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import { ProductCarouselIndicator } from "@/components/molecules"
import { useScreenSize } from "@/hooks/useScreenSize"

// Define the correct image type based on Medusa's structure
type ProductImage = {
  id: string
  url: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  metadata?: Record<string, any> | null
}

export const ProductCarousel = ({
  slides = [],
}: {
  slides: ProductImage[]
}) => {
  const screenSize = useScreenSize()

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis:
      screenSize === "xs" || screenSize === "sm" || screenSize === "md"
        ? "x"
        : "y",
    loop: true,
    align: "start",
  })

  return (
    <div className="embla relative">
      <div
        className="embla__viewport overflow-hidden rounded-xs"
        ref={emblaRef}
      >
        <div className="embla__container h-[350px] lg:h-fit max-h-[698px] flex lg:block">
          {(slides || []).map((slide) => (
            <div
              key={slide.id}
              className="embla__slide min-w-0 h-[350px] lg:h-fit"
            >
              <Image
                src={decodeURIComponent(slide.url)}
                alt="Product image"
                width={700}
                height={700}
                quality={100}
                className="max-h-[700px] w-full h-auto aspect-square object-cover object-center object-center"
              />
            </div>
          ))}
        </div>
        {slides?.length ? (
          <ProductCarouselIndicator slides={slides} embla={emblaApi} />
        ) : null}
      </div>
    </div>
  )
}