/**
 * DOM (Home) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Dekoracje — framed artwork with landscape */
export const DekoracjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Frame */}
    <rect x="4" y="5" width="16" height="14" rx="2" />

    {/* Landscape line */}
    <path d="M6 15C8 12.5 10 13.5 12 12C14 10.5 16 12 18 14" />

    {/* Sun */}
    <circle cx="9" cy="10" r="1.2" />
  </svg>
)

/** Tekstylia — decorative cushion with tassels */
export const TekstyliaDomIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Cushion body */}
    <path d="M6 6C4.5 7.5 4.5 16.5 6 18C7.5 19.5 16.5 19.5 18 18C19.5 16.5 19.5 7.5 18 6C16.5 4.5 7.5 4.5 6 6Z" />

    {/* Soft center seam */}
    <path d="M9 12C10.5 13 13.5 13 15 12" />
  </svg>
)


/** Meble — elegant armchair */
export const MebleIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4C7 3 8 2 9 2H15C16 2 17 3 17 4V10" />
    <path d="M5 10C4 10 3 11 3 12V16H21V12C21 11 20 10 19 10" />
    <path d="M7 10H17" />
    <path d="M5 10V16" />
    <path d="M19 10V16" />
    <path d="M4 16V20" />
    <path d="M20 16V20" />
    <path d="M3 16H21" />
    <path d="M8 10V7" />
    <path d="M16 10V7" />
  </svg>
)



/** Lampy — pendant lamp with shade */
export const LampyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Shade */}
    <path d="M7 9H17L15.5 14H8.5L7 9Z" />
    
    {/* Bulb hint */}
    <path d="M12 10.5V12.5" />
    
    {/* Stem */}
    <path d="M12 14V18" />
    
    {/* Base */}
    <path d="M9 18H15" />
    <path d="M8 20H16" />
  </svg>
)

/** Kuchnia i jadalnia — steaming teacup on saucer */
export const KuchniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Cup */}
    <path d="M6 10V14C6 16 7.5 17.5 10 17.5H14C16.5 17.5 18 16 18 14V10Z" />

    {/* Handle */}
    <path d="M18 11C20 11 21 12 21 13C21 14 20 15 18 15" />

    {/* Saucer */}
    <path d="M5 19C7 20 17 20 19 19" />

    {/* Steam */}
    <path d="M12 7C12 7 11 5.5 12 4C13 5.5 12 7 12 7Z" />
  </svg>
)


/** Organizacja — woven storage basket */
export const OrganizacjaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Basket body */}
    <path d="M5 9C5 9 6 19 12 19C18 19 19 9 19 9Z" />

    {/* Rim */}
    <path d="M4 9C6 7.5 18 7.5 20 9" />
  </svg>
)


/** Ogród i balkon — potted plant with leaves */
export const OgródIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Pot */}
    <path d="M8 15H16L15 20H9L8 15Z" />

    {/* Stem */}
    <path d="M12 15V9" />

    {/* Left leaf */}
    <path d="M12 10C12 10 9 9 8 6C10 6.5 11.5 8 12 10Z" />

    {/* Right leaf */}
    <path d="M12 10C12 10 15 9 16 6C14 6.5 12.5 8 12 10Z" />
  </svg>
)
