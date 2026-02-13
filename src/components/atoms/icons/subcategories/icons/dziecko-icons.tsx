/**
 * DZIECKO (Children) — non-shared icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Dekoracje do pokoju dziecięcego — airplane mobile hanging over cradle */
export const DekoracjePokojuIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Mobile bar */}
    <path d="M5 4H19" />
    <path d="M12 4V7" />

    {/* Hanging airplane */}
    <path d="M12 7V9" />
    <path d="M9 10L12 9L15 10" />
    <path d="M12 9V12" />

    {/* Cradle body */}
    <path d="M6 16C6 14.5 8 14 12 14C16 14 18 14.5 18 16V17.5C18 18.5 17 19 16 19H8C7 19 6 18.5 6 17.5V16Z" />

    {/* Rocking base */}
    <path d="M5 19C7 21 17 21 19 19" />
  </svg>
)


/** Akcesoria dziecięce — baby stroller with canopy */
export const AkcesoriaDziecięceIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Handle */}
    <path d="M17 4C18 4 19 5 19 6V9" />

    {/* Canopy */}
    <path d="M6 9C6 6 9 4 12 4C15 4 18 6 18 9Z" />

    {/* Body */}
    <path d="M6 9H18V14C18 15.5 17 16.5 15.5 16.5H8.5C7 16.5 6 15.5 6 14V9Z" />

    {/* Wheels */}
    <circle cx="9" cy="19" r="2" />
    <circle cx="16" cy="19" r="2" />
  </svg>
)
