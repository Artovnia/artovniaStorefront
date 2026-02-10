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
  
  // ✅ OPTIMIZATION: Default to Poland region immediately (no loading state)
  // Find Poland region from server-provided regions
  const polandRegion = regions.find(r => 
    r.name === 'Poland' || 
    r.name === 'Polska' ||
    r.countries?.some(c => c.iso_2?.toLowerCase() === 'pl')
  )
  
  // Show Poland flag immediately while regions load
  if (!regions || regions.length === 0) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-primary border border-[#3B3634]/20">
        <span className="text-xl">🇵🇱</span>
      </div>
    )
  }
  
  // Get current region from CartContext, default to Poland
  const currentRegionId = cart?.region_id || polandRegion?.id
  
  // ✅ Pass refreshCart to CountrySelector so it can update after region change
  return (
    <CountrySelector 
      regions={regions} 
      currentRegionId={currentRegionId}
      onRegionChanged={refreshCart}
    />
  )
}
