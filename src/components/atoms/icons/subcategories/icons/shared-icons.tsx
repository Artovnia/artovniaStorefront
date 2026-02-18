/**
 * SHARED / REUSABLE ICONS
 * Used across multiple parent categories (e.g. Biżuteria in Ona & On)
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Biżuteria — elegant dangling earring with gemstone */
export const BiżuteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Necklace chain left */}
  <path d="M4 4c2 4 6 10 12 14"/>
  {/* Necklace chain right */}
  <path d="M44 4c-2 4-6 10-12 14"/>
  {/* Chain detail left */}
  <path d="M8 9c1 1.5 2.5 3 4 4.5" strokeDasharray="2 2.5" opacity="0.4"/>
  {/* Chain detail right */}
  <path d="M40 9c-1 1.5-2.5 3-4 4.5" strokeDasharray="2 2.5" opacity="0.4"/>
  {/* Pendant bail (loop connecting to chain) */}
  <path d="M16 18c2 1.5 5 2.5 8 2.5s6-1 8-2.5"/>
  <path d="M20 19.5c1 1 2.5 1.5 4 1.5s3-.5 4-1.5"/>
  {/* Gemstone — faceted diamond shape */}
  <path d="M18 28h12l-6 12z" strokeWidth="1.5"/>
  <path d="M18 28l2-4h8l2 4" strokeWidth="1.5"/>
  {/* Gem top facets */}
  <path d="M20 24l4 4 4-4"/>
  {/* Gem inner facets */}
  <path d="M20 28l4 12M28 28l-4 12"/>
  {/* Small sparkle left */}
  <path d="M12 26l.5-1.5.5 1.5M13.5 26.5l-1.5.4 1.5.4" strokeWidth="1" opacity="0.4"/>
  {/* Small sparkle right */}
  <path d="M35 30l.5-1.5.5 1.5M36.5 30.5l-1.5.4 1.5.4" strokeWidth="1" opacity="0.4"/>
</svg>
)

/** Ubrania — flowing dress on hanger */
export const UbraniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Neckline */}
  <path d="M19 6c1.5 2 3 3 5 3s3.5-1 5-3"/>
  {/* Straps */}
  <path d="M19 6l-1-3.5"/>
  <path d="M29 6l1-3.5"/>
  {/* Bodice left */}
  <path d="M19 6c-2 2-4 5-5 9l-1 4"/>
  {/* Bodice right */}
  <path d="M29 6c2 2 4 5 5 9l1 4"/>
  {/* Waist cinch */}
  <path d="M13 19c3-1.5 7-2.5 11-2.5s8 1 11 2.5"/>
  {/* Skirt flare left */}
  <path d="M13 19c-3 6-6 14-8 22"/>
  {/* Skirt flare right */}
  <path d="M35 19c3 6 6 14 8 22"/>
  {/* Hem */}
  <path d="M5 41c5-1.5 11-2.5 19-2.5s14 1 19 2.5"/>
  {/* Waist belt / sash */}
  <path d="M13 19h22" strokeWidth="1.8"/>
  {/* Sash bow */}
  <path d="M24 19c-1.5 1-3 1.5-3 2.5s1.5 1 3 .5"/>
  <path d="M24 19c1.5 1 3 1.5 3 2.5s-1.5 1-3 .5"/>
  {/* Skirt flow lines */}
  <path d="M18 22c-2 6-3.5 12-5 18" opacity="0.25"/>
  <path d="M30 22c2 6 3.5 12 5 18" opacity="0.25"/>
  <path d="M24 19v20" opacity="0.15"/>
  {/* Subtle hem ruffle */}
  <path d="M9 40c2.5-.5 5-1 8-.5s5 1 7 .5 4.5-1 7-.5 5.5 0 8 .5" opacity="0.3" strokeWidth="1"/>
</svg>
)

/** Ubrania męskie — casual t-shirt with collar and sleeve detail */
export const UbraniaMęskieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Collar left */}
  <path d="M18 4l-5 6 5 3"/>
  {/* Collar right */}
  <path d="M30 4l5 6-5 3"/>
  {/* Collar stand */}
  <path d="M18 4c2 1.5 4 2 6 2s4-.5 6-2"/>
  {/* Shoulder left */}
  <path d="M13 10l-5 3"/>
  {/* Shoulder right */}
  <path d="M35 10l5 3"/>
  {/* Sleeve left */}
  <path d="M8 13l-3 14h7"/>
  {/* Sleeve right */}
  <path d="M40 13l3 14h-7"/>
  {/* Cuff left */}
  <path d="M5 27h7v2H5"/>
  {/* Cuff right */}
  <path d="M36 27h7v2h-7"/>
  {/* Body left */}
  <path d="M12 29l-1 15"/>
  {/* Body right */}
  <path d="M36 29l1 15"/>
  {/* Hem */}
  <path d="M11 44h26"/>
  {/* Placket center */}
  <path d="M24 13v31" strokeWidth="1"/>
  {/* Buttons */}
  <circle cx="24" cy="17" r="1"/>
  <circle cx="24" cy="23" r="1"/>
  <circle cx="24" cy="29" r="1"/>
  <circle cx="24" cy="35" r="1"/>
  <circle cx="24" cy="41" r="1"/>
  {/* Chest pocket */}
  <rect x="16" y="16" width="5" height="4" rx="0.5" opacity="0.5" strokeWidth="1"/>
</svg>
)

/** Dodatki — elegant draped scarf with fringe */
export const DodatkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Scarf main loop */}
  <path d="M14 8c-6 2-10 8-10 15s4 12 10 14"/>
  <path d="M34 8c6 2 10 8 10 15s-4 12-10 14"/>
  {/* Scarf cross-over at top */}
  <path d="M14 8c3-2 6-3 10-3s7 1 10 3"/>
  {/* Scarf left tail hanging */}
  <path d="M14 37c-1 1-1.5 2.5-1 4l3 3"/>
  <path d="M16 44c-.5 0-1.5-.5-2-.5"/>
  {/* Scarf right tail hanging */}
  <path d="M34 37c1 1 1.5 2.5 1 4l-3 3"/>
  <path d="M32 44c.5 0 1.5-.5 2-.5"/>
  {/* Fringe left */}
  <path d="M14 43v3M15.5 43.5v2.5M12.5 43.5v2.5" strokeWidth="1" opacity="0.6"/>
  {/* Fringe right */}
  <path d="M34 43v3M35.5 43.5v2.5M32.5 43.5v2.5" strokeWidth="1" opacity="0.6"/>
  {/* Inner scarf fold showing overlap */}
  <path d="M16 10c2.5-1 5-1.5 8-1.5s5.5.5 8 1.5" opacity="0.4"/>
  <path d="M12 14c3.5-2 7.5-3 12-3s8.5 1 12 3" opacity="0.3"/>
  {/* Fabric drape lines */}
  <path d="M8 18c1 5 2 10 4 15" opacity="0.3" strokeWidth="1"/>
  <path d="M40 18c-1 5-2 10-4 15" opacity="0.3" strokeWidth="1"/>
  {/* Pattern dots on scarf */}
  <circle cx="10" cy="22" r="1" opacity="0.3"/>
  <circle cx="38" cy="22" r="1" opacity="0.3"/>
  <circle cx="8" cy="28" r="1" opacity="0.3"/>
  <circle cx="40" cy="28" r="1" opacity="0.3"/>
  {/* Center decorative knot area */}
  <path d="M20 7c1.5.5 2.5 1.5 4 1.5s2.5-1 4-1.5" strokeWidth="1.2" opacity="0.5"/>
</svg>
)

/** Zabawki — teddy bear with bow */
export const ZabawkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Tennis ball */}
  <circle cx="15" cy="33" r="12" strokeWidth="1.8"/>
  {/* Tennis ball seam left */}
  <path d="M7 25c2 3 2 7 0 11" strokeWidth="1.5"/>
  {/* Tennis ball seam right */}
  <path d="M23 25c-2 3-2 7 0 11" strokeWidth="1.5"/>
  {/* Bone — diagonal, cartoon style */}
  {/* Top-left knob pair */}
  <ellipse cx="21" cy="12" rx="3.5" ry="2.8" transform="rotate(-35 21 12)" strokeWidth="1.8"/>
  <ellipse cx="25.5" cy="9" rx="3.5" ry="2.8" transform="rotate(-35 25.5 9)" strokeWidth="1.8"/>
  {/* Bone shaft as outlined shape */}
  <path d="M21.2 12.3 L24.8 8.7 L40.8 24.7 L37.2 28.3 Z" strokeWidth="1.8"/>
  {/* Bottom-right knob pair */}
  <ellipse cx="37" cy="28" rx="3.5" ry="2.8" transform="rotate(-35 37 28)" strokeWidth="1.8"/>
  <ellipse cx="41.5" cy="25" rx="3.5" ry="2.8" transform="rotate(-35 41.5 25)" strokeWidth="1.8"/>
</svg>
)

/** Ubranka — baby onesie with snap buttons */
export const UbrankaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Neck opening */}
  <ellipse cx="24" cy="8" rx="10" ry="4"/>
  {/* Ribbed neck */} 
  <path d="M14 8v3c2 2 6 3 10 3s8-1 10-3V8"/>
  <path d="M16 9v2.5" opacity="0.3" strokeWidth="1"/>
  <path d="M20 9.5v3" opacity="0.3" strokeWidth="1"/>
  <path d="M24 10v3" opacity="0.3" strokeWidth="1"/>
  <path d="M28 9.5v3" opacity="0.3" strokeWidth="1"/>
  <path d="M32 9v2.5" opacity="0.3" strokeWidth="1"/>
  {/* Body left side */}
  <path d="M14 11c-2 2-4 6-4 12v10c0 2 1 3 3 3.5"/>
  {/* Body right side */}
  <path d="M34 11c2 2 4 6 4 12v10c0 2-1 3-3 3.5"/>
  {/* Bottom hem */}
  <path d="M13 36.5c3 1.5 7 2.5 11 2.5s8-1 11-2.5"/>
  {/* Front leg hole left */}
  <ellipse cx="14" cy="18" rx="4" ry="5"/>
  {/* Front leg hole right */}
  <ellipse cx="34" cy="18" rx="4" ry="5"/>
  {/* Belly strap */}
  <path d="M12 28h24" strokeWidth="1.5"/>
  {/* Velcro / buckle on strap */}
  <rect x="21" y="26" width="6" height="4" rx="1"/>
  {/* Bone pattern on back */}
  <path d="M21 20c0-1 .5-1.5 1.2-1.5h3.6c.7 0 1.2.5 1.2 1.5s-.5 1.5-1.2 1.5h-3.6C21.5 21.5 21 21 21 20z" strokeWidth="1" opacity="0.4"/>
  <circle cx="21.5" cy="20" r="1" opacity="0.3"/>
  <circle cx="26.5" cy="20" r="1" opacity="0.3"/>
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Pouch body */}
  <path d="M6 18h36v20c0 2.5-2 4.5-4.5 4.5h-27C8 42.5 6 40.5 6 38z"/>
  {/* Pouch flap */}
  <path d="M6 18c0-5 4-10 8-12h20c4 2 8 7 8 12"/>
  {/* Flap fold line */}
  <path d="M6 18h36" strokeWidth="1.8"/>
  {/* Button clasp */}
  <circle cx="24" cy="22" r="2"/>
  {/* Stitching detail */}
  <path d="M10 18v22" strokeDasharray="2 2" opacity="0.25"/>
  <path d="M38 18v22" strokeDasharray="2 2" opacity="0.25"/>
  {/* Tag */}
  <path d="M34 10l5-3v6z" strokeWidth="1.2"/>
  <circle cx="37" cy="10" r="0.7" opacity="0.5"/>
  {/* Star decoration on pouch */}
  <path d="M24 30l1.5 3 3.3.5-2.4 2.3.5 3.2-3-1.5-3 1.5.5-3.2-2.4-2.3 3.3-.5z" strokeWidth="1.2" opacity="0.5"/>
  {/* Small dots */}
  <circle cx="16" cy="28" r="0.8" opacity="0.3"/>
  <circle cx="32" cy="28" r="0.8" opacity="0.3"/>
</svg>
)

/** Zestawy prezentowe — wrapped gift box with ribbon and bow */
export const ZestawyPrezentoweIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Large box (back) */}
  <rect x="4" y="22" width="22" height="16" rx="1.5"/>
  <rect x="3" y="18" width="24" height="4" rx="1"/>
  {/* Large box ribbon vertical */}
  <path d="M15 18v20"/>
  {/* Large box bow */}
  <path d="M15 18c-2-2-5-3-5.5-1.5S12 19 15 18"/>
  <path d="M15 18c2-2 5-3 5.5-1.5S18 19 15 18"/>
  {/* Medium box (front right) */}
  <rect x="22" y="28" width="18" height="14" rx="1.5"/>
  <rect x="21" y="25" width="20" height="3" rx="1"/>
  {/* Medium box ribbon vertical */}
  <path d="M31 25v17"/>
  {/* Medium box bow */}
  <path d="M31 25c-1.5-1.5-4-2.5-4.5-1S29 25.5 31 25"/>
  <path d="M31 25c1.5-1.5 4-2.5 4.5-1S33 25.5 31 25"/>
  {/* Small box (top) */}
  <rect x="24" y="12" width="14" height="10" rx="1.5"/>
  <rect x="23" y="9" width="16" height="3" rx="1"/>
  {/* Small box ribbon */}
  <path d="M31 9v13"/>
  {/* Small box bow */}
  <path d="M31 9c-1.2-1.5-3.5-2-3.8-.8S29.5 10 31 9"/>
  <path d="M31 9c1.2-1.5 3.5-2 3.8-.8S32.5 10 31 9"/>
  {/* Decorative dots around */}
  <circle cx="8" cy="14" r="0.7" opacity="0.35"/>
  <circle cx="44" cy="20" r="0.7" opacity="0.35"/>
  <circle cx="12" cy="10" r="0.7" opacity="0.35"/>
  {/* Sparkle */}
  <path d="M42 8l.5-1.5.5 1.5M43.5 8.5l-1.5.5 1.5.5" strokeWidth="1" opacity="0.4"/>
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
