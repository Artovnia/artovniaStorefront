'use client'
import { Suspense } from "react"
import { ProductListingSkeleton } from "../ProductListingSkeleton/ProductListingSkeleton"
import { TabsContent, TabsList } from "@/components/molecules"
import { SellerProductListingClient } from "@/components/molecules/SellerProductListing/SellerProductListingClient"
import { SellerReviewTab } from "@/components/cells"
import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"
import { Review } from "@/lib/data/reviews"

export const SellerTabs = ({
  tab: initialTab,
  seller_handle,
  seller_id,
  seller_name,
  user,
  locale,
  initialProducts,
  initialTotalCount,
  initialWishlists,
  categories,
  reviews,
}: {
  tab: string
  seller_handle: string
  seller_id: string
  seller_name?: string
  user: HttpTypes.StoreCustomer | null
  locale: string
  initialProducts?: HttpTypes.StoreProduct[]
  initialTotalCount?: number
  initialWishlists?: any[]
  categories?: Array<{ id: string; name: string; handle: string }>
  reviews?: Review[]
}) => {
  const searchParams = useSearchParams()
  // Read tab from URL, fallback to initialTab prop, ensure it's always valid
  let tab = (searchParams.get('tab') as string) || initialTab || 'produkty'
  
  // Validate tab value
  if (!tab || typeof tab !== 'string' || (tab !== 'produkty' && tab !== 'recenzje')) {
    console.warn('SellerTabs received invalid tab:', tab, '- defaulting to produkty')
    tab = "produkty"
  }
  
  // Comprehensive safety checks for required props
  if (!seller_handle || 
      seller_handle === 'undefined' || 
      seller_handle === '[object Object]' || 
      seller_handle === 'null') {
    console.error('SellerTabs received invalid seller_handle:', seller_handle)
    return (
      <div className="mt-8 border rounded-sm p-4">
        <h3 className="heading-sm mb-4 text-error">Błąd konfiguracji karty sprzedawcy</h3>
        <p className="text-secondary">Nieprawidłowy identyfikator sprzedawcy.</p>
        <p className="mt-2 text-xs text-gray-500">Błąd: {typeof seller_handle === 'string' ? seller_handle : String(seller_handle)}</p>
      </div>
    )
  }

  if (!seller_id || 
      seller_id === 'undefined' || 
      seller_id === '[object Object]' || 
      seller_id === 'null') {
    console.error('SellerTabs received invalid seller_id:', seller_id)
    return (
      <div className="mt-8 border rounded-sm p-4">
        <h3 className="heading-sm mb-4 text-error">Błąd konfiguracji karty sprzedawcy</h3>
        <p className="text-secondary">Nieprawidłowe ID sprzedawcy.</p>
        <p className="mt-2 text-xs text-[#3B3634]">Błąd: {typeof seller_id === 'string' ? seller_id : String(seller_id)}</p>
      </div>
    )
  }

  const tabsList = [
    { label: "produkty", link: `/sellers/${seller_handle}/` },
    { label: "recenzje", link: `/sellers/${seller_handle}/reviews` },
  ]

  return (
    <div className="w-full">
      <TabsList list={tabsList} activeTab={tab} />
      
      <TabsContent value="produkty" activeTab={tab}>
        <SellerProductListingClient 
          seller_id={seller_id}
          user={user}
          initialProducts={initialProducts}
          initialTotalCount={initialTotalCount}
          initialWishlists={initialWishlists}
          categories={categories}
        />
      </TabsContent>
      
      <TabsContent value="recenzje" activeTab={tab}>
        {reviews && reviews.length >= 0 ? (
          <SellerReviewTab reviews={reviews} />
        ) : (
          <div className="mt-8 border rounded-sm p-4">
            <p className="text-error">Nie można załadować recenzji</p>
          </div>
        )}
      </TabsContent>
    </div>
  )
}