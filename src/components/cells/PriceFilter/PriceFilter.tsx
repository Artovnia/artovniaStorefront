"use client"
import { useEffect } from "react"
import { Input } from "@/components/atoms"
import { Accordion } from "@/components/molecules"
import { useFilterStore } from "@/stores/filterStore"
import { useSearchParams } from "next/navigation"

interface PriceFilterProps {
  onClose?: () => void;
  showButton?: boolean;
}

export const PriceFilter = ({ onClose, showButton = true }: PriceFilterProps = {}) => {
  // Use PENDING state for staging (not applied until Apply button)
  // URL sync is handled by useSyncFiltersFromURL in ProductFilterBar
  const { pendingMinPrice, pendingMaxPrice, setPendingMinPrice, setPendingMaxPrice } = useFilterStore()

  // Handle price input changes - updates PENDING state only
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Only allow numeric input
    if (value === '' || /^[0-9]*$/.test(value)) {
      if (name === 'min_price') {
        setPendingMinPrice(value)
      } else if (name === 'max_price') {
        setPendingMaxPrice(value)
      }
    }
  }

  return (
    <Accordion heading="Cena">
      <div className="space-y-4">
        <h4 className="font-medium text-black font-instrument-sans">Zakres cen</h4>
        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8 font-instrument-sans"
                placeholder="Min"
                value={pendingMinPrice}
                name="min_price"
                onChange={handlePriceChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">zł</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="w-full border border-gray-300 rounded py-2 pl-2 pr-8 font-instrument-sans"
                placeholder="Max"
                value={pendingMaxPrice}
                name="max_price"
                onChange={handlePriceChange}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">zł</span>
            </div>
          </div>
        </div>
      </div>
    </Accordion>
  )
}
