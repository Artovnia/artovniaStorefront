import { detectUserCountry } from '@/lib/helpers/country-detection'
import { CountrySelector } from './CountrySelector'

/**
 * Server component wrapper for CountrySelector
 * Detects current country and passes it to the client component
 */
export async function CountrySelectorWrapper() {
  const currentCountry = await detectUserCountry()
  
  return <CountrySelector currentCountry={currentCountry} />
}
