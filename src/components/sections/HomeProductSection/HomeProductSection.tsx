import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"

export const HomeProductSection = ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  products = [],
  home = false,
  theme = 'default',
  fullWidth = false,
  headingFont = 'font-instrument-serif',
  headingSpacing = 'mb-6',
  isSellerSection = false,
  user = null,
  wishlist = [],
  noMobileMargin = false,
}: {
  heading: string
  locale?: string
  products?: Product[]
  home?: boolean
  theme?: 'default' | 'light' | 'dark'
  fullWidth?: boolean
  headingFont?: string
  headingSpacing?: string
  textTransform?: string
  isSellerSection?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  noMobileMargin?: boolean
}) => {
  // ✅ OPTIMIZED: Removed BatchPriceProvider - uses parent provider from ProductDetailsPage
  // This eliminates duplicate batch requests and shares price data cache
  return (
    <section className={`w-full h-full flex flex-col justify-center items-center ${fullWidth ? 'relative' : ''}`}>
      {/* If fullWidth is true, add a background div that extends beyond parent container */}
      {fullWidth && (
        <div 
          className="absolute top-0 bottom-0 bg-inherit" 
          style={{ 
            width: '100vw', 
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            zIndex: -1
          }}
        />
      )}
      
      <div className="w-full mx-auto flex flex-col justify-center items-center py-8">
        <h2 className={`${headingSpacing} heading-lg font-bold tracking-tight ${theme === 'dark' ? 'text-black' : 'text-white'} ${headingFont}  text-center`}>
          {heading}
        </h2>

        <div className="w-full flex justify-center">
          <HomeProductsCarousel
            locale={locale}
            sellerProducts={products.slice(0, 8)}
            home={home}
            theme={theme}
            isSellerSection={isSellerSection}
            user={user}
            wishlist={wishlist}
            noMobileMargin={noMobileMargin}
          />
        </div>
      </div>
    </section>
  )
}