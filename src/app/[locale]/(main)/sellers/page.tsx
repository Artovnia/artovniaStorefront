import { Metadata } from 'next'
import { SellerListing } from '@/components/sections/SellerListing/SellerListing'

export const metadata: Metadata = {
  title: 'Sprzedawcy - Artovnia',
  description: 'Przeglądaj wszystkich sprzedawców na platformie Artovnia. Znajdź swoich ulubionych artystów i odkryj nowe talenty.',
}

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-primary max-w-[1920px] w-full mx-auto">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="bg-primary  px-4 sm:px-6 py-8">
          <div className="mx-auto">
            <h1 className="text-3xl  text-black font-instrument-serif italic  mb-2 text-center">
              Sprzedawcy
            </h1>
            <p className="text-gray-600 font-instrument-sans text-center">
              Odkryj utalentowanych artystów i sprzedawców na naszej platformie
            </p>
          </div>
        </div>

        {/* Seller Listing Component */}
        <SellerListing />
      </div>
    </div>
  )
}
