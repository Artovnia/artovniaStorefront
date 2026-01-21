"use client"

import React, { useState } from "react"
import { Link } from "@/i18n/routing"
import { FileText, Check } from "lucide-react"

interface TermsAcceptanceProps {
  onAcceptanceChange: (accepted: boolean) => void
  className?: string
}

// Custom Checkbox Component - visual only, no onClick handler
const CustomCheckbox = ({ checked }: { checked: boolean }) => (
  <div
    className={`
      w-5 h-5 border-2 flex items-center justify-center shrink-0
      transition-all duration-200
      ${checked 
        ? "bg-plum border-plum" 
        : "bg-cream-50 border-cream-300 group-hover:border-plum-muted"
      }
    `}
  >
    {checked && <Check size={14} className="text-cream-50" />}
  </div>
)

const TermsAcceptance: React.FC<TermsAcceptanceProps> = ({
  onAcceptanceChange,
  className = ""
}) => {
  const [isAccepted, setIsAccepted] = useState(false)

  const handleAcceptanceChange = () => {
    const newChecked = !isAccepted
    setIsAccepted(newChecked)
    onAcceptanceChange(newChecked)
  }

  return (
    <div className={`bg-cream-100 border border-cream-300 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-cream-200 flex items-center gap-2">
        <FileText size={18} className="text-plum-muted" />
        <h3 className="text-sm font-medium text-plum uppercase tracking-wider">
          Regulamin
        </h3>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div 
          className="flex items-start gap-4 cursor-pointer group"
          onClick={handleAcceptanceChange}
          role="checkbox"
          aria-checked={isAccepted}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              handleAcceptanceChange()
            }
          }}
        >
          <CustomCheckbox checked={isAccepted} />
          <span className="text-sm text-plum leading-relaxed select-none">
            Akceptuję{" "}
            <Link 
              href="/regulamin" 
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-plum font-medium underline underline-offset-2 hover:text-plum-light transition-colors"
            >
              Regulamin sklepu
            </Link>
            {" "}oraz potwierdzam, że zapoznałem się z jego treścią.
          </span>
        </div>
        
        {!isAccepted && (
          <p className="mt-3 ml-9 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
            Akceptacja regulaminu jest wymagana do złożenia zamówienia.
          </p>
        )}
      </div>
    </div>
  )
}

export default TermsAcceptance
