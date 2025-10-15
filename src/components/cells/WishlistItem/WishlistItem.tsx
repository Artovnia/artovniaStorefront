"use client"
import Link from "next/link"
import Image from "next/image"
import { SerializableWishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/atoms"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price"
import clsx from "clsx"

export const WishlistItem = ({
  product,
  wishlist,
  user,
}: {
  product: any
  wishlist: SerializableWishlist[]
  user?: HttpTypes.StoreCustomer | null
}) => {
  // Use the same price calculation logic as ProductCard
  const { cheapestPrice } = product?.id ? getProductPrice({
    product,
  }) : { cheapestPrice: null }

  const { cheapestPrice: sellerCheapestPrice } = product?.id ? getSellerProductPrice({
    product,
  }) : { cheapestPrice: null }

  // Get seller name with multiple fallback patterns (same as ProductCard)
  const sellerName = 
    product.seller?.name ||
    product.seller?.company_name ||
    (product as any).seller_name ||
    (product as any).seller?.name ||
    (product as any)['seller.name']
  
  // Format price for display
  const displayPrice = (sellerCheapestPrice?.calculated_price || cheapestPrice?.calculated_price)?.replace(/PLN\s+([\d,.]+)/, '$1 zł')
  const originalPrice = (sellerCheapestPrice?.original_price || cheapestPrice?.original_price)?.replace(/PLN\s+([\d,.]+)/, '$1 zł')
  const hasDiscount = displayPrice && originalPrice && displayPrice !== originalPrice

  return (
    <div
      className={clsx(
        "relative group border flex flex-col justify-between p-1 w-[250px] lg:w-[370px]"
      )}
    >
      <div className="relative w-full h-full bg-primary aspect-square">
        <div className="absolute right-3 top-3 z-10 cursor-pointer">
          <WishlistButton
            productId={product.id}
            wishlist={wishlist}
            user={user}
          />
        </div>
        <Link href={`/products/${product.handle}`}>
          <div className="overflow-hidden w-full h-full flex justify-center align-center ">
            {product.thumbnail ? (
              <Image
                src={decodeURIComponent(product.thumbnail)}
                alt={product.title}
                width={360}
                height={360}
                className="object-cover aspect-square w-full object-center h-full lg:group-hover:-mt-14 transition-all duration-300 "
                priority
              />
            ) : (
              <Image
                src="/images/placeholder.svg"
                alt="Product placeholder"
                width={100}
                height={100}
                className="flex margin-auto w-[100px] h-auto"
              />
            )}
          </div>
        </Link>
        <Link href={`/products/${product.handle}`}>
          <Button className="absolute bg-action text-action-on-primary h-auto lg:h-[48px] lg:group-hover:block hidden w-full uppercase bottom-1 z-10">
            Zobacz produkt
          </Button>
        </Link>
      </div>
      <Link href={`/products/${product.handle}`}>
        <div className="flex justify-between p-4">
          <div className="w-full">
            <h3 className="heading-sm truncate">{product.title}</h3>
            {/* Seller name below title (same as ProductCard) */}
            {sellerName && (
              <p className="font-instrument-sans text-sm mb-1 text-black">
                {sellerName}
              </p>
            )}
            {/* Price display with discount support */}
            <div className="flex items-center gap-2 mt-2">
              {hasDiscount ? (
                <>
                  <p className="font-instrument-sans font-semibold text-md">
                    {displayPrice}
                  </p>
                  <p className="text-xs text-gray-500 line-through">
                    {originalPrice}
                  </p>
                </>
              ) : (
                <p className="font-instrument-sans font-semibold text-md">
                  {displayPrice || '0 zł'}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
