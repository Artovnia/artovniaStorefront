/**
 * Frontend-only view tracking system using localStorage
 * No backend changes required
 */

interface ProductView {
  productId: string
  viewCount: number
  lastViewed: number
  firstViewed: number
}

interface ViewTrackingData {
  views: Record<string, ProductView>
  totalViews: number
  lastUpdated: number
}

const STORAGE_KEY = 'artovnia_product_views'
const STORAGE_VERSION = '1.0'

class ViewTracker {
  private data: ViewTrackingData

  constructor() {
    this.data = this.loadFromStorage()
  }

  private loadFromStorage(): ViewTrackingData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate data structure
        if (parsed.version === STORAGE_VERSION && parsed.data) {
          return parsed.data
        }
      }
    } catch (error) {
      console.warn('Failed to load view tracking data:', error)
    }

    // Return default structure
    return {
      views: {},
      totalViews: 0,
      lastUpdated: Date.now()
    }
  }

  private saveToStorage(): void {
    try {
      const toStore = {
        version: STORAGE_VERSION,
        data: this.data,
        savedAt: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    } catch (error) {
      console.warn('Failed to save view tracking data:', error)
    }
  }

  /**
   * Track a product view
   */
  trackView(productId: string): void {
    const now = Date.now()
    
    if (this.data.views[productId]) {
      // Update existing view
      this.data.views[productId].viewCount++
      this.data.views[productId].lastViewed = now
    } else {
      // Create new view record
      this.data.views[productId] = {
        productId,
        viewCount: 1,
        lastViewed: now,
        firstViewed: now
      }
    }

    this.data.totalViews++
    this.data.lastUpdated = now
    this.saveToStorage()
  }

  /**
   * Get view count for a specific product
   */
  getViewCount(productId: string): number {
    return this.data.views[productId]?.viewCount || 0
  }

  /**
   * Get all products sorted by view count
   */
  getMostViewedProducts(limit: number = 10): Array<{ productId: string; viewCount: number; lastViewed: number }> {
    return Object.values(this.data.views)
      .sort((a, b) => {
        // Primary sort: view count
        if (a.viewCount !== b.viewCount) {
          return b.viewCount - a.viewCount
        }
        // Secondary sort: most recently viewed
        return b.lastViewed - a.lastViewed
      })
      .slice(0, limit)
      .map(view => ({
        productId: view.productId,
        viewCount: view.viewCount,
        lastViewed: view.lastViewed
      }))
  }

  /**
   * Get trending products (high views in recent time)
   */
  getTrendingProducts(limit: number = 10, daysBack: number = 7): Array<{ productId: string; viewCount: number; trendScore: number }> {
    const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000)
    
    return Object.values(this.data.views)
      .filter(view => view.lastViewed > cutoffTime)
      .map(view => {
        // Calculate trend score based on recent activity
        const daysSinceLastView = (Date.now() - view.lastViewed) / (24 * 60 * 60 * 1000)
        const recencyBonus = Math.max(0, (daysBack - daysSinceLastView) / daysBack)
        const trendScore = view.viewCount * (1 + recencyBonus)
        
        return {
          productId: view.productId,
          viewCount: view.viewCount,
          trendScore
        }
      })
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit)
  }

  /**
   * Get analytics data
   */
  getAnalytics() {
    const views = Object.values(this.data.views)
    const now = Date.now()
    const last24h = now - (24 * 60 * 60 * 1000)
    const last7days = now - (7 * 24 * 60 * 60 * 1000)

    // Find most viewed product with proper type handling
    const mostViewedProduct = views.length > 0 
      ? views.reduce((max, current) => 
          current.viewCount > max.viewCount ? current : max
        )
      : null

    return {
      totalProducts: views.length,
      totalViews: this.data.totalViews,
      viewsLast24h: views.filter(v => v.lastViewed > last24h).reduce((sum, v) => sum + v.viewCount, 0),
      viewsLast7days: views.filter(v => v.lastViewed > last7days).reduce((sum, v) => sum + v.viewCount, 0),
      mostViewedProduct,
      lastUpdated: this.data.lastUpdated
    }
  }

  /**
   * Clear all tracking data (for privacy/testing)
   */
  clearData(): void {
    this.data = {
      views: {},
      totalViews: 0,
      lastUpdated: Date.now()
    }
    this.saveToStorage()
  }

  /**
   * Export data for backup/analysis
   */
  exportData(): ViewTrackingData {
    return { ...this.data }
  }
}

// Create singleton instance
export const viewTracker = new ViewTracker()

// React hook for easy usage in components
export function useViewTracker() {
  return {
    trackView: (productId: string) => viewTracker.trackView(productId),
    getViewCount: (productId: string) => viewTracker.getViewCount(productId),
    getMostViewed: (limit?: number) => viewTracker.getMostViewedProducts(limit),
    getTrending: (limit?: number, daysBack?: number) => viewTracker.getTrendingProducts(limit, daysBack),
    getAnalytics: () => viewTracker.getAnalytics(),
    clearData: () => viewTracker.clearData()
  }
}
