import { ProductCarousel } from '@/components/cells';
import { MedusaProductImage } from '@/types/product';
import Image from 'next/image';

/**
 * GalleryCarousel - Optimized for LCP (Largest Contentful Paint)
 * 
 * Strategy:
 * 1. Server-render the first image in an <img> tag that displays IMMEDIATELY
 *    (this is rendered in the initial HTML, no JS needed)
 * 2. The client carousel renders on top with opacity-0 initially
 * 3. Once hydrated, carousel fades in and takes over
 * 
 * The key insight: Next.js Image with priority in a Server Component
 * renders as a real <img> tag in the HTML, which browsers display immediately.
 * But in a Client Component, it only renders after JS hydration.
 */

export const GalleryCarousel = ({
  images,
  title = "Product image",
}: {
  images: MedusaProductImage[];
  title?: string;
}) => {
  const firstImage = images?.[0];
  
  return (
    <div className='w-full max-w-full p-1 rounded-sm overflow-hidden bg-[#F4F0EB]'>
      {/* 
        ✅ LCP OPTIMIZATION: Server-rendered first image layer
        This renders as actual <img> in HTML - displays BEFORE JS loads
        Position: absolute, behind the carousel
      */}
      {firstImage && (
        <div className="relative">
          {/* Desktop: Server-rendered first image (shows immediately) */}
          <div className="hidden lg:block">
            <div className="flex gap-4">
              {/* Thumbnail column - server rendered */}
              {images.length > 1 && (
                <div className="relative flex flex-col w-20 flex-shrink-0 py-4">
                  <div className="flex flex-col gap-2 max-h-[624px] overflow-hidden mt-5">
                    {images.slice(0, 6).map((img, idx) => (
                      <div 
                        key={img.id} 
                        className={`relative w-20 h-20 rounded-xs overflow-hidden border-2 flex-shrink-0 ${
                          idx === 0 ? 'border-[#3B3634] ring-2 ring-[#3B3634]' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={title}
                          fill
                          quality={50}
                          loading={idx === 0 ? "eager" : "lazy"}
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Main image - server rendered, priority for LCP */}
              <div className="flex-1 min-w-0 bg-[#F4F0EB]">
                <div className="relative aspect-square w-full max-h-[698px] overflow-hidden rounded-xs ">
                  <Image
                    src={firstImage.url}
                    alt={title}
                    fill
                    quality={85}
                    priority
                    loading="eager"
                    fetchPriority="high"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    sizes="(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile: Server-rendered first image (shows immediately) */}
          <div className="lg:hidden w-full overflow-hidden">
            <div className="relative h-[350px] rounded-xs overflow-hidden bg-[#F4F0EB]">
              <Image
                src={firstImage.url}
                alt={title}
                fill
                quality={80}
                priority
                loading="eager"
                fetchPriority="high"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                sizes="(max-width: 640px) 100vw, (max-width: 828px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
            {/* Dot indicators placeholder */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {images.slice(0, Math.min(images.length + 1, 6)).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#3B3634]' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* 
            ✅ Interactive carousel layer - renders on top after hydration
            Position: absolute, covers the server-rendered image
            The carousel handles its own visibility/transition
            bg-[#F4F0EB] ensures no black flash during hydration
          */}
          <div className="absolute inset-0 bg-[#F4F0EB]">
            <ProductCarousel slides={images} title={title} />
          </div>
        </div>
      )}
      
      {/* Fallback if no images */}
      {!firstImage && (
        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center rounded-xs">
          <span className="text-gray-400">Brak zdjęć</span>
        </div>
      )}
    </div>
  );
};