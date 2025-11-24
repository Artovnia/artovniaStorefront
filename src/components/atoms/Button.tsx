import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "px-6 py-2 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-instrument-sans uppercase"
  
  const variantStyles = {
    primary: "bg-[#3b3634] text-white hover:bg-[#2a2523]",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    outline: "border-2 border-[#3b3634] text-[#3b3634] hover:bg-gray-50",
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Ładowanie...
        </span>
      ) : (
        children
      )}
    </button>
  )
}
