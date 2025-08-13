"use client"
import { useEffect } from "react"
import { Input } from "@/components/atoms"
import { Accordion } from "@/components/molecules"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { useFilterStore } from "@/stores/filterStore"

interface PriceFilterProps {
  onClose?: () => void;
  showButton?: boolean;
}

export const PriceFilter = ({ onClose, showButton = true }: PriceFilterProps = {}) => {
  const updateSearchParams = useUpdateSearchParams()
  
  // Use Zustand store for state management (like ColorFilter and ProductRatingFilter)
  const { minPrice, maxPrice, setMinPrice, setMaxPrice } = useFilterStore()

  // Apply price filter immediately on change
  const applyPriceFilter = (type: 'min' | 'max', value: string) => {
    const paramName = type === 'min' ? 'min_price' : 'max_price'
    
    // Update URL param - this will trigger the search automatically
    updateSearchParams(paramName, value || null)
  }

  // Handle price input changes with immediate filtering
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Only allow numeric input
    if (value === '' || /^[0-9]*$/.test(value)) {
      if (name === 'min_price') {
        setMinPrice(value)
        applyPriceFilter('min', value)
      } else if (name === 'max_price') {
        setMaxPrice(value)
        applyPriceFilter('max', value)
      }
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const { name, value } = e.currentTarget
      if (name === 'min_price') {
        applyPriceFilter('min', value)
      } else if (name === 'max_price') {
        applyPriceFilter('max', value)
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
                value={minPrice}
                name="min_price"
                onChange={handlePriceChange}
                onKeyDown={handleKeyPress}
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
                value={maxPrice}
                name="max_price"
                onChange={handlePriceChange}
                onKeyDown={handleKeyPress}
              />
              <span className="absolute right-2 top-2 text-xs font-medium text-gray-500">zł</span>
            </div>
          </div>
        </div>
      </div>
    </Accordion>
  )
}
