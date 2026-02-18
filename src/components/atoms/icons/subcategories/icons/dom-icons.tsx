/**
 * DOM (Home) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Dekoracje — framed artwork with landscape */
export const DekoracjeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Picture frame outer */}
  <rect x="4" y="4" width="30" height="28" rx="1.5" strokeWidth="1.8"/>
  {/* Picture frame inner */}
  <rect x="8" y="8" width="22" height="20" rx="0.5"/>
  {/* Hanging wire */}
  <path d="M12 4l7-3 7 3" strokeWidth="1.2"/>
  {/* Mountain landscape inside frame */}
  <path d="M8 24l6-8 5 5 4-6 7 9" strokeWidth="1.3"/>
  {/* Sun in frame */}
  <circle cx="13" cy="13" r="2.5"/>
  {/* Sun rays */}
  <path d="M13 9v1.5M13 15v1.5M9 13h1.5M15 13h1.5M10 10l1 1M15 10l-1 1M10 16l1-1M15 16l-1-1" strokeWidth="1" opacity="0.4"/>
  {/* Ground line in painting */}
  <path d="M8 24h22" opacity="0.3"/>
  {/* Candle to the right */}
  <rect x="38" y="24" width="6" height="14" rx="1.5"/>
  {/* Candle top */}
  <path d="M38 26h6" opacity="0.3"/>
  {/* Wick */}
  <path d="M41 24v-3"/>
  {/* Flame */}
  <path d="M41 15c-1.2 1.2-2 2.5-2 3.5 0 1.2 1 2 2 2s2-.8 2-2c0-1-.8-2.3-2-3.5z" strokeWidth="1.3"/>
  {/* Flame inner */}
  <path d="M41 17.5c-.5.5-.8 1.2-.8 1.7 0 .5.4.8.8.8s.8-.3.8-.8c0-.5-.3-1.2-.8-1.7" opacity="0.4" strokeWidth="1"/>
  {/* Candle drip */}
  <path d="M40 26v2" opacity="0.4" strokeWidth="1"/>
  {/* Small star decoration on wall */}
  <path d="M40 6l.8 1.6 1.7.3-1.2 1.2.3 1.7L40 9.8l-1.6 1 .3-1.7-1.2-1.2 1.7-.3z" strokeWidth="1" opacity="0.35"/>
  {/* Wall texture dots */}
  <circle cx="38" cy="42" r="0.6" opacity="0.2"/>
  <circle cx="4" cy="38" r="0.6" opacity="0.2"/>
</svg>
)

/** Tekstylia — decorative cushion with tassels */
export const TekstyliaDomIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Pillow body with soft curves */}
  <path d="M8 18c0-3 3-6 7-7h18c4 1 7 4 7 7v12c0 3-3 6-7 7H15c-4-1-7-4-7-7z"/>
  {/* Pillow seam lines showing softness */}
  <path d="M8 24c4-1.5 8-2 16-2s12 .5 16 2"/>
  <path d="M24 11v26" strokeDasharray="3 3" opacity="0.5"/>
  {/* Corner tufts / gathers */}
  <path d="M11 14c1-1 2.5-1.5 4-2"/>
  <path d="M11 34c1 1 2.5 1.5 4 2"/>
  <path d="M37 14c-1-1-2.5-1.5-4-2"/>
  <path d="M37 34c-1 1-2.5 1.5-4 2"/>
  {/* Tassel left */}
  <path d="M8 24l-3 0M5 24v3M5 24l-1 2.8M5 24l1 2.8"/>
  {/* Tassel right */}
  <path d="M40 24l3 0M43 24v3M43 24l-1 2.8M43 24l1 2.8"/>
  {/* Subtle fabric texture */}
  <path d="M16 17c2 1.5 5 2 8 2s6-.5 8-2" opacity="0.4"/>
  <path d="M16 31c2-1.5 5-2 8-2s6 .5 8 2" opacity="0.4"/>
</svg>
)


/** Meble — elegant armchair */
export const MebleIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Backrest */}
  <path d="M12 12c0-3 2.5-5 5-5.5h14c2.5.5 5 2.5 5 5.5v10"/>
  {/* Seat */}
  <path d="M10 28h28"/>
  {/* Inner backrest curve */}
  <path d="M15 10v16h18V10"/>
  {/* Armrest left */}
  <path d="M12 12c-3 1-4.5 3-4.5 6v7c0 2 1 3 2.5 3"/>
  {/* Armrest right */}
  <path d="M36 12c3 1 4.5 3 4.5 6v7c0 2-1 3-2.5 3"/>
  {/* Seat cushion */}
  <path d="M15 26c3-1 6-1.5 9-1.5s6 .5 9 1.5"/>
  {/* Front legs */}
  <path d="M12 28l-2 13M36 28l2 13"/>
  {/* Back legs */}
  <path d="M15 28l-1 13M33 28l1 13"/>
  {/* Leg crossbar */}
  <path d="M13 37h4M30 37h4" opacity="0.5"/>
  {/* Cushion button detail */}
  <circle cx="24" cy="20" r="0.8"/>
</svg>
)



/** Lampy — pendant lamp with shade */
export const LampyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/*  Lamp shade */}
  <path d="M11 20L21 6h6l10 14"/>
  {/* Shade bottom rim */}
  <ellipse cx="24" cy="20" rx="13" ry="2"/>
  {/* Shade decorative lines */}
  <path d="M15 17l6-8" opacity="0.3"/>
  <path d="M18 18l5-9" opacity="0.3"/>
  {/* Neck */}
  <path d="M23 22v4h2v-4"/>
  {/* Stem */}
  <path d="M24 26v10"/>
  {/* Stem decorative ball */}
  <circle cx="24" cy="29" r="1.5"/>
  {/* Base */}
  <path d="M17 42c0-2 2-4 4-5h6c2 1 4 3 4 5"/>
  <path d="M24 36v1"/>
  {/* Base bottom */}
  <path d="M15 42h18"/>
  {/* Light rays (subtle) */}
  <path d="M14 22l-2 3M34 22l2 3M24 22v3" opacity="0.25" strokeDasharray="1 2"/>
</svg>
)

/** Kuchnia i jadalnia — steaming teacup on saucer */
export const KuchniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Plate outer */}
  <circle cx="24" cy="24" r="14"/>
  {/* Plate inner */}
  <circle cx="24" cy="24" r="9"/>
  {/* Fork (left) */}
  <path d="M6 8v12c0 1.5 1 2.5 2 2.5s2-1 2-2.5V8"/>
  <path d="M6 8v7M8 8v7M10 8v7"/>
  <path d="M8 22.5V42"/>
  {/* Knife (right) */}
  <path d="M40 8c1.2 0 2.2 1 2.2 2.5 0 4-1 8-2.2 10v0c-.5 1-1 1.5-1 2V42"/>
  <path d="M39 8v12.5"/>
  {/* Decorative sprig on plate */}
  <path d="M21 24c2-3 3-5 3-7"/>
  <path d="M24 19c-1.2-1-2.8-.5-3 .8s1.2 2 2.5 1.5"/>
  <path d="M24 19c1.2-1 2.8-.5 3 .8s-1.2 2-2.5 1.5"/>
  <path d="M22.5 22c-1.5-.3-2.5.8-2 2s2 1 2.5.2"/>
  <path d="M24 17c-.5-1 .2-2.2 1.2-2s1.2 1.5.5 2.3"/>
</svg>
)


/** Organizacja — woven storage basket */
export const OrganizacjaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bottom large box */}
  <rect x="6" y="30" width="36" height="12" rx="1.5"/>
  {/* Bottom box label/handle */}
  <path d="M20 36h8"/>
  {/* Middle box left */}
  <rect x="6" y="17" width="17" height="12" rx="1.5"/>
  {/* Middle left label */}
  <path d="M11.5 23h6"/>
  {/* Middle box right */}
  <rect x="25" y="17" width="17" height="12" rx="1.5"/>
  {/* Middle right label */}
  <path d="M30.5 23h6"/>
  {/* Top small box */}
  <rect x="13" y="5" width="22" height="11" rx="1.5"/>
  {/* Top box label */}
  <path d="M21 10.5h6"/>
  {/* Decorative dots suggesting contents peeking out */}
  <circle cx="17" cy="8" r="0.7" opacity="0.4"/>
  <circle cx="31" cy="8" r="0.7" opacity="0.4"/>
  {/* Small tag on bottom box */}
  <path d="M38 33l2-2 2 0 0 2-2 2z" strokeWidth="1" opacity="0.6"/>
  <circle cx="41" cy="33" r="0.4" opacity="0.6"/>
</svg>
)


/** Ogród i balkon — potted plant with leaves */
export const OgródIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Pot rim */}
  <path d="M13 30h22v2H13z"/>
  {/* Pot body (tapered) */}
  <path d="M14 32l2 12h16l2-12"/>
  {/* Pot base line */}
  <path d="M16 44h16"/>
  {/* Main stem */}
  <path d="M24 30v-6"/>
  {/* Central top leaf */}
  <path d="M24 14c-2-4 0-8 0-8s2 4 0 8z"/>
  {/* Left branch */}
  <path d="M24 24c-4-1-7-4-9-7"/>
  <path d="M15 17c-3-1-3-4-1-5s4 0 4 2"/>
  <path d="M17 19c-2.5 0-3.5-2.5-1.5-4"/>
  {/* Right branch */}
  <path d="M24 22c4-1 7-3 9-6"/>
  <path d="M33 16c3-1 3-4 1-5s-4 0-4 2"/>
  <path d="M31 18c2.5 0 3.5-2.5 1.5-4"/>
  {/* Small left leaf */}
  <path d="M22 26c-3 0-5-2-5-2s3-1 5 0 2 2 0 2z"/>
  {/* Small right leaf */}
  <path d="M26 28c3-.5 4.5-2.5 4.5-2.5s-3-1-5 0c-1.5.7-1.5 2.5.5 2.5z"/>
  {/* Soil texture */}
  <path d="M18 31c2-.5 4-.7 6-.7s4 .2 6 .7" opacity="0.4"/>
  {/* Tiny butterfly */}
  <path d="M10 12c-1-1.5 0-3 1-2.5M10 12c-.5 1.5 1 2.5 2 1.5" strokeWidth="1" opacity="0.5"/>
</svg>
)
