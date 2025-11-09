"use client"

import { useState, useTransition } from 'react'
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
  currentCountry = 'pl',
  className 
}: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const current = SUPPORTED_COUNTRIES.find(c => c.code === currentCountry) || SUPPORTED_COUNTRIES[0]

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
    <div className={clsx("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover",
          "transition-colors duration-200",
          "text-sm font-medium",
          {
            "opacity-50 cursor-not-allowed": isPending
          }
        )}
        aria-label="Select country"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <svg 
          className={clsx(
            "w-4 h-4 transition-transform duration-200",
            { "rotate-180": isOpen }
          )} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-ui-border-base z-50">
            <div className="py-1">
              {SUPPORTED_COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  disabled={isPending || country.code === currentCountry}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-2",
                    "text-left text-sm transition-colors",
                    {
                      "bg-ui-bg-subtle font-medium": country.code === currentCountry,
                      "hover:bg-ui-bg-subtle-hover": country.code !== currentCountry,
                      "opacity-50 cursor-not-allowed": isPending
                    }
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                  {country.code === currentCountry && (
                    <svg className="w-4 h-4 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
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
