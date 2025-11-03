"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { cn } from '@/lib/utils'

interface MobilePromotionsFilterModalProps {
  promotionNames?: string[]
  sellerNames?: { id: string; name: string }[]
  campaignNames?: string[]
  hasActiveFilters: boolean
  onClearAll: () => void
}

export const MobilePromotionsFilterModal = ({ 
  promotionNames = [],
  sellerNames = [],
  campaignNames = [],
  hasActiveFilters,
  onClearAll
}: MobilePromotionsFilterModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const currentSort = searchParams.get("sortBy") || ""
  const currentPromotion = searchParams.get("promotion") || ""
  const currentSeller = searchParams.get("seller") || ""
  const currentCampaign = searchParams.get("campaign") || ""

  const sortOptions = [
    { label: "Domyślne", value: "" },
    { label: "Największa zniżka", value: "discount_desc" },
    { label: "Cena: Niska do wysokiej", value: "price_asc" },
    { label: "Cena: Wysoka do niskiej", value: "price_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
  ]

  const handleApply = () => {
    setIsOpen(false)
  }

  if (!mounted) return null

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 bg-primary rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3B3634]">
          <h2 className="text-lg font-medium font-instrument-sans">Filtry</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Zamknij filtry"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Sort Section */}
          <div className="space-y-3">
            <h3 className="font-medium text-black font-instrument-sans">Sortuj według</h3>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={currentSort === option.value}
                    onChange={() => updateSearchParams("sortBy", option.value)}
                    className="w-5 h-5 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] cursor-pointer"
                    style={{ accentColor: '#3B3634' }}
                  />
                  <span className="text-sm text-black font-instrument-sans">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Promotion Filter */}
          {promotionNames.length > 0 && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="font-medium text-black font-instrument-sans">Promocja</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {promotionNames.map((name) => (
                  <label key={name} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="promotion"
                      value={name}
                      checked={currentPromotion === name}
                      onChange={() => updateSearchParams("promotion", name)}
                      className="w-5 h-5 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] cursor-pointer"
                      style={{ accentColor: '#3B3634' }}
                    />
                    <span className="text-sm text-black font-instrument-sans">{name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Seller Filter */}
          {sellerNames.length > 0 && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="font-medium text-black font-instrument-sans">Sprzedawca</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {sellerNames.map((seller) => (
                  <label key={seller.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="seller"
                      value={seller.id}
                      checked={currentSeller === seller.id}
                      onChange={() => updateSearchParams("seller", seller.id)}
                      className="w-5 h-5 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] cursor-pointer"
                      style={{ accentColor: '#3B3634' }}
                    />
                    <span className="text-sm text-black font-instrument-sans">{seller.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Filter */}
          {campaignNames.length > 0 && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <h3 className="font-medium text-black font-instrument-sans">Kampania</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {campaignNames.map((name) => (
                  <label key={name} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                    <input
                      type="radio"
                      name="campaign"
                      value={name}
                      checked={currentCampaign === name}
                      onChange={() => updateSearchParams("campaign", name)}
                      className="w-5 h-5 text-[#3B3634] border-[#3B3634] focus:ring-[#3B3634] cursor-pointer"
                      style={{ accentColor: '#3B3634' }}
                    />
                    <span className="text-sm text-black font-instrument-sans">{name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#3B3634] p-4 space-y-2 bg-primary">
          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearAll()
                setIsOpen(false)
              }}
              className="w-full py-3 px-4 border border-[#3B3634] rounded-lg text-[#3B3634] font-medium font-instrument-sans hover:bg-gray-50 transition-colors"
            >
              Wyczyść filtry
            </button>
          )}
          <button
            onClick={handleApply}
            className="w-full py-3 px-4 bg-[#3B3634] text-white rounded-lg font-medium font-instrument-sans hover:bg-opacity-90 transition-colors"
          >
            Zastosuj
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 font-instrument-sans",
          hasActiveFilters
            ? "bg-[#3B3634] text-white border-[#3B3634]"
            : "bg-primary text-black border-[#3B3634] hover:shadow-sm"
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">Filtry</span>
        {hasActiveFilters && (
          <span className="bg-white text-[#3B3634] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {[searchParams.get("promotion"), searchParams.get("seller"), searchParams.get("campaign")].filter(Boolean).length}
          </span>
        )}
      </button>

      {typeof window !== 'undefined' && createPortal(
        modalContent,
        document.body
      )}
    </>
  )
}