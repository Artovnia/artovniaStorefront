/**
 * CRITICAL PERFORMANCE: Sanity-specific caching and optimization utilities
 * Reduces Sanity API calls and improves blog loading performance
 */

import { RequestDeduplicator } from './performance'

// Sanity-specific request deduplicator with optimized settings
export const sanityDeduplicator = new RequestDeduplicator()

// Image URL optimization for Sanity images
export const optimizeSanityImageUrl = (imageRef: any, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png'
} = {}) => {
  if (!imageRef) return null
  
  const {
    width = 800,
    height = 600,
    quality = 85,
    format = 'webp'
  } = options
  
  // Build optimized Sanity image URL
  const baseUrl = imageRef.asset?._ref 
    ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${imageRef.asset._ref.replace('image-', '').replace('-webp', '.webp').replace('-jpg', '.jpg').replace('-png', '.png')}`
    : imageRef.url || imageRef
    
  if (typeof baseUrl !== 'string') return null
  
  // Add optimization parameters
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    q: quality.toString(),
    fm: format,
    fit: 'crop',
    crop: 'center'
  })
  
  return `${baseUrl}?${params.toString()}`
}

// Preload critical Sanity resources
export const preloadSanityResources = () => {
  if (typeof window === 'undefined') return
  
  // Preload Sanity CDN connection
  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = 'https://cdn.sanity.io'
  document.head.appendChild(link)
  
  // Preload Sanity API connection
  const apiLink = document.createElement('link')
  apiLink.rel = 'dns-prefetch'
  apiLink.href = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io`
  document.head.appendChild(apiLink)
}

// Cache key generators for consistent caching
export const generateSanityCacheKey = (query: string, params?: Record<string, any>) => {
  const paramString = params ? JSON.stringify(params) : ''
  return `sanity-${btoa(query + paramString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`
}

// Batch multiple Sanity queries for better performance
export const batchSanityQueries = async (
  client: any,
  queries: Array<{ query: string; params?: Record<string, any>; key: string }>
) => {
  const results = await Promise.allSettled(
    queries.map(({ query, params, key }) =>
      sanityDeduplicator.dedupe(key, () =>
        client.fetch(query, params, {
          cache: 'force-cache',
          next: { revalidate: 600 }
        })
      )
    )
  )
  
  return results.map((result, index) => ({
    key: queries[index].key,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }))
}

// Optimized GROQ query builder
export const buildOptimizedGroqQuery = (baseQuery: string, options: {
  limit?: number
  offset?: number
  orderBy?: string
  fields?: string[]
} = {}) => {
  const { limit, offset, orderBy = 'publishedAt desc', fields } = options
  
  let query = baseQuery
  
  // Add ordering
  if (orderBy) {
    query += ` | order(${orderBy})`
  }
  
  // Add pagination
  if (limit || offset) {
    const start = offset || 0
    const end = limit ? start + limit - 1 : ''
    query += `[${start}...${end}]`
  }
  
  // Add field projection if specified
  if (fields && fields.length > 0) {
    query += ` { ${fields.join(', ')} }`
  }
  
  return query
}
