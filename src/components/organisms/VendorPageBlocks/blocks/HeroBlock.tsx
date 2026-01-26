'use client'

import Image from 'next/image'

interface HeroBlockData {
  image_id?: string
  image_url?: string
  title?: string
  subtitle?: string
  overlay_opacity?: number
  text_position: 'center' | 'left' | 'right'
}

interface HeroBlockProps {
  data: HeroBlockData
}

export const HeroBlock = ({ data }: HeroBlockProps) => {
  const { image_url, title, subtitle, overlay_opacity = 40, text_position = 'center' } = data

  // Don't render empty hero blocks
  const hasContent = image_url || title || subtitle
  if (!hasContent) {
    return null
  }

  const positionClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right'
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg">
      {image_url ? (
        <Image
          src={image_url}
          alt={title || 'Hero image'}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
      )}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlay_opacity / 100 }}
      />
      <div className={`relative z-10 h-full flex flex-col justify-center px-8 md:px-16 ${positionClasses[text_position]}`}>
        {title && (
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-4">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
