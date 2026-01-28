'use client'

import Image from 'next/image'

interface HeroBlockData {
  image_id?: string
  image_url?: string
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  subtitle?: string
  overlay_opacity?: number
  text_position: 'center' | 'left' | 'right'
  rounded_edges?: boolean
}

interface HeroBlockProps {
  data: HeroBlockData
}

export const HeroBlock = ({ data }: HeroBlockProps) => {
  const {
    image_url,
    title,
    title_alignment = 'center',
    title_italic = false,
    subtitle,
    overlay_opacity = 40,
    text_position = 'center',
    rounded_edges = true
  } = data

  const positionClasses = {
    left: 'items-start',
    center: 'items-center',
    right: 'items-end'
  }

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const titleClasses = `text-3xl md:text-5xl font-instrument-serif mb-4 ${titleAlignmentClasses[title_alignment]} ${title_italic ? 'italic' : ''}`
  const subtitleClasses = `text-lg md:text-xl text-white/90 max-w-2xl ${titleAlignmentClasses[title_alignment]}`

  // Don't render empty hero blocks
  const hasContent = image_url || title || subtitle
  if (!hasContent) {
    return null
  }

  return (
    <div className={`relative w-full h-[400px] md:h-[500px] overflow-hidden ${rounded_edges ? 'rounded-lg' : ''}`}>
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
      <div className={`relative z-10 h-full text-white flex flex-col justify-center px-8 md:px-16 ${positionClasses[text_position]}`}>
        {title && (
          <h1 className={titleClasses}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className={subtitleClasses}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
