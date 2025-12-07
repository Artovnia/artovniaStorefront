"use client"

import { useCart } from '@/components/context/CartContext'
import { ProductDetailsShipping } from './ProductDetailsShipping'
import { HttpTypes } from '@medusajs/types'
import { useEffect, useState } from 'react'

interface ProductDetailsShippingWrapperProps {
  product: HttpTypes.StoreProduct
  locale: string
}

/**
 * ✅ OPTIMIZED: Client wrapper that uses CartContext for region
 * Eliminates duplicate cart request by using shared cart state
 * Falls back to fetching default region if cart has no region
 */
export function ProductDetailsShippingWrapper({ 
  product, 
  locale 
}: ProductDetailsShippingWrapperProps) {
  const { cart } = useCart()
  const [fallbackRegion, setFallbackRegion] = useState<HttpTypes.StoreRegion | null>(null)
  
  // Get region from cart or fetch default
  const region = cart?.region || fallbackRegion
  
  // Fetch fallback region if cart has no region
  useEffect(() => {
    if (!cart?.region && !fallbackRegion) {
      import('@/lib/data/regions')
        .then(m => m.getRegion(locale))
        .then(region => setFallbackRegion(region || null))
        .catch(() => setFallbackRegion(null))
    }
  }, [cart?.region, locale, fallbackRegion])
  
  return <ProductDetailsShipping product={product} region={region} />
}
