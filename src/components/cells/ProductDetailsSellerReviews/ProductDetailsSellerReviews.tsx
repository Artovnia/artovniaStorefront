"use client"

import { Button } from '@/components/atoms';
import { SellerReview } from '@/components/molecules';
import { SingleProductReview } from '@/types/product';
import { SellerProps } from "@/types/seller"
import { StarRating } from "@/components/atoms"
import { SellerAvatar } from "@/components/cells/SellerAvatar/SellerAvatar"
import { useRouter } from 'next/navigation';

export const ProductDetailsSellerReviews = ({ seller }: { seller: SellerProps }) => {
  const { photo, name, reviews } = seller
  const router = useRouter();

  const reviewCount = reviews ? reviews?.length : 0

  const rating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  const handleSellerClick = () => {
    // Navigate to seller page
    router.push(`/sellers/${seller.handle}`);
  };
  
  const handleSeeMoreClick = () => {
    // Navigate to seller reviews page
    router.push(`/sellers/${seller.handle}/reviews`);
  };

  return (
    <div className='p-4 border rounded-sm'>
      <div className='flex justify-between items-center mb-5'>
        <div 
          className="flex gap-4 cursor-pointer" 
          onClick={handleSellerClick}
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-sm">
            <SellerAvatar photo={photo} size={56} alt={name} />
          </div>
          <div>
            <h3 className="heading-sm text-primary">{name}</h3>
            <div className="flex items-center gap-2">
              <StarRating starSize={16} rate={rating} />
              <span className="text-md text-secondary">{reviewCount} recenzji</span>
            </div>
          </div>
        </div>
        <Button
          variant='tonal'
          className='uppercase label-md font-400'
          onClick={handleSeeMoreClick}
        >
          Zobacz więcej ({reviewCount})
        </Button>
      </div>
      {/* Display only the latest review */}
      {reviews && reviews.length > 0 && (
        <SellerReview 
          key={reviews[0].id} 
          review={[...reviews].sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || '').getTime();
            const dateB = new Date(b.updated_at || b.created_at || '').getTime();
            return dateB - dateA; // Sort in descending order (newest first)
          })[0]} 
        />
      )}
    </div>
  );
};