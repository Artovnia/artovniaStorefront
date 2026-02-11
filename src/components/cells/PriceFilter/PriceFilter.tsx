"use client"
import { useEffect } from "react"
import { Accordion } from "@/components/molecules"
import { useFilterStore } from "@/stores/filterStore"
import { CloseIcon } from "@/icons"

interface PriceFilterProps {
  onClose?: () => void;
  showButton?: boolean;
}

export const PriceFilter = ({ onClose, showButton = true }: PriceFilterProps = {}) => {
  // Use PENDING state for staging (not applied until Apply button)
  const { pendingMinPrice, pendingMaxPrice, setPendingMinPrice, setPendingMaxPrice, setIsEditingPrice } = useFilterStore()

  // Handle price input changes - updates PENDING state only
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Mark as editing to prevent URL sync from overwriting
    setIsEditingPrice(true)
    
    // Only allow numeric input
    if (value === '' || /^[0-9]*$/.test(value)) {
      if (name === 'min_price') {
        setPendingMinPrice(value)
      } else if (name === 'max_price') {
        setPendingMaxPrice(value)
      }
    }
  }
  
  // Clear individual price field
  const handleClearMin = () => {
    setPendingMinPrice('')
  }
  
  const handleClearMax = () => {
    setPendingMaxPrice('')
  }
  
  // Reset editing flag when component unmounts
  useEffect(() => {
    return () => {
      setIsEditingPrice(false)
    }
  }, [setIsEditingPrice])

  return (
    <div className="p-4">
     
      <div className="flex gap-2 flex-col sm:flex-row" role="group" aria-label="Zakres cenowy">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-10 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
              placeholder="Min"
              value={pendingMinPrice}
              name="min_price"
              onChange={handlePriceChange}
              aria-label="Minimalna cena w złotych"
              inputMode="numeric"
            />
            {pendingMinPrice && (
              <button
                type="button"
                onClick={handleClearMin}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-[#3B3634]/5 rounded-full transition-colors"
                aria-label="Wyczyść minimalną cenę"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            )}
            <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60" aria-hidden="true">zł</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              className="w-full border border-[#3B3634]/20 rounded py-2 pl-2 pr-10 font-instrument-sans text-sm focus:border-[#3B3634] focus:outline-none transition-colors"
              placeholder="Max"
              value={pendingMaxPrice}
              name="max_price"
              onChange={handlePriceChange}
              aria-label="Maksymalna cena w złotych"
              inputMode="numeric"
            />
            {pendingMaxPrice && (
              <button
                type="button"
                onClick={handleClearMax}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-[#3B3634]/5 rounded-full transition-colors"
                aria-label="Wyczyść maksymalną cenę"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            )}
            <span className="absolute right-2 top-2 text-xs font-medium text-[#3B3634]/60" aria-hidden="true">zł</span>
          </div>
        </div>
      </div>
    </div>
  )
}
