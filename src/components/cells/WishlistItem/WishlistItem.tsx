"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { SerializableWishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price"
import { ArrowRightIcon } from "@/icons"
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
  const [isHovered, setIsHovered] = useState(false)

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
        "relative group  p-1 w-[250px] lg:w-[370px]",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:-translate-y-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative w-full bg-primary aspect-square overflow-hidden">
        {/* Wishlist Button - Always visible */}
        <div className="absolute right-3 top-3 z-20 cursor-pointer">
          <WishlistButton
            productId={product.id}
            wishlist={wishlist}
            user={user}
          />
        </div>

        <Link href={`/products/${product.handle}`}>
          <div className="w-full h-full flex justify-center items-center">
            {product.thumbnail ? (
              <Image
                src={decodeURIComponent(product.thumbnail)}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500"
                priority
              />
            ) : (
              <Image
                src="/placeholder.webp"
                alt="Product placeholder"
                width={100}
                height={100}
                className="w-[100px] h-auto"
              />
            )}
          </div>
        </Link>

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#3B3634]/95 via-[#3B3634]/70 to-transparent transition-opacity duration-500 flex items-center justify-center ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <Link href={`/products/${product.handle}`} className="w-full h-full flex items-center justify-center">
            <div
              className="text-center px-6 flex flex-col items-center gap-3 transform transition-transform duration-500"
              style={{
                transform: isHovered ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {/* Product Details on Hover */}
              <div className="text-white space-y-2">
                <h4 className="font-instrument-serif text-xl font-medium line-clamp-2">
                  {product.title}
                </h4>
                
                {sellerName && (
                  <p className="text-sm font-instrument-sans opacity-90">
                    {sellerName}
                  </p>
                )}

                {/* Price on hover */}
                <div className="flex items-center justify-center gap-2">
                  {hasDiscount ? (
                    <>
                      <p className="font-instrument-sans font-medium text-lg">
                        {displayPrice}
                      </p>
                      <p className="text-sm line-through opacity-70">
                        {originalPrice}
                      </p>
                    </>
                  ) : (
                    <p className="font-instrument-sans font-semibold text-lg">
                      {displayPrice || '0 zł'}
                    </p>
                  )}
                </div>
              </div>
              
              {/* "Zobacz produkt" CTA */}
              <span className="text-white font-instrument-serif text-base flex items-center gap-2 mt-2">
                Zobacz produkt
                <ArrowRightIcon size={20} color="white" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Info Section */}
      <Link href={`/products/${product.handle}`}>
        <div className="flex justify-between p-4 bg-primary">
          <div className="w-full">
            <h3 className="heading-sm truncate">{product.title}</h3>
            {/* Seller name below title */}
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
