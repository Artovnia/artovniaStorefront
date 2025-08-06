"use server"
import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { revalidatePath } from "next/cache"
import { Wishlist, SerializableWishlist, WishlistResponse } from "@/types/wishlist"

export const getUserWishlists = async (): Promise<WishlistResponse> => {
  const authHeaders = await getAuthHeaders()
  
  // Debug: Check if we have authorization
  if (!('authorization' in authHeaders)) {
    console.log('🔒 No authorization header found for wishlist request')
    return { wishlists: [], count: 0 }
  }
  
  const headers = {
    ...authHeaders,
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  
  
  return sdk.client
    .fetch<{ wishlists: Wishlist[]; count: number }>(`/store/wishlist`, {
      cache: "no-cache",
      headers,
      method: "GET",
    })
    .then((res) => {
     
      
      // Ensure data is serializable for client components
      const serializedData: WishlistResponse = {
        wishlists: res.wishlists?.map(wishlist => ({
          id: wishlist.id,
          products: wishlist.products?.map(product => ({
            id: product.id,
            title: product.title || '',
            handle: product.handle || '',
            thumbnail: product.thumbnail || null,
          })) || []
        })) || [],
        count: res.count || 0
      }
      
      return serializedData
    })
    .catch((error) => {
      console.error('❌ Error fetching wishlist:', error)
      return { wishlists: [], count: 0 }
    })
}

export const addWishlistItem = async ({
  reference_id,
  reference,
}: {
  reference_id: string
  reference: "product"
}) => {
  const authHeaders = await getAuthHeaders()
  
  // Debug: Check if we have authorization
  if (!('authorization' in authHeaders)) {
    console.error('❌ No authorization header found for add wishlist request')
    throw new Error('User not authenticated')
  }
  
  const headers = {
    ...authHeaders,
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  
  
  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/wishlist`,
      {
        headers,
        method: "POST",
        body: JSON.stringify({
          reference,
          reference_id,
        }),
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // Check if the error is because item is already in wishlist
      if (response.status === 400 && errorText.includes('Cannot create multiple links')) {
        revalidatePath("/wishlist")
        return { success: true, alreadyExists: true }
      }
      
      throw new Error(`Failed to add item to wishlist: ${response.status} ${response.statusText}`)
    }
    
    revalidatePath("/wishlist")
    return { success: true, alreadyExists: false }
  } catch (error) {
    throw error
  }
}

export const removeWishlistItem = async ({
  wishlist_id,
  product_id,
}: {
  wishlist_id: string
  product_id: string
}) => {
  const authHeaders = await getAuthHeaders()
  
  // Debug: Check if we have authorization
  if (!('authorization' in authHeaders)) {
    console.error('❌ No authorization header found for remove wishlist request')
    throw new Error('User not authenticated')
  }
  
  const headers = {
    ...authHeaders,
    "Content-Type": "application/json",
    "x-publishable-api-key": process.env
      .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
  }

  
  
  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL}/store/wishlist/${wishlist_id}/product/${product_id}`,
      {
        headers,
        method: "DELETE",
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Failed to remove item from wishlist:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Failed to remove item from wishlist: ${response.status} ${response.statusText}`)
    }
    

    revalidatePath("/wishlist")
    return { success: true }
  } catch (error) {
    console.error('❌ Error removing item from wishlist:', error)
    throw error
  }
}
