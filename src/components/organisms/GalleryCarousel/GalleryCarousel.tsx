import { ProductCarousel } from '@/components/cells';
import { MedusaProductImage } from '@/types/product';

export const GalleryCarousel = ({
  images,
}: {
  images: MedusaProductImage[];
}) => {
  return (
    <div className='w-full max-w-full p-1 rounded-sm overflow-hidden'>
      <ProductCarousel slides={images} />
    </div>
  );
};
