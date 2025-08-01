"use client"

import { useLoading } from "./LoadingProvider"
import { useEffect, useState } from "react"

/**
 * LoadingOverlay component that shows immediately when navigation starts
 * This provides instant visual feedback (under 10ms) when a user clicks a link
 */
export function LoadingOverlay() {
  const { isLoading } = useLoading()
  const [showSpinner, setShowSpinner] = useState(false)
  
  // Only show spinner if loading takes more than 50ms
  // This provides faster feedback while preventing flashing
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowSpinner(true)
      }, 50)
    } else {
      setShowSpinner(false)
    }
    
    return () => {
      clearTimeout(timeout)
    }
  }, [isLoading])
  
  if (!isLoading) return null
  
  return (
    <div 
      className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300 flex items-center justify-center"
      style={{ opacity: showSpinner ? 1 : 0 }}
    >
      {showSpinner && (
        <div className="relative">
          {/* Elegant spinner animation */}
          <div className="w-16 h-16 relative">
            <div className="absolute w-full h-full rounded-full border-4 border-solid border-gray-200"></div>
            <div className="absolute w-full h-full rounded-full border-4 border-solid border-primary border-t-transparent animate-spin"></div>
          </div>
          
          {/* Loading text */}
          <div className="mt-4 text-center text-primary font-medium">Loading...</div>
        </div>
      )}
    </div>
  )
}
