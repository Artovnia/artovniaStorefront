"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createContext, useContext, useEffect, useState } from "react"
import NProgress from "nprogress"

// Configure NProgress
import "nprogress/nprogress.css"

// Custom styles for NProgress
const NPROGRESS_STYLES = `
  #nprogress {
    pointer-events: none;
  }
  
  #nprogress .bar {
    background: #e11d48;
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
  }
  
  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #e11d48, 0 0 5px #e11d48;
    opacity: 1.0;
    transform: rotate(3deg) translate(0px, -4px);
  }
`

// Configure NProgress
NProgress.configure({
  minimum: 0.1,
  easing: "ease",
  speed: 300,
  showSpinner: false,
  trickleSpeed: 100,
})

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
  const router = useRouter()

  // Start loading indicator
  const startLoading = () => {
    setIsLoading(true)
    NProgress.start()
  }

  // Stop loading indicator
  const stopLoading = () => {
    setIsLoading(false)
    NProgress.done()
  }

  // Reset loading state when route changes
  useEffect(() => {
    stopLoading()
  }, [pathname, searchParams])

  // Listen for navigation events
  useEffect(() => {
    const handleStart = () => {
      startLoading()
    }

    const handleStop = () => {
      stopLoading()
    }

    // Add event listeners for route changes
    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("routeChangeStart", handleStart)
    window.addEventListener("routeChangeComplete", handleStop)
    window.addEventListener("routeChangeError", handleStop)

    // Intercept clicks on links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (link && 
          link.href && 
          link.href.startsWith(window.location.origin) && 
          !link.hasAttribute("download") && 
          !link.target) {
        // Start loading indicator immediately on click
        startLoading()
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("routeChangeStart", handleStart)
      window.removeEventListener("routeChangeComplete", handleStop)
      window.removeEventListener("routeChangeError", handleStop)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      <style dangerouslySetInnerHTML={{ __html: NPROGRESS_STYLES }} />
      {children}
    </LoadingContext.Provider>
  )
}
