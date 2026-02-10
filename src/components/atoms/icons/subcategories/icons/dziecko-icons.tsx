/**
 * DZIECKO (Children) — non-shared icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Dekoracje do pokoju dziecięcego — airplane mobile hanging over cradle */
export const DekoracjePokojuIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2H20" />
    <path d="M12 2V5" />
    <path d="M7 2V6" />
    <path d="M17 2V6" />
    {/* Airplane hanging from center */}
    <path d="M12 5V7" />
    <path d="M10 8.5L12 7L14 8.5" />
    <path d="M12 7V10" />
    <path d="M8 9L12 8L16 9" />
    <path d="M12 10L11 11.5" />
    <path d="M12 10L13 11.5" />
    {/* Star hanging from left */}
    <path d="M7 6V8" />
    <path d="M7 9L7.5 10.2L8.8 10.4L7.9 11.2L8.1 12.5L7 11.8L5.9 12.5L6.1 11.2L5.2 10.4L6.5 10.2Z" />
    {/* Moon hanging from right */}
    <path d="M17 6V9" />
    <path d="M17 10C17 10 15.5 10.5 15.5 12C15.5 13.5 17 14 17 14C17 14 16 14 15 13C14 12 14 10.5 15 9.5C16 9 17 10 17 10Z" />
    {/* Cradle base */}
    <path d="M5 19C5 19 5 17 8 17C10 17 11 18 12 18C13 18 14 17 16 17C19 17 19 19 19 19" />
    <path d="M4 19H20" />
    <path d="M3 19C3 20 4 21 5 21" />
    <path d="M21 19C21 20 20 21 19 21" />
  </svg>
)

/** Akcesoria dziecięce — baby stroller with canopy */
export const AkcesoriaDziecięceIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Handle */}
    <path d="M18 4C18 4 19 4 19 5V9" />
    <path d="M17 4H19" />
    {/* Canopy */}
    <path d="M6 9C6 9 6 5 10 4C14 3 16 5 16 9" />
    <path d="M8 6C8 6 10 5 13 5.5" />
    {/* Body */}
    <path d="M5 9H19V15C19 16 18 17 17 17H7C6 17 5 16 5 15V9Z" />
    <path d="M5 12H19" />
    {/* Wheels */}
    <circle cx="8" cy="20" r="2" />
    <circle cx="17" cy="20" r="2" />
    <path d="M7 17L8 18" />
    <path d="M17 17V18" />
    {/* Wheel details */}
    <circle cx="8" cy="20" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="17" cy="20" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)
