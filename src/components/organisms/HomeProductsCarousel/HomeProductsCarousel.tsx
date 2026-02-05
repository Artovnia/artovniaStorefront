"use client"

import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { Hit } from "instantsearch.js"
import { SerializableWishlist } from "@/types/wishlist"

export const HomeProductsCarousel = ({
  locale,
  sellerProducts,
  home,
  theme = 'default',
  isSellerSection = false,
  user = null,
  wishlist = [],
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
  theme?: 'default' | 'light' | 'dark'
  isSellerSection?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
}) => {
  try {
    // ✅ CONVERTED TO CLIENT COMPONENT: Now can access React Context from parent providers
    // Products are always passed as props from parent server component
    // This allows ProductCard to access PromotionDataProvider and BatchPriceProvider contexts
    
    const displayProducts = sellerProducts || [];
    
    if (!displayProducts.length) {
      return (
        <div className="flex justify-center w-full py-8">
          <p className={theme === 'light' ? 'text-gray-300' : 'text-gray-500'}>No products available</p>
        </div>
      );
    }
    
    // Optimize product card creation with better type safety
    const productCards = displayProducts
      .slice(0, home ? 16 : 19) // Limit displayed products
      .map((product, index) => {  // ✅ Add index parameter
        if (!product?.id) return null;
        
        const typedProduct = {
          ...product,
          id: String(product.id),
          handle: (product as any).handle || String(product.id),
          title: product.title || "Untitled Product",
          thumbnail: (product as any).images?.[0]?.url || (product as any).thumbnail || "/images/product/placeholder.jpg"
        };
        
        return (
          <ProductCard
            key={typedProduct.id}
            product={typedProduct as unknown as Hit<HttpTypes.StoreProduct>}
            themeMode={theme === 'light' ? 'light' : 'default'}
            user={user}
            wishlist={wishlist}
            index={index}  // ✅ Pass index for priority loading
            isSellerSection={isSellerSection}  // ✅ Force lazy loading for seller products
          />
        );
      })
      .filter(Boolean);
    
    if (!productCards.length) {
      return (
        <div className="flex justify-center w-full py-8">
          <p className={theme === 'light' ? 'text-gray-300' : 'text-gray-500'}>No valid products to display</p>
        </div>
      );
    }
    
    return (
      <div className="w-full max-w-full">
        <Carousel
          align="start"
          items={productCards}
          theme={theme}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in HomeProductsCarousel:", error);
    // Return a fallback UI instead of null
    return (
      <div className="flex justify-center w-full py-8">
        <p className="text-red-500">Unable to load products. Please try again later.</p>
      </div>
    );
  }
}