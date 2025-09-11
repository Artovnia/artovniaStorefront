import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"
import { BatchPriceProvider } from "@/components/context/BatchPriceProvider"

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  products = [],
  home = false,
  theme = 'default',
  fullWidth = false,
  headingFont = 'font-instrument-serif', // Default font for backward compatibility
  headingSpacing = 'mb-6', // Default spacing for backward compatibility
  isSellerSection = false, // Identifies if this component shows a specific seller's products
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
}) => {
  // Create a centered container that works within parent constraints
  return (
    <BatchPriceProvider currencyCode="PLN" days={30}>
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
              sellerProducts={products.slice(0, 4)}
              home={home}
              theme={theme}
              isSellerSection={isSellerSection}
            />
          </div>
        </div>
      </section>
    </BatchPriceProvider>
  )
}
