"use client"
import { cn } from "@/lib/utils"
import { CloseIcon } from "@/icons"
import { forwardRef, useEffect, useState } from "react"
import { EyeMini, EyeSlashMini } from "@medusajs/icons"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
  clearable?: boolean
  error?: boolean
  changeValue?: (value: string) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, icon, clearable, className, error, changeValue, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(props.type)
    let paddingY = ""
    if (icon) paddingY += "pl-[46px] "
    if (clearable) paddingY += "pr-[38px]"

    useEffect(() => {
      if (props.type === "password" && showPassword) {
        setInputType("text")
      }

      if (props.type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [props.type, showPassword])

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (changeValue) changeValue(value)
      if (props.onChange) props.onChange(e)
    }

    const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement
      if (changeValue) changeValue(target.value)
      if (props.onInput) props.onInput(e)
    }

    const pasteHandler = (e: React.ClipboardEvent<HTMLInputElement>) => {
      // Let paste complete, then read the actual value
      setTimeout(() => {
        const target = e.target as HTMLInputElement
        if (changeValue) changeValue(target.value)
      }, 0)
      if (props.onPaste) props.onPaste(e)
    }

    const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
      // Check for autofilled value on focus
      setTimeout(() => {
        const target = e.target as HTMLInputElement
        if (target.value && changeValue) {
          changeValue(target.value)
        }
      }, 50)
      if (props.onFocus) props.onFocus(e)
    }

    const animationStartHandler = (
      e: React.AnimationEvent<HTMLInputElement>
    ) => {
      // Detect autofill animation
      if (
        e.animationName === "onAutoFillStart" ||
        e.animationName.includes("autofill")
      ) {
        setTimeout(() => {
          const target = e.target as HTMLInputElement
          if (target.value && changeValue) {
            changeValue(target.value)
          }
        }, 10)
      }
      if (props.onAnimationStart) props.onAnimationStart(e)
    }

    const clearHandler = () => {
      if (changeValue) changeValue("")
    }

    const {
      onChange,
      onInput,
      onFocus,
      onAnimationStart,
      onPaste,
      ...restProps
    } = props

    return (
      <label className="label-md">
        {label}
        <div className="relative">
          {icon && (
            <span className="absolute top-0 left-[16px] h-full flex items-center">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            className={cn(
              "w-full px-[16px] py-[10px] border rounded-sm bg-white focus:border-primary focus:outline-none focus:ring-0",
              error && "border-negative focus:border-negative",
              restProps.disabled && "bg-disabled cursor-not-allowed",
              paddingY,
              className
            )}
            {...restProps}
            type={inputType}
            onChange={changeHandler}
            onInput={inputHandler}
            onPaste={pasteHandler}
            onFocus={focusHandler}
            onAnimationStart={animationStartHandler}
          />
          {clearable && props.value && (
            <span
              className="absolute h-full flex items-center top-0 right-[16px] cursor-pointer"
              onClick={clearHandler}
            >
              <CloseIcon />
            </span>
          )}
          {props.type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-ui-fg-subtle px-4 focus:outline-none transition-all duration-150 outline-none focus:text-ui-fg-base absolute right-0 top-4"
            >
              {showPassword ? <EyeMini /> : <EyeSlashMini />}
            </button>
          )}
        </div>
      </label>
    )
  }
)

Input.displayName = "Input"