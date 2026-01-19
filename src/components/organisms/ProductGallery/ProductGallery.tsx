import { GalleryCarousel } from '@/components/organisms';
import { MedusaProductImage } from '@/types/product';

export const ProductGallery = ({
  images,
  title = "Product image",
}: {
  images: MedusaProductImage[];
  title?: string;
}) => {
  return (
    <div className="w-full items-center justify-center max-w-full overflow-hidden ">
      <GalleryCarousel images={images} title={title} />
    </div>
  );
};