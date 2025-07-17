"use client"

import { useEffect, useState } from "react"
import * as Slider from "@radix-ui/react-slider"

interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (values: [number, number]) => void
  onChangeComplete?: () => void
  step?: number
  unit?: string
  className?: string
}

export const RangeSlider = ({
  min,
  max,
  value,
  onChange,
  onChangeComplete,
  step = 1,
  unit = "",
  className = "",
}: RangeSliderProps) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleValueChange = (newValue: number[]) => {
    const typedValue: [number, number] = [newValue[0], newValue[1]]
    setLocalValue(typedValue)
    onChange(typedValue)
  }

  return (
    <div className={`w-full ${className}`}>
      <Slider.Root
        className="relative flex items-center select-none touch-none h-5 w-full"
        value={localValue}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        onValueCommit={onChangeComplete}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
          <Slider.Range className="absolute bg-black rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-md"
          aria-label="Min value"
        />
        <Slider.Thumb
          className="block w-5 h-5 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 shadow-md"
          aria-label="Max value"
        />
      </Slider.Root>
      
      <div className="flex justify-between mt-2 text-sm">
        <span>
          {localValue[0].toFixed(step < 1 ? 1 : 0)}
          {unit && ` ${unit}`}
        </span>
        <span>
          {localValue[1].toFixed(step < 1 ? 1 : 0)}
          {unit && ` ${unit}`}
        </span>
      </div>
    </div>
  )
}

export default RangeSlider
