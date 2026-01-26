'use client'

import Image from 'next/image'

interface GalleryImage {
  id: string
  url: string
  alt?: string
  caption?: string
}

interface ImageGalleryBlockData {
  images: GalleryImage[]
  columns: 2 | 3 | 4
  gap: 'small' | 'medium' | 'large'
}

interface ImageGalleryBlockProps {
  data: ImageGalleryBlockData
}

export const ImageGalleryBlock = ({ data }: ImageGalleryBlockProps) => {
  const { images = [], columns = 3, gap = 'medium' } = data

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }

  const gapClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  }

  if (!images.length) {
    return null
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
      {images.map((image, index) => (
        <div key={image.id || index} className="relative aspect-square overflow-hidden rounded-lg group">
          <Image
            src={image.url}
            alt={image.alt || `Gallery image ${index + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
