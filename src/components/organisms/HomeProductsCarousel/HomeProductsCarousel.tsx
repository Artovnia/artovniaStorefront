import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { Hit } from "instantsearch.js"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
  theme = 'default',
  isSellerSection = false,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
  theme?: 'default' | 'light' | 'dark'
  isSellerSection?: boolean
}) => {
  try {
    // Fetch user and wishlist data once for all ProductCards
    // Handle authentication gracefully - don't fail if user is not logged in
    let user: HttpTypes.StoreCustomer | null = null;
    let wishlist: SerializableWishlist[] = [];
    
    try {
      const customer = await retrieveCustomer();
      user = customer;
      
      // Only fetch wishlist if user is authenticated
      if (customer) {
        try {
          const wishlistData = await getUserWishlists();
          wishlist = wishlistData.wishlists || [];
        } catch (wishlistError) {
          console.warn('Failed to fetch wishlist data:', wishlistError);
          wishlist = [];
        }
      }
    } catch (authError) {
      // User is not authenticated - this is normal, don't log as error
      // Only log if it's not a 401 error
      if (authError && typeof authError === 'object' && 'status' in authError && authError.status !== 401) {
        console.warn('Authentication error (non-401):', authError);
      }
      user = null;
      wishlist = [];
    }
    
    // Prioritize provided products to avoid unnecessary API calls
    let products: any[] = [];
    
    // Only fetch all products if not in seller section or if no seller products provided
    if (!isSellerSection && (!sellerProducts || sellerProducts.length === 0)) {
      const result = await listProducts({
        countryCode: locale,
        queryParams: {
          limit: home ? 16 : 19, // Optimized limits
          order: "created_at",
        },
      });
      
      if (result?.response?.products) {
        products = result.response.products;
      }
    }
    
    const displayProducts = sellerProducts?.length ? sellerProducts : products;
    
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
      .map(product => {
        if (!product?.id) return null;
        
        const typedProduct = {
          ...product,
          id: String(product.id),
          handle: product.handle || String(product.id),
          title: product.title || "Untitled Product",
          thumbnail: product.images?.[0]?.url || product.thumbnail || "/images/product/placeholder.jpg"
        };
        
        return (
          <ProductCard
            key={typedProduct.id}
            product={typedProduct as unknown as Hit<HttpTypes.StoreProduct>}
            themeMode={theme === 'light' ? 'light' : 'default'}
            user={user}
            wishlist={wishlist}
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
