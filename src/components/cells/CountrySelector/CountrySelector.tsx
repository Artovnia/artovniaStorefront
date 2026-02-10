"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { HttpTypes } from '@medusajs/types'

interface RegionDisplay {
  id: string
  name: string
  flag: string
  countries: string[] // ISO codes
}

interface CountrySelectorProps {
  regions: HttpTypes.StoreRegion[]
  currentRegionId?: string
  className?: string
  onRegionChanged?: () => Promise<void>
}

// Map region names to display info
const getRegionDisplay = (region: HttpTypes.StoreRegion): RegionDisplay => {
  const name = region.name || 'Unknown'
  
  // Map region names to flags and display info
  const displayMap: Record<string, { flag: string; displayName?: string }> = {
    'Polska': { flag: '🇵🇱' },
    'Poland': { flag: '🇵🇱' },
    'EU': { flag: '🇪🇺', displayName: 'Europa' },
    'Europe': { flag: '🇪🇺', displayName: 'Europa' },
    // 'USA': { flag: '🇺🇸', displayName: 'Stany Zjednoczone' },
    // 'United States': { flag: '🇺🇸', displayName: 'Stany Zjednoczone' },
    // 'US': { flag: '🇺🇸', displayName: 'Stany Zjednoczone' },
    // 'Canada': { flag: '🇨🇦', displayName: 'Kanada' },
    // 'Kanada': { flag: '🇨🇦', displayName: 'Kanada' },
    // 'CA': { flag: '🇨🇦', displayName: 'Kanada' },
  }
  
  const display = displayMap[name] || { flag: '🌍' }
  
  return {
    id: region.id,
    name: display.displayName || name,
    flag: display.flag,
    countries: region.countries?.map(c => c.iso_2 || '') || []
  }
}

export const CountrySelector = ({ 
  regions,
  currentRegionId,
  className,
  onRegionChanged
}: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Convert regions to display format
  const regionDisplays = regions.map(getRegionDisplay)
  
  // Find Poland as default region
  const polandRegion = regionDisplays.find(r => 
    r.name === 'Poland' || 
    r.name === 'Polska' || 
    regions.find(reg => reg.id === r.id)?.name === 'Poland' ||
    regions.find(reg => reg.id === r.id)?.name === 'Polska'
  ) || regionDisplays[0]
  
  // Find current region or default to Poland
  const current = currentRegionId 
    ? regionDisplays.find(r => r.id === currentRegionId) || polandRegion
    : polandRegion

  const handleRegionChange = async (regionId: string) => {
    setIsOpen(false)
    
    // Update cart region
    startTransition(async () => {
      try {
        // Update existing cart's region or create new cart with selected region
        const { updateCartRegion } = await import('@/lib/data/cart')
        await updateCartRegion(regionId)
        
        // ✅ Refresh CartContext to get updated cart with new region
        if (onRegionChanged) {
          await onRegionChanged()
        }
        
        // ✅ Refresh server components to update prices and product data
        router.refresh()
      } catch (error) {
        console.error('Error updating region:', error)
        // Still refresh to show the new region
        router.refresh()
      }
    })
  }

  return (
    <div className={clsx("relative font-instrument-sans", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={clsx(
          "flex items-center gap-2 px-2 py-1.5",
          "bg-primary hover:bg-[#3B3634]",
          "border border-[#3B3634]/20 hover:border-[#3B3634]/40",
          "transition-all duration-300 ease-out",
          "text-sm font-normal text-[#3B3634] hover:text-white",
          "shadow-sm hover:shadow-md",
          "group relative overflow-hidden",
          {
            "opacity-50 cursor-not-allowed": isPending,
            "ring-2 ring-[#3B3634]/20": isOpen
          }
        )}
        aria-label="Select country"
      >
        {/* Decorative gradient on hover */}
        <div className="absolute inset-0  duration-300 pointer-events-none" />
        
        <span className="text-xl relative z-10">{current.flag}</span>
        <span className="hidden sm:inline relative z-10"></span>
        <svg 
          className={clsx(
            "w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-300 relative z-10",
            { "rotate-180": isOpen }
          )} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown with artistic styling */}
          <div className="absolute left-0 mt-3 w-64 bg-primary shadow-2xl border border-[#3B3634]/30 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300 rounded-sm">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#3B3634]/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3B3634]/10 relative">
              <h3 className="text-md font-semibold text-[#3B3634] font-instrument-sans">
                Wybierz swój region
              </h3>
            </div>
            
            <div className="py-2 relative">
              {regionDisplays.map((region, index) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionChange(region.id)}
                  disabled={isPending || region.id === current.id}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-2.5",
                    "text-left font-semibold transition-all duration-200",
                    "group/item relative overflow-hidden animate-in fade-in slide-in-from-left-2",
                    {
                      "bg-[#3B3634] text-white": region.id === current.id,
                      "text-[#3B3634] hover:bg-[#3B3634] hover:text-white": region.id !== current.id,
                      "opacity-50 cursor-not-allowed": isPending
                    }
                  )}
                >
                  <span className="text-xl relative z-10">{region.flag}</span>
                  <span className="relative z-10">{region.name}</span>
                  {region.id === current.id && (
                    <svg className="w-4 h-4 ml-auto relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}