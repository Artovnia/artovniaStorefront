"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useLoading } from "./LoadingProvider"

/**
 * NavigationHandler - Properly integrates with Next.js App Router
 * This component uses Next.js router methods to handle navigation
 * and coordinates with LoadingProvider for loading states
 */
export function NavigationHandler() {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()

  useEffect(() => {
    // Enhanced link click handler that works with Next.js
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (!link || !link.href) return
      
      // Skip external links, downloads, and links with targets
      if (!link.href.startsWith(window.location.origin) || 
          link.hasAttribute("download") || 
          link.target) {
        return
      }
      
      // Skip if it's the same page
      try {
        const currentPath = window.location.pathname + window.location.search
        const targetUrl = new URL(link.href)
        const targetPath = targetUrl.pathname + targetUrl.search
        
        if (currentPath === targetPath) {
          return
        }
        
        // Prevent default navigation and use Next.js router
        e.preventDefault()
        
        // Start loading immediately
        startLoading()
        
        // Use Next.js router for navigation
        router.push(link.href)
        
        // Safety timeout
        setTimeout(() => {
          stopLoading()
        }, 10000)
        
      } catch (error) {
        console.warn("Navigation error:", error)
        // Let default navigation happen if our custom handling fails
      }
    }

    // Use capture phase to intercept clicks before other handlers
    document.addEventListener("click", handleLinkClick, { capture: true })

    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true } as any)
    }
  }, [router, startLoading, stopLoading])

  return null
}
