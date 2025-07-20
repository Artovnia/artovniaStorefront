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
    // Only fetch products if we need them (when sellerProducts is empty)
    let products: any[] = [];
    
    if (!sellerProducts || sellerProducts.length === 0) {
      const result = await listProducts({
        countryCode: locale,
        queryParams: {
          limit: home ? 4 : 30, // Reduce limit to prevent too many products
          order: "created_at",
        },
      });
      
      if (result && result.response && result.response.products) {
        products = result.response.products;
      }
    }
    
    const displayProducts = sellerProducts?.length ? sellerProducts : products;
    
    if (!displayProducts.length) return null;
    
    // Create array of product cards
    const productCards = displayProducts.map(product => {
      if (!product || !product.id) return null;
      
      // Safely type-cast the product
      const typedProduct = {
        ...product,
        id: product.id?.toString() || "",
        handle: product.handle || product.id?.toString() || "",
        title: product.title || "",
        thumbnail: product.thumbnail || ""
      };
      
      return (
        <ProductCard
          key={typedProduct.id}
          product={typedProduct as unknown as Hit<HttpTypes.StoreProduct>}
        />
      );
    }).filter(Boolean); // Filter out any null items
    
    return (
      <div className="flex justify-center w-full">
        <Carousel
          align="start"
          items={productCards}
        />
      </div>
    );
  } catch (error) {
    console.error("Error in HomeProductsCarousel:", error);
    return null; // Return null on error to prevent component crashes
  }
}
