"use client"

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'
import { cn } from '@/lib/utils'
import { SellerAlphabetFilter } from '@/components/cells/SellerAlphabetFilter/SellerAlphabetFilter'
import { Check } from 'lucide-react'

interface MobileSellerFilterModalProps {
  hasActiveFilters: boolean
  onClearAll: () => void
}

export const MobileSellerFilterModal = ({ 
  hasActiveFilters,
  onClearAll
}: MobileSellerFilterModalProps) => {
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
  const currentLetter = searchParams.get("letter") || ""

  const sortOptions = [
    { label: "Domyślne (A-Z)", value: "" },
    { label: "Nazwa: A-Z", value: "name_asc" },
    { label: "Nazwa: Z-A", value: "name_desc" },
    { label: "Najnowsze", value: "created_at_desc" },
    { label: "Najstarsze", value: "created_at_asc" },
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
            <h3 className="font-medium text-black mb-3 font-instrument-sans text-sm">Sortuj według</h3>
            <div className="space-y-1">
              {sortOptions.map((option) => (
                <div key={option.value} className="relative">
                  <button
                    type="button"
                    onClick={() => updateSearchParams("sortBy", option.value)}
                    className="w-full flex items-center justify-between py-2.5 text-left transition-colors cursor-pointer hover:bg-[#3B3634]/5"
                  >
                    <span className={cn(
                      "text-sm font-instrument-sans select-none",
                      currentSort === option.value ? "text-[#3B3634] font-medium" : "text-[#3B3634]/90"
                    )}>
                      {option.label}
                    </span>
                    <Check 
                      className={cn(
                        "w-4 h-4 text-[#3B3634] transition-opacity duration-150",
                        currentSort === option.value ? "opacity-100" : "opacity-0"
                      )}
                      strokeWidth={2.5} 
                    />
                  </button>
                  <div className="flex justify-center">
                    <div className="w-[99%] h-px bg-[#3B3634]/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alphabet Filter */}
          <div className="space-y-3 border-t border-[#3B3634]/10 pt-6">
            <h3 className="font-medium text-black mb-3 font-instrument-sans text-sm">Filtruj według litery</h3>
            <SellerAlphabetFilter />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#3B3634] p-4 space-y-2 bg-primary">
          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearAll()
                setIsOpen(false)
              }}
              className="w-full py-3 px-4 border border-[#3B3634] text-[#3B3634] font-medium font-instrument-sans hover:bg-gray-50 transition-colors"
            >
              Wyczyść filtry
            </button>
          )}
          <button
            onClick={handleApply}
            className="w-full py-3 px-4 bg-[#3B3634] text-white font-semibold font-instrument-sans hover:bg-[#2a2523] transition-colors"
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
            {[searchParams.get("letter")].filter(Boolean).length}
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
