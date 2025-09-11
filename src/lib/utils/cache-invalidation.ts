/**
 * Clean cache invalidation utilities for standalone Redis
 */

import { storefrontCache } from './storefront-cache'

export const invalidateCache = {
  // Product invalidation
  product: (handle: string, locale: string) => 
    storefrontCache.del(`product:${handle}:${locale}`),
    
  allProducts: (locale: string) => 
    storefrontCache.invalidatePattern(`product:*:${locale}`),
    
  // Price invalidation  
  prices: (currencyCode: string) => 
    storefrontCache.invalidatePattern(`prices:*:${currencyCode}:*`),
    
  specificVariantPrices: (variantIds: string[], currencyCode: string) => {
    const sortedIds = variantIds.sort().join(',')
    return storefrontCache.invalidatePattern(`prices:${sortedIds}:${currencyCode}:*`)
  },
    
  // Checkout invalidation
  checkout: (cartId?: string) => {
    if (cartId) {
      storefrontCache.del(`checkout:cart:${cartId}`)
    }
    storefrontCache.invalidatePattern('checkout:*')
  },
  
  // Clear everything
  all: () => storefrontCache.invalidatePattern('*')
}
