"use client"

import { Button } from "@/components/atoms"
import { HeartFilledIcon, HeartIcon } from "@/icons"
import { addWishlistItem, removeWishlistItem } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

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
  
  
  const [isWishlistAdding, setIsWishlistAdding] = useState(false)
  const initialWishlisted = wishlist?.[0]?.products?.some((item) => item.id === productId)
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted)

  useEffect(() => {
    const newIsWishlisted = wishlist?.[0]?.products?.some((item) => item.id === productId)
  
    setIsWishlisted(newIsWishlisted)
  }, [wishlist, productId, isWishlisted])

  if (!user) {
    return null
  }

  const handleAddToWishlist = async () => {
    try {
      setIsWishlistAdding(true)
      const result = await addWishlistItem({
        reference_id: productId,
        reference: "product",
      })
      
      // Update local state for both success and "already exists" cases
      setIsWishlisted(true)
      
      // Notify parent component about wishlist change if callback is provided
      if (onWishlistChange) {
        onWishlistChange()
      }
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error)
      // For genuine errors, don't update the state
    } finally {
      setIsWishlistAdding(false)
    }
  }

  const handleRemoveFromWishlist = async () => {
    try {
      setIsWishlistAdding(true)

      await removeWishlistItem({
        wishlist_id: wishlist?.[0].id!,
        product_id: productId,
      })
      // Update local state immediately after successful removal
      setIsWishlisted(false)
      
      // Notify parent component about wishlist change if callback is provided
      if (onWishlistChange) {
        onWishlistChange()
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      
      // Check if the error is because item is not in wishlist
      if (error instanceof Error && (error.message.includes('not found') || error.message.includes('404'))) {
        setIsWishlisted(false)
      } else {
      }
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
      className="w-10 h-10 p-0 flex items-center ring-1 ring-[#B7B7AD] justify-center rounded-full bg-[#F4F0EB] bg-opacity-80 hover:bg-[#B7B7AD] hover:fill-[#B7B7AD]"
      loading={isWishlistAdding}
      disabled={isWishlistAdding}
    >
      {isWishlisted ? <HeartFilledIcon size={20} /> : <HeartIcon size={20} />}
    </Button>
  )
}
