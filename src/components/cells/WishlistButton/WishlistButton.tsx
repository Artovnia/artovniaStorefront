"use client"

import { Button } from "@/components/atoms"
import { HeartFilledIcon, HeartIcon } from "@/icons"
import { addWishlistItem, removeWishlistItem } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRouter } from "next/navigation"
import { useGuestWishlist } from "@/components/context/GuestWishlistContext"

export const WishlistButton = ({
  productId,
  wishlist,
  user,
  onWishlistChange,
}: {
  productId: string
  wishlist?: SerializableWishlist[]
  user?: HttpTypes.StoreCustomer | null
  onWishlistChange?: () => void
}) => {
  const router = useRouter()
  const { 
    isInGuestWishlist, 
    addToGuestWishlist, 
    removeFromGuestWishlist 
  } = useGuestWishlist()
  
  const [isWishlistAdding, setIsWishlistAdding] = useState(false)
  
  // Determine if product is wishlisted (check both database and local storage)
  const isInDatabaseWishlist = wishlist?.[0]?.products?.some((item) => item.id === productId)
  const isInLocalWishlist = isInGuestWishlist(productId)
  const isWishlisted = user ? isInDatabaseWishlist : isInLocalWishlist

  useEffect(() => {
    // Update local state when database wishlist changes (for authenticated users)
    if (user) {
      const newIsWishlisted = wishlist?.[0]?.products?.some((item) => item.id === productId)
      if (newIsWishlisted !== isInDatabaseWishlist) {
        // State will be updated via isWishlisted calculation
      }
    }
  }, [wishlist, productId, user, isInDatabaseWishlist])

  const handleAddToWishlist = async () => {
    try {
      setIsWishlistAdding(true)
      
      if (user) {
        // Authenticated user: Add to database
        const result = await addWishlistItem({
          reference_id: productId,
          reference: "product",
        })
        
        // Notify parent component about wishlist change if callback is provided
        if (onWishlistChange) {
          onWishlistChange()
        }
        
        // Force router refresh to update Header and other components
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        // Guest user: Add to local storage
        addToGuestWishlist(productId)
      }
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error)
    } finally {
      setIsWishlistAdding(false)
    }
  }

  const handleRemoveFromWishlist = async () => {
    try {
      setIsWishlistAdding(true)

      if (user) {
        // Authenticated user: Remove from database
        await removeWishlistItem({
          wishlist_id: wishlist?.[0].id!,
          product_id: productId,
        })
        
        // Notify parent component about wishlist change if callback is provided
        if (onWishlistChange) {
          onWishlistChange()
        }
        
        // Force router refresh to update Header and other components
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        // Guest user: Remove from local storage
        removeFromGuestWishlist(productId)
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setIsWishlistAdding(false)
    }
  }
  return (
    <Button
      onClick={
        isWishlisted
          ? () => handleRemoveFromWishlist()
          : () => handleAddToWishlist()
      }
      variant="tonal"
      className="w-7 h-7   p-0 flex items-center ring-1 ring-[#B7B7AD] justify-center rounded-full bg-[#F4F0EB] bg-opacity-80 hover:bg-[#B7B7AD] hover:fill-[#B7B7AD]"
      loading={isWishlistAdding}
      disabled={isWishlistAdding}
    >
      {isWishlisted ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
    </Button>
  )
}
