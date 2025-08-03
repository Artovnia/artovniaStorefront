"use client"

import React from "react"

interface HydrationEvent {
  timestamp: string
  event: string
  component?: string
  details?: any
  isProduction: boolean
  isVercel: boolean
  url: string
  userAgent: string
}

class HydrationLogger {
  private events: HydrationEvent[] = []
  private isClient = typeof window !== 'undefined'
  private startTime = this.isClient ? performance.now() : 0

  constructor() {
    if (this.isClient) {
      this.setupHydrationDetection()
    }
  }

  private setupHydrationDetection() {
    // Detect when React hydration starts
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      
      // Detect hydration errors
      if (message.includes('hydration') || 
          message.includes('Hydration') ||
          message.includes('server HTML') ||
          message.includes('client-side')) {
        this.logEvent('hydration_error', undefined, {
          errorMessage: message,
          args: args
        })
      }
      
      // Detect router errors
      if (message.includes('router') || 
          message.includes('navigation') ||
          message.includes('redirect')) {
        this.logEvent('router_error', undefined, {
          errorMessage: message,
          args: args
        })
      }
      
      originalConsoleError.apply(console, args)
    }

    // Detect when DOM is ready vs when React hydrates
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.logEvent('dom_ready')
      })
    } else {
      this.logEvent('dom_already_ready')
    }

    // Detect React hydration completion
    setTimeout(() => {
      this.logEvent('react_hydration_check', undefined, {
        reactRootExists: !!document.querySelector('[data-reactroot]'),
        hasReactFiber: !!(document.querySelector('*') as any)?._reactInternalFiber,
        timeSinceStart: performance.now() - this.startTime
      })
    }, 100)

    // Monitor for navigation events
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = (...args) => {
      this.logEvent('navigation_push_state', undefined, { args })
      return originalPushState.apply(history, args)
    }

    history.replaceState = (...args) => {
      this.logEvent('navigation_replace_state', undefined, { args })
      return originalReplaceState.apply(history, args)
    }

    window.addEventListener('popstate', (event) => {
      this.logEvent('navigation_popstate', undefined, { state: event.state })
    })

    // Monitor for unhandled promise rejections (common in navigation issues)
    window.addEventListener('unhandledrejection', (event) => {
      this.logEvent('unhandled_promise_rejection', undefined, {
        reason: event.reason,
        promise: event.promise
      })
    })
  }

  logEvent(event: string, component?: string, details?: any) {
    if (!this.isClient) return

    const hydrationEvent: HydrationEvent = {
      timestamp: new Date().toISOString(),
      event,
      component,
      details,
      isProduction: process.env.NODE_ENV === 'production',
      isVercel: process.env.VERCEL === '1',
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    this.events.push(hydrationEvent)

    // Log to console for immediate debugging
    console.log(`🔍 Hydration Event [${event}]:`, hydrationEvent)

    // Keep only last 50 events to prevent memory bloat
    if (this.events.length > 50) {
      this.events.splice(0, this.events.length - 50)
    }

    // Store in localStorage for persistence across page loads
    try {
      const existingLogs = JSON.parse(localStorage.getItem('hydrationLogs') || '[]')
      existingLogs.push(hydrationEvent)
      
      // Keep only last 100 events in localStorage
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }
      
      localStorage.setItem('hydrationLogs', JSON.stringify(existingLogs))
    } catch (error) {
      console.error('Failed to store hydration log:', error)
    }
  }

  logComponentMount(componentName: string, props?: any) {
    this.logEvent('component_mount', componentName, {
      props: props ? Object.keys(props) : undefined,
      mountTime: performance.now() - this.startTime
    })
  }

  logComponentUnmount(componentName: string) {
    this.logEvent('component_unmount', componentName, {
      unmountTime: performance.now() - this.startTime
    })
  }

  logNavigationAttempt(method: string, destination: string) {
    this.logEvent('navigation_attempt', undefined, {
      method,
      destination,
      currentUrl: window.location.href,
      timestamp: performance.now() - this.startTime
    })
  }

  logNavigationSuccess(destination: string) {
    this.logEvent('navigation_success', undefined, {
      destination,
      newUrl: window.location.href,
      timestamp: performance.now() - this.startTime
    })
  }

  logNavigationFailure(destination: string, error: any) {
    this.logEvent('navigation_failure', undefined, {
      destination,
      error: error.message || error,
      currentUrl: window.location.href,
      timestamp: performance.now() - this.startTime
    })
  }

  getEvents(): HydrationEvent[] {
    return [...this.events]
  }

  getStoredLogs(): HydrationEvent[] {
    if (!this.isClient) return []
    
    try {
      return JSON.parse(localStorage.getItem('hydrationLogs') || '[]')
    } catch {
      return []
    }
  }

  clearLogs() {
    this.events = []
    if (this.isClient) {
      localStorage.removeItem('hydrationLogs')
    }
  }

  exportLogs(): string {
    const allLogs = {
      currentSession: this.events,
      storedLogs: this.getStoredLogs(),
      exportTime: new Date().toISOString(),
      environment: {
        isProduction: process.env.NODE_ENV === 'production',
        isVercel: process.env.VERCEL === '1',
        userAgent: this.isClient ? navigator.userAgent : 'unknown',
        url: this.isClient ? window.location.href : 'unknown'
      }
    }
    
    return JSON.stringify(allLogs, null, 2)
  }
}

// Create singleton instance
export const hydrationLogger = new HydrationLogger()

// Helper hook for React components
export function useHydrationLogger(componentName: string, props?: any) {
  if (typeof window !== 'undefined') {
    // Log mount
    React.useEffect(() => {
      hydrationLogger.logComponentMount(componentName, props)
      
      return () => {
        hydrationLogger.logComponentUnmount(componentName)
      }
    }, [componentName])
  }
}

// Helper for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).hydrationLogger = hydrationLogger
  console.log('🔍 Hydration Logger available in console as window.hydrationLogger')
}
