"use client"

import { useEffect, useState, useRef, memo } from "react"
import { useBatchPrice } from "@/components/context/BatchPriceProvider"
import { formatPrice } from "@/lib/helpers/format-price"
import clsx from "clsx"

interface CompactLowestPriceDisplayProps {
  variantId: string
  currencyCode: string
  days?: number
  className?: string
  themeMode?: "default" | "light" | "dark"
  /** Fallback price to use when no price history exists (e.g., variant's original_amount) */
  fallbackPrice?: number | null
}

/**
 * Compact version of BatchLowestPriceDisplay for ProductCard.
 * Shows short "cena z 30 dni" text with an info icon.
 * On hover/focus the icon reveals a tooltip with the full price info:
 * "Najniższa cena z {days} dni: {price}"
 *
 * The original BatchLowestPriceDisplay remains unchanged for use on
 * the product detail page and other places.
 */
export const CompactLowestPriceDisplay = memo(
  ({
    variantId,
    currencyCode,
    days = 30,
    className,
    themeMode = "default",
    fallbackPrice,
  }: CompactLowestPriceDisplayProps) => {
    const { registerVariant, unregisterVariant, getPriceData, loading } =
      useBatchPrice()
    const [showTooltip, setShowTooltip] = useState(false)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
      registerVariant(variantId)
      return () => unregisterVariant(variantId)
    }, [variantId, registerVariant, unregisterVariant])

    // Close tooltip when clicking outside
    useEffect(() => {
      if (!showTooltip) return
      const handleClickOutside = (e: MouseEvent) => {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setShowTooltip(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [showTooltip])

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

    // Priority: lowest_30d_amount > current_amount from price history > fallbackPrice
    const lowestPrice =
      priceData?.lowest_30d_amount || priceData?.current_amount || fallbackPrice
    if (!lowestPrice) return null

    const fullText = `Najniższa cena z ${days} dni: ${formatPrice(lowestPrice, currencyCode)}`

    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 relative",
          "text-[10px] font-light tracking-wide",
          theme,
          className
        )}
      >
        <span>cena z {days} dni</span>
        {/* Info icon — hover/focus reveals full price tooltip */}
        <button
          ref={triggerRef}
          type="button"
          className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-current opacity-70 hover:opacity-100 focus:opacity-100 focus:outline-none transition-opacity"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowTooltip((prev) => !prev)
          }}
          aria-label={fullText}
          aria-describedby={`tooltip-${variantId}`}
        >
          <svg
            width="7"
            height="7"
            viewBox="0 0 7 7"
            fill="none"
            className="flex-shrink-0"
            aria-hidden="true"
          >
            <path
              d="M3.5 1.75V1.5M3.5 3V5.25"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            ref={tooltipRef}
            id={`tooltip-${variantId}`}
            role="tooltip"
            className={clsx(
              "absolute z-50 bottom-full left-0 mb-1.5",
              "px-2.5 py-1.5 rounded shadow-lg",
              "text-[10px] font-normal whitespace-nowrap",
              "pointer-events-none",
              "animate-in fade-in duration-150",
              themeMode === "default"
                ? "bg-[#3B3634] text-white"
                : "bg-white text-[#3B3634] border border-gray-200"
            )}
          >
            {fullText}
            {/* Tooltip arrow */}
            <span
              className={clsx(
                "absolute top-full left-3 w-0 h-0",
                "border-l-[4px] border-l-transparent",
                "border-r-[4px] border-r-transparent",
                themeMode === "default"
                  ? "border-t-[4px] border-t-[#3B3634]"
                  : "border-t-[4px] border-t-white"
              )}
              aria-hidden="true"
            />
          </div>
        )}
      </span>
    )
  }
)

CompactLowestPriceDisplay.displayName = "CompactLowestPriceDisplay"
