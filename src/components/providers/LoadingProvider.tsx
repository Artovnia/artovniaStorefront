"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"

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
  const [isNavigating, setIsNavigating] = useState(false)

  // Start loading indicator
  const startLoading = () => {
    setIsLoading(true)
  }

  // Stop loading indicator
  const stopLoading = () => {
    setIsLoading(false)
    setIsNavigating(false)
  }

  // Handle navigation state changes
  useEffect(() => {
    if (isNavigating) {
      // If we were navigating, stop loading when route changes
      stopLoading()
    }
  }, [pathname, searchParams, isNavigating])

  // Simple click detection without interference
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      // Only detect internal navigation links
      if (link && 
          link.href && 
          link.href.startsWith(window.location.origin) && 
          !link.hasAttribute("download") && 
          !link.target &&
          !e.defaultPrevented) {
        
        try {
          const currentPath = window.location.pathname + window.location.search
          const targetUrl = new URL(link.href)
          const targetPath = targetUrl.pathname + targetUrl.search
          
          // Only start loading for different routes
          if (currentPath !== targetPath) {
            setIsNavigating(true)
            startLoading()
            
            // Safety timeout
            setTimeout(() => {
              stopLoading()
            }, 10000)
          }
        } catch (error) {
          // Ignore URL parsing errors
        }
      }
    }

    // Listen for browser back/forward
    const handlePopState = () => {
      setIsNavigating(true)
      startLoading()
      // Let the pathname/searchParams useEffect handle stopping
    }

    // Listen for page unload
    const handleBeforeUnload = () => {
      startLoading()
    }

    document.addEventListener("click", handleLinkClick, { passive: true })
    window.addEventListener("popstate", handlePopState)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("click", handleLinkClick)
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
