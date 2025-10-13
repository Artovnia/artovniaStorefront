import { cn } from "@/lib/utils"

import Spinner from "@/icons/spinner"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "tonal" | "text" | "destructive"
  size?: "small" | "large"
  loading?: boolean
}

export function Button({
  children,
  variant = "filled",
  size = "small",
  loading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    "text-md button-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
  
  // CRITICAL: Disable pointer events when loading to prevent double-clicks
  const loadingClasses = loading ? "pointer-events-none" : ""

  const variantClasses = {
    filled: `bg-[#3B3634] text-white hover:bg-[#2A2522] active:bg-[#1F1B19] ${
      loading && "text-white"
    }`,
    tonal:
      "bg-[#3B3634]/10 hover:bg-[#3B3634]/20 active:bg-[#3B3634]/30 text-[#3B3634]",
    text: "bg-transparent hover:bg-[#3B3634]/10 active:bg-[#3B3634]/20 text-[#3B3634]",
    destructive: `text-white bg-red-600 hover:bg-red-700 active:bg-red-800 ${
      loading && "text-white"
    }`,
  }

  const sizeClasses = {
    small: "px-[16px] py-[8px]",
    large: "px-[24px] py-[8px]",
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        baseClasses,
        loadingClasses,
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}
