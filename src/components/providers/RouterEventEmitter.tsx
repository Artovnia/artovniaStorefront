"use client"

/**
 * RouterEventEmitter - DEPRECATED
 * This component has been removed to prevent conflicts with LoadingProvider
 * All navigation event handling is now centralized in LoadingProvider for better performance
 * and to eliminate race conditions that were causing navigation issues.
 */
export function RouterEventEmitter() {
  // This component is now a no-op to maintain backward compatibility
  // All navigation event logic has been moved to LoadingProvider
  return null
}
