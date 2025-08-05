import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  products = [],
  home = false,
  theme = 'default',
  fullWidth = false,
}: {
  heading: string
  locale?: string
  products?: Product[]
  home?: boolean
  theme?: 'default' | 'light' | 'dark'
  fullWidth?: boolean
}) => {
  // Create a full width container that goes edge to edge
  return (
    <section className={`py-8 w-full ${fullWidth ? 'relative' : ''}`}>
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
      
      <h2 className="mb-6 heading-lg font-bold tracking-tight uppercase font-instrument-serif text-white text-center">
        {heading}
      </h2>

      <HomeProductsCarousel
        locale={locale}
        sellerProducts={products.slice(0, 4)}
        home={home}
        theme={theme}
      />
    </section>
  )
}
