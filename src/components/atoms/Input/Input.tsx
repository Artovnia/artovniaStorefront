"use client"

import { cn } from "@/lib/utils"
import { X, Eye, EyeOff } from "lucide-react"
import { forwardRef, useEffect, useState } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  clearable?: boolean
  error?: string | boolean
  hint?: string
  changeValue?: (value: string) => void
  onClear?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon,
      clearable,
      className,
      error,
      hint,
      changeValue,
      onClear,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(props.type)
    const [isFocused, setIsFocused] = useState(false)

    useEffect(() => {
      if (props.type === "password") {
        setInputType(showPassword ? "text" : "password")
      }
    }, [props.type, showPassword])

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      changeValue?.(e.target.value)
      props.onChange?.(e)
    }

    const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement
      changeValue?.(target.value)
      props.onInput?.(e)
    }

    const pasteHandler = (e: React.ClipboardEvent<HTMLInputElement>) => {
      setTimeout(() => {
        const target = e.target as HTMLInputElement
        changeValue?.(target.value)
      }, 0)
      props.onPaste?.(e)
    }

    const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      setTimeout(() => {
        const target = e.target as HTMLInputElement
        if (target.value) changeValue?.(target.value)
      }, 50)
      props.onFocus?.(e)
    }

    const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const { onChange, onInput, onFocus, onBlur, onPaste, placeholder, ...restProps } = props

    // Only show placeholder when label is floated (focused or has value)
    const isLabelFloated = isFocused || !!props.value
    const effectivePlaceholder = label && !isLabelFloated ? "" : placeholder

    return (
      <div className="relative">
        {/* Floating Label */}
        {label && (
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none z-10",
              isLabelFloated
                ? "-top-2.5 text-xs bg-cream-50 px-1 text-plum"
                : "top-3.5 text-sm text-plum-muted",
              error && "text-red-600"
            )}
          >
            {label}
            {props.required && <span className="text-accent-copper ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Leading Icon */}
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-plum-muted">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            className={cn(
              // Base styles
              "w-full px-4 py-3.5 bg-cream-50 text-plum",
              "border border-cream-300 rounded-none",
              "text-sm tracking-wide",
              "transition-all duration-200 ease-out",
              // Focus styles
              "focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum/20",
              // Placeholder
              "placeholder:text-plum-muted/50",
              // Hover
              "hover:border-plum-muted",
              // Error state
              error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
              // Disabled state
              restProps.disabled &&
                "bg-cream-200 cursor-not-allowed opacity-60",
              // Icon padding
              icon && "pl-12",
              clearable && props.value && "pr-10",
              props.type === "password" && "pr-12",
              className
            )}
            {...restProps}
            type={inputType}
            placeholder={effectivePlaceholder}
            onChange={changeHandler}
            onInput={inputHandler}
            onPaste={pasteHandler}
            onFocus={focusHandler}
            onBlur={blurHandler}
          />

          {/* Clear button */}
          {clearable && props.value && (
            <button
              type="button"
              onClick={() => {
                changeValue?.("")
                onClear?.()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* Password toggle */}
          {props.type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-plum-muted hover:text-plum transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Error/Hint text */}
        {(error || hint) && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              error ? "text-red-600" : "text-plum-muted"
            )}
          >
            {typeof error === "string" ? error : hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"