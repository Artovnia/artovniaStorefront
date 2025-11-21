import { retrieveCustomer } from "@/lib/data/customer"
import { redirect } from "next/navigation"
import { isEmpty } from "lodash"
import { SerializableWishlist as WishlistType } from "@/types/wishlist"
import Link from "next/link"
import { Button } from "@/components/atoms"
import { WishlistItem } from "@/components/cells"
import { getUserWishlists } from "@/lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import { UserPageLayout } from "@/components/molecules"

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
    <UserPageLayout>
      {isEmpty(wishlist?.[0]?.products) ? (
        <div className="w-96 mx-auto flex flex-col items-center justify-center">
          <h2 className="heading-lg text-primary uppercase mb-2">
            Lista życzeń
          </h2>
          <p className="text-lg text-secondary mb-6">
            Twoja lista życzeń jest aktualnie pusta.
          </p>
          <Link href="/categories" className="w-full">
            <Button className="w-full">Eksploruj</Button>
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
                product={product as any}
                wishlist={wishlist}
                user={user}
              />
            ))}
          </div>
        </div>
      )}
    </UserPageLayout>
  )
}