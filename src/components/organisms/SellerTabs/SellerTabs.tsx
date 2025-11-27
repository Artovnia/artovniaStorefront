import { Suspense } from "react"
import { ProductListingSkeleton } from "../ProductListingSkeleton/ProductListingSkeleton"
import { TabsContent, TabsList } from "@/components/molecules"
import { SellerProductListing } from "@/components/molecules/SellerProductListing/SellerProductListing"
import { SellerReviewTab } from "@/components/cells"
import { ServerAuthProvider } from "@/components/cells/SellerMessageTab/ServerAuthProvider"

//TODO: keep and eye for that file and update it. 

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

export const SellerTabs = ({
  tab,
  seller_handle,
  seller_id,
  seller_name,
  locale,
}: {
  tab: string
  seller_handle: string
  seller_id: string
  seller_name?: string
  locale: string
}) => {
  // Comprehensive safety checks for required props
  // Check if seller_handle is valid
  if (!seller_handle || 
      seller_handle === 'undefined' || 
      seller_handle === '[object Object]' || 
      seller_handle === 'null') {
    console.error('SellerTabs received invalid seller_handle:', seller_handle);
    return (
      <div className="mt-8 border rounded-sm p-4">
        <h3 className="heading-sm mb-4 text-error">Błąd konfiguracji karty sprzedawcy</h3>
        <p className="text-secondary">Nieprawidłowy identyfikator sprzedawcy.</p>
        <p className="mt-2 text-xs text-gray-500">Błąd: {typeof seller_handle === 'string' ? seller_handle : String(seller_handle)}</p>
      </div>
    );
  }

  // Check if seller_id is valid
  if (!seller_id || 
      seller_id === 'undefined' || 
      seller_id === '[object Object]' || 
      seller_id === 'null') {
    console.error('SellerTabs received invalid seller_id:', seller_id);
    return (
      <div className="mt-8 border rounded-sm p-4">
        <h3 className="heading-sm mb-4 text-error">Błąd konfiguracji karty sprzedawcy</h3>
        <p className="text-secondary">Nieprawidłowe ID sprzedawcy.</p>
        <p className="mt-2 text-xs text-[#3B3634]">Błąd: {typeof seller_id === 'string' ? seller_id : String(seller_id)}</p>
      </div>
    );
  }
  
  // Validate tab prop
  if (!tab || typeof tab !== 'string') {
    console.error('SellerTabs received invalid tab:', tab);
    // Default to products tab if invalid
    tab = "produkty";
  }
  

  
  
  // Safely construct links to prevent undefined interpolation
  // Note: labels are in Polish but URLs match English directory structure
  // Message tab removed - contact form is now in sidebar
  const tabsList = [
    { label: "produkty", link: `/sellers/${seller_handle}/` },
    {
      label: "recenzje", 
      link: `/sellers/${seller_handle}/reviews`,
    },
  ]

  return (
    <div className="w-full">
      <TabsList list={tabsList} activeTab={tab} />
      <TabsContent value="produkty" activeTab={tab}>
        <Suspense fallback={<ProductListingSkeleton />}>
          <SellerProductListing seller_id={seller_id} />
        </Suspense>
      </TabsContent>
      <TabsContent value="recenzje" activeTab={tab}>
        <Suspense fallback={<div className="mt-8 p-4 border">Ładowanie recenzji...</div>}>
          {seller_handle && 
           seller_handle !== 'undefined' && 
           seller_handle !== 'null' && 
           seller_handle !== '[object Object]' ? (
            <SellerReviewTab seller_handle={seller_handle} />
          ) : (
            <div className="mt-8 border rounded-sm p-4">
              <p className="text-error">Nie można załadować recenzji - brak identyfikatora sprzedawcy</p>
              <p className="mt-2 text-xs text-[#3B3634]">Błąd: {typeof seller_handle === 'string' ? seller_handle : String(seller_handle)}</p>
            </div>
          )}
        </Suspense>
      </TabsContent>
    </div>
  )
}