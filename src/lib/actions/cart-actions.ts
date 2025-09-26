"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders, setCartId } from "@/lib/data/cookies"
import { getRegion } from "@/lib/data/regions"
import { revalidateTag } from "next/cache"

const CART_FIELDS = "*items,*region,*region.countries,*items.product,*items.variant,*items.variant.options,items.variant.options.option.title,*items.thumbnail,*items.metadata,+items.total,+items.unit_price,+items.original_total,+items.original_unit_price,*promotions,*promotions.application_method,*shipping_methods,*items.product.seller,*payment_collection,*payment_collection.payment_sessions,email,*shipping_address,*billing_address,subtotal,total,tax_total,item_total,shipping_total,currency_code"

export async function createCartAction(countryCode: string = 'pl') {
  try {
    const region = await getRegion(countryCode)
    
    if (!region) {
      throw new Error(`Region not found for country code: ${countryCode}`)
    }

    const headers = await getAuthHeaders()
    
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id },
      { fields: CART_FIELDS },
      headers
    )
    
    const cart = cartResp.cart
    
    if (cart?.id) {
      await setCartId(cart.id)
      
      // Now we can safely revalidate in a server action
      revalidateTag('carts')
      
      console.log('🛒 Cart created via server action:', cart.id)
    }
    
    return cart
  } catch (error) {
    console.error('Error creating cart:', error)
    throw error
  }
}
