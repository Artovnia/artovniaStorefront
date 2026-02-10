/**
 * SHARED / REUSABLE ICONS
 * Used across multiple parent categories (e.g. Biżuteria in Ona & On)
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Biżuteria — elegant dangling earring with gemstone */
export const BiżuteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="3.5" r="1.5" />
    <path d="M12 5V7" />
    <path d="M12 7L9 10" />
    <path d="M12 7L15 10" />
    <path d="M9 10L12 13L15 10" />
    <path d="M12 13V15" />
    <path d="M12 15C10 15 8.5 16.5 8.5 18.5C8.5 20.5 10 22 12 22C14 22 15.5 20.5 15.5 18.5C15.5 16.5 14 15 12 15Z" />
    <path d="M10.5 18L12 16.5L13.5 18L12 19.5L10.5 18Z" />
  </svg>
)

/** Ubrania — flowing dress on hanger */
export const UbraniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2V3" />
    <path d="M8 5L12 3L16 5" />
    <path d="M8 5L6 6" />
    <path d="M16 5L18 6" />
    <path d="M8 5V8C8 8 8 10 10 10" />
    <path d="M16 5V8C16 8 16 10 14 10" />
    <path d="M10 10C10 10 9 12 8 14C7 16 6 22 6 22" />
    <path d="M14 10C14 10 15 12 16 14C17 16 18 22 18 22" />
    <path d="M6 22C6 22 9 20 12 20C15 20 18 22 18 22" />
    <path d="M10 10C10 10 11 11 12 11C13 11 14 10 14 10" />
  </svg>
)

/** Ubrania męskie — casual t-shirt with collar and sleeve detail */
export const UbraniaMęskieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2L4 5V9L7 8V20C7 20.5 7.5 21 8 21H16C16.5 21 17 20.5 17 20V8L20 9V5L15 2" />
    <path d="M9 2C9 2 10 4 12 4C14 4 15 2 15 2" />
    <path d="M4 5.5L5.5 5" />
    <path d="M20 5.5L18.5 5" />
    <path d="M7 11H17" />
    <path d="M10 15H14" />
  </svg>
)

/** Dodatki — elegant draped scarf with fringe */
export const DodatkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3C7 3 5 4 5 6C5 8 7 9 7 9" />
    <path d="M7 9C7 9 4 10 4 13C4 15 6 16 6 16" />
    <path d="M6 16L5 19" />
    <path d="M4 19L6 19" />
    <path d="M17 3C17 3 19 4 19 6C19 8 17 9 17 9" />
    <path d="M17 9C17 9 20 10 20 13C20 15 18 16 18 16" />
    <path d="M18 16L19 19" />
    <path d="M18 19L20 19" />
    <path d="M7 3C7 3 9 2 12 2C15 2 17 3 17 3" />
    <path d="M7 9C7 9 9 8 12 8C15 8 17 9 17 9" />
    <path d="M9 5L9 7" />
    <path d="M12 4.5L12 7.5" />
    <path d="M15 5L15 7" />
  </svg>
)

/** Zabawki — teddy bear with bow */
export const ZabawkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8.5" cy="5.5" r="2.5" />
    <circle cx="15.5" cy="5.5" r="2.5" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="10" cy="11" r="0.7" fill="currentColor" stroke="none" />
    <circle cx="14" cy="11" r="0.7" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="13" rx="1.5" ry="1" />
    <path d="M10.5 14.5C10.5 14.5 11 15.5 12 15.5C13 15.5 13.5 14.5 13.5 14.5" />
    <path d="M9 18L8 20" />
    <path d="M15 18L16 20" />
    <circle cx="8.5" cy="5.5" r="1" />
    <circle cx="15.5" cy="5.5" r="1" />
  </svg>
)

/** Ubranka — baby onesie with snap buttons */
export const UbrankaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3L7 5L4 6V10L7 9V17C7 18.5 8.5 20 10 20H14C15.5 20 17 18.5 17 17V9L20 10V6L17 5L15 3" />
    <path d="M9 3C9 3 10 5 12 5C14 5 15 3 15 3" />
    <path d="M10 10H14" />
    <circle cx="11" cy="16" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="13" cy="16" r="0.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="0.5" fill="currentColor" stroke="none" />
    <path d="M4 7.5L5.5 7" />
    <path d="M20 7.5L18.5 7" />
  </svg>
)

/** Akcesoria — structured tote bag with details */
export const AkcesoriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 9H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V9Z" />
    <path d="M5 9L6 7H18L19 9" />
    <path d="M9 7V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7" />
    <path d="M5 13H19" />
    <circle cx="12" cy="17" r="1.5" />
    <path d="M12 15.5V13" />
  </svg>
)

/** Pozostałe — decorative four-point star pattern */
export const PozostałeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L13 6L17 5L14 8L18 10L14 11L15 15L12 12L9 15L10 11L6 10L10 8L7 5L11 6Z" />
    <circle cx="5" cy="18" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="19" cy="18" r="2" />
  </svg>
)

/** Zestawy prezentowe — wrapped gift box with ribbon and bow */
export const ZestawyPrezentoweIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="11" rx="1.5" />
    <rect x="4.5" y="7" width="15" height="3" rx="1" />
    <path d="M12 7V21" />
    <path d="M8 7C8 7 8 5 9 4C10 3 12 4 12 4" />
    <path d="M16 7C16 7 16 5 15 4C14 3 12 4 12 4" />
    <path d="M12 4V7" />
    <path d="M10 4C10 3.5 10.5 3 11 3" />
    <path d="M14 4C14 3.5 13.5 3 13 3" />
    <path d="M6 15H10" />
    <path d="M14 15H18" />
  </svg>
)

/** Generic fallback — decorative compass rose */
export const GenericCategoryIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2V5" />
    <path d="M12 19V22" />
    <path d="M2 12H5" />
    <path d="M19 12H22" />
    <path d="M4.93 4.93L7.05 7.05" />
    <path d="M16.95 16.95L19.07 19.07" />
    <path d="M4.93 19.07L7.05 16.95" />
    <path d="M16.95 7.05L19.07 4.93" />
  </svg>
)
