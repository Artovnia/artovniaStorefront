"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { CollapseIcon, TickThinIcon } from "@/icons"

export const SelectField = ({
  options,
  className = "",
  selected,
  selectOption,
}: {
  options: {
    value: string
    label: string
    hidden?: boolean
  }[]
  className?: string
  selected?: string
  selectOption?: (value: string) => void
}) => {
  const [selectedOption, setSelectedOption] = useState(
    options.find(({ value }) => value === selected)?.label || options[0].label
  )
  const [open, setOpen] = useState(false)

  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if the click is outside the entire select component
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    // Only add listener when dropdown is open
    if (open) {
      document.addEventListener("click", handleClickOutside)
    }

    // Cleanup function
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [open]) // Add 'open' to dependency array

  const selectOptionHandler = (label: string, value: string) => {
    setSelectedOption(label)
    if (selectOption) selectOption(value)
    setOpen(false)
  }

  return (
    <div className="relative">
      <div
        ref={selectRef}
        className={cn(
          "relative rounded-sm border px-3 py-2 bg-component-secondary label-md cursor-pointer h-10 flex items-center justify-between",
          open && "border-primary",
          className
        )}
        onClick={() => setOpen(!open)}
      >
        <span className="truncate pr-4">{selectedOption}</span>
        <CollapseIcon className="flex-shrink-0" size={20} />
      </div>
      {open && (
        <ul className="absolute border border-primary bg-component-secondary rounded-sm w-full top-[39px] z-10">
          {options.map(
            ({ label, value, hidden }, index) =>
              !hidden && (
                <li
                  key={value}
                  className={cn(
                    "relative label-md py-2 px-3 hover:bg-component-secondary-hover cursor-pointer",
                    index === 0 && "rounded-t-sm",
                    index === options.length - 1 && "rounded-b-sm"
                  )}
                  onClick={() => selectOptionHandler(label, value)}
                >
                  {label}
                  {label === selectedOption && (
                    <TickThinIcon
                      className="absolute top-[10px] right-2"
                      size={20}
                    />
                  )}
                </li>
              )
          )}
        </ul>
      )}
    </div>
  )
}