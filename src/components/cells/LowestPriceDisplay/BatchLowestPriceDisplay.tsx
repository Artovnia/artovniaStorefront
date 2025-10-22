"use client"

import { useEffect, memo } from "react"
import { useBatchPrice } from "@/components/context/BatchPriceProvider"
import { formatPrice } from "@/lib/helpers/format-price"
import clsx from "clsx"

interface BatchLowestPriceDisplayProps {
  variantId: string
  currencyCode: string
  days?: number
  className?: string
  themeMode?: 'default' | 'light' | 'dark'
}

export const BatchLowestPriceDisplay = memo(({
  variantId,
  currencyCode,
  days = 30,
  className,
  themeMode = 'default'
}: BatchLowestPriceDisplayProps) => {
  const { registerVariant, unregisterVariant, getPriceData, loading } = useBatchPrice()

  // Register this variant when component mounts
  useEffect(() => {
    registerVariant(variantId)
    
    // Cleanup on unmount
    return () => {
      unregisterVariant(variantId)
    }
  }, [variantId, registerVariant, unregisterVariant])

  const priceData = getPriceData(variantId)

  // Dynamic theme-based styling
  const getThemeClasses = () => {
    switch (themeMode) {
      case 'dark':
        return {
          container: "text-xs text-white/80",
          price: "font-semibold font-instrument-sans text-white",
          date: "text-white/60 font-instrument-sans ml-1"
        }
      case 'light':
        return {
          container: "text-xs text-white/90",
          price: "font-semibold font-instrument-sans text-white",
          date: "text-white/70 font-instrument-sans ml-1"
        }
      default:
        return {
          container: "text-xs text-gray-600",
          price: "font-semibold font-instrument-sans text-[#3B3634]",
          date: "text-gray-600 font-instrument-sans ml-1"
        }
    }
  }

  const themeClasses = getThemeClasses()

  // Show loading state only if we're actively loading and don't have data yet
  if (loading && !priceData) {
    return (
      <div className={clsx("animate-pulse", className)}>
        <div className={clsx("h-4 rounded w-24", {
          "bg-white/20": themeMode === 'dark' || themeMode === 'light',
          "bg-gray-200": themeMode === 'default'
        })}></div>
      </div>
    )
  }

  // ENHANCED: Check for lowest price - now includes fallback to current_amount
  // This handles first-time promotions where no historical data exists
  const lowestPrice = priceData?.lowest_30d_amount || priceData?.current_amount
  
  // Don't render if no price data available at all
  if (!priceData || !lowestPrice) {
    return null
  }

  return (
    <div className={clsx(themeClasses.container, className)}>
      <span>Najniższa cena z {days} dni: </span>
      <span className={themeClasses.price}>
        {formatPrice(lowestPrice, currencyCode)}
      </span>
    
    </div>
  )
})

BatchLowestPriceDisplay.displayName = 'BatchLowestPriceDisplay'