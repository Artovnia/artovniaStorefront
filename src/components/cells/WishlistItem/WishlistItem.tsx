import Link from "next/link"
import Image from "next/image"
import { SerializableWishlist } from "@/types/wishlist"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/atoms"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price"
import clsx from "clsx"

// Define extended product type with required properties
type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  calculated_amount: number
  currency_code: string
  handle: string
  thumbnail: string | null
  title: string
  id: string
}

export const WishlistItem = ({
  product,
  wishlist,
  user,
}: {
  product: ExtendedStoreProduct
  wishlist: SerializableWishlist[]
  user?: HttpTypes.StoreCustomer | null
}) => {
  // Get the price value - ensuring we always have something to display
  const price = product.calculated_amount || 0;
  const currency = product.currency_code || 'PLN';
  
  // Format price with the currency symbol
  let formattedPrice = '';
  
  if (currency === 'PLN') {
    formattedPrice = `${price} zł`;
  } else if (currency === 'USD') {
    formattedPrice = `$${price}`;
  } else {
    formattedPrice = `${price} ${currency}`;
  }
  
  // We won't try to use the complex price helpers since the product structure
  // from wishlist doesn't have the necessary variant information

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
            <div className="flex items-center gap-2 mt-2">
              <p className="font-instrument-sans font-semibold text-md">
                {formattedPrice}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
