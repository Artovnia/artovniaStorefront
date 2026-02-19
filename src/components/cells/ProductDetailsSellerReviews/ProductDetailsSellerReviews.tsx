import { Button } from '@/components/atoms';
import { SellerReview, ProductPageAccordion } from '@/components/molecules';
import { SingleProductReview } from '@/types/product';
import { SellerProps } from "@/types/seller"
import { StarRating } from "@/components/atoms"
import { SellerAvatar } from "@/components/cells/SellerAvatar/SellerAvatar"
import { Review } from '@/lib/data/reviews';
import Link from 'next/link';

// ✅ Use native fetch (no Authorization header) so Next.js Data Cache works.
// getSellerReviews called getAuthHeaders() → cookies() which forced the entire page dynamic.
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

async function fetchSellerReviews(handle: string): Promise<{ reviews: Review[]; count: number }> {
  try {
    const encodedHandle = encodeURIComponent(handle)
    const res = await fetch(
      `${BACKEND_URL}/store/seller/${encodedHandle}/reviews?limit=100`,
      {
        headers: {
          'accept': 'application/json',
          'x-publishable-api-key': PUB_KEY,
        },
        next: { revalidate: 300, tags: [`seller-reviews-${handle}`] },
      }
    )
    if (!res.ok) return { reviews: [], count: 0 }
    return res.json() as Promise<{ reviews: Review[]; count: number }>
  } catch {
    return { reviews: [], count: 0 }
  }
}

export const ProductDetailsSellerReviews = async ({ seller }: { seller: SellerProps }) => {
  const { photo, name, handle } = seller
  
  const { reviews, count } = await fetchSellerReviews(handle)
  
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
      <div className='flex flex-col lg:flex-row justify-between gap-4 lg:items-start items-center mb-5'>
        <Link href={`/sellers/${handle}`} className="flex gap-4" aria-label={`Profil sprzedawcy: ${name}`}>
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
        <div className="flex flex-col lg:flex-col gap-3 w-full lg:w-auto">
          <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/sellers/${handle}?tab=message`} className="w-full lg:w-auto" aria-label={`Skontaktuj się ze sprzedawcą ${name}`}>
            <Button
              variant='filled'
              className='uppercase label-md font-400 w-full lg:min-w-[11rem]'
            >
              Kontakt
            </Button>
          </Link>
          <Link href={`/sellers/${handle}?tab=reviews`} className="w-full lg:w-auto" aria-label={`Zobacz wszystkie recenzje sprzedawcy ${name} (${reviewCount})`}>
            <Button
              variant='tonal'
              className='uppercase label-md font-400 w-full lg:min-w-[11rem]'
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