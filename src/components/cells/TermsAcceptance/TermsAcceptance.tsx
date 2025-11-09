"use client"

import React, { useState } from "react"
import { Link } from "@/i18n/routing"
import { Checkbox } from "@/components/atoms"

interface TermsAcceptanceProps {
  onAcceptanceChange: (accepted: boolean) => void
  className?: string
}

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
    <div className={`border rounded-lg border-[#3B3634] p-4 bg-primary ${className}`}>
      <div className="flex items-start space-x-3">
        <div onClick={handleAcceptanceChange} className="cursor-pointer">
          <Checkbox
            id="terms-acceptance"
            checked={isAccepted}
            onChange={handleAcceptanceChange}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <label 
            htmlFor="terms-acceptance" 
            onClick={handleAcceptanceChange}
            className="text-sm text-gray-700 cursor-pointer leading-relaxed"
          >
            Akceptuję{" "}
            <Link 
              href="/regulamin" 
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Regulamin sklepu
            </Link>
            {" "}oraz potwierdzam, że zapoznałem się z jego treścią. Akceptacja regulaminu jest wymagana do złożenia zamówienia.
          </label>
        </div>
      </div>
      
      {!isAccepted && (
        <div className="mt-2 text-xs text-red-600 ml-7">
          Aby kontynuować, musisz zaakceptować regulamin sklepu.
        </div>
      )}
    </div>
  )
}

export default TermsAcceptance
