"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FooterAccordionProps {
  title: string
  id: string
  children: React.ReactNode
}

/**
 * FooterAccordion - Mobile-only accordion for footer columns
 * 
 * On mobile (<lg): Renders as a collapsible accordion, closed by default.
 * On desktop (lg+): Always expanded, no toggle button, identical to original layout.
 */
export function FooterAccordion({ title, id, children }: FooterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      {/* Mobile: clickable header with chevron */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-between w-full py-3 border-b border-white/20"
        aria-expanded={isOpen}
        aria-controls={`footer-panel-${id}`}
      >
        <h2 className="text-white font-instrument-sans font-normal text-lg uppercase" id={id}>
          {title}
        </h2>
        <ChevronDown
          className={`w-5 h-5 text-white transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Desktop: static header (unchanged from original) */}
      <h2
        className="hidden lg:block text-white font-instrument-sans font-normal text-lg mb-6 uppercase"
        id={id}
      >
        {title}
      </h2>

      {/* Mobile: collapsible panel */}
      <div
        id={`footer-panel-${id}`}
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 pt-4 pb-2" : "max-h-0 opacity-0"
        }`}
        role="region"
        aria-labelledby={id}
      >
        {children}
      </div>

      {/* Desktop: always visible content */}
      <div className="hidden lg:block">
        {children}
      </div>
    </div>
  )
}
