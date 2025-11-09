"use client"

import Image from "next/image"
import { Button } from "@/components/atoms"
import { HeartIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@/lib/helpers/money"
import { DeleteCartItemButton } from "@/components/molecules"
import { Link } from "@/i18n/routing"
import { QuantityChanger } from "@/components/cells"
import { retrieveCart } from "@/lib/data/cart"


export const CartItemsProducts = ({
  products,
  currency_code,
  delete_item = true,
  show_quantity_changer = true,
  cartId,
  onCartUpdate,
}: {
  products: HttpTypes.StoreCartLineItem[]
  currency_code: string
  delete_item?: boolean
  show_quantity_changer?: boolean
  cartId?: string
  onCartUpdate?: (updatedCart: HttpTypes.StoreCart) => void
}) => {

  const handleQuantityChange = (itemId: string, newQuantity: number, newTotal: number) => {
    
    
    // Don't do additional API calls here - QuantityChanger already handles server sync
    // Just update the local UI state optimistically
    
    // Optional: If we need to propagate state changes, do it non-blocking
    if (onCartUpdate && cartId) {
      // Use setTimeout to make this non-blocking
      setTimeout(async () => {
        try {
         
          const updatedCart = await retrieveCart(cartId)
          if (updatedCart) {
            onCartUpdate(updatedCart)
          }
        } catch (error) {
        }
      }, 1000) // Delay to avoid blocking UI
    }
  }
  return (
    <div>
      {products.map((product) => {
        // Safely extract options with fallback
        const { options } = product.variant ?? {}
        
        // Ensure we have valid amounts for price display
        const original_total = convertToLocale({
          amount: product.original_total || product.unit_price * product.quantity,
          currency_code,
        })

        const total = convertToLocale({
          amount: product.total || product.unit_price * product.quantity,
          currency_code,
        })
        
        // Get raw data from product
        let rawTitle = product.title || product.variant?.product?.title || 'Product';
        let rawSubtitle = product.subtitle || '';
        
        // Clean up both fields to remove "Default variant"
        const isDefaultVariant = (text: string) => text.toLowerCase().includes('default variant');
        
        // If either field contains "default variant", remove it
        if (isDefaultVariant(rawTitle)) {
          rawTitle = rawTitle.replace(/default variant/i, '').trim();
        }
        
        if (isDefaultVariant(rawSubtitle)) {
          rawSubtitle = '';
        }
        
        // Final cleaned values
        const productTitle = rawTitle;
        const productSubtitle = rawSubtitle;
        const productHandle = product.product_handle || product.variant?.product?.handle || 'product';
        
        return (
          <div key={product.id} className="border rounded-sm p-1 flex gap-2">
            <Link href={`/products/${productHandle}`}>
              <div className="w-[100px] h-[132px] flex items-center justify-center">
                {product.thumbnail ? (
                  <Image
                    src={decodeURIComponent(product.thumbnail)}
                    alt="Product thumbnail"
                    width={100}
                    height={132}
                    className="rounded-xs w-[100px] h-[132px] object-contain"
                  />
                ) : (
                  <Image
                    src={"/images/placeholder.svg"}
                    alt="Product thumbnail"
                    width={50}
                    height={66}
                    className="rounded-xs w-[50px] h-[66px] object-contain opacity-30"
                  />
                )}
              </div>
            </Link>

            <div className="w-full p-2">
              <div className="flex justify-between lg:mb-4">
                <Link href={`/products/${productHandle}`}>
                  <div className="mb-6 pr-2">
                    <h3 className="heading-xs uppercase break-normal">
                      {productSubtitle ? `${productTitle} ${productSubtitle}` : productTitle}
                    </h3>
                  </div>
                </Link>
                {delete_item && (
                  <div className="lg:flex">
                    <DeleteCartItemButton 
                      id={product.id} 
                    />
                  </div>
                )}
              </div>
              <Link href={`/products/${productHandle}`}>
                <div className="lg:flex justify-between -mt-4 lg:mt-0">
                  <div className="label-md text-secondary">
                    
                    <div className="flex items-center gap-2">
                      <span className="text-secondary">Ilość:</span>
                      {show_quantity_changer ? (
                        <QuantityChanger
                          itemId={product.id}
                          cartId={cartId || product.cart_id || ''}
                          initialQuantity={product.quantity}
                          maxQuantity={product.variant?.inventory_quantity || 999}
                          unitPrice={product.unit_price}
                          onQuantityChange={(newQuantity, newTotal) => handleQuantityChange(product.id, newQuantity, newTotal)}
                        />
                      ) : (
                        <span className="text-primary font-medium">{product.quantity}</span>
                      )}
                    </div>
                  </div>
                  <div className="lg:text-right flex lg:block items-center gap-2 mt-4 lg:mt-0">
                    {total !== original_total && (
                      <p className="line-through text-secondary label-md">
                        {original_total}
                      </p>
                    )}
                    <p className="label-lg">{total}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}