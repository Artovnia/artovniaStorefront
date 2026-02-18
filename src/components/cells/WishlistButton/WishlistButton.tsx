"use client"

import { Button } from "@/components/atoms"
import { HeartFilledIcon, HeartIcon } from "@/icons"
import { addWishlistItem, removeWishlistItem } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { useEffect, useState, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
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
  const { 
    isInGuestWishlist, 
    addToGuestWishlist, 
    removeFromGuestWishlist 
  } = useGuestWishlist()
  
  const [isWishlistAdding, setIsWishlistAdding] = useState(false)
  
  // ✅ OPTIMIZATION: Use local optimistic state to prevent parent re-renders from resetting UI
  const isInDatabaseWishlist = wishlist?.[0]?.products?.some((item) => item.id === productId) ?? false
  const isInLocalWishlist = isInGuestWishlist(productId)
  const initialWishlisted = user ? isInDatabaseWishlist : isInLocalWishlist
  
  // Track if we've made a local change that shouldn't be overwritten by props
  const hasLocalChange = useRef(false)
  const [localWishlisted, setLocalWishlisted] = useState(initialWishlisted)
  
  // Use local state for display, but sync with props only on initial mount or when no local change pending
  const isWishlisted = hasLocalChange.current ? localWishlisted : initialWishlisted

  // Sync with props only when they change AND we don't have a pending local change
  useEffect(() => {
    if (!hasLocalChange.current) {
      setLocalWishlisted(initialWishlisted)
    }
  }, [initialWishlisted])

  // ✅ SYNC: Listen for wishlist:change events from OTHER WishlistButton instances
  // This ensures all buttons for the same product stay in sync across the page
  useEffect(() => {
    const handleWishlistChange = (event: CustomEvent<{ productId: string; action: 'add' | 'remove' }>) => {
      const { productId: changedProductId, action } = event.detail || {}
      
      // Only update if this event is for THIS product
      if (changedProductId === productId) {
        hasLocalChange.current = true
        setLocalWishlisted(action === 'add')
      }
    }

    window.addEventListener('wishlist:change', handleWishlistChange as EventListener)
    return () => {
      window.removeEventListener('wishlist:change', handleWishlistChange as EventListener)
    }
  }, [productId])

  const handleAddToWishlist = async () => {
    try {
      setIsWishlistAdding(true)
      
      // ✅ OPTIMISTIC UPDATE: Update local state immediately
      hasLocalChange.current = true
      setLocalWishlisted(true)
      
      if (user) {
        // Authenticated user: Add to database
        await addWishlistItem({
          reference_id: productId,
          reference: "product",
        })
        
        // Notify parent component about wishlist change if callback is provided
        if (onWishlistChange) {
          onWishlistChange()
        }
        
        // Dispatch custom event for other components (e.g., header counter)
        window.dispatchEvent(new CustomEvent('wishlist:change', {
          detail: { productId, action: 'add' }
        }))
        
        // ✅ REMOVED: router.refresh() - causes full page re-render and product shuffle
        // The optimistic local state handles UI update, header listens to event
      } else {
        // Guest user: Add to local storage
        addToGuestWishlist(productId)
      }
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error)
      // Revert optimistic update on error
      setLocalWishlisted(false)
    } finally {
      setIsWishlistAdding(false)
    }
  }

  const handleRemoveFromWishlist = async () => {
    try {
      setIsWishlistAdding(true)

      // ✅ OPTIMISTIC UPDATE: Update local state immediately
      hasLocalChange.current = true
      setLocalWishlisted(false)

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
        
        // Dispatch custom event for other components (e.g., header counter)
        window.dispatchEvent(new CustomEvent('wishlist:change', {
          detail: { productId, action: 'remove' }
        }))
        
        // ✅ REMOVED: router.refresh() - causes full page re-render and product shuffle
        // The optimistic local state handles UI update, header listens to event
      } else {
        // Guest user: Remove from local storage
        removeFromGuestWishlist(productId)
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      // Revert optimistic update on error
      setLocalWishlisted(true)
    } finally {
      setIsWishlistAdding(false)
    }
  }
  const handleClick = () => {
    if (isWishlisted) {
      handleRemoveFromWishlist()
    } else {
      handleAddToWishlist()
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="tonal"
      className="w-7 h-7   p-0 flex items-center ring-1 ring-[#B7B7AD] justify-center rounded-full bg-[#F4F0EB] bg-opacity-80 hover:bg-[#B7B7AD] hover:fill-[#B7B7AD]"
      loading={isWishlistAdding}
      disabled={isWishlistAdding}
    >
      {isWishlisted ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
    </Button>
  )
}