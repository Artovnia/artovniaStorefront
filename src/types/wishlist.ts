import { HttpTypes } from "@medusajs/types"

export type Wishlist = {
  id: string
  products: HttpTypes.StoreProduct[]
}

// Serializable version for client components
export type SerializableWishlist = {
  id: string
  products: {
    id: string
    title: string
    handle: string
    thumbnail: string | null
  }[]
}

export type WishlistResponse = {
  wishlists: SerializableWishlist[]
  count: number
}