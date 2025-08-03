import { ProductCarousel } from '@/components/cells';
import { MedusaProductImage } from '@/types/product';

export const GalleryCarousel = ({
  images,
}: {
  images: MedusaProductImage[];
}) => {
  return (
    <div className=' w-full p-1 rounded-sm'>
      <ProductCarousel slides={images} />
    </div>
  );
};
