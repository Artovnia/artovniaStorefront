"use client"
import { cn } from "@/lib/utils"
import { MinusHeavyIcon, TickThinIcon } from "@/icons"
import { ReactNode } from "react"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean
  error?: boolean
  label?: ReactNode
}

export function Checkbox({
  label,
  indeterminate,
  error,
  className,
  checked,
  onChange,
  ...props
}: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <span
        className={cn(
          "checkbox-wrapper relative flex items-center justify-center",
          checked && "!bg-action",
          error && "!border-negative",
          indeterminate && "!bg-action",
          props.disabled && "!bg-disabled !border-disabled !cursor-default",
          className
        )}
      >
        {indeterminate && !checked && !props.disabled && (
          <MinusHeavyIcon size={20} className="absolute" />
        )}
        {checked && !props.disabled && <TickThinIcon size={20} className="absolute" />}

        <input
          type="checkbox"
          className={cn(
            "w-[20px] h-[20px] opacity-0 cursor-pointer",
            props.disabled && "cursor-default"
          )}
          checked={checked}
          onChange={onChange} // Properly handle onChange
          {...props}
        />
      </span>
      {label}
    </label>
  )
}