/**
 * Format price number to currency string
 * @param amount - Price amount in cents
 * @param currencyCode - Currency code (e.g., 'PLN', 'USD')
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currencyCode: string): string {
  try {
    const formatter = new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    
    return formatter.format(amount) // Amount is already in main currency unit
  } catch (error) {
    // Fallback for unsupported currency codes
    const value = amount.toFixed(2)
    return `${value} ${currencyCode.toUpperCase()}`
  }
}

/**
 * Format price for Polish locale with 'zł' suffix
 * @param amount - Price amount in main currency unit
 * @returns Formatted price string with 'zł' suffix
 */
export function formatPricePLN(amount: number): string {
  const value = amount.toFixed(2)
  return `${value} zł`
}
