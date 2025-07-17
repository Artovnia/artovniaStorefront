/**
 * Utility functions for color handling
 */

/**
 * Converts a hex color code to a Tailwind-compatible background class
 * Falls back to a default color if the hex code is invalid
 */
export const hexToBgClass = (hex: string): string => {
  // If hex doesn't start with #, add it
  if (hex && !hex.startsWith('#')) {
    hex = '#' + hex
  }
  
  // Simple validation for hex format
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return 'bg-gray-300' // Default fallback color
  }
  
  // For now use inline style rather than Tailwind classes
  // since we don't know which specific colors will be used
  return hex
}
