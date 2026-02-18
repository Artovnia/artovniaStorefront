/**
 * AKCESORIA (Accessories) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Moda — cat-eye sunglasses */
export const ModaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Left lens */}
  <path d="M5 20c0-3 2.5-5 6-5h4c3 0 5 2 5 5v4c0 3-2 6-5.5 6H11c-3.5 0-6-3-6-6z"/>
  {/* Right lens */}
  <path d="M28 20c0-3 2.5-5 6-5h4c3 0 5 2 5 5v4c0 3-2 6-5.5 6H33.5c-3.5 0-5.5-3-5.5-6z"/>
  {/* Bridge */}
  <path d="M20 19c1-2 3-3 4-3s3 1 4 3"/>
  {/* Left temple arm */}
  <path d="M5 19l-2-1.5"/>
  {/* Right temple arm */}
  <path d="M43 19l2-1.5"/>
  {/* Lens reflection left */}
  <path d="M9 19c1-.5 2-.5 3 0" opacity="0.3" strokeWidth="1"/>
  {/* Lens reflection right */}
  <path d="M33 19c1-.5 2-.5 3 0" opacity="0.3" strokeWidth="1"/>
  {/* Small decorative star */}
  <path d="M24 34l.6 1.2 1.4.2-1 1 .2 1.4-1.2-.6-1.2.6.2-1.4-1-1 1.4-.2z" strokeWidth="1" opacity="0.4"/>
</svg>
)

/** Technologia — phone case with camera detail */
export const TechnologiaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Phone/tablet body */}
  <rect x="8" y="4" width="22" height="40" rx="3"/>
  {/* Screen area */}
  <rect x="11" y="9" width="16" height="28" rx="1"/>
  {/* Home button / notch */}
  <circle cx="19" cy="41" r="1.2"/>
  {/* Speaker slit */}
  <path d="M16 6.5h6"/>
  {/* Camera dot */}
  <circle cx="14" cy="6.5" r="0.7"/>
  {/* Stylus / pencil */}
  <path d="M36 8l-2 32" strokeWidth="1.8"/>
  <path d="M34 40l-.8 3.5.8-.5.8.5z"/>
  {/* Stylus top */}
  <path d="M36 8l.8-2-.8-.5-.8.5z"/>
  {/* Stylus clip */}
  <path d="M36.5 10l1.5 0 0 6-1.5 0" strokeWidth="1"/>
  {/* Screen content suggestion */}
  <path d="M14 15h10M14 19h7M14 23h9" opacity="0.25"/>
</svg>
)

/** Papeteria i biuro — open notebook with pen */
export const PapeteriaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Notebook body */}
  <rect x="10" y="4" width="26" height="38" rx="2"/>
  {/* Notebook spine */}
  <path d="M10 4v38" strokeWidth="2"/>
  {/* Spine rings */}
  <circle cx="10" cy="10" r="2" strokeWidth="1.2"/>
  <circle cx="10" cy="18" r="2" strokeWidth="1.2"/>
  <circle cx="10" cy="26" r="2" strokeWidth="1.2"/>
  <circle cx="10" cy="34" r="2" strokeWidth="1.2"/>
  {/* Page lines */}
  <path d="M16 12h15" opacity="0.35"/>
  <path d="M16 16h12" opacity="0.35"/>
  <path d="M16 20h14" opacity="0.35"/>
  <path d="M16 24h10" opacity="0.35"/>
  <path d="M16 28h13" opacity="0.35"/>
  {/* Elastic band */}
  <path d="M33 4v38" strokeWidth="1" opacity="0.5"/>
  {/* Pencil overlapping */}
  <path d="M38 40L42 8" strokeWidth="1.8"/>
  <path d="M42 8l.6-2.5-1.2-.3-.6 2.5" strokeWidth="1.2"/>
  {/* Pencil tip */}
  <path d="M37.6 42l-.6 2.5 1.5.2z" strokeWidth="1"/>
  {/* Pencil eraser band */}
  <path d="M41.8 9.5l1.2.3" strokeWidth="1.5" opacity="0.6"/>
</svg>
)

/** Podróże — compass with cardinal points */
export const PodróżeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bag body */}
  <rect x="4" y="16" width="40" height="22" rx="4"/>
  {/* Bag flap / zipper line */}
  <path d="M4 22h40"/>
  {/* Handle left strap */}
  <path d="M16 16v-3c0-2 1.5-3.5 3.5-3.5h0"/>
  {/* Handle right strap */}
  <path d="M32 16v-3c0-2-1.5-3.5-3.5-3.5h0"/>
  {/* Handle top */}
  <path d="M19.5 9.5h9"/>
  {/* Zipper pull */}
  <circle cx="24" cy="22" r="1.2"/>
  {/* Front pocket */}
  <rect x="14" y="27" width="20" height="8" rx="1.5"/>
  {/* Pocket clasp */}
  <path d="M22 27v2h4v-2"/>
  {/* Buckle left */}
  <rect x="7" y="25" width="3" height="4" rx="0.5" strokeWidth="1.2"/>
  {/* Buckle right */}
  <rect x="38" y="25" width="3" height="4" rx="0.5" strokeWidth="1.2"/>
  {/* Small luggage tag */}
  <path d="M38 14h4v5h-4z" strokeWidth="1"/>
  <circle cx="40" cy="14" r="1" strokeWidth="1"/>
  <path d="M39 16.5h2" strokeWidth="0.8" opacity="0.5"/>
</svg>
)
