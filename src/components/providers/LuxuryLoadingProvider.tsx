"use client"

import React, { createContext, useContext, useState } from "react"

interface LuxuryLoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const LuxuryLoadingContext = createContext<LuxuryLoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export const useLuxuryLoading = () => useContext(LuxuryLoadingContext)

/**
 * SIMPLE LUXURY LOADING PROVIDER
 * Clean, non-blocking loading state management
 */
export function LuxuryLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => {
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  return (
    <LuxuryLoadingContext.Provider value={{ 
      isLoading, 
      startLoading, 
      stopLoading 
    }}>
      {children}
    </LuxuryLoadingContext.Provider>
  )
}

/**
 * SIMPLE LUXURY LOADING OVERLAY
 * Classy spinner with overlay - non-blocking
 */
export function LuxuryLoadingOverlay() {
  const { isLoading } = useLuxuryLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
        {/* Classy gold spinner */}
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        
        {/* Elegant loading text */}
        <div className="text-gray-700 font-medium text-lg">
          Ładowanie...
        </div>
      </div>
    </div>
  )
}
