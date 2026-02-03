"use client"

import { useCart } from '@/components/context/CartContext'
import { ProductDetailsShipping } from './ProductDetailsShipping'
import { HttpTypes } from '@medusajs/types'
import { useEffect, useState } from 'react'

interface ProductDetailsShippingWrapperProps {
  product: HttpTypes.StoreProduct
  locale: string
  region?: HttpTypes.StoreRegion | null
}

/**
 * ✅ OPTIMIZED: Client wrapper that uses CartContext for region
 * Eliminates duplicate cart request by using shared cart state
 * Uses server-provided region as fallback (no client-side fetch)
 */
export function ProductDetailsShippingWrapper({ 
  product, 
  locale,
  region: serverRegion
}: ProductDetailsShippingWrapperProps) {
  const { cart } = useCart()
  
  // Use cart region first, then server-provided region, then null
  // No client-side fetch needed - region is passed from ProductDetailsPage
  const region = cart?.region || serverRegion
  
  return <ProductDetailsShipping product={product} region={region} />
}
