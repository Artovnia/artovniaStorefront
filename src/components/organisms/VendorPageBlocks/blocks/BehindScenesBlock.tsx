'use client'

import Image from 'next/image'
import { useState } from 'react'

interface MediaItem {
  id: string
  url: string
  type: 'image' | 'video'
  caption?: string
}

interface BehindScenesBlockData {
  title?: string
  title_alignment?: 'left' | 'center' | 'right'
  title_italic?: boolean
  description?: string
  layout?: 'masonry' | 'grid' | 'carousel'
  media: MediaItem[]
  rounded_edges?: boolean
}

interface BehindScenesBlockProps {
  data: BehindScenesBlockData
}

export const BehindScenesBlock = ({ data }: BehindScenesBlockProps) => {
  const { 
    title, 
    title_alignment = 'center',
    title_italic = false,
    description, 
    media = [], 
    layout = 'masonry', 
    rounded_edges = true 
  } = data

  const titleAlignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const titleClasses = `text-xl md:text-2xl font-instrument-serif ${titleAlignmentClasses[title_alignment]} ${title_italic ? 'italic' : ''}`
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  if (!media.length) {
    return null
  }

  const renderMedia = (item: MediaItem, index: number, className: string = '') => {
    if (item.type === 'video') {
      return (
        <div 
          key={item.id || index}
          className={`relative cursor-pointer group ${className}`}
          onClick={() => setSelectedMedia(item)}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors z-10">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <video 
            src={item.url} 
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          {item.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 z-10">
              <p className="text-white text-sm">{item.caption}</p>
            </div>
          )}
        </div>
      )
    }

    return (
      <div 
        key={item.id || index}
        className={`relative cursor-pointer group overflow-hidden ${className}`}
        onClick={() => setSelectedMedia(item)}
      >
        <Image
          src={item.url}
          alt={item.caption || `Behind the scenes ${index + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {item.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm">{item.caption}</p>
          </div>
        )}
      </div>
    )
  }

  const renderMasonry = () => (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {media.map((item, index) => (
        <div key={item.id || index} className="break-inside-avoid">
          <div className={`relative rounded-lg overflow-hidden ${
            index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
          }`}>
            {renderMedia(item, index)}
          </div>
        </div>
      ))}
    </div>
  )

  const renderGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {media.map((item, index) => (
        <div key={item.id || index} className="relative aspect-square rounded-lg overflow-hidden">
          {renderMedia(item, index)}
        </div>
      ))}
    </div>
  )

  const renderCarousel = () => (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
      {media.map((item, index) => (
        <div 
          key={item.id || index} 
          className="relative flex-shrink-0 w-72 md:w-96 aspect-[4/3] rounded-lg overflow-hidden snap-center"
        >
          {renderMedia(item, index)}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      {(title || description) && (
        <div className="text-center max-w-2xl mx-auto">
          {title && (
            <h2 className={titleClasses}>{title}</h2>
          )}
          {description && (
            <p className="text-[#3B3634]/70">{description}</p>
          )}
        </div>
      )}
      
      {layout === 'masonry' && renderMasonry()}
      {layout === 'grid' && renderGrid()}
      {layout === 'carousel' && renderCarousel()}

      {/* Lightbox */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl hover:text-white/70"
            onClick={() => setSelectedMedia(null)}
          >
            ×
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {selectedMedia.type === 'video' ? (
              <video 
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.caption || 'Behind the scenes'}
                width={1200}
                height={800}
                className="w-full h-full object-contain"
              />
            )}
            {selectedMedia.caption && (
              <p className="text-white text-center mt-4">{selectedMedia.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
