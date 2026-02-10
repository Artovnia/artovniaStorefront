/**
 * DOM (Home) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Dekoracje — framed artwork with landscape */
export const DekoracjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="1" />
    <rect x="5" y="6" width="14" height="12" rx="0.5" />
    <path d="M5 14L8 11L11 14L15 9L19 13" />
    <circle cx="8.5" cy="9" r="1.5" />
    <path d="M12 2V4" />
    <path d="M10 2H14" />
  </svg>
)

/** Tekstylia — decorative cushion with tassels */
export const TekstyliaDomIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7C4 6 5 5 6 5H18C19 5 20 6 20 7V17C20 18 19 19 18 19H6C5 19 4 18 4 17V7Z" />
    <path d="M4 9C4 9 8 7.5 12 7.5C16 7.5 20 9 20 9" />
    <path d="M4 15C4 15 8 16.5 12 16.5C16 16.5 20 15 20 15" />
    <path d="M9 11L11 13L13 11L15 13" />
    <path d="M3 7L2 6" />
    <path d="M21 7L22 6" />
    <path d="M3 17L2 18" />
    <path d="M21 17L22 18" />
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
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1V4" />
    <path d="M8 4H16" />
    <path d="M8 4L5 14H19L16 4" />
    <path d="M5 14C5 14 7 16 12 16C17 16 19 14 19 14" />
    <path d="M10 14V15" />
    <path d="M14 14V15" />
    <path d="M4 18L8 16" />
    <path d="M20 18L16 16" />
    <path d="M9 8L15 8" />
    <path d="M8 11L16 11" />
  </svg>
)

/** Kuchnia i jadalnia — steaming teacup on saucer */
export const KuchniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 7V14C5 15.5 6.5 17 8.5 17H14.5C16.5 17 18 15.5 18 14V7" />
    <path d="M4 7H19" />
    <path d="M18 9H20C21 9 22 10 22 11C22 12 21 13 20 13H18" />
    <path d="M3 17H21" />
    <path d="M8 4C8 3 8.5 2 9 2C9.5 2 9 3 9 4" />
    <path d="M12 3C12 2 12.5 1 13 1C13.5 1 13 2 13 3" />
    <path d="M16 4C16 3 16.5 2 17 2C17.5 2 17 3 17 4" />
  </svg>
)

/** Organizacja — woven storage basket */
export const OrganizacjaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8H20V19C20 20 19 21 18 21H6C5 21 4 20 4 19V8Z" />
    <path d="M4 8L5.5 5H18.5L20 8" />
    <path d="M10 5V8" />
    <path d="M14 5V8" />
    <path d="M4 12H20" />
    <path d="M4 16H20" />
    <path d="M8 8V21" />
    <path d="M16 8V21" />
    <path d="M12 8V12" />
  </svg>
)

/** Ogród i balkon — potted plant with leaves */
export const OgródIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 15H16L15 21H9L8 15Z" />
    <path d="M8 15H16" />
    <path d="M12 15V10" />
    <path d="M12 10C12 10 8 9 6.5 5.5C9 6 11 8 12 10" />
    <path d="M12 10C12 10 16 9 17.5 5.5C15 6 13 8 12 10" />
    <path d="M12 8C12 8 10.5 4 12 1.5C13.5 4 12 8 12 8" />
    <path d="M8 6C8 6 9 5 10 5.5" />
    <path d="M16 6C16 6 15 5 14 5.5" />
    <path d="M10 17H14" />
    <path d="M9.5 19H14.5" />
  </svg>
)
