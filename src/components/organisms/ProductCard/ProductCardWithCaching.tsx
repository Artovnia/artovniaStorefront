// src/components/organisms/ProductCard/ProductCardWithCaching.tsx
"use client"

import { useProductPricing, useProductAvailability } from '@/hooks/useProductPricing'
import { ProductCard } from './ProductCard'
import { HttpTypes } from '@medusajs/types'
import { Hit, BaseHit } from 'instantsearch.js'
import { SerializableWishlist } from '@/types/wishlist'

interface ProductCardWithCachingProps {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>
  sellerPage?: boolean
  themeMode?: 'default' | 'light' | 'dark'
  user?: any
  wishlist?: SerializableWishlist[]
  onWishlistChange?: () => void
}

/**
 * Enhanced ProductCard with caching for pricing and availability
 * This wrapper adds performance optimizations while maintaining the same API
 */
export const ProductCardWithCaching = (props: ProductCardWithCachingProps) => {
  const { product } = props
  
  // Use cached pricing data
  const { promotionalPricing, isLoading: isPricingLoading } = useProductPricing(
    product,
    product.variants?.[0]?.id
  )
  
  // Use cached availability data
  const { available, quantity, isLoading: isAvailabilityLoading } = useProductAvailability(
    product,
    product.variants?.[0]?.id
  )
  
  // Enhanced product object with cached data
  const enhancedProduct = {
    ...product,
    // Add cached promotional pricing to product
    _cached_promotional_pricing: promotionalPricing,
    _cached_availability: {
      available,
      quantity,
      isLoading: isAvailabilityLoading
    },
    // Add loading states
    _cache_loading: {
      pricing: isPricingLoading,
      availability: isAvailabilityLoading
    }
  }
  
  // Pass enhanced product to original ProductCard
  return <ProductCard {...props} product={enhancedProduct} />
}

/**
 * Helper hook for components that need to check if pricing data is cached
 */
export const useProductCardCache = (productId: string) => {
  // This could be expanded to provide cache status, invalidation methods, etc.
  return {
    invalidatePricing: () => {
      // Implementation would call unifiedCache.invalidateKey for pricing
    },
    invalidateAvailability: () => {
      // Implementation would call unifiedCache.invalidateKey for availability
    }
  }
}
