"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/lib/utils"
import { CloseIcon } from "@/components/atoms/icons/mobile-icons"

interface RegionDisplay {
  id: string
  name: string
  flag: string
  countries: string[]
}

interface MobileRegionModalProps {
  isOpen: boolean
  onClose: () => void
  regions: HttpTypes.StoreRegion[]
  currentRegionId?: string
  onRegionChanged?: () => Promise<void>
}

const getRegionDisplay = (region: HttpTypes.StoreRegion): RegionDisplay => {
  const name = region.name || "Unknown"

  const displayMap: Record<string, { flag: string; displayName?: string }> = {
    Polska: { flag: "🇵🇱" },
    Poland: { flag: "🇵🇱" },
    EU: { flag: "🇪🇺", displayName: "Europa" },
    Europe: { flag: "🇪🇺", displayName: "Europa" },
  }

  const display = displayMap[name] || { flag: "🌍" }

  return {
    id: region.id,
    name: display.displayName || name,
    flag: display.flag,
    countries: region.countries?.map((c) => c.iso_2 || "") || [],
  }
}

export const MobileRegionModal = ({
  isOpen,
  onClose,
  regions,
  currentRegionId,
  onRegionChanged,
}: MobileRegionModalProps) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const regionDisplays = regions.map(getRegionDisplay)

  const currentRegion = currentRegionId
    ? regionDisplays.find((r) => r.id === currentRegionId) || regionDisplays[0]
    : regionDisplays[0]

  const handleRegionChange = async (regionId: string) => {
    if (regionId === currentRegion?.id) return

    onClose()

    startTransition(async () => {
      try {
        const { updateCartRegion } = await import("@/lib/data/cart")
        await updateCartRegion(regionId)

        if (onRegionChanged) {
          await onRegionChanged()
        }

        router.refresh()
      } catch (error) {
        console.error("Error updating region:", error)
        router.refresh()
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby="region-modal-heading">
      {/* Full Screen Container */}
      <div className="relative h-full w-full bg-[#F4F0EB] overflow-hidden">
        {/* Scrollable Content */}
        <div
          className="relative h-full overflow-y-auto px-5 pb-8"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Header with Close Button */}
          <div className="sticky top-0 z-10 bg-[#F4F0EB] pt-4 pb-2">
            <div className="flex items-center justify-between">
              <h1 id="region-modal-heading" className="text-2xl font-instrument serif tracking-tight text-[#3B3634] uppercase">
                Wybierz Region
              </h1>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full 
                         bg-[#3B3634]/5 hover:bg-[#3B3634]/10 transition-colors"
                aria-label="Zamknij"
              >
                <CloseIcon className="w-5 h-5 text-[#3B3634]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6 space-y-6">
            

            {/* Description */}
            <div className="text-center">
              <p className="text-[#3B3634]/60 text-sm leading-relaxed">
                Wybierz region, aby zobaczyć ceny i opcje dostawy
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#3B3634]/10" />

            {/* Region List */}
            <div className="space-y-2" role="radiogroup" aria-label="Dostępne regiony">
              {regionDisplays.map((region, index) => {
                const isActive = region.id === currentRegion?.id

                return (
                  <button
                    key={region.id}
                    onClick={() => handleRegionChange(region.id)}
                    disabled={isPending}
                    style={{ animationDelay: `${index * 50}ms` }}
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`Region: ${region.name}`}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3.5",
                      "transition-all duration-200 animate-in fade-in slide-in-from-bottom-2",
                      isActive
                        ? "bg-[#3B3634] text-[#F4F0EB]"
                        : "border border-[#3B3634]/10 text-[#3B3634]",
                      "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                      isPending && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{region.flag}</span>
                    </div>
                    <span className="font-medium flex-1 text-left">{region.name}</span>
                    {isActive ? (
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 opacity-40 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-white/50 border border-[#3B3634]/10">
              <p className="text-xs text-[#3B3634]/60 text-center leading-relaxed">
                Zmiana regionu może wpłynąć na dostępność produktów, ceny oraz
                opcje dostawy.
              </p>
            </div>
          </div>

          {/* Bottom Spacing for Safe Area */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  )
}