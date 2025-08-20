import { SellerTabs } from "@/components/organisms"
import { SellerPageHeader } from "@/components/sections"
import { retrieveCustomer } from "@/lib/data/customer"
import { getSellerByHandle } from "@/lib/data/seller"
import { getSellerReviews } from "@/lib/data/reviews"
import { SellerProps } from "@/types/seller"

export default async function SellerReviewsPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  const seller = await getSellerByHandle(handle)
  const user = await retrieveCustomer()
  
  // Fetch seller reviews
  const { reviews = [] } = await getSellerReviews(handle)
  
  // Merge reviews data with seller object
  const sellerWithReviews = seller ? {
    ...seller,
    reviews: reviews || []
  } : null

  const tab = "recenzje"

  if (!seller) {
    return (
      <main className="container">
        <div className="border rounded-sm p-4 my-8">
          <h1 className="heading-lg mb-4">Sprzedawca nie znaleziony</h1>
          <p className="text-secondary">Nie mogliśmy znaleźć sprzedawcy. Sprawdź adres URL i spróbuj ponownie.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container">
      <SellerPageHeader seller={sellerWithReviews as SellerProps} user={user} />
      <SellerTabs
        tab={tab}
        seller_id={seller.id}
        seller_handle={seller.handle}
        locale={locale}
      />
    </main>
  )
}