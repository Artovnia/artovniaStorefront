/**
 * ONA (Her) & ON (Him) — non-shared icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Akcesoria Męskie — leather belt with rectangular buckle */
export const AkcesoriaMęskieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Left strap going off-screen */}
  <path d="M0 21h14"/>
  <path d="M0 27h14"/>
  {/* Right strap going off-screen with pointed end tucked */}
  <path d="M34 21h10c2 0 3 1.5 3 3s-1 3-3 3H34"/>
  {/* Strap tail hanging down from buckle */}
  <path d="M20 27v5c0 1.5-.5 2.5-1.5 3"/>
  <path d="M26 27v5c0 1.5.5 2.5 1.5 3"/>
  {/* Strap tail end */}
  <path d="M18.5 35l2-1h5.5l2 1"/>
  {/* Belt tip pointing down */}
  <path d="M21 38l3 5 3-5"/>
  <path d="M21 38h6" opacity="0.4"/>
  {/* Buckle frame */}
  <rect x="14" y="18" width="20" height="12" rx="2" strokeWidth="2"/>
  {/* Buckle center bar */}
  <path d="M14 24h20" strokeWidth="1.5"/>
  {/* Prong */}
  <path d="M24 18v8" strokeWidth="2"/>
  <circle cx="24" cy="26" r="1.2"/>
  {/* Belt holes on right strap */}
  <circle cx="38" cy="24" r="1.2"/>
  <circle cx="42" cy="24" r="1.2"/>
  <circle cx="46" cy="24" r="1.2"/>
  {/* Stitching on left strap */}
  <path d="M2 22.5h10" strokeDasharray="2 2" opacity="0.25" strokeWidth="1"/>
  <path d="M2 25.5h10" strokeDasharray="2 2" opacity="0.25" strokeWidth="1"/>
  {/* Stitching on right strap */}
  <path d="M36 22.5h8" strokeDasharray="2 2" opacity="0.25" strokeWidth="1"/>
  <path d="M36 25.5h8" strokeDasharray="2 2" opacity="0.25" strokeWidth="1"/>
</svg>
)

/** Dodatki Męskie — knit beanie with folded brim and pom-pom */
export const DodatkiMęskieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Pom-pom */}
  <circle cx="24" cy="7" r="4"/>
  <path d="M22 5.5c.5 1 1.5 1.5 2 2" strokeWidth="1" opacity="0.4"/>
  <path d="M26 5.5c-.5 1-1.5 1.5-2 2" strokeWidth="1" opacity="0.4"/>
  <path d="M24 4v3" strokeWidth="1" opacity="0.4"/>
  {/* Hat crown */}
  <path d="M12 28c0-10 5-17 12-17s12 7 12 17"/>
  {/* Ribbed brim */}
  <rect x="8" y="28" width="32" height="8" rx="2"/>
  {/* Brim bottom */}
  <path d="M8 36c0 3 7 5.5 16 5.5s16-2.5 16-5.5"/>
  {/* Rib lines on brim */}
  <path d="M12 29v7" opacity="0.4" strokeWidth="1"/>
  <path d="M16 28.5v8" opacity="0.4" strokeWidth="1"/>
  <path d="M20 28.5v8.5" opacity="0.4" strokeWidth="1"/>
  <path d="M24 28.5v9" opacity="0.4" strokeWidth="1"/>
  <path d="M28 28.5v8.5" opacity="0.4" strokeWidth="1"/>
  <path d="M32 28.5v8" opacity="0.4" strokeWidth="1"/>
  <path d="M36 29v7" opacity="0.4" strokeWidth="1"/>
  {/* Knit texture lines on crown */}
  <path d="M16 18c2 2 5 3.5 8 3.5s6-1.5 8-3.5" opacity="0.25"/>
  <path d="M14 23c3 2 6 3 10 3s7-1 10-3" opacity="0.25"/>
  {/* Brim fold shadow */}
  <path d="M8 28h32" strokeWidth="1.8"/>
</svg>
)

/** Torebki i plecaki — structured handbag with clasp */
export const TorebkiPlecakiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bag body */}
  <path d="M6 20h36v18c0 3-2.5 5.5-5.5 5.5h-25C8.5 43.5 6 41 6 38z"/>
  {/* Bag flap */}
  <path d="M6 20c0-4 2-7 5-8h26c3 1 5 4 5 8"/>
  {/* Flap fold emphasis */}
  <path d="M6 20h36" strokeWidth="1.8"/>
  {/* Handle left */}
  <path d="M15 12V7c0-1.5 1-2.5 2.5-2.5h0"/>
  {/* Handle right */}
  <path d="M33 12V7c0-1.5-1-2.5-2.5-2.5h0"/>
  {/* Handle top */}
  <path d="M17.5 4.5h13" strokeWidth="1.8"/>
  {/* Clasp */}
  <rect x="20" y="19" width="8" height="6" rx="1.5"/>
  <path d="M24 19v-2"/>
  <circle cx="24" cy="22" r="1"/>
  {/* Stitching left */}
  <path d="M10 20v20" strokeDasharray="2 2" opacity="0.2"/>
  {/* Stitching right */}
  <path d="M38 20v20" strokeDasharray="2 2" opacity="0.2"/>
  {/* Bottom seam */}
  <path d="M10 36h28" opacity="0.25"/>
  {/* Decorative tassel */}
  <path d="M38 26l3 0M41 26v2.5M41 26l-.8 2.3M41 26l.8 2.3" strokeWidth="1.2" opacity="0.5"/>
</svg>
)
