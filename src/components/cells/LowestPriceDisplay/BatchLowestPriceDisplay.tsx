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
  themeMode?: "default" | "light" | "dark"
  /** Fallback price to use when no price history exists (e.g., variant's original_amount) */
  fallbackPrice?: number | null
}

export const BatchLowestPriceDisplay = memo(
  ({
    variantId,
    currencyCode,
    days = 30,
    className,
    themeMode = "default",
    fallbackPrice,
  }: BatchLowestPriceDisplayProps) => {
    const { registerVariant, unregisterVariant, getPriceData, loading } =
      useBatchPrice()

    useEffect(() => {
      registerVariant(variantId)
      return () => unregisterVariant(variantId)
    }, [variantId, registerVariant, unregisterVariant])

    const priceData = getPriceData(variantId)
    
    const theme = {
      dark: "text-white/80",
      light: "text-white/80",
      default: "text-gray-700",
    }[themeMode]

    if (loading && !priceData && !fallbackPrice) {
      return (
        <div className={clsx("animate-pulse", className)}>
          <div
            className={clsx("h-3 w-16 rounded", {
              "bg-white/40": themeMode !== "default",
              "bg-gray-100": themeMode === "default",
            })}
          />
        </div>
      )
    }

    // Priority: lowest_30d_amount > current_amount from price history > fallbackPrice (variant's original price)
    const lowestPrice = priceData?.lowest_30d_amount || priceData?.current_amount || fallbackPrice
    if (!lowestPrice) return null

    return (
      <span
        className={clsx(
          "text-[10px] font-light tracking-wide",
          theme,
          className
        )}
      >
        Najniższa z {days}dni: {formatPrice(lowestPrice, currencyCode)}
      </span>
    )
  }
)

BatchLowestPriceDisplay.displayName = "BatchLowestPriceDisplay"