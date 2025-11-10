import { GalleryCarousel } from '@/components/organisms';
import { MedusaProductImage } from '@/types/product';

export const ProductGallery = ({
  images,
}: {
  images: MedusaProductImage[];
}) => {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <GalleryCarousel images={images} />
    </div>
  );
};
