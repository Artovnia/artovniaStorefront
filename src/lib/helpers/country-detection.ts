"use server"

import { cookies, headers } from 'next/headers'

/**
 * Country detection utility
 * Detects user's country from various sources with fallback chain
 */

const COUNTRY_COOKIE_NAME = 'user_country'
const DEFAULT_COUNTRY = 'pl' // Poland as fallback

/**
 * Get country from cookie
 */
export async function getCountryFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const countryCookie = cookieStore.get(COUNTRY_COOKIE_NAME)
    return countryCookie?.value || null
  } catch (error) {
    return null
  }
}

/**
 * Set country cookie
 */
export async function setCountryCookie(countryCode: string): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.set(COUNTRY_COOKIE_NAME, countryCode.toLowerCase(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
  } catch (error) {
    console.error('Error setting country cookie:', error)
  }
}

/**
 * Detect country from Cloudflare headers
 * Cloudflare adds CF-IPCountry header automatically
 */
async function getCountryFromCloudflare(): Promise<string | null> {
  try {
    const headersList = await headers()
    const cfCountry = headersList.get('cf-ipcountry')
    
    if (cfCountry && cfCountry !== 'XX') {
      return cfCountry.toLowerCase()
    }
  } catch (error) {
    // Headers not available in this context
  }
  return null
}

/**
 * Detect country from Vercel headers
 * Vercel adds x-vercel-ip-country header
 */
async function getCountryFromVercel(): Promise<string | null> {
  try {
    const headersList = await headers()
    const vercelCountry = headersList.get('x-vercel-ip-country')
    
    if (vercelCountry && vercelCountry !== 'XX') {
      return vercelCountry.toLowerCase()
    }
  } catch (error) {
    // Headers not available in this context
  }
  return null
}

/**
 * Detect country from Accept-Language header
 * This is less accurate but works as a fallback
 */
async function getCountryFromLanguage(): Promise<string | null> {
  try {
    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language')
    
    if (acceptLanguage) {
      // Parse Accept-Language header
      // Example: "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7"
      const languages = acceptLanguage.split(',')
      
      for (const lang of languages) {
        const parts = lang.trim().split('-')
        if (parts.length === 2) {
          const country = parts[1].split(';')[0].toLowerCase()
          // Validate it's a 2-letter country code
          if (country.length === 2) {
            return country
          }
        }
      }
    }
  } catch (error) {
    // Headers not available in this context
  }
  return null
}

/**
 * Main country detection function
 * Uses fallback chain: Cookie → Cloudflare → Vercel → Language → Default
 */
export async function detectUserCountry(): Promise<string> {
  // 1. Check cookie first (user preference)
  const cookieCountry = await getCountryFromCookie()
  if (cookieCountry) {
    return cookieCountry
  }

  // 2. Try Cloudflare geolocation
  const cfCountry = await getCountryFromCloudflare()
  if (cfCountry) {
    // 🔒 FIX: Don't set cookie in read operation (Server Component)
    // Cookie will be set when user manually selects country
    return cfCountry
  }

  // 3. Try Vercel geolocation
  const vercelCountry = await getCountryFromVercel()
  if (vercelCountry) {
    // 🔒 FIX: Don't set cookie in read operation (Server Component)
    return vercelCountry
  }

  // 4. Try Accept-Language header
  const langCountry = await getCountryFromLanguage()
  if (langCountry) {
    // 🔒 FIX: Don't set cookie in read operation (Server Component)
    return langCountry
  }

  // 5. Fallback to default
  // 🔒 FIX: Don't set cookie in read operation (Server Component)
  return DEFAULT_COUNTRY
}

/**
 * Update user's country preference
 * This is called when user manually selects a country
 */
export async function updateUserCountry(countryCode: string): Promise<void> {
  await setCountryCookie(countryCode)
}

// Note: Non-async utility functions moved to country-utils.ts
// to avoid "Server Actions must be async" error
