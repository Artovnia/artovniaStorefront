"use client"

import React, { useState, useCallback, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { useCart } from "@/components/context/CartContext"

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
  const { updateItem } = useCart()

  // Use CartContext for server sync to ensure state consistency
  const syncToServer = useCallback(async (newQuantity: number) => {
    try {
      setIsUpdating(true)
      
   
      
      await updateItem(itemId, newQuantity)
      setLastSyncedQuantity(newQuantity)
      
    } catch (error) {
      console.warn('⚠️ CartContext sync error:', error)
      // Keep UI state - don't revert on network errors
    } finally {
      setIsUpdating(false)
    }
  }, [itemId, lastSyncedQuantity, updateItem])

  // Handle quantity changes with debouncing
  const handleQuantityChange = useCallback((newQuantity: number) => {
    // Validate bounds
    const clampedQuantity = Math.max(minQuantity, Math.min(maxQuantity, newQuantity))
    
    if (clampedQuantity === quantity) return // No change needed
    

    
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
