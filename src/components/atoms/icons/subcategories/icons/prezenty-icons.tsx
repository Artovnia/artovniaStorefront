/**
 * PREZENTY I OKAZJE (Gifts & Occasions) icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Urodziny — birthday cake with candles and frosting */
export const UrodzinyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Cake base */}
  <rect x="8" y="28" width="32" height="12" rx="2"/>
  {/* Cake top tier */}
  <rect x="13" y="19" width="22" height="9" rx="2"/>
  {/* Frosting drip */}
  <path d="M13 22c2 2 4 2 6 0s4-2 6 0 4 2 6 0s4-2 5 0" strokeWidth="1.2"/>
  {/* Base frosting drip */}
  <path d="M8 31c2 2 5 2 7 0s5-2 7 0 5 2 7 0 5-2 7 0" strokeWidth="1.2"/>
  {/* Candle left */}
  <path d="M20 19v-6"/>
  {/* Candle center */}
  <path d="M24 19v-6"/>
  {/* Candle right */}
  <path d="M28 19v-6"/>
  {/* Flame left */}
  <path d="M20 13c-.5-1.5 0-3 0-3s1.5 1 .5 3" strokeWidth="1.2"/>
  {/* Flame center */}
  <path d="M24 13c-.5-1.5 0-3 0-3s1.5 1 .5 3" strokeWidth="1.2"/>
  {/* Flame right */}
  <path d="M28 13c-.5-1.5 0-3 0-3s1.5 1 .5 3" strokeWidth="1.2"/>
  {/* Plate line */}
  <path d="M5 40h38" strokeWidth="1.5"/>
  {/* Cake stand base */}
  <path d="M16 40c0 2 3.5 3 8 3s8-1 8-3"/>
</svg>
)


/** Kartki okolicznościowe — open greeting card with heart */
export const KartkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Card back (slightly angled) */}
  <path d="M8 8l16 3v30l-16-3z"/>
  {/* Card front */}
  <path d="M24 11l16-3v30l-16 3z"/>
  {/* Card fold line */}
  <path d="M24 11v30" strokeDasharray="3 2" opacity="0.4"/>
  {/* Heart on front panel */}
  <path d="M30 20c0-1.8 1.2-3 2.5-3s2.5 1.2 2.5 3c0 3-5 6-5 6s-5-3-5-6c0-1.8 1.2-3 2.5-3s2.5 1.2 2.5 3" strokeWidth="1.3"/>
  {/* Decorative text lines on front */}
  <path d="M28 30h5" opacity="0.5"/>
  <path d="M27.5 33h6" opacity="0.5"/>
  <path d="M28 36h4" opacity="0.5"/>
  {/* Back panel decorative dots */}
  <circle cx="16" cy="20" r="0.7" opacity="0.4"/>
  <circle cx="16" cy="24" r="0.7" opacity="0.4"/>
  <circle cx="16" cy="28" r="0.7" opacity="0.4"/>
  {/* Small star on back */}
  <path d="M14 16l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" strokeWidth="1"/>
</svg>
)


/** Opakowania — gift wrapping with ribbon and bow */
export const OpakowaniaIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Box body */}
  <rect x="8" y="20" width="32" height="20" rx="1.5"/>
  {/* Box lid */}
  <rect x="6" y="15" width="36" height="6" rx="1.5"/>
  {/* Vertical ribbon */}
  <path d="M24 15v25"/>
  {/* Horizontal ribbon */}
  <path d="M6 18h36" opacity="0.5" strokeDasharray="0"/>
  {/* Bow left loop */}
  <path d="M24 15c-2-3-6-5-7-3s2 4 5 4"/>
  {/* Bow right loop */}
  <path d="M24 15c2-3 6-5 7-3s-2 4-5 4"/>
  {/* Bow left ribbon tail */}
  <path d="M17 12c-1-2-3-4-5-4.5"/>
  {/* Bow right ribbon tail */}
  <path d="M31 12c1-2 3-4 5-4.5"/>
  {/* Bow center knot */}
  <circle cx="24" cy="15" r="1.5"/>
  {/* Wrapping pattern (subtle) */}
  <path d="M12 25l4 4M12 31l4 4M32 25l4 4M32 31l4 4" opacity="0.2" strokeWidth="1"/>
</svg>
)


/** Ślub i wesele — bride in wedding dress and groom in suit */
export const ŚlubIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Left ring */}
  <circle cx="19" cy="24" r="9"/>
  <circle cx="19" cy="24" r="7" opacity="0.4"/>
  {/* Right ring */}
  <circle cx="29" cy="24" r="9"/>
  <circle cx="29" cy="24" r="7" opacity="0.4"/>
  {/* Diamond on right ring */}
  <path d="M29 14.5l-2 2h4l-2-2z" strokeWidth="1.2"/>
  <path d="M27 16.5l2 3 2-3"/>
  {/* Tiny sparkles */}
  <path d="M37 14l.5-1.5.5 1.5M38.5 14.5l-1.5.5 1.5.5" strokeWidth="1" opacity="0.5"/>
  <path d="M11 14l.5-1.5.5 1.5M12.5 14.5l-1.5.5 1.5.5" strokeWidth="1" opacity="0.5"/>
  {/* Leaf sprig underneath */}
  <path d="M18 36c2 1 4 2 6 2s4-1 6-2"/>
  <path d="M20 37c-1.5.5-2 2-.8 2.8s2.5 0 2.5-1.2"/>
  <path d="M28 37c1.5.5 2 2 .8 2.8s-2.5 0-2.5-1.2"/>
  <path d="M24 38v3"/>
  <path d="M24 39c-.8.5-.5 1.5.2 1.8s1.4-.3 1.2-1"/>
  <path d="M24 39c.8.5.5 1.5-.2 1.8s-1.4-.3-1.2-1"/>
</svg>
)

/** Rocznice i walentynki — ornate heart with flourishes */
export const WalentynkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Large heart */}
  <path d="M24 38S8 28 8 18c0-4 3-8 7.5-8S23 13 24 16c1-3 4.5-6 8.5-6S40 14 40 18c0 10-16 20-16 20z"/>
  {/* Smaller heart inside */}
  <path d="M24 32s-10-6-10-12c0-2.5 2-5 4.5-5S23 17 24 19c1-2 3.5-4 5.5-4S34 17.5 34 20c0 6-10 12-10 12z" opacity="0.35"/>
  {/* Rose at top */}
  <path d="M24 10c-1-2 .5-4 2-4s2.5 2 1.5 3.5"/>
  <path d="M24 10c1.5-.5 3 .5 2.5 2s-2 1.5-2.5.5"/>
  <path d="M24 10c-1.5-.5-3 .5-2.5 2s2 1.5 2.5.5"/>
  <path d="M24 10c0 1-1 2.5-1 2.5" strokeWidth="1" opacity="0.5"/>
  {/* Rose leaves */}
  <path d="M21 11c-1.5-1-3.5-.5-3.5 1s1.5 2 3 1.2" strokeWidth="1.2"/>
  <path d="M27 11c1.5-1 3.5-.5 3.5 1s-1.5 2-3 1.2" strokeWidth="1.2"/>
  {/* Small sparkle */}
  <path d="M38 12l.5-1.5.5 1.5M39.5 12.5l-1.5.5 1.5.5" strokeWidth="1" opacity="0.5"/>
</svg>
)

/** Boże Narodzenie — christmas tree with ornaments and star */
export const BożeNarodzenieIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Star on top */}
  <path d="M24 3l1.5 3 3.5.5-2.5 2.5.5 3.5L24 11l-3 1.5.5-3.5L19 6.5l3.5-.5z" strokeWidth="1.3"/>
  {/* Tree tier 1 (top) */}
  <path d="M24 11l-6 8h12z"/>
  {/* Tree tier 2 (middle) */}
  <path d="M24 16l-9 10h18z"/>
  {/* Tree tier 3 (bottom) */}
  <path d="M24 22l-12 12h24z"/>
  {/* Trunk */}
  <rect x="21" y="34" width="6" height="5" rx="1"/>
  {/* Pot */}
  <path d="M17 39h14l-2 6H19z"/>
  {/* Ornament baubles */}
  <circle cx="20" cy="22" r="1.2"/>
  <circle cx="28" cy="26" r="1.2"/>
  <circle cx="22" cy="30" r="1.2"/>
  <circle cx="27" cy="19" r="1"/>
  {/* Garland suggestion */}
  <path d="M18 28c2-1 4-1 6 0s4 1 6 0" opacity="0.4" strokeWidth="1"/>
  <path d="M21 23c1-.5 2-.5 3 0s2 .5 3 0" opacity="0.4" strokeWidth="1"/>
</svg>
)

/** Wielkanoc — decorated easter egg with patterns */
export const WielkanocIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Egg shape */}
  <path d="M24 4c-8 0-14 9-14 19s6 19 14 19 14-9 14-19S32 4 24 4z"/>
  {/* Decorative band 1 */}
  <path d="M12 18c3 1.5 7 2.5 12 2.5s9-1 12-2.5"/>
  {/* Decorative band 2 */}
  <path d="M11 26c3 2 7 3 13 3s10-1 13-3"/>
  {/* Zigzag pattern between bands */}
  <path d="M14 21l2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2" strokeWidth="1.2"/>
  {/* Dots row top */}
  <circle cx="19" cy="13" r="1" opacity="0.5"/>
  <circle cx="24" cy="12" r="1" opacity="0.5"/>
  <circle cx="29" cy="13" r="1" opacity="0.5"/>
  {/* Dots row bottom */}
  <circle cx="20" cy="32" r="1" opacity="0.5"/>
  <circle cx="24" cy="33" r="1" opacity="0.5"/>
  <circle cx="28" cy="32" r="1" opacity="0.5"/>
  {/* Small leaf sprig right */}
  <path d="M36 34c2-1 3-3 2-4.5" strokeWidth="1.2" opacity="0.6"/>
  <path d="M37 32c1 .5 1.5 1.8.8 2.8s-2 .8-2-.3" strokeWidth="1" opacity="0.6"/>
  <path d="M36.5 30c1.2-.3 2.2.5 2 1.5s-1.5 1.2-2 .5" strokeWidth="1" opacity="0.6"/>
</svg>
)

/** Halloween — carved jack-o-lantern with squashed pumpkin shape */
export const HalloweenIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Pumpkin body segments */}
  <ellipse cx="24" cy="28" rx="16" ry="13"/>
  {/* Segment lines */}
  <path d="M24 15v26" opacity="0.3"/>
  <path d="M16 16c-1 4-1.5 9 0 14" opacity="0.3"/>
  <path d="M32 16c1 4 1.5 9 0 14" opacity="0.3"/>
  {/* Left rib bulge */}
  <path d="M9 24c-1 3-.5 6 1 8" opacity="0.25"/>
  {/* Right rib bulge */}
  <path d="M39 24c1 3 .5 6-1 8" opacity="0.25"/>
  {/* Stem */}
  <path d="M24 15c0-2 .5-4 1-5s2-2 3-2"/>
  <path d="M24 15c-.5-1.5-.5-3 0-4" opacity="0.5"/>
  {/* Leaf on stem */}
  <path d="M27 9c1.5-.5 3 .5 2.5 2s-2 1.5-2.8.5" strokeWidth="1.2"/>
  {/* Left eye (triangle) */}
  <path d="M17 24l2.5-4 2.5 4z"/>
  {/* Right eye (triangle) */}
  <path d="M26 24l2.5-4 2.5 4z"/>
  {/* Mouth (jagged grin) */}
  <path d="M15 31l3-2 2 2 2-2 2 2 2-2 2 2 2-2 3 2" strokeWidth="1.3"/>
  {/* Nose */}
  <path d="M23 27l1-2 1 2z"/>
</svg>
)

/** Dzień Matki / Ojca / Babci / Dziadka — family heart with people */
export const DzieńRodzinyIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Heart */}
  <path d="M24 32S14 25 14 18.5c0-3 2.5-6 5.5-6S24 15 24 17c0-2 2-4.5 4.5-4.5s5.5 3 5.5 6C34 25 24 32 24 32z"/>
  {/* Left hand */}
  <path d="M6 28c0-2 1-3 2.5-3.5"/>
  <path d="M8.5 24.5c1-.3 2 .3 2.5 1.2l2.5 5"/>
  <path d="M6 28l1 8c.5 1.5 1.5 2.5 3 3h4"/>
  {/* Left fingers curving around heart */}
  <path d="M13.5 33c-1 .5-2.5 1-3.5 1"/>
  <path d="M13 31c-1.5.5-3 .8-4 .5"/>
  {/* Right hand */}
  <path d="M42 28c0-2-1-3-2.5-3.5"/>
  <path d="M39.5 24.5c-1-.3-2 .3-2.5 1.2l-2.5 5"/>
  <path d="M42 28l-1 8c-.5 1.5-1.5 2.5-3 3h-4"/>
  {/* Right fingers curving around heart */}
  <path d="M34.5 33c1 .5 2.5 1 3.5 1"/>
  <path d="M35 31c1.5.5 3 .8 4 .5"/>
  {/* Tiny sparkle above heart */}
  <path d="M24 9l.4-1.5.4 1.5M25.3 9.5l-1.3.4 1.3.4" strokeWidth="1" opacity="0.4"/>
  <path d="M18 10l.4-1 .4 1" strokeWidth="1" opacity="0.3"/>
  <path d="M30 10l.4-1 .4 1" strokeWidth="1" opacity="0.3"/>
</svg>
)

/** Chrzest i komunia — baptism candle with cross and gentle flame */
export const ChrzestIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Candle body */}
  <rect x="6" y="16" width="12" height="26" rx="2"/>
  {/* Candle top rim */}
  <path d="M6 18h12"/>
  {/* Wick */}
  <path d="M12 16v-3"/>
  {/* Flame */}
  <path d="M12 6c-2 2-3 4-3 5.5C9 13.5 10.5 14 12 14s3-.5 3-2.5C15 10 14 8 12 6z" strokeWidth="1.5"/>
  {/* Flame inner */}
  <path d="M12 8.5c-.8.8-1.2 1.8-1.2 2.5 0 .8.5 1.2 1.2 1.2s1.2-.4 1.2-1.2c0-.7-.4-1.7-1.2-2.5" opacity="0.4" strokeWidth="1"/>
  {/* Cross */}
  <path d="M33 8v34" strokeWidth="2"/>
  <path d="M25 18h16" strokeWidth="2"/>
  {/* Cross base */}
  <path d="M28 42h10"/>
  {/* Small radiating lines from cross intersection */}
  <path d="M27 14l-2-2M39 14l2-2M27 22l-2 2M39 22l2 2" strokeWidth="1" opacity="0.35"/>
  {/* Candle decoration */}
  <path d="M8 28h8" opacity="0.3"/>
  <path d="M9 32h6" opacity="0.3"/>
</svg>
)

/** Wieczór Panieński — elegant high heel shoe */
export const WieczórPanieńskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Ring band */}
  <ellipse cx="24" cy="30" rx="12" ry="10"/>
  <ellipse cx="24" cy="30" rx="9" ry="7.5" opacity="0.4"/>
  {/* Diamond bottom */}
  <path d="M18 18l6 8 6-8"/>
  {/* Diamond top */}
  <path d="M16 14h16l2 4H18z" strokeWidth="1.5"/>
  {/* Diamond facets */}
  <path d="M20 14l-2 4M28 14l2 4M24 14v8"/>
  {/* Heart left */}
  <path d="M6 16c0-.8.5-1.5 1.2-1.5S8.5 15.2 8.5 16c0 1.5-2.2 2.8-2.2 2.8S4 17.5 4 16c0-.8.5-1.5 1.2-1.5S6 15.2 6 16" strokeWidth="1.2"/>
  {/* Heart right */}
  <path d="M42 16c0-.8.5-1.5 1.2-1.5s1.3.7 1.3 1.5c0 1.5-2.2 2.8-2.2 2.8S40 17.5 40 16c0-.8.5-1.5 1.2-1.5s1.3.7 1.3 1.5" strokeWidth="1.2"/>
  {/* Sparkles */}
  <path d="M10 8l.5-1.5.5 1.5M11.5 8.5l-1.5.4 1.5.4" strokeWidth="1.2" opacity="0.5"/>
  <path d="M37 6l.5-1.5.5 1.5M38.5 6.5l-1.5.4 1.5.4" strokeWidth="1.2" opacity="0.5"/>
</svg>
)

/** Wieczór Kawalerski — bow tie with collar */
export const WieczórKawalerskiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bow tie left */}
  <path d="M24 16c-4-4-10-5-11-2s4 6 8 5"/>
  <path d="M24 16c-4 4-10 5-11 2s4-6 8-5"/>
  {/* Bow tie right */}
  <path d="M24 16c4-4 10-5 11-2s-4 6-8 5"/>
  <path d="M24 16c4 4 10 5 11 2s-4-6-8-5"/>
  {/* Bow tie knot */}
  <circle cx="24" cy="16" r="2"/>
  {/* Collar lines */}
  <path d="M20 18l-4 6"/>
  <path d="M28 18l4 6"/>
  {/* Cocktail glass */}
  <path d="M14 30l7 7M28 30l-7 7"/>
  <path d="M14 30h14"/>
  {/* Glass stem */}
  <path d="M21 37v5"/>
  {/* Glass base */}
  <path d="M16 42h10"/>
  {/* Olive/cherry on glass */}
  <circle cx="21" cy="33" r="1.5"/>
  <path d="M21 31.5V30"/>
  {/* Stars decorative */}
  <path d="M38 8l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" strokeWidth="1.1"/>
  {/* Small sparkles */}
  <path d="M8 10l.4-1.2.4 1.2M9.3 10.4l-1.2.4 1.2.4" strokeWidth="1" opacity="0.4"/>
</svg>
)

/** Baby Shower — baby bottle with bubbles */
export const BabyShowerIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bottle body */}
  <rect x="10" y="18" width="14" height="22" rx="3"/>
  {/* Bottle neck */}
  <path d="M14 18v-5h6v5"/>
  {/* Bottle nipple */}
  <path d="M14 13c0-2 1.5-4 3-4.5 1.5.5 3 2.5 3 4.5"/>
  {/* Nipple tip */}
  <path d="M16 9c0-.5.5-1 1-1s1 .5 1 1"/>
  {/* Measurement lines on bottle */}
  <path d="M10 24h3" opacity="0.5"/>
  <path d="M10 28h2" opacity="0.5"/>
  <path d="M10 32h3" opacity="0.5"/>
  <path d="M10 36h2" opacity="0.5"/>
  {/* Rattle handle */}
  <path d="M34 32v10"/>
  {/* Rattle base */}
  <path d="M31 42h6"/>
  {/* Rattle ball */}
  <circle cx="34" cy="25" r="7"/>
  {/* Rattle inner decoration */}
  <circle cx="32" cy="23.5" r="1" opacity="0.4"/>
  <circle cx="36" cy="23.5" r="1" opacity="0.4"/>
  <circle cx="34" cy="27" r="1" opacity="0.4"/>
  {/* Rattle ring at joint */}
  <ellipse cx="34" cy="31.5" rx="2.5" ry="1"/>
  {/* Stars */}
  <path d="M6 6l.5-1.5.5 1.5M7.5 6.5l-1.5.5 1.5.5" strokeWidth="1" opacity="0.5"/>
  <path d="M42 12l.5-1.5.5 1.5M43.5 12.5l-1.5.5 1.5.5" strokeWidth="1" opacity="0.5"/>
  <path d="M26 5l.5-1.5.5 1.5M27.5 5.5l-1.5.5 1.5.5" strokeWidth="1" opacity="0.5"/>
</svg>
)
