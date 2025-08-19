import { Metadata } from 'next'
import { SellerListing } from '@/components/sections/SellerListing/SellerListing'

export const metadata: Metadata = {
  title: 'Sprzedawcy - Artovnia',
  description: 'Przeglądaj wszystkich sprzedawców na platformie Artovnia. Znajdź swoich ulubionych artystów i odkryj nowe talenty.',
}

export default function SellersPage() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="bg-primary border-b border-gray-200 px-4 sm:px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-black font-instrument-sans mb-2">
              Sprzedawcy
            </h1>
            <p className="text-gray-600 font-instrument-sans">
              Odkryj talentowanych artystów i sprzedawców na naszej platformie
            </p>
          </div>
        </div>

        {/* Seller Listing Component */}
        <SellerListing />
      </div>
    </div>
  )
}
