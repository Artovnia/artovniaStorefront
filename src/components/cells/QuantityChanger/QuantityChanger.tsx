"use client"

import React, { useState, useCallback, useRef } from "react"
import { HttpTypes } from "@medusajs/types"

interface QuantityChangerProps {
  itemId: string
  cartId: string
  initialQuantity: number
  maxQuantity?: number // Stock limit
  minQuantity?: number
  unitPrice: number
  onQuantityChange?: (newQuantity: number, newTotal: number) => void
  disabled?: boolean
}

export const QuantityChanger = ({
  itemId,
  cartId,
  initialQuantity,
  maxQuantity = 999,
  minQuantity = 1,
  unitPrice,
  onQuantityChange,
  disabled = false
}: QuantityChangerProps) => {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastSyncedQuantity, setLastSyncedQuantity] = useState(initialQuantity)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced server sync to minimize API calls
  const syncToServer = useCallback(async (newQuantity: number) => {
    try {
      setIsUpdating(true)
      
      // Get auth token from browser cookies
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('_medusa_jwt='))
        ?.split('=')[1]
      
      // Get publishable key from environment variables
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
      
      if (!publishableKey) {
        throw new Error('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY environment variable is not set')
      }
      
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-publishable-api-key': publishableKey,
      }
      
      if (authToken) {
        headers['authorization'] = `Bearer ${authToken}`
      }
      
      // Get backend URL from environment variables
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      
      if (!backendUrl) {
        throw new Error('NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable is not set')
      }
      
      console.log('🔄 Syncing quantity to server:', { 
        cartId, 
        itemId, 
        quantity: newQuantity,
        previouslySynced: lastSyncedQuantity,
        backendUrl
      })
      
      const response = await fetch(`${backendUrl}/store/carts/${cartId}/line-items/${itemId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ quantity: newQuantity })
      })
      
      if (response.ok) {
        setLastSyncedQuantity(newQuantity)
        console.log('✅ Quantity synced successfully:', { itemId, quantity: newQuantity })
      } else {
        console.warn('⚠️ Server sync failed:', response.status, response.statusText)
        // Keep UI state - don't revert on server errors
      }
      
    } catch (error) {
      console.warn('⚠️ Server sync error:', error)
      // Keep UI state - don't revert on network errors
    } finally {
      setIsUpdating(false)
    }
  }, [cartId, itemId, lastSyncedQuantity])

  // Handle quantity changes with debouncing
  const handleQuantityChange = useCallback((newQuantity: number) => {
    // Validate bounds
    const clampedQuantity = Math.max(minQuantity, Math.min(maxQuantity, newQuantity))
    
    if (clampedQuantity === quantity) return // No change needed
    
    console.log('📊 Quantity changed:', { 
      itemId, 
      from: quantity, 
      to: clampedQuantity,
      maxStock: maxQuantity
    })
    
    // Update UI immediately
    setQuantity(clampedQuantity)
    
    // Calculate new total
    const newTotal = clampedQuantity * unitPrice
    
    // Notify parent component
    onQuantityChange?.(clampedQuantity, newTotal)
    
    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    
    // Debounce server sync (wait for user to stop clicking)
    syncTimeoutRef.current = setTimeout(() => {
      if (clampedQuantity !== lastSyncedQuantity) {
        syncToServer(clampedQuantity)
      }
    }, 300) // Reduced to 300ms for faster response
    
  }, [quantity, maxQuantity, minQuantity, unitPrice, onQuantityChange, syncToServer, lastSyncedQuantity, itemId])

  const handleDecrease = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleQuantityChange(quantity - 1)
  }, [quantity, handleQuantityChange])

  const handleIncrease = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleQuantityChange(quantity + 1)
  }, [quantity, handleQuantityChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minQuantity
    handleQuantityChange(value)
  }, [handleQuantityChange, minQuantity])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  const canDecrease = quantity > minQuantity && !disabled
  const canIncrease = quantity < maxQuantity && !disabled
  const showSyncIndicator = isUpdating || (quantity !== lastSyncedQuantity)

  return (
    <div className="flex items-center gap-1 border rounded bg-white">
      <button
        onClick={handleDecrease}
        disabled={!canDecrease}
        className="px-3 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={minQuantity}
        max={maxQuantity}
        disabled={disabled}
        className="w-16 px-2 py-2 text-center text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset disabled:bg-gray-50"
        aria-label="Quantity"
      />
      
      <button
        onClick={handleIncrease}
        disabled={!canIncrease}
        className="px-3 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
      
      {showSyncIndicator && (
        <div className="px-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Syncing to server..." />
        </div>
      )}
    </div>
  )
}
