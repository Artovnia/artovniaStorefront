/**
 * Country utility functions (client-safe, no server directive)
 */

/**
 * Get supported countries from your Medusa region
 * This should match the countries you've configured in Medusa Admin
 */
export function getSupportedCountries(): string[] {
  // TODO: You can fetch this from Medusa API or hardcode based on your region
  return ['pl', 'de', 'cz', 'sk', 'at'] // Example: Central Europe
}

/**
 * Validate if country is supported
 */
export function isCountrySupported(countryCode: string): boolean {
  const supported = getSupportedCountries()
  return supported.includes(countryCode.toLowerCase())
}
