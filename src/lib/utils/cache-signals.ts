"use client"
import React from 'react' 
import { unifiedCache } from './unified-cache'

interface CacheSignal {
  type: 'inventory_updated' | 'price_updated' | 'promotion_updated' | 'product_updated'
  data: {
    productIds?: string[]
    variantIds?: string[]
    categoryIds?: string[]
    promotionCodes?: string[]
  }
}

class CacheSignalManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000

  connect() {
    if (typeof window === 'undefined') return // Server-side skip

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:9000'
      this.ws = new WebSocket(`${wsUrl}/cache-signals`)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const signal: CacheSignal = JSON.parse(event.data)
          this.handleCacheSignal(signal)
        } catch (error) {
          console.error('Failed to parse cache signal:', error)
        }
      }

      this.ws.onclose = () => {
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('Cache signals WebSocket error:', error)
      }

    } catch (error) {
      console.error('Failed to connect to cache signals WebSocket:', error)
    }
  }

  private async handleCacheSignal(signal: CacheSignal) {
    switch (signal.type) {
      case 'inventory_updated':
        await unifiedCache.invalidate(['inventory', 'products'])
        break
        
      case 'price_updated':
        await unifiedCache.invalidate(['prices', 'promotions'])
        break
        
      case 'promotion_updated':
        await unifiedCache.invalidate(['promotions', 'prices', 'products'])
        break
        
      case 'product_updated':
        await unifiedCache.invalidate(['products'])
        if (signal.data.productIds) {
          // Invalidate specific product cache keys
          for (const productId of signal.data.productIds) {
            await unifiedCache.invalidateKey(`product:${productId}`)
          }
        }
        break
    }

    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('cache-invalidated', { 
      detail: signal 
    }))
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect()
      }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export const cacheSignalManager = new CacheSignalManager()

// Auto-connect in browser environment
if (typeof window !== 'undefined') {
  cacheSignalManager.connect()
}

// Hook for components to listen to cache invalidation events
export const useCacheInvalidation = (callback: (signal: CacheSignal) => void) => {
    React.useEffect(() => { 
      const handleInvalidation = (event: CustomEvent<CacheSignal>) => {
        callback(event.detail)
      }
  
      window.addEventListener('cache-invalidated', handleInvalidation as EventListener)
      
      return () => {
        window.removeEventListener('cache-invalidated', handleInvalidation as EventListener)
      }
    }, [callback])
  }