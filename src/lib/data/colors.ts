import { useState, useEffect } from 'react'
import { sdk } from '../config'
import { getAuthHeaders } from '@/lib/data/cookies'

/**
 * Color family type definition
 */
export interface Color {
  id: string
  name: string
  display_name: string
  hex_code: string
  family_id: string
  sort_order: number
  synonyms: string[] // Add synonyms field
}

/**
 * Color family type definition
 */
export interface ColorFamily {
  id: string
  name: string
  display_name: string
  hex_base: string
  sort_order: number
  colors: Color[]
}

/**
 * Fetches color taxonomy from API with proper authentication
 */
export const fetchColorTaxonomy = async (): Promise<ColorFamily[]> => {
  try {
    // Get authentication headers (same as other working endpoints)
    const headers = {
      ...(await getAuthHeaders()),
    }
    
    // Use SDK client like other working endpoints
    const response = await sdk.client.fetch<{
      color_taxonomy: ColorFamily[]
      count: number
    }>('/store/product-colors', {
      method: 'GET',
      headers,
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['color-taxonomy'],
      }
    })
    
    if (response.color_taxonomy && Array.isArray(response.color_taxonomy)) {
      return response.color_taxonomy;
    }
    
    return [];
    
  } catch (error) {
    // Don't fall back to mock data - return empty array to show the real issue
    return [];
  }
}

// Simple localStorage utils to avoid dependency on external hook
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    return defaultValue
  }
}

const saveToLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // Silently fail
  }
}

/**
 * Hook to get color families with caching and proper authentication
 */
export const useColorTaxonomy = () => {
  const [colorTaxonomy, setColorTaxonomy] = useState<ColorFamily[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const CACHE_KEY = "color-taxonomy"
  // Cache for 24 hours
  const CACHE_TIME = 24 * 60 * 60 * 1000
  
  useEffect(() => {
    const getCachedData = () => {
      return getFromLocalStorage<{data: ColorFamily[], timestamp: number}>(
        CACHE_KEY, 
        { data: [], timestamp: 0 }
      )
    }
    
    // Check if we have valid cache
    const cachedData = getCachedData()
    const isCacheValid = 
      cachedData && 
      (Date.now() - cachedData.timestamp) < CACHE_TIME &&
      cachedData.data.length > 0
      
    // Use cache if valid
    if (isCacheValid) {
      setColorTaxonomy(cachedData.data)
      return
    }
    
    // Otherwise fetch fresh data
    const fetchColors = async () => {
      setIsLoading(true)
      try {
        const data = await fetchColorTaxonomy()
        
        if (data.length > 0) {
          setColorTaxonomy(data)
          
          // Update cache
          saveToLocalStorage(CACHE_KEY, {
            data,
            timestamp: Date.now()
          })
        } else {
          setColorTaxonomy([])
        }
        
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch color taxonomy'))
        setColorTaxonomy([]) // Don't use mock data
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchColors()
  }, [CACHE_KEY, CACHE_TIME, fetchColorTaxonomy, setColorTaxonomy, setIsLoading, setError])

  return {
    colorTaxonomy,
    isLoading,
    error
  }
}