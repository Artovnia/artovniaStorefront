import Image from "next/image"
import { Button } from "@/components/atoms"
import { HeartIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@/lib/helpers/money"
import { DeleteCartItemButton } from "@/components/molecules"
import { Link } from "@/i18n/routing"


export const CartItemsProducts = ({
  products,
  currency_code,
  delete_item = true,
}: {
  products: HttpTypes.StoreCartLineItem[]
  currency_code: string
  delete_item?: boolean
}) => {
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
                    <DeleteCartItemButton id={product.id} />
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
                    <p>
                      Ilość:{" "}
                      <span className="text-primary">{product.quantity}</span>
                    </p>
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