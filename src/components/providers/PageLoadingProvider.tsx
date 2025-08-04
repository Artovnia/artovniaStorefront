"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * COMPREHENSIVE LOADING SOLUTION
 * Handles both initial page loads and navigation with immediate feedback
 */

interface PageLoadingContextType {
  isLoading: boolean
  loadingProgress: number
  loadingMessage: string
}

const PageLoadingContext = createContext<PageLoadingContextType>({
  isLoading: false,
  loadingProgress: 0,
  loadingMessage: ""
})

export const usePageLoading = () => useContext(PageLoadingContext)

export function PageLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true) // Start loading for initial page
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("Loading page...")
  
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)

  // Simulate realistic loading progress
  const startLoadingProgress = (message: string = "Loading...") => {
    setLoadingMessage(message)
    setLoadingProgress(0)
    
    let progress = 0
    progressInterval.current = setInterval(() => {
      progress += Math.random() * 15 + 5 // Increment 5-20%
      
      // Slow down as we approach completion
      if (progress > 70) {
        progress += Math.random() * 5 + 2 // Slower increment
      }
      
      if (progress > 95) {
        progress = 95 // Cap at 95% until real completion
      }
      
      setLoadingProgress(progress)
    }, 150)
  }

  const completeLoading = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
    
    // Complete progress animation
    setLoadingProgress(100)
    setLoadingMessage("Complete!")
    
    // Hide loading after brief completion animation
    setTimeout(() => {
      setIsLoading(false)
      setLoadingProgress(0)
    }, 300)
  }

  // Handle initial page load
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      
      // Start loading progress for initial page
      startLoadingProgress("Loading categories...")
      
      // Auto-complete initial loading after reasonable time
      loadingTimeout.current = setTimeout(() => {
        completeLoading()
      }, 2000) // 2 seconds for initial load
      
      return () => {
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current)
        }
      }
    }
  }, [])

  // Handle navigation changes
  useEffect(() => {
    if (!isInitialLoad.current) {
      // Start loading for navigation
      setIsLoading(true)
      startLoadingProgress("Navigating...")
      
      // Complete navigation loading
      const navTimeout = setTimeout(() => {
        completeLoading()
      }, 1000) // Shorter for navigation
      
      return () => clearTimeout(navTimeout)
    }
  }, [pathname, searchParams])

  // Handle click events for immediate feedback
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link?.href && 
          link.href.startsWith(window.location.origin) && 
          !link.hasAttribute('download') && 
          !link.target) {
        
        // Start loading immediately on click
        setIsLoading(true)
        startLoadingProgress("Loading...")
      }
    }

    document.addEventListener('click', handleClick, { passive: true })
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current)
      }
    }
  }, [])

  return (
    <PageLoadingContext.Provider value={{ isLoading, loadingProgress, loadingMessage }}>
      {children}
    </PageLoadingContext.Provider>
  )
}

/**
 * ENHANCED LOADING OVERLAY
 * Provides immediate, highly visible feedback
 */
export function PageLoadingOverlay() {
  const { isLoading, loadingProgress, loadingMessage } = usePageLoading()

  if (!isLoading) return null

  return (
    <>
      {/* Top progress bar - immediately visible */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      
      {/* Cursor feedback */}
      <style jsx global>{`
        * {
          cursor: wait !important;
        }
      `}</style>
      
      {/* Loading indicator */}
      <div className="fixed top-4 right-4 z-[9998] bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">{loadingMessage}</span>
            <span className="text-xs text-gray-500">{Math.round(loadingProgress)}%</span>
          </div>
        </div>
      </div>
      
      {/* Subtle overlay */}
      <div className="fixed inset-0 z-[9997] bg-white/5 backdrop-blur-[0.5px] pointer-events-none" />
    </>
  )
}
