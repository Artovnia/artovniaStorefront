"use client"

import { useVariantLowestPrice } from "@/hooks/use-lowest-price"
import { LowestPriceData } from "@/types/price-history"
import { formatPrice } from "@/lib/helpers/format-price"
import clsx from "clsx"

interface LowestPriceDisplayProps {
  variantId: string
  currencyCode: string
  regionId?: string
  days?: number
  className?: string
  showSavings?: boolean
  compact?: boolean
}

export const LowestPriceDisplay = ({
  variantId,
  currencyCode,
  regionId,
  days = 30,
  className,
  showSavings = true,
  compact = false
}: LowestPriceDisplayProps) => {
  const { data, loading, error } = useVariantLowestPrice(
    variantId,
    currencyCode,
    regionId,
    days,
    true
  )

  // Type guard to ensure we have LowestPriceData
  if (loading || error || !data || !('lowest_30d_amount' in data)) {
    return null
  }

  const lowestPriceData = data as LowestPriceData
  
  // ENHANCED: Fallback to current_amount for first-time promotions
  const lowestPrice = lowestPriceData.lowest_30d_amount || lowestPriceData.current_amount
  
  if (!lowestPrice) {
    return null
  }

  const hasValidSavings = lowestPriceData.savings_amount && lowestPriceData.savings_amount > 0

  if (compact) {
    return (
      <div className={clsx("text-xs text-gray-600", className)}>
        <span>Najniższa cena z {days} dni: </span>
        <span className="font-semibold text-green-600">
          {formatPrice(lowestPrice, currencyCode)}
        </span>
        {showSavings && hasValidSavings && (
          <span className="text-red-600 ml-1">
            (-{lowestPriceData.savings_percentage}%)
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={clsx("space-y-1", className)}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">Najniższa cena z {days} dni:</span>
        <span className="font-semibold text-green-600">
          {formatPrice(lowestPrice, currencyCode)}
        </span>
      </div>
      
      {showSavings && hasValidSavings && (
        <div className="text-xs text-gray-500">
          <span>Oszczędzasz: </span>
          <span className="text-red-600 font-medium">
            {formatPrice(lowestPriceData.savings_amount!, currencyCode)} ({lowestPriceData.savings_percentage}%)
          </span>
        </div>
      )}
      
      {lowestPriceData.found_at && (
        <div className="text-xs text-gray-400">
          z dnia {new Date(lowestPriceData.found_at).toLocaleDateString('pl-PL')}
        </div>
      )}
    </div>
  )
}
