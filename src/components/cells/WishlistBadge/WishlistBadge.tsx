"use client"

import { Badge } from "@/components/atoms"
import { HeartIcon } from "@/icons"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { useGuestWishlist } from "@/components/context/GuestWishlistContext"

export const WishlistBadge = ({ 
  user, 
  databaseWishlistCount 
}: { 
  user: any
  databaseWishlistCount: number 
}) => {
  const { getGuestWishlistCount } = useGuestWishlist()
  
  // Use database count if authenticated, otherwise use guest count
  const wishlistCount = user ? databaseWishlistCount : getGuestWishlistCount()

  return (
    <Link
      href="/user/wishlist"
      className="flex items-center gap-1 text-sm hover:text-gray-600 transition-colors"
      aria-label={`Lista życzeń${wishlistCount > 0 ? ` - ${wishlistCount} ${wishlistCount === 1 ? 'produkt' : 'produktów'}` : ' - pusta'}`}
    >
      <div className="relative">
        <HeartIcon size={20} />
        {wishlistCount > 0 && (
          <Badge className="w-4 h-4 p-2" aria-hidden="true">
            {wishlistCount}
          </Badge>
        )}
      </div>
    </Link>
  )
}
