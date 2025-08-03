"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { createContext, useContext, useEffect, useState, useRef } from "react"

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)
  const lastUrl = useRef<string>('')

  // Optimized start/stop functions with immediate feedback
  const startLoading = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsLoading(true)
    
    // Safety timeout - always stop loading after 8 seconds
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
    }, 8000)
  }

  const stopLoading = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLoading(false)
  }

  // Handle route changes - stop loading when navigation completes
  useEffect(() => {
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    // Skip initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastUrl.current = currentUrl
      return
    }
    
    // Only stop loading if URL actually changed
    if (lastUrl.current !== currentUrl) {
      stopLoading()
      lastUrl.current = currentUrl
    }
  }, [pathname, searchParams])

  // Single, optimized navigation handler
  useEffect(() => {
    const handleNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      // Skip if not a valid internal link
      if (!link?.href || 
          !link.href.startsWith(window.location.origin) || 
          link.hasAttribute('download') || 
          link.target || 
          e.defaultPrevented) {
        return
      }
      
      try {
        const currentUrl = window.location.pathname + window.location.search
        const targetUrl = new URL(link.href)
        const targetPath = targetUrl.pathname + targetUrl.search
        
        // Only start loading for different routes
        if (currentUrl !== targetPath) {
          startLoading()
        }
      } catch (error) {
        // Ignore URL parsing errors
      }
    }

    // Handle browser navigation
    const handlePopState = () => {
      startLoading()
    }

    // Handle page unload
    const handleBeforeUnload = () => {
      startLoading()
    }

    // Add event listeners with optimized options
    document.addEventListener('click', handleNavigation, { passive: true, capture: false })
    window.addEventListener('popstate', handlePopState, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload, { passive: true })

    return () => {
      document.removeEventListener('click', handleNavigation)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      // Cleanup timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
