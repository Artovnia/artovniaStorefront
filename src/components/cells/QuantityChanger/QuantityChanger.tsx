"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { useCart } from "@/components/context/CartContext"

interface QuantityChangerProps {
  itemId: string
  cartId: string
  initialQuantity: number
  maxQuantity?: number // Stock limit from inventory
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
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { updateItem, cart, error: cartError } = useCart()

  // Track if inventory is managed (maxQuantity < 999 means real stock limit)
  const hasStockLimit = maxQuantity < 999

  // When maxQuantity changes (e.g. inventory refreshed after error), clamp current quantity
  useEffect(() => {
    if (hasStockLimit && quantity > maxQuantity) {
      setQuantity(maxQuantity)
      setLastSyncedQuantity(maxQuantity)
    }
  }, [maxQuantity]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync quantity from cart state when server responds with a different quantity
  useEffect(() => {
    if (!cart?.items) return
    const serverItem = cart.items.find((item) => item.id === itemId)
    if (serverItem && serverItem.quantity !== quantity && !isUpdating) {
      setQuantity(serverItem.quantity)
      setLastSyncedQuantity(serverItem.quantity)
    }
  }, [cart?.items, itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Show warning briefly then auto-hide
  const showWarning = useCallback((msg: string) => {
    setWarningMessage(msg)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    warningTimeoutRef.current = setTimeout(() => setWarningMessage(null), 4000)
  }, [])

  // Detect insufficient inventory error from CartContext and show inline warning
  useEffect(() => {
    if (cartError && (
      cartError.includes('Niewystarczająca ilość') || 
      cartError.includes('insufficient_inventory') ||
      cartError.includes('does not have the required inventory')
    )) {
      showWarning('Brak wystarczającej ilości w magazynie')
    }
  }, [cartError, showWarning])

  // Use CartContext for server sync
  const syncToServer = useCallback(async (newQuantity: number) => {
    try {
      setIsUpdating(true)
      setWarningMessage(null)
      await updateItem(itemId, newQuantity)
      setLastSyncedQuantity(newQuantity)
    } catch (error) {
      // Revert to last known good quantity on error
      setQuantity(lastSyncedQuantity)
      showWarning('Nie udało się zaktualizować ilości')
    } finally {
      setIsUpdating(false)
    }
  }, [itemId, lastSyncedQuantity, updateItem, showWarning])

  // Handle quantity changes with debouncing
  const handleQuantityChange = useCallback((newQuantity: number) => {
    // Check if user tried to exceed max
    if (newQuantity > maxQuantity && hasStockLimit) {
      showWarning(`Maksymalna dostępna ilość: ${maxQuantity}`)
    }

    // Validate bounds
    const clampedQuantity = Math.max(minQuantity, Math.min(maxQuantity, newQuantity))
    
    if (clampedQuantity === quantity) {
      if (newQuantity > maxQuantity && hasStockLimit) {
        showWarning(`Maksymalna dostępna ilość: ${maxQuantity}`)
      }
      return
    }

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
    
    // Debounce server sync
    syncTimeoutRef.current = setTimeout(() => {
      if (clampedQuantity !== lastSyncedQuantity) {
        syncToServer(clampedQuantity)
      }
    }, 400)
    
  }, [quantity, maxQuantity, minQuantity, unitPrice, onQuantityChange, syncToServer, lastSyncedQuantity, hasStockLimit, showWarning])

  const handleDecrease = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWarningMessage(null)
    handleQuantityChange(quantity - 1)
  }, [quantity, handleQuantityChange])

  const handleIncrease = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleQuantityChange(quantity + 1)
  }, [quantity, handleQuantityChange])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const value = parseInt(e.target.value) || minQuantity
    handleQuantityChange(value)
  }, [handleQuantityChange, minQuantity])

  // Prevent click on input from navigating (it's inside a Link)
  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    }
  }, [])

  const canDecrease = quantity > minQuantity && !disabled && !isUpdating
  const canIncrease = quantity < maxQuantity && !disabled && !isUpdating
  const isAtMax = quantity >= maxQuantity && hasStockLimit
  const showSyncIndicator = isUpdating

  return (
    <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <div className={`flex items-center gap-0 border rounded bg-white ${isAtMax ? 'border-amber-400' : ''}`}>
          <button
            onClick={handleDecrease}
            disabled={!canDecrease}
            className="px-2.5 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Zmniejsz ilość"
          >
            −
          </button>
          
          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            onClick={handleInputClick}
            min={minQuantity}
            max={maxQuantity}
            disabled={disabled || isUpdating}
            className="w-10 px-0 py-1.5 text-center text-sm font-medium border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset disabled:bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Ilość"
          />
          
          <button
            onClick={handleIncrease}
            disabled={!canIncrease}
            className="px-2.5 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Zwiększ ilość"
          >
            +
          </button>
        </div>

        {/* Stock fraction: quantity/available (e.g. 1/4, 3/6) */}
        {hasStockLimit && (
          <span className={`text-xs tabular-nums whitespace-nowrap ${isAtMax ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
            {quantity}/{maxQuantity}
          </span>
        )}
        
        {showSyncIndicator && (
          <div className="px-0.5">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" title="Aktualizacja..." />
          </div>
        )}
      </div>

      {/* Warning / error message */}
      {warningMessage && (
        <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5" role="alert">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="flex-shrink-0">
            <path d="M6 1L11 10H1L6 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none" />
            <path d="M6 4.5V6.5M6 8V8.01" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          {warningMessage}
        </p>
      )}
    </div>
  )
}
