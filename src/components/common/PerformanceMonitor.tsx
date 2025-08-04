"use client"

import { useEffect, useState } from "react"
import { globalDeduplicator, measurementDeduplicator, productDeduplicator, imageDeduplicator } from "@/lib/utils/performance"

interface PerformanceStats {
  globalDeduplicator: any
  measurementDeduplicator: any
  productDeduplicator: any
  imageDeduplicator: any
  pageLoadTime: number | null
  renderCount: number
}

export const PerformanceMonitor = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
  }, []) // Empty dependency array to run only once

  useEffect(() => {
    // Track page load time
    const pageLoadTime = performance.timing 
      ? performance.timing.loadEventEnd - performance.timing.navigationStart
      : null

    const updateStats = () => {
      setStats({
        globalDeduplicator: globalDeduplicator.getStats(),
        measurementDeduplicator: measurementDeduplicator.getStats(),
        productDeduplicator: productDeduplicator.getStats(),
        imageDeduplicator: imageDeduplicator.getStats(),
        pageLoadTime,
        renderCount
      })
    }

    updateStats()
    
    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000)
    
    return () => clearInterval(interval)
  }, [renderCount])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const toggleVisibility = () => setIsVisible(!isVisible)

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg hover:bg-blue-600 z-50"
        title="Show Performance Stats"
      >
        📊 Perf
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm text-xs z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Performance Monitor</h3>
        <button
          onClick={toggleVisibility}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {stats && (
        <div className="space-y-3">
          {/* Page Performance */}
          <div>
            <h4 className="font-semibold text-blue-600">Page Performance</h4>
            <div>Load Time: {stats.pageLoadTime ? `${stats.pageLoadTime}ms` : 'N/A'}</div>
            <div>Renders: {stats.renderCount}</div>
          </div>

          {/* Global Deduplicator */}
          <div>
            <h4 className="font-semibold text-green-600">Global Cache</h4>
            <div>Hit Rate: {(stats.globalDeduplicator.hitRate * 100).toFixed(1)}%</div>
            <div>Cache Size: {stats.globalDeduplicator.cache.size}/{stats.globalDeduplicator.cache.maxSize}</div>
            <div>Pending: {stats.globalDeduplicator.pendingRequests}</div>
          </div>

          {/* Measurements */}
          <div>
            <h4 className="font-semibold text-purple-600">Measurements</h4>
            <div>Hits: {stats.measurementDeduplicator.hits}</div>
            <div>Deduped: {stats.measurementDeduplicator.deduped}</div>
            <div>Errors: {stats.measurementDeduplicator.errors}</div>
            <div>Cache: {stats.measurementDeduplicator.cache.size} items</div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-orange-600">Products</h4>
            <div>Hits: {stats.productDeduplicator.hits}</div>
            <div>Deduped: {stats.productDeduplicator.deduped}</div>
            <div>Cache: {stats.productDeduplicator.cache.size} items</div>
          </div>

          {/* Images */}
          <div>
            <h4 className="font-semibold text-red-600">Images</h4>
            <div>Hits: {stats.imageDeduplicator.hits}</div>
            <div>Deduped: {stats.imageDeduplicator.deduped}</div>
            <div>Cache: {stats.imageDeduplicator.cache.size} items</div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t">
            <button
              onClick={() => {
                globalDeduplicator.clear()
                measurementDeduplicator.clear()
                productDeduplicator.clear()
                imageDeduplicator.clear()
                console.log('🧹 All caches cleared')
              }}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
            >
              Clear All Caches
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
