'use client'

import Image from 'next/image'

interface ImageTextBlockData {
  image_id?: string
  image_url?: string
  image_position: 'left' | 'right'
  title?: string
  content: string
  image_ratio: '1:1' | '4:3' | '16:9'
}

interface ImageTextBlockProps {
  data: ImageTextBlockData
}

export const ImageTextBlock = ({ data }: ImageTextBlockProps) => {
  const { image_url, image_position = 'left', title, content, image_ratio = '1:1' } = data

  // Don't render empty image-text blocks
  const hasContent = image_url || title || (content && content.trim() !== '')
  if (!hasContent) {
    return null
  }

  const ratioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video'
  }

  const imageElement = (
    <div className={`relative ${ratioClasses[image_ratio]} overflow-hidden rounded-lg`}>
      {image_url && (
        <Image
          src={image_url}
          alt={title || 'Section image'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      )}
    </div>
  )

  const textElement = (
    <div className="flex flex-col justify-center">
      {title && (
        <h2 className="text-2xl md:text-3xl font-instrument-serif mb-4">{title}</h2>
      )}
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {image_position === 'left' ? (
        <>
          {imageElement}
          {textElement}
        </>
      ) : (
        <>
          {textElement}
          {imageElement}
        </>
      )}
    </div>
  )
}
