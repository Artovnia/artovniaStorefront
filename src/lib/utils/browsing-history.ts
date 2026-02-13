/**
 * Browsing History Tracker
 * 
 * Tracks user browsing behavior for personalized recommendations.
 * This is what "marketing cookies" are actually used for in your case - 
 * NOT paid advertising, but improving user experience with recommendations.
 * 
 * Requires "functional" cookie consent (not "marketing" - that's for paid ads).
 */

interface ProductView {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: number
  category_id?: string
  category_name?: string
  seller_id?: string
  seller_name?: string
  viewed_at: number
}

interface SellerView {
  id: string
  name: string
  handle: string
  photo?: string
  viewed_at: number
}

interface CategoryView {
  id: string
  name: string
  handle: string
  viewed_at: number
}

const STORAGE_KEYS = {
  PRODUCTS: 'artovnia-viewed-products',
  SELLERS: 'artovnia-viewed-sellers',
  CATEGORIES: 'artovnia-viewed-categories',
  SEARCH_HISTORY: 'artovnia-search-history',
} as const

const LIMITS = {
  PRODUCTS: 50,      // Keep last 50 viewed products
  SELLERS: 20,       // Keep last 20 viewed sellers
  CATEGORIES: 10,    // Keep last 10 viewed categories
  SEARCH_TERMS: 20,  // Keep last 20 search terms
} as const

/**
 * Check if user has consented to functional cookies.
 * Browsing history requires functional cookie consent.
 * CookieConsent.tsx stores preferences in localStorage as:
 * { necessary: true, functional: true, analytics: true, ... }
 */
function hasConsentForTracking(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const consent = localStorage.getItem('artovnia-cookie-preferences')
    if (!consent) return false
    
    const preferences = JSON.parse(consent)
    return preferences.functional === true
  } catch (e) {
    console.error('Error checking consent:', e)
    return false
  }
}

/**
 * Track product view
 */
export function trackProductView(product: {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: number
  category_id?: string
  category_name?: string
  seller_id?: string
  seller_name?: string
}): void {
  if (!hasConsentForTracking()) return
  
  try {
    const viewed: ProductView[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'
    )
    
    // Remove if already exists (to update timestamp)
    const filtered = viewed.filter(p => p.id !== product.id)
    
    // Add to front with current timestamp
    filtered.unshift({
      ...product,
      viewed_at: Date.now()
    })
    
    // Keep only the limit
    const limited = filtered.slice(0, LIMITS.PRODUCTS)
    
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(limited))
  } catch (e) {
    console.error('Error tracking product view:', e)
  }
}

/**
 * Track seller profile view
 */
export function trackSellerView(seller: {
  id: string
  name: string
  handle: string
  photo?: string
}): void {
  if (!hasConsentForTracking()) return
  
  try {
    const viewed: SellerView[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SELLERS) || '[]'
    )
    
    const filtered = viewed.filter(s => s.id !== seller.id)
    
    filtered.unshift({
      ...seller,
      viewed_at: Date.now()
    })
    
    const limited = filtered.slice(0, LIMITS.SELLERS)
    
    localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(limited))
  } catch (e) {
    console.error('Error tracking seller view:', e)
  }
}

/**
 * Track category view
 */
export function trackCategoryView(category: {
  id: string
  name: string
  handle: string
}): void {
  if (!hasConsentForTracking()) return
  
  try {
    const viewed: CategoryView[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]'
    )
    
    const filtered = viewed.filter(c => c.id !== category.id)
    
    filtered.unshift({
      ...category,
      viewed_at: Date.now()
    })
    
    const limited = filtered.slice(0, LIMITS.CATEGORIES)
    
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(limited))
  } catch (e) {
    console.error('Error tracking category view:', e)
  }
}

/**
 * Track search term
 */
export function trackSearch(searchTerm: string): void {
  if (!hasConsentForTracking()) return
  if (!searchTerm.trim()) return
  
  try {
    const searches: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]'
    )
    
    // Remove if already exists
    const filtered = searches.filter(s => s.toLowerCase() !== searchTerm.toLowerCase())
    
    // Add to front
    filtered.unshift(searchTerm.trim())
    
    // Keep only the limit
    const limited = filtered.slice(0, LIMITS.SEARCH_TERMS)
    
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limited))
  } catch (e) {
    console.error('Error tracking search:', e)
  }
}

/**
 * Get recently viewed products
 */
export function getRecentlyViewedProducts(limit: number = 10): ProductView[] {
  if (!hasConsentForTracking()) return []
  
  try {
    const viewed: ProductView[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'
    )
    return viewed.slice(0, limit)
  } catch (e) {
    console.error('Error getting viewed products:', e)
    return []
  }
}

/**
 * Get recently viewed sellers
 */
export function getRecentlyViewedSellers(limit: number = 5): SellerView[] {
  if (!hasConsentForTracking()) return []
  
  try {
    const viewed: SellerView[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SELLERS) || '[]'
    )
    return viewed.slice(0, limit)
  } catch (e) {
    console.error('Error getting viewed sellers:', e)
    return []
  }
}

/**
 * Get recently viewed categories
 */
export function getRecentlyViewedCategories(limit: number = 5): CategoryView[] {
  if (!hasConsentForTracking()) return []
  
  try {
    const viewed: CategoryView[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]'
    )
    return viewed.slice(0, limit)
  } catch (e) {
    console.error('Error getting viewed categories:', e)
    return []
  }
}

/**
 * Get search history
 */
export function getSearchHistory(limit: number = 10): string[] {
  if (!hasConsentForTracking()) return []
  
  try {
    const searches: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]'
    )
    return searches.slice(0, limit)
  } catch (e) {
    console.error('Error getting search history:', e)
    return []
  }
}

/**
 * Get product recommendations based on browsing history
 * Returns category IDs and seller IDs that user is interested in
 */
export function getRecommendationContext(): {
  categoryIds: string[]
  sellerIds: string[]
  priceRange: { min: number; max: number } | null
} {
  if (!hasConsentForTracking()) {
    return { categoryIds: [], sellerIds: [], priceRange: null }
  }
  
  try {
    const products = getRecentlyViewedProducts(20)
    
    // Extract unique category IDs (most recent first)
    const categoryIds = Array.from(
      new Set(products.map(p => p.category_id).filter(Boolean) as string[])
    )
    
    // Extract unique seller IDs (most recent first)
    const sellerIds = Array.from(
      new Set(products.map(p => p.seller_id).filter(Boolean) as string[])
    )
    
    // Calculate price range from viewed products
    const prices = products.map(p => p.price).filter(Boolean) as number[]
    const priceRange = prices.length > 0
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices)
        }
      : null
    
    return { categoryIds, sellerIds, priceRange }
  } catch (e) {
    console.error('Error getting recommendation context:', e)
    return { categoryIds: [], sellerIds: [], priceRange: null }
  }
}

/**
 * Clear all browsing history (for privacy/GDPR compliance)
 */
export function clearBrowsingHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS)
    localStorage.removeItem(STORAGE_KEYS.SELLERS)
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES)
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
  } catch (e) {
    console.error('Error clearing browsing history:', e)
  }
}

/**
 * Clear browsing history when consent is withdrawn
 */
if (typeof window !== 'undefined') {
  window.addEventListener('cookie-consent-updated', () => {
    if (!hasConsentForTracking()) {
      clearBrowsingHistory()
    }
  })
}
