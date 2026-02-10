/**
 * AKCESORIA (Accessories) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Moda — cat-eye sunglasses */
export const ModaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11C3 11 3 9 5 9C7 9 8 11 8 12C8 14 7 15 5.5 15C4 15 3 14 3 12.5" />
    <path d="M21 11C21 11 21 9 19 9C17 9 16 11 16 12C16 14 17 15 18.5 15C20 15 21 14 21 12.5" />
    <path d="M8 11.5H16" />
    <path d="M3 10L1 8" />
    <path d="M21 10L23 8" />
    <path d="M5 9L4 7" />
    <path d="M19 9L20 7" />
  </svg>
)

/** Technologia — phone case with camera detail */
export const TechnologiaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M6 5H18" />
    <path d="M6 17H18" />
    <path d="M10.5 3.5H13.5" />
    <circle cx="12" cy="19" r="1" />
    <path d="M9 9H15V13H9V9Z" />
    <circle cx="12" cy="11" r="1.5" />
  </svg>
)

/** Papeteria i biuro — open notebook with pen */
export const PapeteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3H14C14.5 3 15 3.5 15 4V20C15 20.5 14.5 21 14 21H4C3.5 21 3 20.5 3 20V4C3 3.5 3.5 3 4 3Z" />
    <path d="M6 3V21" />
    <path d="M8 7H13" />
    <path d="M8 10H12" />
    <path d="M8 13H13" />
    <path d="M8 16H11" />
    <path d="M18 3L21 18" />
    <path d="M21 18L20 19L17 4L18 3Z" />
    <path d="M21 18L20.5 20" />
  </svg>
)

/** Podróże — compass with cardinal points */
export const PodróżeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="7" />
    <path d="M15.5 8.5L13.5 13.5L8.5 15.5L10.5 10.5L15.5 8.5Z" />
    <circle cx="12" cy="12" r="1" />
    <path d="M12 3V5" />
    <path d="M12 19V21" />
    <path d="M3 12H5" />
    <path d="M19 12H21" />
  </svg>
)
