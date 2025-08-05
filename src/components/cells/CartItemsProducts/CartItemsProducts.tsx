"use client"

import Image from "next/image"
import { Button } from "@/components/atoms"
import { HeartIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@/lib/helpers/money"
import { DeleteCartItemButton } from "@/components/molecules"
import { Link } from "@/i18n/routing"
import { QuantityChanger } from "@/components/cells"
import { globalDeduplicator } from "@/lib/utils/performance"
import { retrieveCart } from "@/lib/data/cart"


export const CartItemsProducts = ({
  products,
  currency_code,
  delete_item = true,
  cartId,
  onCartUpdate,
}: {
  products: HttpTypes.StoreCartLineItem[]
  currency_code: string
  delete_item?: boolean
  cartId?: string
  onCartUpdate?: (updatedCart: HttpTypes.StoreCart) => void
}) => {

  const handleQuantityChange = (itemId: string, newQuantity: number, newTotal: number) => {
    console.log('🔄 Quantity updated via QuantityChanger:', { itemId, newQuantity, newTotal })
    
    // Don't do additional API calls here - QuantityChanger already handles server sync
    // Just update the local UI state optimistically
    
    // Optional: If we need to propagate state changes, do it non-blocking
    if (onCartUpdate && cartId) {
      // Use setTimeout to make this non-blocking
      setTimeout(async () => {
        try {
          console.log('🔄 Non-blocking cart state refresh...')
          const updatedCart = await retrieveCart(cartId)
          if (updatedCart) {
            console.log('📊 Propagating cart update to parent (non-blocking):', updatedCart)
            onCartUpdate(updatedCart)
          }
        } catch (error) {
          console.warn('⚠️ Non-blocking cart refresh failed:', error)
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
        
        // Ensure we have valid product title
        const productTitle = product.title || product.variant?.product?.title || 'Product';
        const productSubtitle = product.subtitle || '';
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
                      {productSubtitle} {productTitle}
                    </h3>
                  </div>
                </Link>
                {delete_item && (
                  <div className="lg:flex">
                    <DeleteCartItemButton 
                      id={product.id} 
                      onDeleted={async () => {
                        console.log('🗑️ Item deleted, triggering cart refresh...')
                        if (onCartUpdate && cartId) {
                          try {
                            // Fetch updated cart data after deletion
                            const updatedCart = await retrieveCart(cartId)
                            if (updatedCart) {
                              onCartUpdate(updatedCart) // Pass the updated cart data
                            }
                          } catch (error) {
                            console.warn('⚠️ Failed to refresh cart after deletion:', error)
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <Link href={`/products/${productHandle}`}>
                <div className="lg:flex justify-between -mt-4 lg:mt-0">
                  <div className="label-md text-secondary">
                    {options?.map(({ option, id, value }) => (
                      <p key={id}>
                        {option?.title || 'Option'}:{" "}
                        <span className="text-primary">{value || '-'}</span>
                      </p>
                    ))}
                    <div className="flex items-center gap-2">
                      <span className="text-secondary">Ilość:</span>
                      <QuantityChanger
                        itemId={product.id}
                        cartId={cartId || product.cart_id || ''}
                        initialQuantity={product.quantity}
                        maxQuantity={product.variant?.inventory_quantity || 999}
                        unitPrice={product.unit_price}
                        onQuantityChange={(newQuantity, newTotal) => handleQuantityChange(product.id, newQuantity, newTotal)}
                      />
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