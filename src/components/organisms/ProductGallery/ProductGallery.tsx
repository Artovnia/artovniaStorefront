import { GalleryCarousel } from '@/components/organisms';
import { MedusaProductImage } from '@/types/product';

export const ProductGallery = ({
  images,
}: {
  images: MedusaProductImage[];
}) => {
  return (
    <div>
      <GalleryCarousel images={images} />
    </div>
  );
};
