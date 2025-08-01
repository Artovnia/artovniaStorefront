// DEPRECATED: This component has been removed to fix performance issues.
// NavigationProgress was causing conflicts with LoadingProvider.tsx due to:
// 1. Duplicate NProgress configurations (speed: 500 vs 300)
// 2. Race conditions between event listeners
// 3. Redundant loading state management
//
// All navigation progress functionality is now handled by LoadingProvider.tsx
// which provides better performance and eliminates conflicts.
//
// If you need to use navigation progress, import and use LoadingProvider instead.

export function NavigationProgress() {
  console.warn('NavigationProgress is deprecated. Use LoadingProvider instead.')
  return null
}
