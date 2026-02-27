/**
 * BEAUTY icons
 * Style: delicate outline, artistic, strokeWidth 1.2–1.5, round caps/joins
 * Stroke color: #3b3634
 */
import React from "react";

interface IconProps {
  className?: string;
}

/** Mydła — bar of soap with bubbles */
export const MydłaIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="#3b3634"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Soap bar body */}
    <path d="M8 22l3-4h26l3 4v14c0 1.5-1 2.5-2.5 2.5h-27C9 38.5 8 37.5 8 36z" />
    {/* Top face of soap */}
    <path d="M11 18h26l3 4H8z" strokeWidth="1.3" />
    {/* Top surface highlight */}
    <path d="M14 20h20" opacity="0.3" strokeWidth="1" />
    {/* Soap indent / stamp */}
    <rect x="17" y="26" width="14" height="7" rx="1.5" opacity="0.5" />
    <path d="M20 29.5h8" opacity="0.4" strokeWidth="1" />
    {/* Bubbles floating */}
    <circle cx="38" cy="14" r="3" strokeWidth="1.2" />
    <circle cx="42" cy="8" r="2" strokeWidth="1.1" />
    <circle cx="35" cy="8" r="1.5" strokeWidth="1" />
    <circle cx="44" cy="14" r="1.2" strokeWidth="1" opacity="0.6" />
    <circle cx="32" cy="12" r="1" strokeWidth="1" opacity="0.5" />
    {/* Bubble shine */}
    <path d="M36.5 12.8a1.2 1.2 0 0 0 1 .2" opacity="0.35" strokeWidth="1" />
    <path d="M41 6.8a.8.8 0 0 0 .7.1" opacity="0.35" strokeWidth="1" />
    {/* Foam at soap base */}
    <path
      d="M10 38.5c1.5 1.5 4 2 6.5 1.5s4-1 6-1 4 .5 6 1 4 0 6.5-1.5"
      opacity="0.3"
      strokeWidth="1"
    />
    {/* Water drops */}
    <path d="M6 28c-.5 1-.3 2 .3 2.3" opacity="0.3" strokeWidth="1" />
    <path d="M5 32c-.3.8 0 1.5.5 1.5" opacity="0.25" strokeWidth="1" />
  </svg>
);

/** Kule do kąpieli — round bath bomb with fizz */
export const KuleDoKąpieliIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="#3b3634"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Main sphere */}
    <circle cx="24" cy="24" r="13" strokeWidth="1.6" />
    {/* Equator line showing sphere shape */}
    <ellipse cx="24" cy="24" rx="13" ry="3" opacity="0.3" />
    {/* Top hemisphere seam (two halves pressed together) */}
    <path d="M11.5 22c3 1.5 8 2.2 12.5 2.2s9.5-.7 12.5-2.2" opacity="0.5" />
    {/* Surface texture — swirl pattern */}
    <path
      d="M20 16c1.5 1 3.5 1 5 0s3.5-1 5 0"
      opacity="0.35"
      strokeWidth="1"
    />
    <path
      d="M18 20c2 1.2 4.5 1.2 6.5 0s4.5-1.2 6.5 0"
      opacity="0.25"
      strokeWidth="1"
    />
    {/* Dried flower petal on top */}
    <path
      d="M22 13c-1.5-2-.5-4 1-4s2.5 2 1 4"
      strokeWidth="1.2"
      opacity="0.6"
    />
    <path
      d="M25 12c.5-2 2.5-3 3.5-1.5s-.5 3.5-2 3"
      strokeWidth="1.2"
      opacity="0.6"
    />
    <path d="M23.5 13v-1" strokeWidth="1" opacity="0.5" />
    {/* Fizz sparkles rising */}
    <circle cx="10" cy="8" r="1" strokeWidth="1" opacity="0.5" />
    <circle cx="7" cy="12" r="0.7" strokeWidth="1" opacity="0.4" />
    <circle cx="13" cy="5" r="0.7" strokeWidth="1" opacity="0.35" />
    <path d="M8 9.5l-1-1.5" opacity="0.3" strokeWidth="1" />
    {/* Fizz sparkles right */}
    <circle cx="38" cy="10" r="0.8" strokeWidth="1" opacity="0.45" />
    <circle cx="40" cy="14" r="0.6" strokeWidth="1" opacity="0.35" />
    <path d="M37 8l.5-2" opacity="0.3" strokeWidth="1" />
    {/* Small star sparkle */}
    <path
      d="M6 16l.5 1 1-.5-1 .5.5 1"
      strokeWidth="1"
      opacity="0.3"
    />
    <path
      d="M41 6l.5 1 1-.5-1 .5.5 1"
      strokeWidth="1"
      opacity="0.3"
    />
    {/* Water surface hint at bottom */}
    <path
      d="M8 40c3-1.5 7-2.5 16-2.5s13 1 16 2.5"
      opacity="0.2"
      strokeWidth="1"
    />
    <path
      d="M10 43c4-1.5 8-2 14-2s10 .5 14 2"
      opacity="0.15"
      strokeWidth="1"
    />
  </svg>
);


/** Do twarzy — simple feminine face silhouette */
/** Do twarzy — simple feminine face with bob hairstyle */
export const DoTwarzyIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="#3b3634"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Hair outer silhouette */}
    <path
      d="M10 24c0-10 6-18 14-18s14 8 14 18c0 3-.5 6-2 8h-5l1-8"
      strokeWidth="1.6"
    />
    <path
      d="M10 24c0 3 .5 6 2 8h5l-1-8"
      strokeWidth="1.6"
    />
    {/* Face cutout / skin area */}
    <path
      d="M16 24c0 4 1.5 7 3.5 9 1.5 1.5 3 2.5 4.5 2.5s3-1 4.5-2.5c2-2 3.5-5 3.5-9"
      strokeWidth="1.5"
    />
    {/* Neck */}
    <path d="M21.5 35.5l-1 3M26.5 35.5l1 3" strokeWidth="1.5" />
    {/* Shoulders */}
    <path
      d="M20.5 38.5c-4 .5-8 2-11 4.5v2h29v-2c-3-2.5-7-4-11-4.5"
      strokeWidth="1.5"
    />
  </svg>
);

/** Do włosów — flowing hair with a comb */
export const DoWłosówIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="#3b3634"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Flowing hair strands */}
    <path d="M10 6c2 4 3 10 2 18s-1 14 1 18" strokeWidth="1.3" />
    <path d="M16 4c1.5 5 2 11 1 19s0 13 2 17" strokeWidth="1.3" />
    <path d="M22 3c1 5 1.5 11 .5 19s.5 13 2.5 17" strokeWidth="1.3" />
    <path d="M28 4c0 5 0 11-.5 19s1 13 3 17" strokeWidth="1.3" />
    {/* Hair highlights */}
    <path d="M13 10c.5 3 .5 6 0 10" opacity="0.25" strokeWidth="1" />
    <path d="M19 8c.5 3 .5 7 0 11" opacity="0.25" strokeWidth="1" />
    <path d="M25 7c.3 3 .3 7 0 11" opacity="0.25" strokeWidth="1" />
    {/* Wide-tooth comb */}
    <rect x="33" y="8" width="11" height="16" rx="2" strokeWidth="1.4" />
    {/* Comb handle top */}
    <path d="M33 12h11" opacity="0.4" />
    {/* Comb teeth */}
    <path d="M35 24v10" strokeWidth="1.3" />
    <path d="M38.5 24v11" strokeWidth="1.3" />
    <path d="M42 24v10" strokeWidth="1.3" />
    {/* Tooth rounded ends */}
    <circle cx="35" cy="34" r="0.5" opacity="0.5" />
    <circle cx="38.5" cy="35" r="0.5" opacity="0.5" />
    <circle cx="42" cy="34" r="0.5" opacity="0.5" />
    {/* Decorative small leaf on comb */}
    <path
      d="M37 10c-.8-.8-.5-2 .3-2.3s1.8.5 1.5 1.5"
      opacity="0.45"
      strokeWidth="1"
    />
    {/* Small sparkle */}
    <path
      d="M7 14l-.5-1 .5 1 .5-1-.5 1-.5.5.5-.5.5.5"
      opacity="0.3"
      strokeWidth="1"
    />
  </svg>
);

/** Do ciała — body lotion bottle with leaf accent */
export const DoCiałaIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="#3b3634"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Bottle body */}
    <path d="M14 18h20v22c0 2-1.5 3.5-3.5 3.5h-13c-2 0-3.5-1.5-3.5-3.5z" />
    {/* Bottle shoulder taper */}
    <path d="M14 18l3-4h14l3 4" />
    {/* Neck */}
    <rect x="19" y="8" width="10" height="6" rx="1" />
    {/* Pump cap */}
    <path d="M22 8v-2h4v2" />
    {/* Pump nozzle */}
    <path d="M26 6h5" strokeWidth="1.3" />
    <path d="M31 4v2" strokeWidth="1.3" />
    {/* Pump tube */}
    <path d="M24 14v4" opacity="0.3" strokeWidth="1" />
    {/* Label area */}
    <rect
      x="17"
      y="24"
      width="14"
      height="10"
      rx="1"
      opacity="0.4"
      strokeWidth="1.2"
    />
    {/* Label text lines */}
    <path d="M20 27h8" opacity="0.3" strokeWidth="1" />
    <path d="M21 30h6" opacity="0.25" strokeWidth="1" />
    {/* Leaf accent on bottle */}
    <path d="M33 30c2-3 5-4 7-3" strokeWidth="1.2" opacity="0.6" />
    <path d="M40 27c-1 3-4 5-7 3" strokeWidth="1.2" opacity="0.6" />
    <path d="M36 28v3" strokeWidth="1" opacity="0.4" />
    {/* Second small leaf */}
    <path
      d="M35 33c1-1.5 3-2 4-1.2"
      strokeWidth="1"
      opacity="0.45"
    />
    <path
      d="M39 31.8c-.5 1.5-2 2.5-4 1.2"
      strokeWidth="1"
      opacity="0.45"
    />
    {/* Bottle highlight */}
    <path d="M16 20v18" opacity="0.15" strokeWidth="2" />
    {/* Small drops */}
    <path
      d="M31 5c.3-.5.8-.8.8-.3s-.3.8-.8.8"
      opacity="0.35"
      strokeWidth="1"
    />
  </svg>
);

/** Zapachy — elegant perfume bottle with mist */
export const ZapachyIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="48"
    height="48"
    fill="none"
    stroke="#3b3634"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Bottle body — elegant tapered shape */}
    <path d="M15 22c-1 0-2 1-2 2.5v14c0 2.5 2 4.5 4.5 4.5h13c2.5 0 4.5-2 4.5-4.5v-14c0-1.5-1-2.5-2-2.5z" />
    {/* Bottle shoulder */}
    <path d="M15 22l4-4h10l4 4" strokeWidth="1.3" />
    {/* Neck */}
    <rect x="20" y="12" width="8" height="6" rx="1.2" />
    {/* Decorative cap */}
    <path d="M19 12c0-2 2-4 5-4s5 2 5 4" strokeWidth="1.4" />
    {/* Cap facet */}
    <path d="M21 10c1-1 2-1.5 3-1.5s2 .5 3 1.5" opacity="0.3" />
    {/* Bottle front facet lines */}
    <path d="M18 24v15" opacity="0.2" strokeWidth="1" />
    <path d="M30 24v15" opacity="0.2" strokeWidth="1" />
    {/* Label / decorative panel */}
    <rect
      x="19"
      y="28"
      width="10"
      height="8"
      rx="1"
      opacity="0.35"
      strokeWidth="1.2"
    />
    {/* Label ornament */}
    <path d="M22 32h4" opacity="0.3" strokeWidth="1" />
    <circle cx="24" cy="30" r="0.6" opacity="0.3" />
    {/* Spray mist lines */}
    <path d="M8 14c-1-2-1-4 0-5" strokeWidth="1.1" opacity="0.4" />
    <path d="M6 17c-1.5-1.5-1.5-4 0-5.5" strokeWidth="1.1" opacity="0.3" />
    <path d="M4 20c-2-2-2-5 0-7" strokeWidth="1.1" opacity="0.2" />
    {/* Mist dots */}
    <circle cx="9" cy="10" r="0.5" opacity="0.3" />
    <circle cx="6" cy="12" r="0.5" opacity="0.25" />
    <circle cx="3" cy="15" r="0.5" opacity="0.2" />
    <circle cx="7" cy="8" r="0.4" opacity="0.2" />
    {/* Sparkle on bottle */}
    <path
      d="M33 26l.5-1 .5 1-.5 1-.5-1zM33 26l-1 .5 1-.5 1 .5"
      opacity="0.3"
      strokeWidth="1"
    />
    {/* Bottom reflection */}
    <path d="M17 43h14" opacity="0.15" strokeWidth="1" />
  </svg>
);