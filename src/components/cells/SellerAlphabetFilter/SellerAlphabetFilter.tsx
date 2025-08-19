"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import useUpdateSearchParams from '@/hooks/useUpdateSearchParams'

interface SellerAlphabetFilterProps {
  className?: string
  onClose?: () => void
}

export const SellerAlphabetFilter = ({ className, onClose }: SellerAlphabetFilterProps) => {
  const searchParams = useSearchParams()
  const updateSearchParams = useUpdateSearchParams()
  const currentLetter = searchParams.get("letter") || ""

  const alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ]

  const handleLetterSelect = (letter: string) => {
    const newValue = currentLetter === letter ? "" : letter
    updateSearchParams("letter", newValue)
    onClose?.()
  }

  const handleClearFilter = () => {
    updateSearchParams("letter", "")
    onClose?.()
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-black font-instrument-sans">Filtruj według pierwszej litery</h4>
        {currentLetter && (
          <button
            onClick={handleClearFilter}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors font-instrument-sans"
          >
            Wyczyść
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterSelect(letter)}
            className={cn(
              "w-8 h-8 rounded-md border text-sm font-medium transition-all duration-200 font-instrument-sans",
              "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
              currentLetter === letter
                ? "bg-[#3B3634] text-white border-[#3B3634] shadow-md"
                : "bg-white text-black border-[#3B3634] hover:border-[#3B3634] hover:bg-gray-50"
            )}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-600 font-instrument-sans">
        {currentLetter 
          ? `Pokazywane są sprzedawcy zaczynający się na "${currentLetter}"`
          : "Wybierz literę, aby filtrować sprzedawców"
        }
      </div>
    </div>
  )
}
