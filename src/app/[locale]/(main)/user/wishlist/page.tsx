import { retrieveCustomer } from "@/lib/data/customer"
import { redirect } from "next/navigation"
import { isEmpty } from "lodash"
import { SerializableWishlist as WishlistType } from "@/types/wishlist"
import Link from "next/link"
import { Button } from "@/components/atoms"
import { WishlistItem } from "@/components/cells"
import { getUserWishlists } from "@/lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import { UserNavigation } from "@/components/molecules"

export default async function Wishlist() {
  const user = await retrieveCustomer()

  let wishlist: WishlistType[] = []
  if (user) {
    const response = await getUserWishlists()
    wishlist = response.wishlists
  }

  const count = wishlist?.[0]?.products?.length || 0

  if (!user) {
    redirect("/user")
  }

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          {isEmpty(wishlist?.[0]?.products) ? (
            <div className="w-96 mx-auto flex flex-col items-center justify-center">
              <h2 className="heading-lg text-primary uppercase mb-2">
                Lista życzeń
              </h2>
              <p className="text-lg text-secondary mb-6">
                Twoja lista życzeń jest aktualnie pusta.
              </p>
              <Link href="/categories" className="w-full">
                <Button className="w-full">Explore</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <h2 className="heading-lg text-primary uppercase">Lista życzeń</h2>
              <div className="flex justify-between items-center">
                <p>{count} produkty</p>
              </div>
              <div className="flex flex-wrap max-md:justify-center gap-4">
                {wishlist?.[0].products?.map((product) => (
                  <WishlistItem
                    key={product.id}
                    product={
                      {
                        ...product,
                        calculated_amount: (product as any).calculated_amount || 0,
                        currency_code: (product as any).currency_code || 'USD',
                        handle: (product as any).handle || product.id || '',
                        thumbnail: (product as any).thumbnail || null,
                        title: (product as any).title || product.id || '',
                        id: product.id || ''
                      } as HttpTypes.StoreProduct & {
                        calculated_amount: number
                        currency_code: string
                        handle: string
                        thumbnail: string | null
                        title: string
                        id: string
                      }
                    }
                    wishlist={wishlist}
                    user={user}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}