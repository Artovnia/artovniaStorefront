"use client"

import { useCart } from '@/components/context/CartContext'
import { CountrySelector } from './CountrySelector'
import { HttpTypes } from '@medusajs/types'
import { useCallback } from 'react'

interface CountrySelectorWrapperProps {
  regions: HttpTypes.StoreRegion[]
}

/**
 * ✅ OPTIMIZED: Client component that uses CartContext
 * Eliminates duplicate cart requests by using shared cart state
 * Regions are passed as props from server (safe - public data)
 */
export function CountrySelectorWrapper({ regions }: CountrySelectorWrapperProps) {
  const { cart, refreshCart } = useCart()
  
  // Show loading placeholder instead of disappearing
  if (!regions || regions.length === 0) {
    return (
      <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
    )
  }
  
  // Get current region from CartContext (no additional request needed!)
  const currentRegionId = cart?.region_id
  
  // ✅ Pass refreshCart to CountrySelector so it can update after region change
  return (
    <CountrySelector 
      regions={regions} 
      currentRegionId={currentRegionId}
      onRegionChanged={refreshCart}
    />
  )
}
