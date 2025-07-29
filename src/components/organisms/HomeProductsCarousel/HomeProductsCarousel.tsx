import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { Hit } from "instantsearch.js"

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
}) => {
  try {
    // Prioritize provided products to avoid unnecessary API calls
    let products: any[] = [];
    
    if (!sellerProducts || sellerProducts.length === 0) {
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
          <p className="text-gray-500">No products available</p>
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
          thumbnail: product.thumbnail || "/placeholder-product.jpg"
        };
        
        return (
          <ProductCard
            key={typedProduct.id}
            product={typedProduct as unknown as Hit<HttpTypes.StoreProduct>}
          />
        );
      })
      .filter(Boolean);
    
    if (!productCards.length) {
      return (
        <div className="flex justify-center w-full py-8">
          <p className="text-gray-500">No valid products to display</p>
        </div>
      );
    }
    
    return (
      <div className="w-full max-w-full max-h-[40rem] ">
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
