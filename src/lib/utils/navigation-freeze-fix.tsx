/**
 * CRITICAL FIX: Navigation Freeze Issue
 * Fixes the infinite loading state when navigating to the same route
 */

import React, { useCallback, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Track navigation state to prevent freezes
let navigationState = {
  isNavigating: false,
  currentPath: '',
  lastNavigationTime: 0,
  pendingNavigation: null as NodeJS.Timeout | null
}

/**
 * Safe navigation hook that prevents freeze when navigating to current route
 */
export const useSafeNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const mountedRef = useRef(true)

  useEffect(() => {
    navigationState.currentPath = pathname
    navigationState.isNavigating = false
    
    // Clear any pending navigation when route actually changes
    if (navigationState.pendingNavigation) {
      clearTimeout(navigationState.pendingNavigation)
      navigationState.pendingNavigation = null
    }

    return () => {
      mountedRef.current = false
    }
  }, [pathname])

  const navigate = useCallback((url: string, options?: { replace?: boolean; force?: boolean }) => {
    const now = Date.now()
    
    // Prevent rapid successive navigation calls
    if (now - navigationState.lastNavigationTime < 100) {
      console.log('🚫 Navigation throttled (too rapid):', url)
      return
    }

    // CRITICAL FIX: Check if navigating to current route
    const isSameRoute = url === pathname || url === navigationState.currentPath
    
    if (isSameRoute && !options?.force) {
      console.log('🚫 Navigation blocked (same route):', url, 'current:', pathname)
      return // Don't navigate to the same route
    }

    // Prevent navigation if already navigating
    if (navigationState.isNavigating) {
      console.log('🚫 Navigation blocked (already navigating):', url)
      return
    }

    console.log('✅ Safe navigation to:', url, 'from:', pathname)
    
    navigationState.isNavigating = true
    navigationState.lastNavigationTime = now
    
    // Clear any existing pending navigation
    if (navigationState.pendingNavigation) {
      clearTimeout(navigationState.pendingNavigation)
    }

    // Set timeout to reset navigation state if it gets stuck
    navigationState.pendingNavigation = setTimeout(() => {
      if (navigationState.isNavigating) {
        console.warn('⚠️ Navigation timeout detected, forcing reset')
        navigationState.isNavigating = false
        navigationState.pendingNavigation = null
      }
    }, 5000) // 5 second timeout

    try {
      if (options?.replace) {
        router.replace(url)
      } else {
        router.push(url)
      }
    } catch (error) {
      console.error('❌ Navigation error:', error)
      navigationState.isNavigating = false
      if (navigationState.pendingNavigation) {
        clearTimeout(navigationState.pendingNavigation)
        navigationState.pendingNavigation = null
      }
    }
  }, [router, pathname])

  const refresh = useCallback(() => {
    console.log('🔄 Safe refresh')
    router.refresh()
  }, [router])

  const back = useCallback(() => {
    console.log('⬅️ Safe back navigation')
    navigationState.isNavigating = true
    navigationState.lastNavigationTime = Date.now()
    
    // Set timeout for back navigation
    navigationState.pendingNavigation = setTimeout(() => {
      navigationState.isNavigating = false
      navigationState.pendingNavigation = null
    }, 3000)
    
    router.back()
  }, [router])

  return { 
    navigate, 
    refresh, 
    back,
    isNavigating: navigationState.isNavigating,
    currentPath: pathname
  }
}

/**
 * Force reset navigation state (emergency function)
 */
export const forceResetNavigation = () => {
  console.log('🆘 Force resetting navigation state')
  navigationState.isNavigating = false
  navigationState.lastNavigationTime = 0
  
  if (navigationState.pendingNavigation) {
    clearTimeout(navigationState.pendingNavigation)
    navigationState.pendingNavigation = null
  }
}

/**
 * Enhanced Link component that prevents same-route navigation
 */
interface SafeLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  children: React.ReactNode
  replace?: boolean
}

export const SafeLink = ({ 
  href, 
  children, 
  replace = false, 
  className = '',
  onClick,
  ...props 
}: SafeLinkProps) => {
  const { navigate, currentPath } = useSafeNavigation()

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e)
    }
    
    // Use safe navigation
    navigate(href, { replace })
  }, [href, replace, navigate, onClick])

  const isCurrent = href === currentPath

  return (
    <a
      href={href}
      className={`${className} ${isCurrent ? 'current-route' : ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}

/**
 * Debug function to check navigation state
 */
export const debugNavigationState = () => {
  console.log('🔍 Navigation State Debug:', {
    isNavigating: navigationState.isNavigating,
    currentPath: navigationState.currentPath,
    lastNavigationTime: new Date(navigationState.lastNavigationTime).toISOString(),
    hasPendingNavigation: !!navigationState.pendingNavigation
  })
}
