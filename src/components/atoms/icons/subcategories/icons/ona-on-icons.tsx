/**
 * ONA (Her) & ON (Him) — non-shared icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Torebki i plecaki — structured handbag with clasp */
export const TorebkiPlecakiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 10V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V10" />
    <path d="M3 10H21L20 8H4L3 10Z" />
    <path d="M9 8C9 5 10 3 12 3C14 3 15 5 15 8" />
    <path d="M10 14.5C10 14 10.5 13.5 11 13.5H13C13.5 13.5 14 14 14 14.5C14 15 13.5 15.5 13 15.5H11C10.5 15.5 10 15 10 14.5Z" />
    <path d="M12 15.5V17" />
    <path d="M5 12H19" />
  </svg>
)
