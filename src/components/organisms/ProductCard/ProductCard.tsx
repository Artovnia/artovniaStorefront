"use client"
import Image from "next/image"

import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { Link } from "@/i18n/routing"
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { BaseHit, Hit } from "instantsearch.js"
import clsx from "clsx"
import { WishlistButton } from "@/components/cells/WishlistButton/WishlistButton"
import { useHoverPrefetch } from "@/hooks/useHoverPrefetch"
import { useRouter } from "next/navigation"

export const ProductCard = ({
  product,
  sellerPage = false,
}: {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>
  sellerPage?: boolean
}) => {
  const { prefetchOnHover } = useHoverPrefetch()
  const router = useRouter()
  const productUrl = `/products/${product.handle}`
  
  // Fallback prefetch method that works even if hook fails
  const handleMouseEnter = () => {
    try {
      router.prefetch(productUrl)
    } catch (error) {
      console.error('❌ Fallback prefetch failed for:', productUrl, error)
    }
  }
  
  // Debug: Log ProductCard render and hover setup
  if (process.env.NODE_ENV === 'development') {
    
  }
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const { cheapestPrice: sellerCheapestPrice } = getSellerProductPrice({
    product,
  })

  return (
    <div
      className={clsx(
        "relative group border rounded-sm flex flex-col h-full",
        {
          "w-[250px] lg:w-[370px] p-2": sellerPage,
          "w-full p-1": !sellerPage, // Use full width of container, let carousel control sizing
        }
      )}
      {...prefetchOnHover(productUrl)}
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative w-full bg-primary aspect-square flex-shrink-0">
        {/* <div className="absolute right-3 top-3 z-10 cursor-pointer">
          <WishlistButton productId={product.id} />
        </div> */}
        <Link href={productUrl} prefetch={true}>
          <div className="overflow-hidden rounded-sm w-full h-full flex justify-center items-center">
            {product.thumbnail ? (
              <Image
                src={decodeURIComponent(product.thumbnail)}
                alt={product.title}
                width={320}
                height={320}
                className="object-cover aspect-square w-full object-center h-full lg:group-hover:scale-105 transition-all duration-300 rounded-xs"
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
        <Link href={productUrl} prefetch={true}>
          <Button className="absolute bg-[#3B3634] opacity-90  ring ring-[#3B3634]   text-white h-auto lg:h-[48px] lg:group-hover:block hidden w-full uppercase bottom-1 z-10">
            Zobacz więcej
          </Button>
        </Link>
      </div>
      <Link href={`/products/${product.handle}`}>
        <div className="flex justify-between p-3 flex-grow">
          <div className="w-full">
            <h3 className="text-sm font-medium truncate mb-2 leading-tight">{product.title}</h3>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">
                {sellerCheapestPrice?.calculated_price ||
                  cheapestPrice?.calculated_price}
              </p>
              {sellerCheapestPrice?.calculated_price
                ? sellerCheapestPrice?.calculated_price !==
                    sellerCheapestPrice?.original_price && (
                    <p className="text-xs text-gray-500 line-through">
                      {sellerCheapestPrice?.original_price}
                    </p>
                  )
                : cheapestPrice?.calculated_price !==
                    cheapestPrice?.original_price && (
                    <p className="text-xs text-gray-500 line-through">
                      {cheapestPrice?.original_price}
                    </p>
                  )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}