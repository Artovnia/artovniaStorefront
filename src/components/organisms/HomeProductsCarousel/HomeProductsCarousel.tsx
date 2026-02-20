"use client"

import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { Hit } from "instantsearch.js"
import { SerializableWishlist } from "@/types/wishlist"
import { useMemo } from "react"

export const HomeProductsCarousel = ({
  locale,
  sellerProducts,
  home,
  theme = 'default',
  isSellerSection = false,
  user = null,
  wishlist = [],
  noMobileMargin = false,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
  theme?: 'default' | 'light' | 'dark'
  isSellerSection?: boolean
  user?: HttpTypes.StoreCustomer | null
  wishlist?: SerializableWishlist[]
  noMobileMargin?: boolean
}) => {
  // ✅ OPTIMIZATION: Memoize product cards to prevent re-creation on wishlist changes
  // WishlistButton manages its own optimistic state, so we don't need to re-render
  // when wishlist prop changes. Only recreate when products or display settings change.
  const productCards = useMemo(() => {
    const displayProducts = sellerProducts || [];
    
    return displayProducts
      .slice(0, home ? 16 : 19)
      .map((product, index) => {
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
            index={index}
            isSellerSection={isSellerSection}
          />
        );
      })
      .filter(Boolean);
  }, [sellerProducts, home, theme, isSellerSection, user, wishlist]);

  if (!sellerProducts?.length) {
    return (
      <div className="flex justify-center w-full py-8" role="status">
        <p className={theme === 'light' ? 'text-gray-300' : 'text-gray-500'}>No products available</p>
      </div>
    );
  }
  
  if (!productCards.length) {
    return (
      <div className="flex justify-center w-full py-8" role="status">
        <p className={theme === 'light' ? 'text-gray-300' : 'text-gray-500'}>No valid products to display</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-full" role="region" aria-label="Karuzela produktów">
      <Carousel
        align="start"
        items={productCards}
        theme={theme}
        noMobileMargin={noMobileMargin}
      />
    </div>
  );
}