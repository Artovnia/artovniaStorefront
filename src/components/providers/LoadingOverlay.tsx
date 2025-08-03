"use client"

import { useLoading } from "./LoadingProvider"
import { useEffect, useState } from "react"

/**
 * LoadingOverlay component that shows immediately when navigation starts
 * Provides instant visual feedback with optimized animations
 */
export function LoadingOverlay() {
  const { isLoading } = useLoading()
  const [showOverlay, setShowOverlay] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  
  useEffect(() => {
    let spinnerTimeout: NodeJS.Timeout
    
    if (isLoading) {
      // Show overlay immediately for instant feedback
      setShowOverlay(true)
      
      // Show spinner after minimal delay to prevent flashing on fast navigation
      spinnerTimeout = setTimeout(() => {
        setShowSpinner(true)
      }, 100)
    } else {
      // Hide immediately when loading stops
      setShowOverlay(false)
      setShowSpinner(false)
    }
    
    return () => {
      if (spinnerTimeout) {
        clearTimeout(spinnerTimeout)
      }
    }
  }, [isLoading])
  
  if (!showOverlay) return null
  
  return (
    <div 
      className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 pointer-events-none flex items-center justify-center"
      style={{ 
        opacity: showOverlay ? 1 : 0,
        transition: 'opacity 150ms ease-out'
      }}
    >
      {showSpinner && (
        <div className="relative animate-in fade-in duration-200">
          {/* Optimized spinner animation */}
          <div className="w-12 h-12 relative">
            <div className="absolute w-full h-full rounded-full border-3 border-solid border-gray-200/50"></div>
            <div className="absolute w-full h-full rounded-full border-3 border-solid border-primary border-t-transparent animate-spin"></div>
          </div>
          
          {/* Loading text */}
          <div className="mt-3 text-center text-primary font-medium text-sm">Loading...</div>
        </div>
      )}
    </div>
  )
}
