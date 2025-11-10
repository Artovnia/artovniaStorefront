"use client"

import { useState, useTransition, useEffect } from 'react'
import { updateUserCountry } from '@/lib/helpers/country-detection'
import { getSupportedCountries } from '@/lib/helpers/country-utils'
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

interface CountrySelectorProps {
  currentCountry?: string
  className?: string
}

export const CountrySelector = ({ 
  currentCountry,
  className 
}: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [detectedCountry, setDetectedCountry] = useState<string>(currentCountry || 'pl')
  const router = useRouter()

  // Client-side country detection if not provided via props
  useEffect(() => {
    if (!currentCountry) {
      // Try to get from cookie using document.cookie
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
        return undefined
      }
      
      const cookieCountry = getCookie('user_country')
      if (cookieCountry && SUPPORTED_COUNTRIES.find(c => c.code === cookieCountry)) {
        setDetectedCountry(cookieCountry)
      }
    }
  }, [currentCountry])

  const activeCountry = currentCountry || detectedCountry
  const current = SUPPORTED_COUNTRIES.find(c => c.code === activeCountry) || SUPPORTED_COUNTRIES[0]

  const handleCountryChange = async (countryCode: string) => {
    setIsOpen(false)
    
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

  return (
    <div className={clsx("relative font-instrument-sans", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={clsx(
          "flex items-center gap-2 px-4 py-2.5 ",
          "bg-primary hover:bg-[#F4F0EB]/80",
          "border border-[#3B3634]/20 hover:border-[#3B3634]/40",
          "transition-all duration-300 ease-out",
          "text-sm font-semibold text-[#3B3634]",
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#3B3634]/0 via-[#3B3634]/5 to-[#3B3634]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
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
          <div className="absolute left-0 mt-3 min-w-[25rem] bg-primary shadow-2xl border border-[#3B3634]/30 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#3B3634]/5  blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3B3634]/10 relative">
              <h3 className="text-sm font-bold text-[#3B3634] font-instrument-sans">
                Wybierz swój region
              </h3>
            </div>
            
            <div className="py-2 relative">
              {SUPPORTED_COUNTRIES.map((country, index) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  disabled={isPending || country.code === activeCountry}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                  className={clsx(
                    "w-full flex items-center gap-3 px-2 py-2 mx-2 ",
                    "text-left font-semibold transition-all duration-200",
                    "group relative overflow-hidden animate-in fade-in slide-in-from-left-2",
                    {
                      "bg-[#3B3634] text-white shadow-md": country.code === activeCountry,
                      "text-[#3B3634] hover:bg-white/60 hover:shadow-sm": country.code !== activeCountry,
                      "opacity-50 cursor-not-allowed": isPending
                    }
                  )}
                >
                  {/* Hover gradient effect */}
                  {country.code !== activeCountry && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3B3634]/0 via-[#3B3634]/5 to-[#3B3634]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  <span className="text-xl relative z-10">{country.flag}</span>
                  <span className="relative z-10">{country.name}</span>
                  {country.code === activeCountry && (
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
