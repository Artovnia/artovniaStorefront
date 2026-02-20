"use client"

import { Truck } from "lucide-react"
import { DeliveryTimeframe } from "@/lib/data/delivery-timeframe"

// Default fallback: 5 working days if no specific timeframe is set
const DEFAULT_TIMEFRAME_DAYS = 5

interface DeliveryTimeframeDisplayProps {
  timeframe: DeliveryTimeframe | null
  className?: string
  showFallback?: boolean // Whether to show default 5-day fallback when no timeframe is set
}

/**
 * Format delivery timeframe for display (client-side helper)
 */
const formatTimeframe = (timeframe: DeliveryTimeframe): string => {
  if (timeframe.label) {
    return timeframe.label
  }
  return `${timeframe.min_days}-${timeframe.max_days} dni`
}

/**
 * DeliveryTimeframeDisplay Component
 * 
 * Displays the delivery timeframe for a product with a truck icon.
 * Shows "Czas realizacji: X-Y dni" format.
 * Falls back to 5 working days if no specific timeframe is set.
 */
export const DeliveryTimeframeDisplay = ({
  timeframe,
  className = "",
  showFallback = true,
}: DeliveryTimeframeDisplayProps) => {
  // Use provided timeframe or fallback to default 5 days
  const displayTimeframe = timeframe 
    ? formatTimeframe(timeframe)
    : showFallback 
      ? `do ${DEFAULT_TIMEFRAME_DAYS} dni roboczych`
      : null

  if (!displayTimeframe) return null

  return (
    <div 
      className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
      aria-label={`Czas realizacji: ${displayTimeframe}`}
    >
      <Truck className="w-4 h-4 text-gray-500" aria-hidden="true" />
      <span>
        Czas realizacji: <span className="font-medium text-gray-800">{displayTimeframe}</span>
      </span>
    </div>
  )
}
