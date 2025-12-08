import { Button } from '@/components/atoms';
import { SellerReview, ProductPageAccordion } from '@/components/molecules';
import { SingleProductReview } from '@/types/product';
import { SellerProps } from "@/types/seller"
import { StarRating } from "@/components/atoms"
import { SellerAvatar } from "@/components/cells/SellerAvatar/SellerAvatar"
import { getSellerReviews, Review } from '@/lib/data/reviews';
import { unifiedCache, CACHE_TTL } from '@/lib/utils/unified-cache';
import Link from 'next/link';

export const ProductDetailsSellerReviews = async ({ seller }: { seller: SellerProps }) => {
  const { photo, name, handle } = seller
  
  // ✅ FIXED: Fetch seller reviews with unified cache
  const { reviews, count } = await unifiedCache.get(
    `seller:reviews:${handle}`,
    () => getSellerReviews(handle),
    CACHE_TTL.PRODUCT
  )
  
  // Filter out any null reviews
  const filteredReviews = reviews?.filter((r: Review | null): r is Review => r !== null) || []

  const reviewCount = filteredReviews.length

  const rating =
    filteredReviews.length > 0
      ? filteredReviews.reduce((sum: number, r: Review) => sum + (r?.rating || 0), 0) /
        filteredReviews.length
      : 0

 

  return (
    <ProductPageAccordion heading="Sprzedawca" defaultOpen={true}>
      <div className='flex flex-col md:flex-row justify-between gap-4 md:items-start items-center mb-5'>
        <Link href={`/sellers/${handle}`} className="flex gap-4">
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
        </Link>
        <div className="flex md:flex-col gap-4">
          <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/sellers/${handle}?tab=message`}>
            <Button
              variant='filled'
              className='uppercase label-md font-400 md:min-w-[10rem] min-w-[10rem]'
            >
              Kontakt
            </Button>
          </Link>
          <Link href={`/sellers/${handle}?tab=reviews`}>
            <Button
              variant='tonal'
              className='uppercase label-md font-400 max-w-[11rem] '
            >
              Zobacz więcej ({reviewCount})
            </Button>
          </Link>
        </div>
      </div>
      {/* Display only the latest review */}
      {filteredReviews && filteredReviews.length > 0 && (
        <SellerReview 
          key={filteredReviews[0].id} 
          review={[...filteredReviews].sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || '').getTime();
            const dateB = new Date(b.updated_at || b.created_at || '').getTime();
            return dateB - dateA; // Sort in descending order (newest first)
          })[0]} 
        />
      )}
    </ProductPageAccordion>
  );
};