"use client"

// DEPRECATED: This component has been removed to fix performance issues.
// ClientNavigationProgress was dynamically importing the deprecated NavigationProgress
// which was causing the red loading bar to still appear.
//
// All navigation progress functionality is now handled by LoadingProvider.tsx
// which provides better performance and eliminates conflicts.
//
// If you need navigation progress, use LoadingProvider instead.

export function ClientNavigationProgress() {
  // Return null to prevent the red loading bar from appearing
  return null
}
