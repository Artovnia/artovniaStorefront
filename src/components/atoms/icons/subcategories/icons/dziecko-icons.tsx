/**
 * DZIECKO (Children) — non-shared icons
 * Style: delicate outline, artistic, strokeWidth 1.2, round caps/joins
 */
import React from "react"

interface IconProps { className?: string }

/** Dekoracje do pokoju dziecięcego — airplane mobile hanging over cradle */
export const DekoracjePokojuIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Ceiling hook */}
  <path d="M24 2v3"/>
  {/* Main bar */}
  <path d="M10 7h28" strokeWidth="1.8"/>
  {/* Cross bar */}
  <path d="M24 5v2"/>
  <path d="M17 6h14" strokeWidth="1.3"/>
  {/* String left */}
  <path d="M12 7v8"/>
  {/* String center-left */}
  <path d="M20 6v12"/>
  {/* String center-right */}
  <path d="M28 6v10"/>
  {/* String right */}
  <path d="M36 7v14"/>
  {/* Star (left) */}
  <path d="M12 17l1.2 2.5 2.8.4-2 2 .5 2.8L12 23.5l-2.5 1.2.5-2.8-2-2 2.8-.4z" strokeWidth="1.2"/>
  {/* Cloud (center-left) */}
  <path d="M16 21c0-1.5 1-2.5 2.3-2.5.3-1.5 1.5-2.5 3-2.5s2.5 1 2.8 2.3c1.2.2 2.2 1.2 2.2 2.5s-1 2.2-2.3 2.5H17.5c-1 0-1.8-.8-1.8-1.8" strokeWidth="1.2"/>
  {/* Moon (center-right) */}
  <path d="M26 18.5c0-3 2.5-5.5 5.5-5.5-1.5 1-2.5 3-2.5 5s1 4 2.5 5c-3 0-5.5-2.5-5.5-5.5z" strokeWidth="0" fill="none"/>
  <path d="M28 16c-.8.6-1.5 1.8-1.5 3.2 0 2 1.5 3.8 3.5 3.8.7 0 1.3-.2 1.8-.5-1.2.8-2 .7-3.3.2-1.5-.8-2.5-2.3-2.5-4 0-1.2.7-2.2 2-2.7" strokeWidth="1.2"/>
  {/* Heart (right) */}
  <path d="M34 23c0-1.5 1-2.5 2-2.5s2 1 2 2c0 0 0 .3-.1.5.1.2.1.5.1.5 0 1-1 2-2 2.5-.3.2-.6.3-.8.5"/>
  <path d="M36 26c-.2-.2-.5-.3-.8-.5-1-.5-2-1.5-2-2.5 0 0 0-.3.1-.5"/>
  {/* Small star (dangling from cloud) */}
  <path d="M20 25v3"/>
  <path d="M20 29.5l.6 1.2 1.4.2-1 1 .2 1.4-1.2-.6-1.2.6.2-1.4-1-1 1.4-.2z" strokeWidth="1"/>
  {/* Tiny dots decorative */}
  <circle cx="36" cy="30" r="0.6" opacity="0.4"/>
  <circle cx="36" cy="32.5" r="0.6" opacity="0.4"/>
  <circle cx="36" cy="35" r="0.6" opacity="0.4"/>
</svg>
)


/** Ubranka — baby romper/onesie with buttons and tiny heart */
export const UbrankaDziecięceIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Neckline */}
  <path d="M19 8c1.5 1.5 3 2 5 2s3.5-.5 5-2"/>
  {/* Shoulders and sleeves left */}
  <path d="M19 8l-7 4-3 5 3 2 4-4v5"/>
  {/* Shoulders and sleeves right */}
  <path d="M29 8l7 4 3 5-3 2-4-4v5"/>
  {/* Body sides */}
  <path d="M16 20v14c0 1 .5 2 1.5 2.5"/>
  <path d="M32 20v14c0 1-.5 2-1.5 2.5"/>
  {/* Crotch split */}
  <path d="M17.5 36.5c1 1 2.5 2 3.5 2.5v4M30.5 36.5c-1 1-2.5 2-3.5 2.5v4"/>
  {/* Left leg */}
  <path d="M21 43h-4c-1 0-1.5-.5-1.5-1.5V37"/>
  {/* Right leg */}
  <path d="M27 43h4c1 0 1.5-.5 1.5-1.5V37"/>
  {/* Collar detail */}
  <path d="M19 8c-.5-1.5 0-3 1.5-3.5C22 4 23 4.5 24 5c1-.5 2-1 3.5-.5S29 6.5 29 8" strokeWidth="1.2"/>
  {/* Buttons */}
  <circle cx="24" cy="14" r="1"/>
  <circle cx="24" cy="19" r="1"/>
  {/* Tiny heart on chest */}
  <path d="M21 25c0-1 .7-1.5 1.5-1.5s1.2.7 1.5 1.2c.3-.5.7-1.2 1.5-1.2s1.5.5 1.5 1.5c0 1.8-3 3.5-3 3.5s-3-1.7-3-3.5" strokeWidth="1"/>
</svg>
)

/** Zabawki — soft teddy bear with bow tie */
export const ZabawkiDziecięceIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Left ear outer */}
  <circle cx="15" cy="8" r="4.5"/>
  {/* Left ear inner */}
  <circle cx="15" cy="8" r="2" opacity="0.4"/>
  {/* Right ear outer */}
  <circle cx="33" cy="8" r="4.5"/>
  {/* Right ear inner */}
  <circle cx="33" cy="8" r="2" opacity="0.4"/>
  {/* Head */}
  <circle cx="24" cy="14" r="10"/>
  {/* Eyes */}
  <circle cx="20" cy="12.5" r="1.2"/>
  <circle cx="28" cy="12.5" r="1.2"/>
  {/* Snout */}
  <ellipse cx="24" cy="17" rx="3.5" ry="2.5"/>
  {/* Nose */}
  <path d="M23 16.2c.3-.4.7-.6 1-.6s.7.2 1 .6c-.3.3-.7.5-1 .5s-.7-.2-1-.5z"/>
  {/* Mouth */}
  <path d="M24 16.8v1.2M22.5 18.5c.5.5 1 .7 1.5.7s1-.2 1.5-.7"/>
  {/* Body */}
  <ellipse cx="24" cy="33" rx="10" ry="9"/>
  {/* Belly */}
  <ellipse cx="24" cy="34" rx="5" ry="4.5" opacity="0.3"/>
  {/* Left arm */}
  <path d="M14 27c-3 1.5-5.5 4-5.5 6.5s1 3.5 3 3.5 3.5-1.5 3.5-3.5"/>
  {/* Right arm */}
  <path d="M34 27c3 1.5 5.5 4 5.5 6.5s-1 3.5-3 3.5-3.5-1.5-3.5-3.5"/>
  {/* Left foot */}
  <ellipse cx="17.5" cy="42" rx="4" ry="3"/>
  {/* Left foot pad */}
  <ellipse cx="17.5" cy="42.5" rx="2" ry="1.5" opacity="0.3"/>
  {/* Right foot */}
  <ellipse cx="30.5" cy="42" rx="4" ry="3"/>
  {/* Right foot pad */}
  <ellipse cx="30.5" cy="42.5" rx="2" ry="1.5" opacity="0.3"/>
  {/* Bow tie left loop */}
  <path d="M24 24c-2-.8-4-.5-4 .5s2 2 4 1"/>
  {/* Bow tie right loop */}
  <path d="M24 24c2-.8 4-.5 4 .5s-2 2-4 1"/>
  {/* Bow tie knot */}
  <circle cx="24" cy="24.5" r="0.8"/>
</svg>
)

/** Akcesoria dziecięce — baby stroller with canopy */
export const AkcesoriaDziecięceIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#3b3634" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
  {/* Bonnet dome */}
  <path d="M10 22c0-8 6.5-15 14-15s14 7 14 15"/>
  {/* Bonnet brim / ruffle */}
  <path d="M10 22c-1 .5-1.5 1.5-1 2.5s2 1.5 3 1c1-.5 1.5-1.5 2-1"/>
  <path d="M14 24.5c.5 1 1.5 1.5 2.5 1.2s1.8-1.2 1.8-2"/>
  <path d="M18.3 23.7c.2 1.2 1 2 2.2 2s2-.8 2.2-1.8"/>
  <path d="M22.7 23.9c.3 1.2 1.2 1.8 2.3 1.8s2-1 2-2"/>
  <path d="M27 23.7c.5 1.2 1.5 1.8 2.7 1.5s1.8-1.3 1.8-2"/>
  <path d="M31.5 23.2c.8 1 1.8 1.2 2.8.7s1.3-1.5 1-2.5"/>
  <path d="M38 22c.5.5 1.2 1.5.7 2.5s-1.8 1.5-2.8 1"/>
  {/* Bonnet ribbon ties */}
  <path d="M10 22l-3 6M7 28c-1.5.5-2 2-.5 3"/>
  <path d="M38 22l3 6M41 28c1.5.5 2 2 .5 3"/>
  {/* Bonnet decorative seams */}
  <path d="M24 7c-2 4-3 9-3 15" opacity="0.3" strokeDasharray="2 2"/>
  <path d="M24 7c2 4 3 9 3 15" opacity="0.3" strokeDasharray="2 2"/>
  {/* Little bootie left */}
  <path d="M13 36c0-2 1.5-3.5 3.5-3.5S20 34 20 36v3c0 .5-.3 1-1 1.2"/>
  <path d="M13 36v3c0 1.5 1 2.5 2.5 2.8"/>
  <path d="M12 39c-.5.5-.5 1.5 0 2.5s1.5 1.5 2.5 1.5h5c1 0 1.5-.5 1.5-1.5"/>
  {/* Bootie left bow */}
  <path d="M15.5 35c-.8-.5-1-.3-.8.3s.8.8 1.3.5"/>
  <path d="M15.5 35c.3-.8.8-.8 1-.2s-.3 1-.8.8"/>
  {/* Little bootie right */}
  <path d="M28 36c0-2 1.5-3.5 3.5-3.5S35 34 35 36v3c0 .5-.3 1-1 1.2"/>
  <path d="M28 36v3c0 1.5 1 2.5 2.5 2.8"/>
  <path d="M27 39c-.5.5-.5 1.5 0 2.5s1.5 1.5 2.5 1.5h5c1 0 1.5-.5 1.5-1.5"/>
  {/* Bootie right bow */}
  <path d="M30.5 35c-.8-.5-1-.3-.8.3s.8.8 1.3.5"/>
  <path d="M30.5 35c.3-.8.8-.8 1-.2s-.3 1-.8.8"/>
</svg>
)
