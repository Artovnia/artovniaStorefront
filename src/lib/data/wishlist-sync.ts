"use server"

import { addWishlistItem } from "./wishlist"

/**
 * Syncs guest wishlist (from localStorage) with authenticated user's database wishlist
 * Called after successful login
 */
export const syncGuestWishlistToDatabase = async (guestProductIds: string[]) => {
  if (!guestProductIds || guestProductIds.length === 0) {
    console.log('✅ No guest wishlist items to sync')
    return { synced: 0, errors: 0 }
  }

  console.log(`🔄 Starting wishlist sync for ${guestProductIds.length} items...`)
  
  let synced = 0
  let errors = 0

  // Add each product to database wishlist
  for (const productId of guestProductIds) {
    try {
      const result = await addWishlistItem({
        reference_id: productId,
        reference: "product",
      })
      
      if (result.success) {
        synced++
        if (result.alreadyExists) {
          console.log(`✅ Product ${productId} already in wishlist (skipped)`)
        } else {
          console.log(`✅ Product ${productId} synced to database`)
        }
      }
    } catch (error) {
      console.error(`❌ Failed to sync product ${productId}:`, error)
      errors++
    }
  }

  console.log(`✅ Wishlist sync complete: ${synced} synced, ${errors} errors`)
  return { synced, errors }
}
