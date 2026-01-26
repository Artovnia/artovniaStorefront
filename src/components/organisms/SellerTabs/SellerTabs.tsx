'use client'
import { TabsContent, TabsList } from "@/components/molecules"
import { SellerProductListingClient } from "@/components/molecules/SellerProductListing/SellerProductListingClient"
import { SellerReviewTab } from "@/components/cells"
import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"
import { Review } from "@/lib/data/reviews"
import { VendorPage } from "@/lib/data/vendor-page"
import { VendorPageRenderer } from "../VendorPageBlocks"

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
  vendorPage,
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
  vendorPage?: VendorPage | null
}) => {
  const searchParams = useSearchParams()
  
  // Check if vendor has a custom page with show_story_tab enabled
  const hasCustomPage = vendorPage && vendorPage.settings?.show_story_tab
  
  // Valid tabs depend on whether vendor has custom page
  const validTabs = hasCustomPage 
    ? ['historia', 'produkty', 'recenzje'] 
    : ['produkty', 'recenzje']
  
  // Read tab from URL, fallback to initialTab prop
  let tab = (searchParams.get('tab') as string) || initialTab || 'produkty'
  
  // Validate tab value - default to 'produkty' if invalid
  if (!tab || typeof tab !== 'string' || !validTabs.includes(tab)) {
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

  // Build tabs list - add "historia" tab only if vendor has custom page
  const tabsList = hasCustomPage
    ? [
        { label: "historia", link: `/sellers/${seller_handle}?tab=historia` },
        { label: "produkty", link: `/sellers/${seller_handle}?tab=produkty` },
        { label: "recenzje", link: `/sellers/${seller_handle}?tab=recenzje` },
      ]
    : [
        { label: "produkty", link: `/sellers/${seller_handle}/` },
        { label: "recenzje", link: `/sellers/${seller_handle}?tab=recenzje` },
      ]

  return (
    <div className="w-full">
      <TabsList list={tabsList} activeTab={tab} />
      
      {/* Historia (Story) tab - only shown if vendor has custom page */}
      {hasCustomPage && (
        <TabsContent value="historia" activeTab={tab}>
          <div className="mt-8">
            <VendorPageRenderer page={vendorPage!} sellerId={seller_id} sellerHandle={seller_handle} />
          </div>
        </TabsContent>
      )}
      
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