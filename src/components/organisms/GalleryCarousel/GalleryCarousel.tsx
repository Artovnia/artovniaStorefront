import { ProductCarousel } from '@/components/cells';
import { MedusaProductImage } from '@/types/product';

/**
 * GalleryCarousel - Optimized for LCP (Largest Contentful Paint)
 * 
 * Strategy: ProductCarousel is a "use client" component but Next.js still 
 * server-renders it. The first image with priority={true} appears as a real 
 * <img> tag in the initial HTML with a preload hint in <head>.
 * 
 * Previous dual-layer approach (server image + absolute client overlay) was
 * removed because:
 * 1. The absolute overlay completely hid the server-rendered image — it was 
 *    never visible to users, wasting the priority download
 * 2. It doubled image requests and preload hints (server + client copies)
 * 3. It caused "preloaded but not used" browser warnings (7+ per page)
 * 4. Thumbnails from the server layer competed for bandwidth with the main image
 */

export const GalleryCarousel = ({
  images,
  title = "Product image",
}: {
  images: MedusaProductImage[];
  title?: string;
}) => {
  return (
    <div className='w-full max-w-full p-1 rounded-sm overflow-hidden' style={{ backgroundColor: '#F4F0EB' }}>
      {images?.length > 0 ? (
        <ProductCarousel slides={images} title={title} />
      ) : (
        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center rounded-xs">
          <span className="text-gray-400">Brak zdjęć</span>
        </div>
      )}
    </div>
  );
};