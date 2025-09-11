"use client"

import { useLowestPrice } from "@/hooks/use-lowest-price"
import { LowestPriceData } from "@/types/price-history"
import { formatPrice } from "@/lib/helpers/format-price"
import clsx from "clsx"

interface OptimizedLowestPriceDisplayProps {
  variantId: string
  currencyCode: string
  days?: number
  className?: string
}

export const OptimizedLowestPriceDisplay = ({
  variantId,
  currencyCode,
  days = 30,
  className
}: OptimizedLowestPriceDisplayProps) => {
  const { data, loading, error } = useLowestPrice({
    variantId,
    currencyCode,
    days,
    enabled: true
  })

  if (loading) {
    return (
      <div className={clsx("animate-pulse", className)}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  // Type guard to ensure we have LowestPriceData and it's not null
  if (!('lowest_30d_amount' in data) || !data.lowest_30d_amount) {
    return null
  }

  const lowestPriceData = data as LowestPriceData

  return (
    <div className={clsx("text-xs text-gray-600", className)}>
      <span>Najniższa cena z {days} dni: </span>
      <span className="font-semibold text-[#3B3634]">
        {formatPrice(lowestPriceData.lowest_30d_amount!, currencyCode)}
      </span>
      
    </div>
  )
}
