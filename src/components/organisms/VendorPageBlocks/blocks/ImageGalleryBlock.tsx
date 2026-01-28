'use client'

import Image from 'next/image'
import { useState } from 'react'

interface GalleryImage {
  id: string
  url: string
  alt?: string
  caption?: string
  order?: number
  focal_point?: { x: number; y: number }
}

interface ImageGalleryBlockData {
  images: GalleryImage[]
  layout?: 'grid' | 'masonry' | 'featured' | 'mosaic' | 'magazine'
  columns: 2 | 3 | 4
  gap: 'small' | 'medium' | 'large'
  rounded_edges?: boolean
}

interface ImageGalleryBlockProps {
  data: ImageGalleryBlockData
}

export const ImageGalleryBlock = ({ data }: ImageGalleryBlockProps) => {
  const { images: rawImages = [], columns = 3, gap = 'medium', layout = 'grid', rounded_edges = true } = data
  
  // Sort images by order field
  const images = [...rawImages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  
  // Helper to get focal point style
  const getFocalPointStyle = (focalPoint?: { x: number; y: number }) => {
    if (!focalPoint) return {}
    return { objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }
  }

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

  // Render different layouts based on selection
  const renderLayout = () => {
    switch (layout) {
      case 'masonry':
        return <MasonryLayout images={images} columns={columns} gap={gap} gapClasses={gapClasses} roundedEdges={rounded_edges} getFocalPointStyle={getFocalPointStyle} />
      case 'featured':
        return <FeaturedLayout images={images} gap={gap} gapClasses={gapClasses} roundedEdges={rounded_edges} getFocalPointStyle={getFocalPointStyle} />
      case 'mosaic':
        return <MosaicLayout images={images} gap={gap} gapClasses={gapClasses} roundedEdges={rounded_edges} getFocalPointStyle={getFocalPointStyle} />
      case 'magazine':
        return <MagazineLayout images={images} gap={gap} gapClasses={gapClasses} roundedEdges={rounded_edges} getFocalPointStyle={getFocalPointStyle} />
      case 'grid':
      default:
        return <GridLayout images={images} columns={columns} columnClasses={columnClasses} gapClasses={gapClasses} gap={gap} roundedEdges={rounded_edges} getFocalPointStyle={getFocalPointStyle} />
    }
  }

  return renderLayout()
}

// Grid Layout - Classic uniform grid
const GridLayout = ({ images, columns, columnClasses, gapClasses, gap, roundedEdges, getFocalPointStyle }: any) => (
  <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
    {images.map((image: GalleryImage, index: number) => (
      <div key={image.id || index} className={`relative aspect-square overflow-hidden group cursor-pointer ${roundedEdges ? 'rounded-lg' : ''}`}>
        <Image
          src={image.url}
          alt={image.alt || `Gallery image ${index + 1}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={getFocalPointStyle(image.focal_point)}
        />
        {image.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-sm font-instrument-serif">{image.caption}</p>
          </div>
        )}
      </div>
    ))}
  </div>
)

// Masonry Layout - Pinterest-style with varied heights
const MasonryLayout = ({ images, columns, gap, gapClasses, roundedEdges, getFocalPointStyle }: any) => {
  const columnCount = columns
  const imageColumns: GalleryImage[][] = Array.from({ length: columnCount }, () => [])
  
  // Distribute images across columns
  images.forEach((image: GalleryImage, index: number) => {
    imageColumns[index % columnCount].push(image)
  })

  return (
    <div className={`flex ${gapClasses[gap]}`}>
      {imageColumns.map((columnImages, colIndex) => (
        <div key={colIndex} className={`flex-1 flex flex-col ${gapClasses[gap]}`}>
          {columnImages.map((image, imgIndex) => {
            // Vary aspect ratios for masonry effect
            const aspectRatios = ['aspect-square', 'aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]']
            const aspectRatio = aspectRatios[(colIndex + imgIndex) % aspectRatios.length]
            
            return (
              <div key={image.id || imgIndex} className={`relative ${aspectRatio} overflow-hidden group cursor-pointer ${roundedEdges ? 'rounded-lg' : ''}`}>
                <Image
                  src={image.url}
                  alt={image.alt || `Gallery image ${imgIndex + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={getFocalPointStyle(image.focal_point)}
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-instrument-serif">{image.caption}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// Featured Layout - One large image + grid of smaller images
const FeaturedLayout = ({ images, gap, gapClasses, roundedEdges, getFocalPointStyle }: any) => {
  if (images.length === 0) return null
  
  const [featuredImage, ...restImages] = images
  
  return (
    <div className={`flex flex-col ${gapClasses[gap]}`}>
      {/* Featured large image */}
      <div className={`relative aspect-[16/9] overflow-hidden group cursor-pointer ${roundedEdges ? 'rounded-lg' : ''}`}>
        <Image
          src={featuredImage.url}
          alt={featuredImage.alt || 'Featured image'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="100vw"
          priority
          style={getFocalPointStyle(featuredImage.focal_point)}
        />
        {featuredImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-lg font-instrument-serif">{featuredImage.caption}</p>
          </div>
        )}
      </div>
      
      {/* Grid of smaller images */}
      {restImages.length > 0 && (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${gapClasses[gap]}`}>
          {restImages.map((image: GalleryImage, index: number) => (
            <div key={image.id || index} className={`relative aspect-square overflow-hidden group cursor-pointer ${roundedEdges ? 'rounded-lg' : ''}`}>
              <Image
                src={image.url}
                alt={image.alt || `Gallery image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={getFocalPointStyle(image.focal_point)}
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-instrument-serif">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Mosaic Layout - Varied sizes in a creative pattern
const MosaicLayout = ({ images, gap, gapClasses, roundedEdges, getFocalPointStyle }: any) => {
  // Pattern: large, small, small, medium, small, large, etc.
  const getSizeClass = (index: number) => {
    const pattern = index % 6
    switch (pattern) {
      case 0: return 'col-span-2 row-span-2' // Large
      case 1: return 'col-span-1 row-span-1' // Small
      case 2: return 'col-span-1 row-span-1' // Small
      case 3: return 'col-span-2 row-span-1' // Wide
      case 4: return 'col-span-1 row-span-2' // Tall
      case 5: return 'col-span-1 row-span-1' // Small
      default: return 'col-span-1 row-span-1'
    }
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] ${gapClasses[gap]}`}>
      {images.map((image: GalleryImage, index: number) => (
        <div 
          key={image.id || index} 
          className={`relative overflow-hidden group cursor-pointer ${getSizeClass(index)} ${roundedEdges ? 'rounded-lg' : ''}`}
        >
          <Image
            src={image.url}
            alt={image.alt || `Gallery image ${index + 1}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={getFocalPointStyle(image.focal_point)}
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-instrument-serif">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Magazine Layout - Editorial style with alternating layouts
const MagazineLayout = ({ images, gap, gapClasses, roundedEdges, getFocalPointStyle }: any) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  
  return (
    <div className={`space-y-${gap === 'small' ? '4' : gap === 'large' ? '8' : '6'}`}>
      {images.map((image: GalleryImage, index: number) => {
        const isEven = index % 2 === 0
        const isLarge = index % 3 === 0
        
        return (
          <div 
            key={image.id || index}
            className={`relative overflow-hidden group cursor-pointer border border-[#3B3634] p-1 ${
              isLarge ? 'aspect-[21/9]' : 'aspect-[16/9]'
            } ${roundedEdges ? 'rounded-lg' : ''}`}
            onClick={() => setSelectedImage(selectedImage === index ? null : index)}
          >
            <Image
              src={image.url}
              alt={image.alt || `Gallery image ${index + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              style={getFocalPointStyle(image.focal_point)}
            />
            
            {/* Overlay with caption */}
            <div className={`absolute inset-0 bg-gradient-to-t from-[#3B3634]/90 via-[#3B3634]/50 to-transparent transition-opacity duration-300 ${
              selectedImage === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {image.caption && (
                  <p className="text-white font-instrument-serif text-lg mb-2">{image.caption}</p>
                )}
                <p className="text-white/80 text-sm">Zdjęcie {index + 1} z {images.length}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
