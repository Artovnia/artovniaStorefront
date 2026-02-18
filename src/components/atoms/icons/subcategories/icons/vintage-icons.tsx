/**
 * VINTAGE icons — ornate, antique-inspired designs
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Moda vintage — dress form mannequin with ornate stand */
export const ModaVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Hat crown */}
  <path d="M15 22c0-8 4-14 9-14s9 6 9 14"/>
  {/* Crown dent/pinch */}
  <path d="M17 22c1-3 3.5-5 7-5s6 2 7 5" opacity="0.3"/>
  {/* Crown top indent */}
  <path d="M19 10c1.5-1 3-1.5 5-1.5s3.5.5 5 1.5" opacity="0.4"/>
  {/* Brim */}
  <ellipse cx="24" cy="24" rx="20" ry="6"/>
  {/* Brim thickness */}
  <path d="M4 24c0 2 9 5 20 5s20-3 20-5"/>
  <path d="M4 24v2c0 2 9 5 20 5s20-3 20-5v-2" opacity="0.3"/>
  {/* Ribbon band */}
  <path d="M15 22h18" strokeWidth="2"/>
  <path d="M15 24h18" strokeWidth="1" opacity="0.3"/>
  {/* Ribbon bow on side */}
  <path d="M33 22c2-1 4-1.5 4-.5s-1.5 2-3.5 2"/>
  <path d="M33 22c2 1 4 1.5 4 .5"/>
  {/* Ribbon tail */}
  <path d="M37 22c1.5 1 2 3 1.5 5" strokeWidth="1.2" opacity="0.5"/>
  <path d="M37 22c2 0 3 1.5 3 3.5" strokeWidth="1.2" opacity="0.5"/>
  {/* Subtle texture on crown */}
  <path d="M20 12c1 2 1.5 5 1.5 8" opacity="0.15"/>
  <path d="M28 12c-1 2-1.5 5-1.5 8" opacity="0.15"/>
</svg>
)

/** Dom vintage — ornate antique oil lamp */
export const DomVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Horn flare */}
  <path d="M4 6c4 2 10 6 14 12" strokeWidth="1.8"/>
  <path d="M14 4c2 4 6 10 6 16" strokeWidth="1.8"/>
  {/* Horn rim */}
  <path d="M4 6c2-2 7-3.5 10-2"/>
  {/* Horn inner curves */}
  <path d="M7 8c3 1.5 7 5 10 9" opacity="0.3"/>
  <path d="M11 6c1.5 3 4 7 6 10" opacity="0.3"/>
  {/* Horn throat narrowing to arm */}
  <path d="M18 18c1 2 2 4 2 6"/>
  <path d="M20 20c0 2 .5 3.5 .5 5"/>
  {/* Tone arm */}
  <path d="M20 24l4 4" strokeWidth="1.8"/>
  {/* Pivot point */}
  <circle cx="24" cy="28" r="1.5"/>
  {/* Turntable base box */}
  <rect x="10" y="32" width="28" height="12" rx="2" strokeWidth="1.5"/>
  {/* Turntable top surface */}
  <path d="M10 32h28"/>
  {/* Record platter */}
  <circle cx="24" cy="32" r="8" strokeWidth="1.2"/>
  <circle cx="24" cy="32" r="5" opacity="0.3"/>
  <circle cx="24" cy="32" r="1.5"/>
  {/* Base decoration */}
  <path d="M14 38h20" opacity="0.3"/>
  <path d="M16 41h16" opacity="0.2"/>
  {/* Crank handle on side */}
  <path d="M38 38h4v0" strokeWidth="1.5"/>
  <path d="M42 38c1 0 2 .5 2 1.5s-1 1.5-2 1.5" strokeWidth="1.3"/>
  {/* Feet */}
  <circle cx="13" cy="44" r="1" opacity="0.5"/>
  <circle cx="35" cy="44" r="1" opacity="0.5"/>
</svg>
)

/** Biżuteria vintage — ornate cameo brooch with frame */
export const BiżuteriaVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Outer ornate frame */}
  <ellipse cx="24" cy="24" rx="18" ry="20"/>
  {/* Inner frame border */}
  <ellipse cx="24" cy="24" rx="15" ry="17"/>
  {/* Decorative scallop dots around frame */}
  <circle cx="24" cy="4" r="1.2"/>
  <circle cx="24" cy="44" r="1.2"/>
  <circle cx="6" cy="24" r="1.2"/>
  <circle cx="42" cy="24" r="1.2"/>
  <circle cx="10" cy="12" r="1"/>
  <circle cx="38" cy="12" r="1"/>
  <circle cx="10" cy="36" r="1"/>
  <circle cx="38" cy="36" r="1"/>
  <circle cx="14" cy="8" r="0.8" opacity="0.6"/>
  <circle cx="34" cy="8" r="0.8" opacity="0.6"/>
  <circle cx="14" cy="40" r="0.8" opacity="0.6"/>
  <circle cx="34" cy="40" r="0.8" opacity="0.6"/>
  {/* Woman's profile silhouette facing right */}
  {/* Forehead */}
  <path d="M20 13c1-1 3-1.5 4-1"/>
  {/* Nose bridge and nose */}
  <path d="M24 12c1 1 2 3 3 4l1 1.5-.5 1"/>
  {/* Upper lip */}
  <path d="M27.5 18.5c-1 .5-1.5 1-2 1.5"/>
  {/* Lower lip and chin */}
  <path d="M25.5 20c.5.5 1 1 1 2s-.5 2-1.5 3"/>
  {/* Chin to neck */}
  <path d="M25 25c-1 1-1.5 2-1.5 4v4"/>
  {/* Back of neck */}
  <path d="M23.5 33c-1-1-1.5-3-1.5-5"/>
  {/* Back of head and hair */}
  <path d="M22 28c-1-2-1.5-4-1.5-7s.5-5 2-7"/>
  <path d="M20 13c-1 0-2 1-2 3"/>
  {/* Hair bun */}
  <path d="M18 16c-1 2-.5 4 1 5s3 .5 3.5-1"/>
  <path d="M20 16c0 1.5.5 2.5 1.5 3" opacity="0.4"/>
  {/* Hair detail */}
  <path d="M22 13c.5.5 1 2 1 4" opacity="0.3"/>
  {/* Pin on brooch top */}
  <path d="M24 4v-2" strokeWidth="1.5"/>
  <circle cx="24" cy="1" r="1"/>
</svg>
)

/** Zegarki — ornate pocket watch with chain */
export const ZegarkiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Watch case outer */}
  <circle cx="24" cy="26" r="16"/>
  {/* Watch case inner */}
  <circle cx="24" cy="26" r="13.5" opacity="0.4"/>
  {/* Crown / winding knob */}
  <path d="M24 10v-3"/>
  <rect x="22" y="5" width="4" height="3" rx="1"/>
  {/* Crown ring */}
  <circle cx="24" cy="5" r="2.5" strokeWidth="1.3"/>
  {/* Chain from crown going right */}
  <path d="M26.5 5c3-1 6-1.5 9-1.5" strokeWidth="1.3"/>
  <path d="M35.5 3.5c1.5 0 2.5.5 2.5 1.5"/>
  {/* Chain bar (fob) */}
  <path d="M38 5l2-2" strokeWidth="1.8"/>
  {/* Hour markers */}
  <path d="M24 14v1.5"/>
  <path d="M24 36.5V38"/>
  <path d="M14 26h1.5"/>
  <path d="M32.5 26H34"/>
  {/* Smaller markers */}
  <path d="M29 14.5l-.5 1" strokeWidth="1"/>
  <path d="M19 14.5l.5 1" strokeWidth="1"/>
  <path d="M33.5 21l-1 .5" strokeWidth="1"/>
  <path d="M15.5 31l1-.5" strokeWidth="1"/>
  <path d="M33.5 31l-1-.5" strokeWidth="1"/>
  <path d="M15.5 21l1 .5" strokeWidth="1"/>
  <path d="M29 37.5l-.5-1" strokeWidth="1"/>
  <path d="M19 37.5l.5-1" strokeWidth="1"/>
  {/* Hour hand */}
  <path d="M24 26l-3-7" strokeWidth="1.8"/>
  {/* Minute hand */}
  <path d="M24 26l5-5" strokeWidth="1.5"/>
  {/* Center pivot */}
  <circle cx="24" cy="26" r="1.5"/>
  {/* Roman numeral hints */}
  <text x="23" y="17.5" fontSize="3" fontFamily="serif" fill="#3b3634" textAnchor="middle" opacity="0.5" stroke="none">XII</text>
  <text x="23" y="40" fontSize="3" fontFamily="serif" fill="#3b3634" textAnchor="middle" opacity="0.5" stroke="none">VI</text>
</svg>
)

/** Pozostałe vintage — ornate antique key */
export const PozostałeVintageIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Key bow (decorative top ring) */}
  <circle cx="24" cy="12" r="8" strokeWidth="1.8"/>
  {/* Inner decorative ring */}
  <circle cx="24" cy="12" r="5" opacity="0.4"/>
  {/* Ornamental scrolls inside bow */}
  <path d="M22 10c0-1 .8-2 2-2s2 1 2 2" strokeWidth="1" opacity="0.5"/>
  <path d="M22 14c0 1 .8 2 2 2s2-1 2-2" strokeWidth="1" opacity="0.5"/>
  {/* Key shaft */}
  <path d="M24 20v20" strokeWidth="2"/>
  {/* Shaft collar / decorative ring */}
  <path d="M21 22h6" strokeWidth="1.8"/>
  <path d="M22 24h4" strokeWidth="1" opacity="0.4"/>
  {/* Shaft mid decoration */}
  <path d="M22 30h4" strokeWidth="1.3"/>
  {/* Key bit (teeth at bottom) */}
  <path d="M24 40h6v-3h-2v-2h-2v-2h-2" strokeWidth="1.8"/>
  {/* Second tooth */}
  <path d="M28 40v2h-4" strokeWidth="1.5"/>
  {/* Key tip */}
  <path d="M24 42h6" strokeWidth="1.5"/>
  {/* Ward cut */}
  <path d="M26 38h2" strokeWidth="1.2" opacity="0.5"/>
  {/* Tiny sparkle suggesting old & precious */}
  <path d="M36 8l.5-1.5.5 1.5M37.5 8.5l-1.5.4 1.5.4" strokeWidth="1" opacity="0.4"/>
  <path d="M12 8l.5-1.5.5 1.5M13.5 8.5l-1.5.4 1.5.4" strokeWidth="1" opacity="0.4"/>
  </svg>
)

/** Kolekcje i antyki — ornate treasure chest with keyhole */
export const KolekcjeAntyikiIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Outer frame */}
  <rect x="4" y="4" width="40" height="40" rx="2" strokeWidth="1.8"/>
  {/* Inner frame */}
  <rect x="8" y="8" width="32" height="32" rx="1"/>
  {/* Innermost (picture area) */}
  <rect x="12" y="12" width="24" height="24" rx="0.5" opacity="0.4"/>
  {/* Corner ornament top-left */}
  <path d="M4 4c2 2 3 4 3 6" strokeWidth="1.2"/>
  <path d="M4 4c2 0 4 1 6 3" strokeWidth="1.2"/>
  <circle cx="6" cy="6" r="1.5" strokeWidth="1"/>
  {/* Corner ornament top-right */}
  <path d="M44 4c-2 2-3 4-3 6" strokeWidth="1.2"/>
  <path d="M44 4c-2 0-4 1-6 3" strokeWidth="1.2"/>
  <circle cx="42" cy="6" r="1.5" strokeWidth="1"/>
  {/* Corner ornament bottom-left */}
  <path d="M4 44c2-2 3-4 3-6" strokeWidth="1.2"/>
  <path d="M4 44c2 0 4-1 6-3" strokeWidth="1.2"/>
  <circle cx="6" cy="42" r="1.5" strokeWidth="1"/>
  {/* Corner ornament bottom-right */}
  <path d="M44 44c-2-2-3-4-3-6" strokeWidth="1.2"/>
  <path d="M44 44c-2 0-4-1-6-3" strokeWidth="1.2"/>
  <circle cx="42" cy="42" r="1.5" strokeWidth="1"/>
  {/* Frame center top scroll */}
  <path d="M20 5c1.5 1 2.5 1 4 0s2.5-1 4 0" strokeWidth="1" opacity="0.5"/>
  {/* Frame center bottom scroll */}
  <path d="M20 43c1.5-1 2.5-1 4 0s2.5 1 4 0" strokeWidth="1" opacity="0.5"/>
  {/* Antique vase silhouette inside frame */}
  <path d="M21 32c-1-2-2-4-1.5-7 .5-2 1.5-3 2.5-3.5"/>
  <path d="M27 32c1-2 2-4 1.5-7-.5-2-1.5-3-2.5-3.5"/>
  <path d="M22 21.5c.5-.3 1.2-.5 2-.5s1.5.2 2 .5"/>
  <path d="M20 32h8"/>
  {/* Vase base */}
  <path d="M21 32v1h6v-1"/>
  {/* Small flower in vase */}
  <path d="M24 21.5v-4"/>
  <circle cx="24" cy="16" r="2" strokeWidth="1"/>
  <circle cx="24" cy="16" r="0.7" opacity="0.4"/>
</svg>
)
