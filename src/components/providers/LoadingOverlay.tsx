"use client"

import { useLoading } from "./LoadingProvider"
import { useEffect, useState } from "react"

/**
 * CRITICAL FIX: Enhanced LoadingOverlay with immediate, highly visible feedback
 * Provides instant visual confirmation that navigation has started
 */
export function LoadingOverlay() {
  const { isLoading } = useLoading()
  const [showOverlay, setShowOverlay] = useState(false)
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    let progressInterval: NodeJS.Timeout
    
    if (isLoading) {
      // Show overlay IMMEDIATELY - no delay
      setShowOverlay(true)
      setProgress(0)
      
      // Simulate progress for better UX - starts immediately
      let currentProgress = 0
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15 + 5 // Random increment 5-20%
        if (currentProgress > 90) currentProgress = 90 // Cap at 90% until real completion
        setProgress(currentProgress)
      }, 200)
    } else {
      // Complete progress and hide
      setProgress(100)
      setTimeout(() => {
        setShowOverlay(false)
        setProgress(0)
      }, 300) // Brief delay to show completion
    }
    
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [isLoading])
  
  if (!showOverlay) return null

  return (
    <>
      {/* CRITICAL: Top progress bar - immediately visible */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* CRITICAL: Cursor indicator - shows immediate feedback */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <style jsx>{`
          * {
            cursor: wait !important;
          }
        `}</style>
      </div>
      
      {/* Enhanced overlay with better visibility */}
      <div className="fixed inset-0 z-[9997] bg-white/10 backdrop-blur-[1px]">
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    </>
  )
}
