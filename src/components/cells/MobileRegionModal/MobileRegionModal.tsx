"use client"

import { useState, useTransition } from 'react'
import { updateUserCountry } from '@/lib/helpers/country-detection'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

interface Country {
  code: string
  name: string
  flag: string
}

const SUPPORTED_COUNTRIES: Country[] = [
  { code: 'pl', name: 'Polska', flag: '🇵🇱' },
  { code: 'de', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'cz', name: 'Česko', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovensko', flag: '🇸🇰' },
  { code: 'at', name: 'Österreich', flag: '🇦🇹' },
]

interface MobileRegionModalProps {
  isOpen: boolean
  onClose: () => void
  currentCountry?: string
}

export const MobileRegionModal = ({ isOpen, onClose, currentCountry }: MobileRegionModalProps) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Detect current country from cookie if not provided
  const [detectedCountry, setDetectedCountry] = useState<string>(() => {
    if (currentCountry) return currentCountry
    
    // Try to get from cookie
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return undefined
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return undefined
    }
    
    return getCookie('user_country') || 'pl'
  })

  const activeCountry = currentCountry || detectedCountry

  const handleCountryChange = async (countryCode: string) => {
    onClose()
    
    // Update country preference and cart region
    startTransition(async () => {
      try {
        // Update user's country preference in cookie
        await updateUserCountry(countryCode)
        
        // Update existing cart's region if cart exists
        const { updateRegion } = await import('@/lib/data/cart')
        await updateRegion(countryCode, window.location.pathname)
        
        // Refresh the page to reload with new region
        router.refresh()
      } catch (error) {
        console.error('Error updating country:', error)
        // Still refresh to show the new country
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
          <div className="sticky top-0 bg-primary border-b border-[#3B3634]/10 px-6 py-4">
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

          {/* Country List */}
          <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-4 py-4">
            <div className="space-y-2">
              {SUPPORTED_COUNTRIES.map((country, index) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  disabled={isPending || country.code === activeCountry}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  className={clsx(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl",
                    "text-left font-semibold transition-all duration-200",
                    "group relative overflow-hidden animate-in fade-in slide-in-from-bottom-2",
                    "font-instrument-sans",
                    {
                      "bg-[#3B3634] text-white shadow-lg": country.code === activeCountry,
                      "bg-white/60 text-[#3B3634] hover:bg-white hover:shadow-md active:scale-[0.98]": country.code !== activeCountry,
                      "opacity-50 cursor-not-allowed": isPending
                    }
                  )}
                >
                  {/* Hover gradient effect */}
                  {country.code !== activeCountry && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3B3634]/0 via-[#3B3634]/5 to-[#3B3634]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  <span className="text-3xl relative z-10">{country.flag}</span>
                  <span className="text-lg relative z-10 flex-1">{country.name}</span>
                  
                  {country.code === activeCountry && (
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Safe Area */}
          <div className="h-8 bg-primary" />
        </div>
      </div>
    </>
  )
}
