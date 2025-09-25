"use client"
import React from 'react' 
import { unifiedCache } from './unified-cache'

interface CacheSignal {
  type: 'inventory_updated' | 'price_updated' | 'promotion_updated' | 'product_updated' | 'cache_clear'
  data: {
    productIds?: string[]
    variantIds?: string[]
    categoryIds?: string[]
    promotionCodes?: string[]
    region?: string
  }
}

class CacheSignalManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3 // Reduced for production
  private reconnectInterval = 5000 // 5 seconds base interval
  private isReconnecting = false
  private shouldConnect = true
  private listeners = new Set<(signal: CacheSignal) => void>()

  // Disable WebSocket in production serverless environments
  private get shouldUseWebSocket(): boolean {
    if (typeof window === 'undefined') return false
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_ENV) {
      return false // Disable WebSocket in Vercel production
    }
    return !!process.env.NEXT_PUBLIC_WS_URL
  }

  connect() {
    if (!this.shouldUseWebSocket || this.isReconnecting) {
      console.log('Cache signals WebSocket disabled or already reconnecting')
      return
    }

    // Don't connect if we're in a production serverless environment
    if (process.env.NODE_ENV === 'production' && 
        (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview')) {
      console.log('🚫 Cache signals disabled in production serverless environment')
      return
    }

    this.cleanup()

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      if (!wsUrl) {
        console.warn('NEXT_PUBLIC_WS_URL not configured, cache signals disabled')
        return
      }

      console.log('🔌 Connecting to cache signals WebSocket...')
      this.ws = new WebSocket(`${wsUrl}/cache-signals`)

      // Set connection timeout
      const connectTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
          console.warn('WebSocket connection timeout')
          this.ws.close()
        }
      }, 10000) // 10 seconds timeout

      this.ws.onopen = () => {
        clearTimeout(connectTimeout)
        this.reconnectAttempts = 0
        this.isReconnecting = false
        console.log('✅ Cache signals WebSocket connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const signal: CacheSignal = JSON.parse(event.data)
          this.handleCacheSignal(signal)
        } catch (error) {
          console.error('Failed to parse cache signal:', error)
        }
      }

      this.ws.onclose = (event) => {
        clearTimeout(connectTimeout)
        console.log('🔌 Cache signals WebSocket closed:', event.code)
        
        if (this.shouldConnect && !event.wasClean) {
          this.attemptReconnect()
        }
      }

      this.ws.onerror = (error) => {
        clearTimeout(connectTimeout)
        console.error('Cache signals WebSocket error:', error)
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.attemptReconnect()
    }
  }

  private async handleCacheSignal(signal: CacheSignal) {
    console.log('📡 Received cache signal:', signal.type)

    try {
      switch (signal.type) {
        case 'inventory_updated':
          await unifiedCache.invalidate(['inventory', 'products'])
          break
          
        case 'price_updated':
          await unifiedCache.invalidate(['pricing', 'promotions'])
          break
          
        case 'promotion_updated':
          await unifiedCache.invalidate(['promotions', 'pricing', 'products'])
          break
          
        case 'product_updated':
          await unifiedCache.invalidate(['products'])
          
          // Invalidate specific product cache keys
          if (signal.data.productIds) {
            const invalidationPromises = signal.data.productIds.map(productId => 
              unifiedCache.invalidateKey(`product:details:${productId}`)
            )
            await Promise.allSettled(invalidationPromises)
          }
          break
          
        case 'cache_clear':
          unifiedCache.clear()
          break
      }

      // Notify all listeners
      this.listeners.forEach(listener => {
        try {
          listener(signal)
        } catch (error) {
          console.error('Error in cache signal listener:', error)
        }
      })

      // Dispatch custom event for backward compatibility
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cache-invalidated', { 
          detail: signal 
        }))
      }

    } catch (error) {
      console.error('Error handling cache signal:', error)
    }
  }

  private attemptReconnect() {
    if (!this.shouldConnect || this.isReconnecting) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('🚫 Max reconnection attempts reached, giving up')
      return
    }

    this.isReconnecting = true
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts)
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  private cleanup() {
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close()
      }
      
      this.ws = null
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting cache signals WebSocket')
    this.shouldConnect = false
    this.cleanup()
    this.listeners.clear()
  }

  // Subscribe to cache signals
  subscribe(listener: (signal: CacheSignal) => void): () => void {
    this.listeners.add(listener)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Get connection status
  getStatus(): {
    connected: boolean
    reconnectAttempts: number
    isReconnecting: boolean
    shouldUseWebSocket: boolean
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      reconnectAttempts: this.reconnectAttempts,
      isReconnecting: this.isReconnecting,
      shouldUseWebSocket: this.shouldUseWebSocket
    }
  }
}

export const cacheSignalManager = new CacheSignalManager()

// Enhanced hook for components to listen to cache invalidation events
export const useCacheInvalidation = (callback: (signal: CacheSignal) => void) => {
  React.useEffect(() => {
    // Use the new subscribe method for better cleanup
    const unsubscribe = cacheSignalManager.subscribe(callback)
    
    return unsubscribe
  }, [callback])
}

// Hook to get WebSocket connection status
export const useCacheSignalStatus = () => {
  const [status, setStatus] = React.useState(() => cacheSignalManager.getStatus())
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(cacheSignalManager.getStatus())
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return status
}

// Manual cache invalidation for testing/debugging
export const invalidateCache = {
  inventory: (productIds?: string[]) => {
    cacheSignalManager['handleCacheSignal']({
      type: 'inventory_updated',
      data: { productIds }
    })
  },
  
  pricing: (variantIds?: string[]) => {
    cacheSignalManager['handleCacheSignal']({
      type: 'price_updated', 
      data: { variantIds }
    })
  },
  
  products: (productIds?: string[]) => {
    cacheSignalManager['handleCacheSignal']({
      type: 'product_updated',
      data: { productIds }
    })
  },
  
  promotions: (promotionCodes?: string[]) => {
    cacheSignalManager['handleCacheSignal']({
      type: 'promotion_updated',
      data: { promotionCodes }
    })
  },
  
  all: () => {
    cacheSignalManager['handleCacheSignal']({
      type: 'cache_clear',
      data: {}
    })
  }
}

// Initialize connection only in development or when explicitly enabled
if (typeof window !== 'undefined') {
  // Only auto-connect in development or when NEXT_PUBLIC_CACHE_SIGNALS_ENABLED is true
  if (process.env.NODE_ENV === 'development' || 
      process.env.NEXT_PUBLIC_CACHE_SIGNALS_ENABLED === 'true') {
    cacheSignalManager.connect()
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cacheSignalManager.disconnect()
  })
}

// Export the signal interface for type checking
export type { CacheSignal }