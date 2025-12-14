import { SellerTabs, SellerSidebar } from "../../../../../components/organisms"
import { VendorAvailabilityProvider } from "../../../../../components/organisms/VendorAvailabilityProvider/vendor-availability-provider"
import { retrieveCustomer } from "../../../../../lib/data/customer"
import { getSellerByHandle } from "../../../../../lib/data/seller"
import { getVendorAvailability, getVendorHolidayMode, getVendorSuspension } from "../../../../../lib/data/vendor-availability"
import { getSellerReviews } from "../../../../../lib/data/reviews"
import { SellerProps } from "../../../../../types/seller"
import { PromotionDataProvider } from "../../../../../components/context/PromotionDataProvider"
import { BatchPriceProvider } from "../../../../../components/context/BatchPriceProvider"
import { listProductsWithSort } from "../../../../../lib/data/products"
import { getUserWishlists } from "../../../../../lib/data/wishlist"
import { PRODUCT_LIMIT } from "../../../../../const"
import { getOrSetCart } from "../../../../../lib/data/cart"
import { getRegion } from "../../../../../lib/data/regions"
import { generateSellerMetadata } from "../../../../../lib/helpers/seo"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale } = await params

  try {
    const seller = await getSellerByHandle(handle)
    
    if (!seller) {
      return {
        title: "Sprzedawca nie znaleziony",
        description: "Nie mogliśmy znaleźć tego sprzedawcy.",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    return generateSellerMetadata(seller, locale)
  } catch (error) {
    console.error("Error generating seller metadata:", error)
    return {
      title: "Sprzedawca",
      description: "Profil sprzedawcy na Artovnia",
    }
  }
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  try {
    const { handle, locale } = await params
    
    if (!handle || handle === 'undefined') {
      console.error(`Invalid seller handle: ${handle} for seller page`)
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">Nieprawidłowy identyfikator sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
          </div>
        </main>
      )
    }
    
    // Get user's cart to determine their selected region
    const cart = await getOrSetCart("pl").catch(() => null)
    const userRegion = cart?.region_id 
      ? await import("../../../../../lib/data/regions").then(m => m.retrieveRegion(cart.region_id!))
      : await getRegion("pl")
    const countryCode = userRegion?.countries?.[0]?.iso_2 || "pl"

    // Parallel fetching for better performance - fetch products during initial render
    const [seller, user, { reviews = [] }, productsResult, wishlistData] = await Promise.all([
      getSellerByHandle(handle),
      retrieveCustomer(),
      getSellerReviews(handle),
      // Fetch first page of products immediately with user's selected region
      getSellerByHandle(handle).then(s => 
        s ? listProductsWithSort({
          seller_id: s.id,
          countryCode,
          sortBy: "created_at",
          queryParams: { limit: PRODUCT_LIMIT, offset: 0 },
        }) : null
      ),
      // Fetch wishlist data if user exists
      retrieveCustomer().then(u => u ? getUserWishlists() : Promise.resolve({ wishlists: [], count: 0 }))
    ])
    
    const sellerWithReviews = seller ? {
      ...seller,
      reviews: reviews || []
    } : null
    
    const tab = "produkty"

    if (!seller) {
      console.error(`Seller not found for handle: ${handle}`)
      return (
        <main className="container">
          <div className="border rounded-sm p-4 my-8">
            <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
            <p className="text-secondary">Nie mogliśmy znaleźć sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
          </div>
        </main>
      )
    }
  
    // Get vendor availability data with better error handling
    let availability = undefined
    let holidayMode = undefined
    let suspension = undefined
    
    try {
      try {
        availability = await getVendorAvailability(seller.id)
      } catch (availabilityError) {
        console.error(`Vendor availability error: ${availabilityError instanceof Error ? availabilityError.message : 'Unknown error'}`)
        availability = {
          available: true,
          suspended: false,
          onHoliday: false,
          message: null,
          status: 'active' as 'active' | 'holiday' | 'suspended',
          suspension_expires_at: null
        }
      }
      
      try {
        holidayMode = await getVendorHolidayMode(seller.id)
      } catch (holidayError) {
        console.error(`Holiday mode error: ${holidayError instanceof Error ? holidayError.message : 'Unknown error'}`)
      }
      
      try {
        suspension = await getVendorSuspension(seller.id)
      } catch (suspensionError) {
        console.error(`Suspension error: ${suspensionError instanceof Error ? suspensionError.message : 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`General error in vendor availability section: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return (
      <PromotionDataProvider countryCode="PL">
        <BatchPriceProvider currencyCode="PLN">
          <main className="container">
            <VendorAvailabilityProvider
              vendorId={seller.id}
              vendorName={seller.name}
              availability={availability}
              holidayMode={holidayMode}
              suspension={suspension}
              showModalOnLoad={!!availability?.onHoliday}
            >
              <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 mt-8">
                <aside className="lg:sticky lg:top-40 lg:self-start">
                  <SellerSidebar seller={sellerWithReviews as SellerProps} user={user} />
                </aside>
                
                <div className="w-full">
                  <SellerTabs
                    tab={tab}
                    seller_id={seller.id}
                    seller_handle={seller.handle}
                    seller_name={seller.name}
                    user={user}
                    locale={locale}
                    initialProducts={productsResult?.response?.products || []}
                    initialTotalCount={productsResult?.response?.count || 0}
                    initialWishlists={(wishlistData as any)?.wishlists || []}
                  />
                </div>
              </div>
            </VendorAvailabilityProvider>
          </main>
        </BatchPriceProvider>
      </PromotionDataProvider>
    )
  } catch (error) {
    console.error(`Error in SellerPage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return (
      <main className="container">
        <div className="border rounded-sm p-4 my-8">
          <h1 className="heading-lg mb-4">Wystąpił błąd</h1>
          <p className="text-secondary">Przepraszamy, wystąpił problem podczas ładowania strony sprzedawcy. Spróbuj ponownie później.</p>
        </div>
      </main>
    )
  }
}