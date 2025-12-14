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

interface MobileRegionModalProps {
  isOpen: boolean
  onClose: () => void
  regions: HttpTypes.StoreRegion[]
  currentRegionId?: string
  onRegionChanged?: () => Promise<void>
}

// Map region names to display info (same as CountrySelector)
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

export const MobileRegionModal = ({ isOpen, onClose, regions, currentRegionId, onRegionChanged }: MobileRegionModalProps) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Convert regions to display format
  const regionDisplays = regions.map(getRegionDisplay)
  
  // Find current region or default to first
  const currentRegion = currentRegionId 
    ? regionDisplays.find(r => r.id === currentRegionId) || regionDisplays[0]
    : regionDisplays[0]

  const handleRegionChange = async (regionId: string) => {
    onClose()
    
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-primary rounded-t-3xl shadow-2xl border-t border-[#3B3634]/20 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-primary border-b border-[#3B3634]/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#3B3634] font-instrument-sans">
                Wybierz swój region
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#3B3634]/10 transition-colors"
                aria-label="Zamknij"
              >
                <svg className="w-5 h-5 text-[#3B3634]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Region List */}
          <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-4 py-3">
            <div className="space-y-2">
              {regionDisplays.map((region, index) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionChange(region.id)}
                  disabled={isPending || region.id === currentRegion?.id}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl",
                    "text-left font-semibold transition-all duration-200",
                    "group relative overflow-hidden animate-in fade-in slide-in-from-bottom-2",
                    "font-instrument-sans",
                    {
                      "bg-[#3B3634] text-white shadow-lg": region.id === currentRegion?.id,
                      "bg-white/60 text-[#3B3634] hover:bg-white hover:shadow-md active:scale-[0.98]": region.id !== currentRegion?.id,
                      "opacity-50 cursor-not-allowed": isPending
                    }
                  )}
                >
                  {/* Hover gradient effect */}
                  {region.id !== currentRegion?.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3B3634]/0 via-[#3B3634]/5 to-[#3B3634]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  <span className="text-2xl relative z-10">{region.flag}</span>
                  <span className="text-base relative z-10 flex-1">{region.name}</span>
                  
                  {region.id === currentRegion?.id && (
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Safe Area */}
          <div className="h-6 bg-primary" />
        </div>
      </div>
    </>
  )
}