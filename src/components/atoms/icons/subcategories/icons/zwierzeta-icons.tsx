/**
 * ZWIERZĘTA (Pets) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Smycze — detailed leash with carabiner clip and wrist loop */
export const SmyczeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Collar — open oval */}
  <path d="M6 36c-2-3-2-7 0-10 2-4 6-6 11-6"/>
  <path d="M22 36c2-3 2-7 0-10-2-4-6-6-11-6"/>
  {/* Collar thickness */}
  <path d="M4 36h20" strokeWidth="1.8"/>
  <path d="M5 34h18" strokeWidth="1" opacity="0.3"/>
  {/* Collar buckle */}
  <rect x="3" y="33" width="6" height="6" rx="1" strokeWidth="1.3"/>
  <path d="M6 33v6" strokeWidth="1"/>
  {/* Collar holes */}
  <circle cx="13" cy="36" r="0.8" opacity="0.5"/>
  <circle cx="16" cy="36" r="0.8" opacity="0.5"/>
  <circle cx="19" cy="36" r="0.8" opacity="0.5"/>
  {/* D-ring on collar */}
  <circle cx="14" cy="30" r="2.5" strokeWidth="1.3"/>
  {/* Leash clip attaching to D-ring */}
  <rect x="12.5" y="25" width="3" height="3" rx="0.5" strokeWidth="1.3"/>
  {/* Leash strap — curving line up to handle */}
  <path d="M14 25c0-4 4-8 10-12s12-6 16-6" strokeWidth="2"/>
  {/* Leash inner line for strap width */}
  <path d="M15.5 24c1-4 5-7.5 10.5-11s11-5.5 15-5.5" strokeWidth="1" opacity="0.3"/>
  {/* Handle loop */}
  <path d="M40 7c3 0 5-1.5 5-3.5S43 1 40 1"/>
  <path d="M42 7c2 0 3.5-1.5 3.5-3.5S44 1 42 1" opacity="0.3"/>
  {/* Stars on collar (decorative) */}
  <path d="M10 35l.3.7.7.1-.5.5.1.7-.6-.3-.6.3.1-.7-.5-.5.7-.1z" strokeWidth="0.8" opacity="0.4"/>
</svg>
)

/** Szelki — pet harness with buckles, chest plate and straps */
export const SzelkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Center ring */}
  <circle cx="24" cy="16" r="3.5" strokeWidth="2"/>
  {/* Top strap (neck strap going up) */}
  <path d="M24 12.5V4"/>
  <path d="M22 12.5V4" opacity="0.3"/>
  <path d="M26 12.5V4" opacity="0.3"/>
  {/* Top buckle */}
  <rect x="20" y="2" width="8" height="5" rx="1" strokeWidth="1.3"/>
  <path d="M24 2v5" strokeWidth="1"/>
  {/* Buckle holes */}
  <circle cx="22" cy="4.5" r="0.5" opacity="0.5"/>
  <circle cx="26" cy="4.5" r="0.5" opacity="0.5"/>
  {/* Left strap going down-left */}
  <path d="M21 18.5L8 38" strokeWidth="2"/>
  <path d="M19.5 17.5L6.5 37" strokeWidth="1" opacity="0.3"/>
  {/* Left buckle */}
  <rect x="4" y="36" width="8" height="5" rx="1" strokeWidth="1.3"/>
  <path d="M8 36v5" strokeWidth="1"/>
  <circle cx="6" cy="38.5" r="0.5" opacity="0.5"/>
  <circle cx="10" cy="38.5" r="0.5" opacity="0.5"/>
  {/* Left strap extension */}
  <path d="M6 41l-3 4" strokeWidth="1.5"/>
  <path d="M10 41l-1 4" strokeWidth="1.5"/>
  {/* Right strap going down-right */}
  <path d="M27 18.5L40 38" strokeWidth="2"/>
  <path d="M28.5 17.5L41.5 37" strokeWidth="1" opacity="0.3"/>
  {/* Right buckle */}
  <rect x="36" y="36" width="8" height="5" rx="1" strokeWidth="1.3"/>
  <path d="M40 36v5" strokeWidth="1"/>
  <circle cx="38" cy="38.5" r="0.5" opacity="0.5"/>
  <circle cx="42" cy="38.5" r="0.5" opacity="0.5"/>
  {/* Right strap extension */}
  <path d="M38 41l-1 4" strokeWidth="1.5"/>
  <path d="M42 41l3 4" strokeWidth="1.5"/>
  {/* Hardware triangles connecting straps to ring */}
  <path d="M21.5 18l-2 2h5z" strokeWidth="1"/>
  <path d="M26.5 18l2 2h-5z" strokeWidth="1"/>
  <path d="M24 13l-1.5-1.5h3z" strokeWidth="1"/>
  {/* Stitching on top strap */}
  <path d="M24 7v4" strokeDasharray="1.5 1.5" opacity="0.25" strokeWidth="1"/>
</svg>
)

/** Obroże — pet collar with buckle and dangling tag */
export const ObrożeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Collar outer curve (perspective view) */}
  <path d="M4 20c0 8 9 14 20 14s20-6 20-14"/>
  <path d="M4 20c0-4 9-8 20-8s20 4 20 8"/>
  {/* Collar inner curve */}
  <path d="M8 20c0 6 7 10 16 10s16-4 16-10" opacity="0.4"/>
  {/* Collar thickness bottom */}
  <path d="M4 20v3c0 8 9 14 20 14s20-6 20-14v-3"/>
  {/* Buckle */}
  <rect x="2" y="17" width="7" height="9" rx="1.5" strokeWidth="1.5"/>
  <path d="M5.5 17v9" strokeWidth="1.2"/>
  {/* Buckle prong */}
  <path d="M5.5 17l2 4" strokeWidth="1.3"/>
  {/* D-ring for tag */}
  <circle cx="24" cy="13" r="3.5" strokeWidth="1.5"/>
  {/* Tag hanging from D-ring */}
  <path d="M24 16.5v2"/>
  <circle cx="24" cy="21" r="3"/>
  {/* Tag engraving lines */}
  <path d="M22.5 20.5h3" strokeWidth="1" opacity="0.4"/>
  <path d="M23 22h2" strokeWidth="1" opacity="0.4"/>
  {/* Holes in strap */}
  <circle cx="12" cy="19" r="1" opacity="0.5"/>
  <circle cx="16" cy="17.5" r="1" opacity="0.5"/>
  <circle cx="20" cy="16.5" r="1" opacity="0.5"/>
  {/* Stitching */}
  <path d="M8 22c6 4 12 6 16 6" strokeDasharray="2 2" opacity="0.2" strokeWidth="1"/>
</svg>
)

/** Chustki i bandany — folded bandana with pattern */
export const ChustkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bandana triangle */}
  <path d="M6 12h36L24 42z" strokeWidth="1.5"/>
  {/* Neck band / rolled top edge */}
  <path d="M4 10c4-2 10-3.5 20-3.5S40 8 44 10"/>
  <path d="M4 10c1 1.5 2 2.5 2 2.5"/>
  <path d="M44 10c-1 1.5-2 2.5-2 2.5"/>
  {/* Rolled fabric top */}
  <path d="M6 12c4-1.5 10-2.5 18-2.5S38 10.5 42 12" opacity="0.4"/>
  {/* Tie knot behind (visible ends) */}
  <path d="M4 10l-1-3c-.3-1 .5-2 1.5-1.5l2 2"/>
  <path d="M44 10l1-3c.3-1-.5-2-1.5-1.5l-2 2"/>
  {/* Fold lines on bandana */}
  <path d="M12 15l8 18" opacity="0.2"/>
  <path d="M36 15l-8 18" opacity="0.2"/>
  <path d="M24 14v24" opacity="0.15"/>
  {/* Decorative paw print */}
  <ellipse cx="24" cy="26" rx="2.5" ry="3" opacity="0.35"/>
  <circle cx="21.5" cy="22.5" r="1.2" opacity="0.35"/>
  <circle cx="26.5" cy="22.5" r="1.2" opacity="0.35"/>
  <circle cx="20" cy="25" r="1" opacity="0.35"/>
  <circle cx="28" cy="25" r="1" opacity="0.35"/>
  {/* Fabric edge stitch */}
  <path d="M10 14l12 24" strokeDasharray="2 3" opacity="0.15" strokeWidth="1"/>
</svg>
)

/** Zawieszki i identyfikatory — pet tag on ring */
export const ZawieszkiIdIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Split ring at top */}
  <circle cx="24" cy="8" r="4.5" strokeWidth="1.5"/>
  <circle cx="24" cy="8" r="3" opacity="0.4"/>
  {/* Ring connection */}
  <path d="M24 12.5v2"/>
  {/* Bone-shaped tag body */}
  <path d="M15 17c-3 0-5 2-5 4.5s2 4.5 5 4.5"/>
  <path d="M33 17c3 0 5 2 5 4.5s-2 4.5-5 4.5"/>
  <path d="M15 17h18"/>
  <path d="M15 26h18"/>
  {/* Bottom bone bumps */}
  <path d="M15 30c-3 0-5 2-5 4.5S12 39 15 39"/>
  <path d="M33 30c3 0 5 2 5 4.5S36 39 33 39"/>
  <path d="M15 30h18"/>
  <path d="M15 39h18"/>
  {/* Tag engraving lines */}
  <path d="M19 22h10" opacity="0.5"/>
  <path d="M20 25h8" opacity="0.4"/>
  {/* Bottom engraving */}
  <path d="M19 33h10" opacity="0.5"/>
  <path d="M20 36h8" opacity="0.4"/>
  {/* Shine */}
  <path d="M17 19l1.5 2" strokeWidth="1" opacity="0.3"/>
</svg>
)

/** Miski — pet bowl with food and paw print */
export const MiskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bowl rim (ellipse — top view perspective) */}
  <ellipse cx="24" cy="18" rx="18" ry="6"/>
  {/* Bowl outer body */}
  <path d="M6 18c1 10 8 18 18 18s17-8 18-18"/>
  {/* Bowl inner rim */}
  <ellipse cx="24" cy="18" rx="13" ry="4" opacity="0.4"/>
  {/* Bowl base */}
  <ellipse cx="24" cy="35" rx="8" ry="2" opacity="0.3"/>
  {/* Kibble pieces inside */}
  <ellipse cx="20" cy="17" rx="2" ry="1.2" opacity="0.5"/>
  <ellipse cx="26" cy="16.5" rx="2" ry="1.2" opacity="0.5"/>
  <ellipse cx="23" cy="19" rx="1.8" ry="1" opacity="0.5"/>
  <ellipse cx="18" cy="19.5" rx="1.5" ry="1" opacity="0.4"/>
  <ellipse cx="28" cy="18.5" rx="1.5" ry="1" opacity="0.4"/>
  {/* Paw print on bowl side */}
  <ellipse cx="24" cy="28" rx="2" ry="2.5" opacity="0.35"/>
  <circle cx="22" cy="25" r="1" opacity="0.35"/>
  <circle cx="26" cy="25" r="1" opacity="0.35"/>
  <circle cx="21" cy="27.5" r="0.8" opacity="0.3"/>
  <circle cx="27" cy="27.5" r="0.8" opacity="0.3"/>
</svg>
)

/** Pozostałe Zwierzęta — paw print with heart */
export const PozostałeZwierzetaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Main pad (large, bottom) — heart shaped */}
  <path d="M24 40S12 32 12 25c0-3.5 2.5-6.5 5.5-6.5S24 22 24 24c0-2 3-5.5 6.5-5.5S36 21.5 36 25c0 7-12 15-12 15z" strokeWidth="1.5"/>
  {/* Toe pad top-left */}
  <ellipse cx="13" cy="14" rx="4" ry="5"/>
  {/* Toe pad mid-left */}
  <ellipse cx="21" cy="10" rx="3.5" ry="5"/>
  {/* Toe pad mid-right */}
  <ellipse cx="27" cy="10" rx="3.5" ry="5"/>
  {/* Toe pad top-right */}
  <ellipse cx="35" cy="14" rx="4" ry="5"/>
  {/* Subtle sparkle */}
  <path d="M6 8l.5-1.5.5 1.5M7.5 8.5l-1.5.4 1.5.4" strokeWidth="1" opacity="0.4"/>
  <path d="M42 8l.5-1.5.5 1.5M43.5 8.5l-1.5.4 1.5.4" strokeWidth="1" opacity="0.4"/>
  </svg>
)

/** Legowiska — cozy pet bed with cushion */
export const LegowiskaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Zzz drawn as paths — large and clear */}
  {/* Big Z */}
  <path d="M26 3h6l-6 7h6" strokeWidth="2"/>
  {/* Medium z */}
  <path d="M20 6h4l-4 5h4" strokeWidth="1.8"/>
  {/* Small z */}
  <path d="M17 12h3l-3 3.5h3" strokeWidth="1.5"/>
  {/* Bed outer rim back */}
  <path d="M4 28c0-5 9-9 18-9s18 4 18 9" strokeWidth="1.8"/>
  {/* Cushion stitches on rim */}
  <path d="M11 22v5" strokeWidth="1.3"/>
  <path d="M17 20.5v5" strokeWidth="1.3"/>
  <path d="M22 20v5" strokeWidth="1.3"/>
  <path d="M27 20v5" strokeWidth="1.3"/>
  <path d="M33 20.5v5" strokeWidth="1.3"/>
  <path d="M38 22v5" strokeWidth="1.3"/>
  {/* Inner cushion dip */}
  <path d="M6 28c5 3 11 5 16 5s12-2 18-5" strokeWidth="1.5"/>
  {/* Bed outer body */}
  <path d="M4 28v5c0 4 9 7 18 7s18-3 18-7v-5" strokeWidth="1.8"/>
  {/* Wavy cushion inside */}
  <path d="M10 31c4 1.5 8 2.5 12 2.5s9-1 13-2.5" opacity="0.4"/>
  {/* Small cartoon bone next to bed */}
  {/* Bone left knobs */}
  <ellipse cx="35" cy="38" rx="2" ry="1.5" transform="rotate(-30 35 38)" strokeWidth="1.5"/>
  <ellipse cx="37.5" cy="36.5" rx="2" ry="1.5" transform="rotate(-30 37.5 36.5)" strokeWidth="1.5"/>
  {/* Bone shaft */}
  <path d="M37 39l4 3" strokeWidth="2.5"/>
 {/* Bone right knobs*/}
  <ellipse cx="42" cy="43" rx="2" ry="1.5" transform="rotate(-30 42 43)" strokeWidth="1.5"/>
  <ellipse cx="44" cy="41" rx="2" ry="1.5" transform="rotate(-30 44 41)" strokeWidth="1.5"/>
</svg>
)
